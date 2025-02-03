import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './JobDetailsRecruiter.css';
import Modal from '../../components/Modal';

interface JobDetailsRecruiterProps {
    jobId: number;
    onCancel: () => void;
    onJobUpdated: () => void;
}

const JobDetailsRecruiter: React.FC<JobDetailsRecruiterProps> = ({ jobId, onCancel, onJobUpdated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [requirements, setRequirements] = useState('');
    const [location, setLocation] = useState('');
    const [deadline, setDeadline] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalTitle, setModalTitle] = useState<string | null>(null);
    const [modalMessage, setModalMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                const response = await api.get(`/jobs/${jobId}`);
                const job = response.data;
                setTitle(job.title);
                setDescription(job.description);
                setRequirements(job.requirements || '');
                setLocation(job.location);
                setDeadline(job.deadline.split('T')[0]);
                setLoading(false);
            } catch (error) {
                setError('Failed to fetch job details. Please try again.');
                setLoading(false);
            }
        };

        fetchJobDetails();
    }, [jobId]);

    const handleSaveChanges = async () => {
        if (!title || !description || !location || !deadline) {
            setError('All fields are required.');
            return;
        }

        try {
            setLoading(true);
            await api.put(`/jobs/${jobId}`, {
                title,
                description,
                requirements,
                location,
                deadline,
            });
            setLoading(false);
            setModalTitle("Job Updated");
            setModalMessage("Job updated successfully!");
        } catch (error) {
            setError('Failed to update job. Please try again.');
            setLoading(false);
        }
    };

    const closeModal = () => {
        setModalTitle(null);
        setModalMessage(null);
        onJobUpdated();
        onCancel();
    };

    if (loading) {
        return <div className="job-details-container"><p className="loading-message">Loading job details...</p></div>;
    }

    if (error) {
        return (
            <div className="job-details-container">
                <p className="error-message">{error}</p>
                <button className="cancel-btn" onClick={onCancel}>Back</button>
            </div>
        );
    }

    return (
        <div className="job-details-container">
            <form className="job-details-form" onSubmit={(e) => e.preventDefault()}>
                <h2>Edit Job Details</h2>

                <label htmlFor="title">Job Title</label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <label htmlFor="description">Job Description</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <label htmlFor="requirements">Job Requirements</label>
                <textarea
                    id="requirements"
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                />

                <label htmlFor="location">Location</label>
                <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                />

                <label htmlFor="deadline">Application Deadline</label>
                <input
                    type="date"
                    id="deadline"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                />

                <div className="button-group">
                    <button
                        type="button"
                        className="save-btn"
                        onClick={handleSaveChanges}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                </div>
            </form>
            {modalMessage && modalTitle && (
                <Modal
                    title={modalTitle}
                    message={modalMessage}
                    onClose={closeModal}
                />
            )}
        </div>
    );
};

export default JobDetailsRecruiter;
