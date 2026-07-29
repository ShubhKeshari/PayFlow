import { Router } from 'express';
import { googleLogin } from '../controllers/auth.controller.js';

const router = Router();

// POST /api/auth/google - Authenticate user via Google OAuth
router.post('/google', googleLogin);

export default router;
