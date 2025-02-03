import { AuthenticatedRequest } from '../middlewares/authMiddlewares';
import { Response } from 'express';
import { db } from '../database/db';

export const getRecruiterOverview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const recruiterId = req.user?.id;

    const totalInterviews = await db.query(
      'SELECT COUNT(*) FROM interviews WHERE interviewer_id = $1',
      [recruiterId]
    );

    const totalOffersApproved = await db.query(
      `SELECT COUNT(*) 
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             WHERE a.status = $1 AND j.recruiter_id = $2`,
      ['approved', recruiterId]
    );

    const totalOpenJobs = await db.query(
      `
            SELECT COUNT(*) 
            FROM jobs j
            WHERE j.status = $1
              AND NOT EXISTS (
                SELECT 1 
                FROM applications a 
                WHERE a.job_id = j.id 
                  AND a.status = 'approved'
              )
            `,
      ['open']
    );

    const totalCandidates = await db.query(
      'SELECT COUNT(DISTINCT candidate_id) FROM applications WHERE job_id IN (SELECT id FROM jobs WHERE recruiter_id = $1)',
      [recruiterId]
    );

    res.json({
      totalInterviews: totalInterviews.rows[0].count,
      totalOffersApproved: totalOffersApproved.rows[0].count,
      totalOpenJobs: totalOpenJobs.rows[0].count,
      totalCandidates: totalCandidates.rows[0].count,
    });
  } catch (error) {
    console.error('Error fetching recruiter overview:', error);
    res.status(500).json({ error: 'Error fetching recruiter overview' });
  }
};

export const getUpcomingInterviews = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const recruiterId = req.user?.id;

  try {
    const result = await db.query(
      `SELECT 
                i.id AS interview_id,
                i.start_time,
                i.link,
                i.duration,
                j.title AS job_title,
                u.name AS candidate_name
            FROM interviews i
            LEFT JOIN jobs j ON i.job_id = j.id 
            JOIN users u ON i.candidate_id = u.id
            WHERE j.recruiter_id = $1
                AND i.start_time >= NOW()
                AND i.start_time <= date_trunc('day', NOW() + INTERVAL '1 day') + INTERVAL '1 day'
            ORDER BY i.start_time;`,
      [recruiterId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching upcoming interviews:', error);
    res.status(500).json({ message: 'Error fetching upcoming interviews' });
  }
};

export const getCandidateOverview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const candidateId = req.user?.id;

  try {
    const totalApplications = await db.query(
      'SELECT COUNT(*) AS count FROM applications WHERE candidate_id = $1',
      [candidateId]
    );

    const ongoingApplications = await db.query(
      'SELECT COUNT(*) AS count FROM applications WHERE candidate_id = $1 AND status = $2',
      [candidateId, 'pending']
    );

    const scheduledInterviews = await db.query(
      'SELECT COUNT(*) AS count FROM interviews WHERE candidate_id = $1 AND start_time >= NOW()',
      [candidateId]
    );

    const totalInterviews = await db.query(
      'SELECT COUNT(*) AS count FROM interviews WHERE candidate_id = $1',
      [candidateId]
    );

    const approvedOffers = await db.query(
      `SELECT COUNT(*) AS count 
         FROM applications 
         WHERE candidate_id = $1 AND status = $2`,
      [candidateId, 'approved']
    );

    res.json({
      totalApplications: totalApplications.rows[0].count,
      ongoingApplications: ongoingApplications.rows[0].count,
      scheduledInterviews: scheduledInterviews.rows[0].count,
      totalInterviews: totalInterviews.rows[0].count,
      approvedOffers: approvedOffers.rows[0].count,
    });
  } catch (error) {
    console.error('Error fetching candidate overview:', error);
    res.status(500).json({ error: 'Failed to fetch candidate overview' });
  }
};

export const getCandidateUpcomingInterviews = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const candidateId = req.user?.id;

  try {
    const result = await db.query(
      `SELECT 
            i.id AS interview_id,
            i.start_time,
            i.link,
            i.duration,
            j.title AS job_title,
            u.name AS interviewer_name
         FROM interviews i
         JOIN jobs j ON i.job_id = j.id
         JOIN users u ON i.interviewer_id = u.id
         WHERE i.candidate_id = $1
            AND i.start_time >= NOW()
            AND i.start_time <= date_trunc('day', NOW() + INTERVAL '1 day') + INTERVAL '1 day'
         ORDER BY i.start_time`,
      [candidateId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching upcoming interviews:', error);
    res.status(500).json({ message: 'Error fetching upcoming interviews' });
  }
};


export const getApplicationStatusData = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const recruiterId = req.user?.id;

    const statusData = await db.query(
      `SELECT 
                a.status, 
                COUNT(*) AS count
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             WHERE j.recruiter_id = $1
             GROUP BY a.status`,
      [recruiterId]
    );

    const formattedData = statusData.rows.map((row) => ({
      name: row.status.charAt(0).toUpperCase() + row.status.slice(1), 
      value: parseInt(row.count, 10),
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching application status data:', error);
    res.status(500).json({ error: 'Error fetching application status data' });
  }
};

export const getWeeklyApplicationsData = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const recruiterId = req.user?.id;

    const weeklyData = await db.query(
      `SELECT 
              TO_CHAR(a.created_at, 'YYYY-MM-DD') AS week,
              COUNT(*) AS count
           FROM applications a
           JOIN jobs j ON a.job_id = j.id
           WHERE j.recruiter_id = $1
             AND a.created_at >= NOW() - INTERVAL '7 days'
           GROUP BY week
           ORDER BY week ASC`,
      [recruiterId]
    );

    const formattedData = weeklyData.rows.map((row) => ({
      week: row.week,
      applications: parseInt(row.count, 10),
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching weekly applications data:', error);
    res.status(500).json({ error: 'Error fetching weekly applications data' });
  }
};
