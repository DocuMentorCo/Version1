"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContractByID = exports.getUserContracts = exports.analyzeContract = exports.detectAndConfirmContractType = exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const redis_1 = __importDefault(require("../config/redis"));
const ai_services_1 = require("../services/ai.services");
const contract_model_1 = __importDefault(require("../models/contract.model"));
const mongoUtils_1 = require("../utils/mongoUtils");
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        }
        else {
            cb(null, false);
            cb(new Error("Only pdf files are allowed"));
        }
    },
}).single("contract");
exports.uploadMiddleware = upload;
const detectAndConfirmContractType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    try {
        const fileKey = `file:${user._id}:${Date.now()}`;
        yield redis_1.default.set(fileKey, req.file.buffer);
        yield redis_1.default.expire(fileKey, 3600); // 1 hour
        const pdfText = yield (0, ai_services_1.extractTextFromPDF)(fileKey);
        const detectedType = yield (0, ai_services_1.detectContractType)(pdfText);
        yield redis_1.default.del(fileKey);
        res.json({ detectedType });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to detect contract type" });
    }
});
exports.detectAndConfirmContractType = detectAndConfirmContractType;
const analyzeContract = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { contractType } = req.body;
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    if (!contractType) {
        return res.status(400).json({ error: "No contract type provided" });
    }
    try {
        const fileKey = `file:${user._id}:${Date.now()}`;
        yield redis_1.default.set(fileKey, req.file.buffer);
        yield redis_1.default.expire(fileKey, 3600); // 1 hour
        const pdfText = yield (0, ai_services_1.extractTextFromPDF)(fileKey);
        let analysis;
        if (user.isPremium) {
            analysis = yield (0, ai_services_1.analyzeContractWithAI)(pdfText, "premium", contractType);
        }
        else {
            analysis = yield (0, ai_services_1.analyzeContractWithAI)(pdfText, "free", contractType);
        }
        if (!analysis.summary || !analysis.risks || !analysis.opportunities) {
            throw new Error("Failed to analyze contract");
        }
        const savedAnalysis = yield contract_model_1.default.create(Object.assign(Object.assign({ userId: user._id, contractText: pdfText, contractType }, analysis), { language: "en", aiModel: "gemini-pro" }));
        res.json(savedAnalysis);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to analyze contract" });
    }
});
exports.analyzeContract = analyzeContract;
const getUserContracts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    try {
        const query = { userId: user._id };
        const contracts = yield contract_model_1.default.find(query).sort({ createdAt: -1 });
        res.json(contracts);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to get contracts" });
    }
});
exports.getUserContracts = getUserContracts;
const getContractByID = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = req.user;
    if (!(0, mongoUtils_1.isValidMongoId)(id)) {
        return res.status(400).json({ error: "Invalid contract ID" });
    }
    try {
        const cachedContracts = yield redis_1.default.get(`contract:${id}`);
        if (cachedContracts) {
            return res.json(cachedContracts);
        }
        //if not in cache, get from db
        const contract = yield contract_model_1.default.findOne({
            _id: id,
            userId: user._id,
        });
        if (!contract) {
            return res.status(404).json({ error: "Contract not found" });
        }
        //Cache the results for future requests
        yield redis_1.default.set(`contract:${id}`, contract, { ex: 3600 }); // 1 hour
        res.json(contract);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get contract" });
    }
});
exports.getContractByID = getContractByID;
