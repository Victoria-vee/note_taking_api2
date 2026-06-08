"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const model_1 = require("./model");
const error_1 = require("./error");
const router = (0, express_1.Router)();
router.get('/', async (req, res, next) => {
    try {
        const notes = await model_1.Note.find().sort({ createdAt: -1 });
        res.status(200).json(notes);
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        const note = await model_1.Note.findById(req.params.id);
        if (!note) {
            throw new error_1.NotFoundError(`Note with ID ${req.params.id} not found`);
        }
        res.status(200).json(note);
    }
    catch (error) {
        next(error);
    }
});
router.post('/', async (req, res, next) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            throw new error_1.BadRequestError('Title and content are required fields');
        }
        const newNote = new model_1.Note({ title, content });
        const savedNote = await newNote.save();
        res.status(201).json(savedNote);
    }
    catch (error) {
        next(error);
    }
});
router.delete('/:id', async (req, res, next) => {
    try {
        const deletedNote = await model_1.Note.findByIdAndDelete(req.params.id);
        if (!deletedNote) {
            throw new error_1.NotFoundError(`Note with ID ${req.params.id} not found`);
        }
        res.status(200).json({ message: 'Note deleted successfully', id: req.params.id });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
