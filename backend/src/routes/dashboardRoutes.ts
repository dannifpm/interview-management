import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddlewares';
import { getApplicationStatusData, getCandidateOverview, getCandidateUpcomingInterviews, getRecruiterOverview, getUpcomingInterviews, getWeeklyApplicationsData } from '../controllers/dashboardController';


const router = Router();

router.get('/overview', authenticateToken, authorizeRole('recruiter'), getRecruiterOverview);
router.get('/interviews/upcoming', authenticateToken, authorizeRole('recruiter'), getUpcomingInterviews);
router.get('/candidate/overview', authenticateToken, authorizeRole('candidate'), getCandidateOverview);
router.get('/interviews/candidate/upcoming', authenticateToken, authorizeRole('candidate'), getCandidateUpcomingInterviews);
router.get('/application-status', authenticateToken, authorizeRole('recruiter'), getApplicationStatusData);
router.get('/weekly-applications', authenticateToken, authorizeRole('recruiter'), getWeeklyApplicationsData);

export default router;
