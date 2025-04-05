"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    profilePicture: { type: String },
    isPremium: { type: Boolean, default: true },
});
exports.default = (0, mongoose_1.model)("User", UserSchema);
