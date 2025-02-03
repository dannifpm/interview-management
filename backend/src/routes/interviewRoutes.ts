import { Router } from 'express';
import { createInterview, deleteInterview, getAllInterviews, getCandidateInterviews, updateInterview } from '../controllers/interviewController';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddlewares';

const router = Router();

router.post('/',authenticateToken, authorizeRole('recruiter'), createInterview);
router.get('/scheduled', authenticateToken, getAllInterviews);
router.put('/:id', authenticateToken, authorizeRole('recruiter'), updateInterview);
router.delete('/:id', authenticateToken, authorizeRole('recruiter'), deleteInterview);
router.get('/candidate/:id',  getCandidateInterviews);



export default router;
