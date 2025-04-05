import mongoose, { Schema, Document } from "mongoose";

export interface IContractAnalysis extends Document {
  userId: mongoose.Types.ObjectId;
  contractText: string;
  summary: string;
  contractType: string;
  createdAt?: Date;
}

const ContractAnalysisSchema: Schema = new Schema<IContractAnalysis>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  contractText: { type: String, required: true },
  summary: { type: String, required: true },
  contractType: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IContractAnalysis>(
  "ContractAnalysis",
  ContractAnalysisSchema
);
