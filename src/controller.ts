import { Router, Request, Response, NextFunction } from 'express';
import { Note } from './model';
import { NotFoundError, BadRequestError } from './error';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      throw new NotFoundError(`Note with ID ${req.params.id} not found`);
    }
    res.status(200).json(note);
  } catch (error) {
    next(error); 
  }
});


router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      throw new BadRequestError('Title and content are required fields');
    }

    const newNote = new Note({ title, content });
    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (error) {
    next(error);
  }
});


router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deletedNote = await Note.findByIdAndDelete(req.params.id);
    if (!deletedNote) {
      throw new NotFoundError(`Note with ID ${req.params.id} not found`);
    }
    res.status(200).json({ message: 'Note deleted successfully', id: req.params.id });
  } catch (error) {
    next(error);
  }
});

export default router;