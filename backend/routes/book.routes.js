import { Router } from 'express';
import { getBooks, getBookById } from '../controllers/book.controller.js';

const router = Router();

// GET /api/books - Get all 50 catalog books
router.get('/', getBooks);

// GET /api/books/:id - Get a single book by ID
router.get('/:id', getBookById);

export default router;
