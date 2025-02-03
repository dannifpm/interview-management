import { Router } from 'express';
import { registerUser, loginUser, getCurrentUser, getProfile, updateProfile, changePassword } from '../controllers/userController';
import { authenticateToken } from '../middlewares/authMiddlewares';
import { uploadImage } from '../middlewares/multer';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', authenticateToken, getCurrentUser);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, uploadImage.single('profile_picture'), updateProfile);
router.put('/change-password', authenticateToken, changePassword);

export default router;
