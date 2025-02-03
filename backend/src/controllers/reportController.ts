import db from "../database/db";
import { Response } from 'express';
import { AuthenticatedRequest } from "../middlewares/authMiddlewares";
import { parse } from "json2csv";
import PDFDocument from "pdfkit";

export const getJobReports = async (req: AuthenticatedRequest, res: Response) => {
  const recruiterId = req.user?.id;
  const { dateRange, search, status } = req.query;

  try {
    let query = `
          SELECT 
              j.id AS job_id,
              j.title AS job_title,
              j.description AS job_description,
              j.requirements AS job_requirements, 
              COUNT(DISTINCT a.id) AS total_applications,
              SUM(CASE WHEN a.status = 'approved' THEN 1 ELSE 0 END) AS approved_applications,
              SUM(CASE WHEN a.status = 'rejected' THEN 1 ELSE 0 END) AS rejected_applications,
              COUNT(i.id) AS scheduled_interviews,
              j.status AS job_status
          FROM jobs j
          LEFT JOIN applications a ON j.id = a.job_id
          LEFT JOIN interviews i ON i.application_id = a.id
          WHERE j.recruiter_id = $1
      `;

    const filters: any[] = [recruiterId];

    if (dateRange) {
      query += ` AND j.created_at >= NOW() - INTERVAL $${filters.length + 1}`;
      filters.push(`${dateRange} days`);
    }

    if (search) {
      query += ` AND LOWER(j.title) LIKE LOWER($${filters.length + 1})`;
      filters.push(`%${search}%`);
    }

    if (status) {
      query += ` AND j.status = $${filters.length + 1}`;
      filters.push(status);
    }

    query += ` GROUP BY j.id ORDER BY j.title`;

    const result = await db.query(query, filters);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching job reports:', error);
    res.status(500).json({ message: 'Error fetching job reports' });
  }
};

export const exportJobReportsCSV = async (req: AuthenticatedRequest, res: Response) => {
  const recruiterId = req.user?.id;

  try {
    const query = `
        SELECT 
          j.title AS job_title,
          COUNT(DISTINCT a.id) AS total_applications,
          SUM(CASE WHEN a.status = 'approved' THEN 1 ELSE 0 END) AS approved_applications,
          SUM(CASE WHEN a.status = 'rejected' THEN 1 ELSE 0 END) AS rejected_applications,
          COUNT(i.id) AS scheduled_interviews,
          j.status AS job_status
        FROM jobs j
        LEFT JOIN applications a ON j.id = a.job_id
        LEFT JOIN interviews i ON i.application_id = a.id
        WHERE j.recruiter_id = $1
        GROUP BY j.id
      `;

    const reports = await db.query(query, [recruiterId]);

    const csv = parse(reports.rows);
    res.header("Content-Type", "text/csv");
    res.attachment("job_reports.csv");
    res.send(csv);
  } catch (error) {
    console.error("Error exporting CSV:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const exportJobReportsPDF = async (req: AuthenticatedRequest, res: Response) => {
  const recruiterId = req.user?.id;

  try {
    const query = `
        SELECT 
          j.title AS job_title,
          COUNT(DISTINCT a.id) AS total_applications,
          SUM(CASE WHEN a.status = 'approved' THEN 1 ELSE 0 END) AS approved_applications,
          SUM(CASE WHEN a.status = 'rejected' THEN 1 ELSE 0 END) AS rejected_applications,
          COUNT(i.id) AS scheduled_interviews,
          j.status AS job_status
        FROM jobs j
        LEFT JOIN applications a ON j.id = a.job_id
        LEFT JOIN interviews i ON i.application_id = a.id
        WHERE j.recruiter_id = $1
        GROUP BY j.id
      `;

    const reports = await db.query(query, [recruiterId]);

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=job_reports.pdf");

    doc.text("Job Reports", { align: "center" });
    doc.moveDown();

    reports.rows.forEach((report) => {
      doc.text(`Job Title: ${report.job_title}`);
      doc.text(`Total Applications: ${report.total_applications}`);
      doc.text(`Approved Applications: ${report.approved_applications}`);
      doc.text(`Rejected Applications: ${report.rejected_applications}`);
      doc.text(`Scheduled Interviews: ${report.scheduled_interviews}`);
      doc.text(`Status: ${report.job_status}`);
      doc.moveDown();
    });

    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error("Error exporting PDF:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};