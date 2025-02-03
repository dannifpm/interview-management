import { Router } from "express";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddlewares";
import { exportJobReportsCSV, exportJobReportsPDF, getJobReports } from "../controllers/reportController";

const router = Router();

router.get('/jobs', authenticateToken, authorizeRole('recruiter'), getJobReports)
router.get("/export/csv", authenticateToken, authorizeRole('recruiter'), exportJobReportsCSV);
router.get("/export/pdf", authenticateToken, authorizeRole('recruiter'), exportJobReportsPDF);

export default router;