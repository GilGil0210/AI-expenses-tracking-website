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
    // The document is automatically deleted once this time passes —
    // set to 23:59:59 on the last day of the month it was created in.
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

// TTL index: MongoDB's background process checks every ~60s and
// deletes any document whose expiresAt has passed. expireAfterSeconds: 0
// means "delete exactly at expiresAt", not some fixed duration after it.
budgetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Budget", budgetSchema);