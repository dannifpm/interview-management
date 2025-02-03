import express from 'express';
import {
  createJob,
  getAllJobs,
  getJobDetails,
  getSavedJobs,
  removeSavedJob,
  saveJob,
  updateJob,
} from '../controllers/jobController';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddlewares';

const router = express.Router();

router.get('/saved-jobs', authenticateToken, authorizeRole('candidate'), getSavedJobs);
router.post('/saved-jobs', authenticateToken, authorizeRole('candidate'), saveJob);
router.delete('/saved-jobs', authenticateToken, authorizeRole('candidate'), removeSavedJob);
router.post('/', authenticateToken, authorizeRole('recruiter'), createJob);
router.get('/', authenticateToken, getAllJobs);
router.get('/:id', authenticateToken, getJobDetails);
router.put('/:id', authenticateToken, authorizeRole('recruiter'), updateJob);

export default router;
