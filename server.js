import cors from "cors";
import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import fs from "fs";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());

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

app.listen(3000, () => {
  console.log("✅ Server is running on http://localhost:3000");
});