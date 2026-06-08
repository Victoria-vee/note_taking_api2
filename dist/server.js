"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const controller_1 = __importDefault(require("./controller"));
const error_1 = require("./error");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const DATABASE_URI = process.env.DATABASE_URI || '';
app.use(express_1.default.json());
app.use('/api/notes', controller_1.default);
app.use((err, req, res, next) => {
    if (err instanceof error_1.AppError) {
        return res.status(err.statusCode).json({ error: err.message });
    }
    if (err.name === 'CastError') {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    console.error('Unhandled Error:', err);
    res.status(500).json({ error: 'Something went wrong on the server' });
});
mongoose_1.default
    .connect(DATABASE_URI)
    .then(() => {
    console.log('Connected successfully to MongoDB Atlas');
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
})
    .catch((error) => {
    console.error('Database connection failed:', error.message);
    process.exit(1);
});
