
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";
import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import fs from "fs";
import OpenAI from "openai";
import User from "./models/User.js";
import Transaction from "./models/Transaction.js";
import { verifyToken } from "./middleware/auth.js";
import Budget from "./models/Budget.js";

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

console.log("✅ MongoDB Connected");
const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function extractJson(raw) {
  // Defensive: strip markdown code fences in case the model adds them
  // despite being told not to.
  const cleaned = raw
    .trim()
    .replace(/^```(json)?/i, "")
    .replace(/```$/, "")
    .trim();
  return JSON.parse(cleaned);
}

app.post("/scan", upload.single("receipt"), async (req, res) => {
  console.log("Receipt received");

  if (!req.file) {
    return res.status(400).json({ error: "No file was uploaded." });
  }

  try {
    const image = fs.readFileSync(req.file.path);
    const base64 = image.toString("base64");

    const response = await client.chat.completions.create({
      model: "gpt-4.1",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Read this receipt and extract its details.
Respond with ONLY a JSON object, no markdown, no code fences, in exactly this shape:
{"merchant":"","date":"","subtotal":"","tax":"","total":"","category":""}`
            },
            {
              type: "image_url",
              image_url: { url: `data:image/png;base64,${base64}` }
            }
          ]
        }
      ]
    });

    fs.unlinkSync(req.file.path);

    const raw = response.choices[0].message.content;
    let data;
    try {
      data = extractJson(raw);
    } catch (parseErr) {
      console.error("Could not parse model output as JSON:", raw);
      return res
        .status(502)
        .json({ error: "Could not read the receipt data. Try a clearer photo." });
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// Auth: Sign up
// ===============================
app.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "An account with that email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.status(201).json({ token, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong creating your account." });
  }
});

// ===============================
// Auth: Login
// ===============================
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.json({ token, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong logging you in." });
  }
});

// ===============================
// Transactions (per-user, so the same
// data follows you to any device)
// ===============================
app.get("/transactions", verifyToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.userId }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load transactions." });
  }
});

app.post("/transactions", verifyToken, async (req, res) => {
  try {
    const { merchant, category, date, amount } = req.body;
    const transaction = await Transaction.create({
      user: req.userId,
      merchant,
      category,
      date,
      amount
    });
    res.status(201).json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not save transaction." });
  }
});

app.put("/transactions/:id", verifyToken, async (req, res) => {
  try {
    const { merchant, category, date, amount } = req.body;
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.userId }, // scoped to the owner
      { merchant, category, date, amount },
      { new: true }
    );
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found." });
    }
    res.json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update transaction." });
  }
});

app.delete("/transactions/:id", verifyToken, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found." });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not delete transaction." });
  }
});
// ===============================
// Budgets (per-user, resets every month)
// ===============================
function getEndOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
}

app.get("/budgets", verifyToken, async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.userId });
    res.json(budgets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load budgets." });
  }
});

app.post("/budgets", verifyToken, async (req, res) => {
  try {
    const { category, amount } = req.body;
    if (!category || amount == null) {
      return res.status(400).json({ error: "Category and amount are required." });
    }
    const budget = await Budget.findOneAndUpdate(
      { user: req.userId, category },
      { amount, expiresAt: getEndOfMonth() },
      { new: true, upsert: true }
    );
    res.status(201).json(budget);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not save budget." });
  }
});

app.delete("/budgets/:id", verifyToken, async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!budget) return res.status(404).json({ error: "Budget not found." });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not delete budget." });
  }
});

app.listen(3000, () => {
  console.log("✅ Server is running on http://localhost:3000");
});