import { Router } from "express";
import { getApplications, getApplicationsByCandidate, submitApplication, updateApplicationStatus } from "../controllers/applicationController";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddlewares";
import { uploadDocument } from "../middlewares/multer";

const router = Router();

router.post('/', authenticateToken, authorizeRole("candidate"), uploadDocument.single('cv'), submitApplication);
router.get('/candidate/:candidateId', authenticateToken, getApplicationsByCandidate);
router.get('/', authenticateToken, authorizeRole("recruiter"), getApplications); 
router.put('/:id/status', authenticateToken, authorizeRole("recruiter"), updateApplicationStatus); 

export default router;