import { Router, Request, Response, NextFunction } from 'express';
import { INote, Note } from './model';
import { Category } from './model';
import { NotFoundError, BadRequestError, AppError } from './error';
import { validateBody, authGuard } from './middleware';
import {isAuthenticatedRequest } from './types';

const router = Router();
router.use(authGuard);
type NoteInputPayload = Pick<INote, 'title' | 'content' | 'category'>;

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    if (!isAuthenticatedRequest(req)) throw new AppError(500, "Note does not exist");
    const note = await Note.findById(req.params.id);
    if (!note) {
      throw new NotFoundError(`Note with ID ${req.params.id} not found`);
    }
    res.status(200).json(note);
  } catch (error) {
    next(error); 
  }
});

router.get('/categories/:categoryId', async (req: Request<{ categoryId: string }>, res: Response, next: NextFunction) => {
  try {
    if (!isAuthenticatedRequest(req)) throw new AppError(500, "Category does not exist");
    const notes = await Note.find({ 
      'category.name': { $regex: new RegExp(`^${req.params.categoryId}$`, 'i') } 
    });
    res.status(200).json(notes);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content, category } = req.body;
    if (!title || !content || !category) {
      throw new BadRequestError('Title, content, and category are required fields');
    }

    const newNote = new Note({ title, content, category});
    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (error) {
    next(error);
  }
});

router.put(
  '/:id',
  validateBody<Partial<NoteInputPayload>>(['title', 'content', 'category']),
  async (req: Request<{ id: string }, {}, Partial<NoteInputPayload>>, res: Response, next: NextFunction) => {
    try {
       if (!isAuthenticatedRequest(req)) throw new AppError(500, "Note does not exist");
      const updatedNote = await Note.findByIdAndUpdate(
        { _id: req.params.id, user: req.user.id },
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!updatedNote) {
        throw new NotFoundError(`Cannot update note. ID ${req.params.id} not found`);
      }

      res.status(200).json(updatedNote);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    if (!isAuthenticatedRequest(req)) throw new AppError(500, "Note does not exist");
    const deletedNote = await Note.findByIdAndDelete(req.params.id, req.user.id );
    if (!deletedNote) {
      throw new NotFoundError(`Note with ID ${req.params.id} not found`);
    }
    res.status(200).json({ message: 'Note deleted successfully', id: req.params.id });
  } catch (error) {
    next(error);
  }
});

export default router;