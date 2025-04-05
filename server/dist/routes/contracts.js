"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const contract_controller_1 = require("../controllers/contract.controller");
const errors_1 = require("../middleware/errors");
const router = express_1.default.Router();
router.post("/detect-type", auth_1.isAuthenticated, contract_controller_1.uploadMiddleware, (0, errors_1.handleErrors)(contract_controller_1.detectAndConfirmContractType));
router.post("/analyze", auth_1.isAuthenticated, contract_controller_1.uploadMiddleware, (0, errors_1.handleErrors)(contract_controller_1.analyzeContract));
router.get("/user-contracts", auth_1.isAuthenticated, (0, errors_1.handleErrors)(contract_controller_1.getUserContracts));
router.get("/contract/:id", auth_1.isAuthenticated, (0, errors_1.handleErrors)(contract_controller_1.getContractByID));
exports.default = router;
