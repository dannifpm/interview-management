import { Request, Response } from 'express';
import db from '../database/db';
import fs from "fs";

export const submitApplication = async (req: Request, res: Response): Promise<void> => {
    try {
        const file = req.file;
        const { jobId, candidateId, message } = req.body;

        if (!jobId || !candidateId) {
            if (file) fs.unlinkSync(file.path);
            res.status(400).json({ message: 'Job ID and Candidate ID are required' });
            return;
        }

        const existingApplication = await db.query(
            'SELECT id FROM applications WHERE job_id = $1 AND candidate_id = $2',
            [jobId, candidateId]
        );

        if (existingApplication.rows.length > 0) {
            if (file) fs.unlinkSync(file.path);
            res.status(409).json({ message: 'You have already applied for this job.' });
            return;
        }

        if (!file) {
            res.status(400).json({ message: 'CV file is required' });
            return;
        }

        const result = await db.query(
            'INSERT INTO applications (job_id, candidate_id, message, status, created_at, cv_path) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [jobId, candidateId, message || null, 'pending', new Date(), file.path]
        );

        res.status(201).json({ applicationId: result.rows[0].id, message: 'Application submitted successfully!' });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        console.error('Error submitting application:', error);
        res.status(500).json({ message: 'Error submitting application', error });
    }
};

export const getApplicationsByCandidate = async (req: Request, res: Response): Promise<void> => {
    const { candidateId } = req.params;

    if (!candidateId || isNaN(Number(candidateId))) {
        console.error('Invalid candidateId:', candidateId);
        res.status(400).json({ message: 'Invalid or missing candidateId parameter' });
        return;
    }

    try {
        const result = await db.query(
            `SELECT 
                a.id, 
                a.status, 
                a.created_at, 
                j.title, 
                j.description, 
                j.location, 
                j.deadline, 
                j.requirements
             FROM applications a 
             JOIN jobs j ON a.job_id = j.id 
             WHERE a.candidate_id = $1`,
            [Number(candidateId)]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ message: 'Error fetching applications', error });
    }
};

export const getApplications = async (req: Request, res: Response) => {
    const { jobTitle, status, startDate, endDate } = req.query;

    try {
        const query = `
            SELECT a.id, 
                   u.name AS candidate_name, 
                   j.title AS job_title, 
                   j.description AS job_description, 
                   j.requirements AS job_requirements,
                   a.status, 
                   a.created_at AS submitted_on, 
                   a.cv_path,
                   a.message AS candidate_message
            FROM applications a
            JOIN users u ON a.candidate_id = u.id
            JOIN jobs j ON a.job_id = j.id
            WHERE ($1::text IS NULL OR j.title ILIKE $1)
            AND ($2::text IS NULL OR a.status = $2)
            AND ($3::date IS NULL OR a.created_at >= $3)
            AND ($4::date IS NULL OR a.created_at <= $4)
        `;
        const values = [
            jobTitle ? `%${jobTitle}%` : null,
            status || null,
            startDate || null,
            endDate || null,
        ];
        const result = await db.query(query, values);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
    const { id } = req.params; 
    const { status } = req.body; 

    try {
        await db.query('UPDATE applications SET status = $1 WHERE id = $2', [status, id]);

        if (status === 'approved') {
            const result = await db.query(
                'SELECT job_id FROM applications WHERE id = $1',
                [id]
            );

            const jobId = result.rows[0]?.job_id;

            if (jobId) {
                await db.query(
                    'UPDATE jobs SET status = $1 WHERE id = $2',
                    ['closed', jobId]
                );
            }
        }

        res.json({ message: 'Status updated successfully' });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'Error updating status' });
    }
};
