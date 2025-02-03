import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './JobDetailsCandidate.css';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';

const JobDetailsCandidate: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalMessage, setModalMessage] = useState<string | null>(null);
    const [modalTitle, setModalTitle] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const [cv, setCv] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);


    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                const response = await api.get(`/jobs/${id}`);
                setJob(response.data);
                setLoading(false);
            } catch (error) {
                setError('Failed to fetch job details. Please try again later.');
                setLoading(false);
            }
        };

        fetchJobDetails();
    }, [id]);

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cv) {
            setModalTitle('Application Failed');
            setModalMessage('Please upload your CV before submitting your application.');
            return;
        }

        setIsSubmitting(true);

        if (!user || !user.id) {
            setModalTitle('Application Failed');
            setModalMessage('User authentication failed. Please log in and try again.');
            return;
        }

        const formData = new FormData();
        formData.append('jobId', id || '');
        formData.append('candidateId', user.id.toString());
        formData.append('message', message || '');
        formData.append('cv', cv);

        try {
            await api.post('/applications', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setModalTitle('Application Submitted');
            setModalMessage('Your application has been submitted successfully!');
        } catch (error: any) {
            if (error.response && error.response.status === 409) {
                setModalTitle('Application Failed');
                setModalMessage('You have already applied for this job.');
            } else {
                setModalTitle('Application Failed');
                setModalMessage('Failed to submit your application. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCvFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setCv(event.target.files[0]);
        }
    };

    const closeModal = () => {
        setModalMessage(null);
        setModalTitle(null);
        if (modalTitle === 'Application Submitted') {
            navigate('/my-applications');
        }
    };

    if (loading) {
        return <div className="job-details-candidate-container">Loading...</div>;
    }

    if (error) {
        return <div className="job-details-candidate-container">{error}</div>;
    }

    return (
        <div className="job-details-candidate-container">
            <Sidebar />
            <h2>{job.title}</h2>
            <p>
                <strong>Description:</strong> {job.description}
            </p>
            <p>
                <strong>Requirements:</strong>
                <div className="requirements-container">
                    {job.requirements
                        .split(/(\n)/)
                        .filter((req: string) => req.trim().length > 0 && req !== ".")
                        .map((req: string, index: number) => (
                            <div key={index} className="requirement-item">
                                {req.trim()}
                            </div>
                        ))}
                </div>
            </p>
            <p>
                <strong>Location:</strong> {job.location}
            </p>
            <textarea
                className="message-input"
                placeholder="Write a message (optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <div className="file-upload">
                <label htmlFor="cv-upload" className="upload-label">
                    Upload CV:
                </label>
                <input
                    type="file"
                    id="cv-upload"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCvFileChange}
                />
            </div>
            <div className="button-group">
                <button className="apply-btn" onClick={handleApply} disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Confirm Apply'}
                </button>
                <button className="back-btn" onClick={() => navigate(-1)}>
                    Back
                </button>
            </div>
            {modalMessage && modalTitle && (
                <Modal title={modalTitle} message={modalMessage} onClose={closeModal} />
            )}
        </div>
    );
};

export default JobDetailsCandidate;
