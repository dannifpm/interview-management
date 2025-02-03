import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './InterviewsCandidate.css';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';

const InterviewsCandidate: React.FC = () => {
    const [interviews, setInterviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedInterview, setSelectedInterview] = useState<any | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchInterviews = async () => {
            if (!user?.id) return;

            try {
                const response = await api.get(`/interviews/candidate/${user.id}`);
                setInterviews(response.data);
            } catch (error) {
                console.error('Error fetching interviews:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInterviews();
    }, [user]);

    const handleViewDetails = (interview: any) => {
        setSelectedInterview(interview);
    };

    return (
        <div className="interview-container">
            <Sidebar />
            <h1>My Interviews</h1>

            {loading ? (
                <p>Loading...</p>
            ) : interviews.length === 0 ? (
                <p>No interviews scheduled yet.</p>
            ) : (
                <table className="interview-table">
                    <thead>
                        <tr>
                            <th>Job Title</th>
                            <th>Interviewer</th>
                            <th>Date & Time</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {interviews.map((interview) => {
                            const interviewTime = new Date(interview.start_time);
                            const now = new Date();
                            const hoursDifference = (interviewTime.getTime() - now.getTime()) / (1000 * 60 * 60);
                            const isUpcoming = hoursDifference > 0 && hoursDifference <= 24;

                            return (
                                <tr key={interview.id} className={isUpcoming ? 'upcoming-row' : ''}>
                                    <td>
                                        {interview.job_title || 'No Job Assigned'}{' '}
                                        {isUpcoming && (
                                            <span className="badge upcoming-badge">Upcoming</span>
                                        )}
                                    </td>
                                    <td>{interview.interviewer_name || 'Not Assigned'}</td>
                                    <td>{interviewTime.toLocaleString()}</td>
                                    <td>
                                        <button
                                            className="details-btn"
                                            onClick={() => handleViewDetails(interview)}
                                        >
                                            View Details
                                        </button>
                                        {interview.link && (
                                            <button
                                                className="join-btn"
                                                onClick={() => window.open(interview.link, '_blank')}
                                            >
                                                Join
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}

            {selectedInterview && (
                <Modal
                    title={`Interview Details - ${selectedInterview.job_title}`}
                    message={
                        <>
                            <p><strong>Interviewer:</strong> {selectedInterview.interviewer_name}</p>
                            <p>
                                <strong>Link:</strong>{" "}
                                <a
                                    href={selectedInterview.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="link"
                                >
                                    {selectedInterview.link}
                                </a>
                            </p>
                            <p><strong>Duration:</strong> {selectedInterview.duration} minutes</p>
                        </>
                    }
                    onClose={() => setSelectedInterview(null)}
                />
            )}
        </div>
    );
};

export default InterviewsCandidate;
