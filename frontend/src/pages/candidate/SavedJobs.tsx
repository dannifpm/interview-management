import React, { useState, useEffect } from 'react';
import { fetchSavedJobs, removeSavedJob } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import './SavedJobs.css';
import { useNavigate } from 'react-router-dom';

const SavedJobs: React.FC = () => {
    const [savedJobs, setSavedJobs] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const loadSavedJobs = async () => {
            try {
                const saved = await fetchSavedJobs();
                setSavedJobs(saved);
            } catch (error) {
                console.error('Error fetching saved jobs:', error);
            }
        };

        loadSavedJobs();
    }, []);

    const handleRemoveJob = async (jobId: number) => {
        try {
            await removeSavedJob(jobId);
            setSavedJobs(savedJobs.filter((job) => job.id !== jobId));
        } catch (error) {
            console.error('Error removing saved job:', error);
        }
    };

    return (
        <div className="saved-jobs-container">
            <Sidebar />
            <h1>Saved Jobs</h1>
            {savedJobs.length === 0 ? (
                <p className="no-saved-jobs">You have not saved any jobs yet.</p>
            ) : (
                <ul className="saved-jobs-list">
                    {savedJobs.map((job) => (
                        <li key={job.id} className="saved-job-item">
                            <div className="saved-job-info">
                                <h3>{job.title}</h3>
                                <p className="description">{job.description}</p>
                                <p>
                                    <strong>Location:</strong> {job.location}
                                </p>
                            </div>
                            <div className="saved-job-actions">
                                <button
                                    className="apply-btn"
                                    onClick={() => navigate(`/job-details-candidate/${job.id}`)}
                                >
                                    Apply
                                </button>
                                <button
                                    className="remove-btn"
                                    onClick={() => handleRemoveJob(job.id)}
                                >
                                    Remove
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SavedJobs;
