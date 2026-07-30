import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    // "2026-07" style — which month this budget applies to
    month: { type: String, required: true }
  },
  { timestamps: true }
);

// One budget per category per user per month
budgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true });

export default mongoose.model("Budget", budgetSchema);