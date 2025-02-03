import { Response } from 'express';
import db from '../database/db';
import { AuthenticatedRequest } from '../middlewares/authMiddlewares';

export const createJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const recruiterId = req.user?.id;
  const { title, description, requirements, location, deadline,  } = req.body;

  if (!title || !description || !location || !recruiterId) {
    res.status(400).json({ message: 'Missing required fields' });
    return;
  }

  try {
    const status = new Date(deadline) >= new Date() ? 'open' : 'closed'; 

    const result = await db.query(
      `INSERT INTO jobs (title, description, requirements, location, deadline, status, recruiter_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [title, description, requirements, location, deadline, status, recruiterId]
    );

    res.status(201).json({ jobId: result.rows[0].id, message: 'Job created successfully' });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Error creating job' });
  }
};

export const getAllJobs = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    await db.query(`
      UPDATE jobs 
      SET status = 'closed' 
      WHERE deadline < CURRENT_DATE AND status != 'closed'
    `);

    const result = await db.query(`
      SELECT * 
      FROM jobs j
      WHERE j.status != 'closed'
        AND j.deadline >= CURRENT_DATE 
        AND NOT EXISTS (
          SELECT 1 
          FROM applications a 
          WHERE a.job_id = j.id 
            AND a.status = 'approved'
        )
      ORDER BY j.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Error fetching jobs', error });
  }
};

export const getJobDetails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await db.query('SELECT * FROM jobs WHERE id = $1', [id]);
    const job = result.rows[0];

    job.deadline = new Date(job.deadline).toISOString().split('T')[0];

    if (job === 0) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job details', error });
  }
};

export const updateJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, description, requirements, location, deadline } = req.body;

  try {
    const status = new Date(deadline) >= new Date() ? 'open' : 'closed'; 

    const result = await db.query(
      'UPDATE jobs SET title = $1, description = $2, requirements = $3, location = $4, deadline = $5, status = $6 WHERE id = $7 RETURNING *',
      [title, description, requirements, location, deadline, status, id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    res.json({ message: 'Job updated successfully', job: result.rows[0] });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Error updating job', error });
  }
};

export const saveJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { jobId } = req.body;

  if (!userId || !jobId) {
    res.status(400).json({ message: 'Missing required fields (userId, jobId)' });
    return;
  }

  try {
    const existing = await db.query(
      'SELECT * FROM saved_jobs WHERE user_id = $1 AND job_id = $2',
      [userId, jobId]
    );

    if (existing.rows.length > 0) {
      res.status(400).json({ message: 'Job already saved' });
      return;
    }

    await db.query(
      'INSERT INTO saved_jobs (user_id, job_id) VALUES ($1, $2)',
      [userId, jobId]
    );

    res.status(201).json({ message: 'Job saved successfully' });
  } catch (error) {
    console.error('Error saving job:', error);
    res.status(500).json({ message: 'Error saving job', error });
  }
};

export const getSavedJobs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;

  if (!userId || typeof userId !== 'number') {
    res.status(400).json({ message: 'Invalid or missing userId' });
    return;
  }

  try {
    const result = await db.query(
      `SELECT j.*
       FROM saved_jobs s
       INNER JOIN jobs j ON s.job_id = j.id
       WHERE s.user_id = $1`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    res.status(500).json({ message: 'Error fetching saved jobs', error });
  }
};

export const removeSavedJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { jobId } = req.body;

  if (!userId || !jobId) {
    res.status(400).json({ message: 'Missing required fields (userId, jobId)' });
    return;
  }

  try {
    const result = await db.query(
      'DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2',
      [userId, jobId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Saved job not found' });
      return;
    }

    res.json({ message: 'Job removed from saved jobs successfully' });
  } catch (error) {
    console.error('Error removing saved job:', error);
    res.status(500).json({ message: 'Error removing saved job', error });
  }
};
