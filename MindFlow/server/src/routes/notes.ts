import express from 'express';
import { getNotes, createNote, updateNote, deleteNote, getNote, searchNotes, getTags } from '../controllers/notes';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken); // Protect all note routes

router.get('/', getNotes);
router.post('/', createNote);
router.get('/search', searchNotes); // More specific routes first
router.get('/search', authenticateToken, searchNotes);
router.get('/tags', authenticateToken, getTags);
router.get('/:id', authenticateToken, getNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router;
