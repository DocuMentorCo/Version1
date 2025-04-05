"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ContractAnalysisSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    contractText: { type: String, required: true },
    risks: [{ risk: String, explanation: String, severity: String }],
    opportunities: [{ opportunity: String, explanation: String, impact: String }],
    summary: { type: String, required: true },
    recommendations: [{ type: String }],
    keyClauses: [{ type: String }],
    legalCompliance: { type: String },
    negotiationPoints: [{ type: String }],
    contractDuration: { type: String },
    terminationConditions: { type: String },
    overallScore: { type: Number, min: 0, max: 100 },
    compensationStructure: {
        baseSalary: String,
        bonuses: String,
        equity: String,
        otherBenefits: String,
    },
    performanceMetrics: [{ type: String }],
    intellectualPropertyClauses: {
        type: mongoose_1.Schema.Types.Mixed,
        validate: {
            validator: function (v) {
                return (typeof v === "string" ||
                    (Array.isArray(v) && v.every((item) => typeof item === "string")));
            },
            message: (props) => `${props.value} is not a valid string or array of strings!`,
        },
    },
    createdAt: { type: Date, default: Date.now },
    version: { type: Number, default: 1 },
    userFeedback: {
        rating: { type: Number, min: 1, max: 5 },
        comments: String,
    },
    customFields: { type: Map, of: String },
    expirationDate: { type: Date, required: false },
    language: { type: String, default: "en" },
    aiModel: { type: String, default: "gemini-pro" },
    contractType: { type: String, required: true },
    financialTerms: {
        description: String,
        details: [String],
    },
    //   projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
});
exports.default = mongoose_1.default.model("ContractAnalysis", ContractAnalysisSchema);
