import express from 'express';
import { body } from 'express-validator';
import {
    register,
    login,
    refreshTokenHandler,
    logout,
    getMe
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/errorHandler.js';

const router = express.Router();

// Validation middleware
const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    handleValidationErrors
];

const loginValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    handleValidationErrors
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh', refreshTokenHandler);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;