import { Request, Response } from 'express';
import { db } from '../database/db';

export const createInterview = async (req: Request, res: Response): Promise<void> => {
  const { application_id, interviewer_id, start_time, end_time, link, duration } = req.body;

  if (!application_id || !interviewer_id || !start_time || !end_time || !link || !duration) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    const candidateResult = await db.query(
      'SELECT candidate_id FROM applications WHERE id = $1',
      [application_id]
    );

    if (candidateResult.rows.length === 0) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    const candidate_id = candidateResult.rows[0].candidate_id;

    const existingInterview = await db.query(
      'SELECT id FROM interviews WHERE application_id = $1',
      [application_id]
    );

    if (existingInterview.rows.length > 0) {
      res.status(409).json({ error: 'Interview already scheduled for this application.' });
      return;
    }

    const result = await db.query(
      `INSERT INTO interviews 
        (application_id, candidate_id, interviewer_id, start_time, end_time, link, duration) 
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id`,
      [application_id, candidate_id, interviewer_id, start_time, end_time, link, duration]
    );

    res.status(201).json({
      interviewId: result.rows[0].id,
      message: 'Interview created successfully',
    });
  } catch (error) {
    console.error('Error creating interview:', error);
    res.status(500).json({ error: 'Error creating interview' });
  }
};

export const getAllInterviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await db.query(`
          SELECT 
              i.id, 
              u.name AS candidate_name, 
              a.job_id, 
              j.title AS job_title,
              r.name AS interviewer_name, 
              i.start_time, 
              i.end_time, 
              i.link, 
              i.duration 
          FROM interviews i
          JOIN users u ON i.candidate_id = u.id
          JOIN applications a ON i.application_id = a.id
          JOIN jobs j ON a.job_id = j.id
          JOIN users r ON i.interviewer_id = r.id
          WHERE i.start_time > NOW() 
          ORDER BY i.start_time ASC
      `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({ error: 'Error fetching interviews' });
  }
};

export const updateInterview = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { start_time, end_time, link, duration } = req.body;

  if (!start_time || !end_time || !link || !duration) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    const result = await db.query(
      `UPDATE interviews 
       SET start_time = $1, end_time = $2, link = $3, duration = $4 
       WHERE id = $5 
       RETURNING *`,
      [start_time, end_time, link, duration, id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Interview not found' });
      return;
    }

    res.status(200).json({ message: 'Interview updated successfully', interview: result.rows[0] });
  } catch (error) {
    console.error('Error updating interview:', error);
    res.status(500).json({ error: 'Error updating interview' });
  }
};

export const deleteInterview = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM interviews WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Interview not found' });
      return;
    }

    res.status(200).json({ message: 'Interview deleted successfully' });
  } catch (error) {
    console.error('Error deleting interview:', error);
    res.status(500).json({ error: 'Error deleting interview' });
  }
};

export const getCandidateInterviews = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id || isNaN(Number(id))) {
    res.status(400).json({ message: 'Invalid candidate ID provided.' });
    return;
  }

  try {
    const result = await db.query(
      `SELECT 
          i.id AS interview_id,
          i.start_time, 
          i.end_time,
          i.link, 
          i.duration,
          COALESCE(j.title, 'No Job Assigned') AS job_title, 
          COALESCE(r.name, 'No Interviewer') AS interviewer_name, 
          j.location, 
          j.requirements 
       FROM interviews i
       LEFT JOIN applications a ON i.application_id = a.id
       LEFT JOIN jobs j ON a.job_id = j.id
       LEFT JOIN users r ON i.interviewer_id = r.id
       WHERE i.candidate_id = $1
          AND i.start_time > NOW() 
       ORDER BY i.start_time`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'No interviews found for this candidate' });
      return;
    }

    res.json(result.rows);
    return;
  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({ message: 'Error fetching interviews', error });
  }
};
