import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import './InterviewsRecruiter.css';
import Sidebar from '../../components/Sidebar';
import api, { createInterview, fetchAllScheduledInterviews, getApplications } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';

interface Interview {
    id: number;
    candidate_name: string;
    job_title: string;
    interviewer_name: string;
    start_time: string;
    link: string;
    duration: number;
}

interface Application {
    id: number;
    candidate_name: string;
    job_title: string;
}

const InterviewsRecruiter: React.FC = () => {
    const location = useLocation();
    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        candidate_name: '',
        job_title: '',
        application_id: '',
        interviewer_id: '',
        interview_date: '',
        interview_time: '',
        link: '',
        duration: 0,
    });

    const [modalMessage, setModalMessage] = useState<string | null>(null);
    const [modalTitle, setModalTitle] = useState<string | null>(null);
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const [editInterview, setEditInterview] = useState<Interview | null>(null);
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');
    const [newLink, setNewLink] = useState('');
    const [newDuration, setNewDuration] = useState<number>(0);
    const [deleteInterviewId, setDeleteInterviewId] = useState<number | null>(null);
    const [isFormCleared, setIsFormCleared] = useState(false);

    useEffect(() => {
        if (!isFormCleared) {
            setFormData({
                candidate_name: queryParams.get('candidate_name') || '',
                job_title: queryParams.get('job_title') || '',
                application_id: queryParams.get('application_id') || '',
                interviewer_id: user?.id?.toString() || '',
                interview_date: '',
                interview_time: '',
                link: '',
                duration: 0,
            });
        }
    }, [queryParams, user, isFormCleared]);

    useEffect(() => {
        const action = queryParams.get('action');
        const applicationId = queryParams.get('application_id');
    
        if (action === 'quick' || (location.pathname === '/interviews-recruiter' && !applicationId)) {
            setShowDropdown(true);
            fetchApplications();
        } else {
            setShowDropdown(false);
        }
    
        setFormData({
            candidate_name: queryParams.get('candidate_name') || '',
            job_title: queryParams.get('job_title') || '',
            application_id: applicationId || '',
            interviewer_id: user?.id?.toString() || '',
            interview_date: '',
            interview_time: '',
            link: '',
            duration: 0,
        });
    }, [queryParams, user, location.pathname]);
    
    const fetchApplications = async () => {
        try {
            const response = await getApplications({});
            setApplications(response.data);
        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    };

    const loadAllInterviews = async () => {
        setLoading(true);
        try {
            const data = await fetchAllScheduledInterviews();
            setInterviews(data);
        } catch (error) {
            console.error('Error fetching all interviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAllInterviews();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleApplicationSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedApplicationId = e.target.value;
        const selectedApplication = applications.find((app) => app.id.toString() === selectedApplicationId);
        if (selectedApplication) {
            setFormData((prev) => ({
                ...prev,
                candidate_name: selectedApplication.candidate_name,
                job_title: selectedApplication.job_title,
                application_id: selectedApplicationId,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.interview_date || !formData.interview_time || !formData.link || !formData.duration) {
            setModalTitle('Missing fields');
            setModalMessage('Please fill in all required fields.');
            return;
        }

        try {
            const interviewData = {
                application_id: Number(formData.application_id),
                interviewer_id: Number(formData.interviewer_id),
                start_time: `${formData.interview_date}T${formData.interview_time}:00`,
                end_time: `${formData.interview_date}T${formData.interview_time}:00`,
                link: formData.link,
                duration: formData.duration,
            };
            await createInterview(interviewData);
            setModalTitle('Interview Scheduled');
            setModalMessage('Interview scheduled successfully!');
            setFormData({
                candidate_name: '',
                job_title: '',
                application_id: '',
                interviewer_id: user?.id?.toString() || '',
                interview_date: '',
                interview_time: '',
                link: '',
                duration: 0,
            });
            setIsFormCleared(true);
            setLoading(true);
            const data = await fetchAllScheduledInterviews();
            setInterviews(data);
        } catch (error: any) {
            console.error('Error scheduling interview:', error);
            if (error.response?.status === 409) {
                setModalTitle('Interview already scheduled');
                setModalMessage('An interview was already scheduled for this application.');
            } else {
                setModalTitle('Error scheduling interview');
                setModalMessage('Error scheduling interview. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (interview: Interview) => {
        setEditInterview(interview);
        setNewDate(interview.start_time.split('T')[0]);
        setNewTime(interview.start_time.split('T')[1].slice(0, 5));
        setNewLink(interview.link);
        setNewDuration(interview.duration);
    };

    const handleReSchedule = async () => {
        if (!newDate || !newTime || !editInterview || !newLink || !newDuration) return;

        try {
            const updatedData = {
                start_time: `${newDate}T${newTime}:00`,
                end_time: `${newDate}T${newTime}:00`,
                link: newLink,
                duration: newDuration,
            };

            await api.put(`/interviews/${editInterview.id}`, updatedData);
            setModalTitle('Interview rescheduled');
            setModalMessage('Interview rescheduled successfully!');
            setEditInterview(null);
            await loadAllInterviews();
        } catch (error) {
            console.error('Error updating interview:', error);
            setModalTitle('Reschedule Error');
            setModalMessage('Failed to reschedule interview.');
        }
    };

    const handleDeleteInterview = async () => {
        if (!deleteInterviewId) return;

        try {
            await api.delete(`/interviews/${deleteInterviewId}`);
            setModalTitle('Interview cancelled');
            setModalMessage('Interview cancelled successfully!');
            setDeleteInterviewId(null);
            loadAllInterviews();
        } catch (error) {
            console.error('Error deleting interview:', error);
            setModalTitle('Cancel Interview Error');
            setModalMessage('Failed to cancel interview.');
        }
    };

    return (
        <div className="interview-container">
            <Sidebar />
            <h1>Schedule Interview</h1>
            <form className="interview-form" onSubmit={handleSubmit}>
                {showDropdown && (
                    <>
                        <label className="dropdown-label">Select Application:</label>
                        <select className="dropdown" onChange={handleApplicationSelect} defaultValue="">
                            <option value="" disabled>
                                -- Select an application --
                            </option>
                            {applications.map((app) => (
                                <option key={app.id} value={app.id}>
                                    {app.candidate_name} - {app.job_title}
                                </option>
                            ))}
                        </select>
                    </>
                )}
                <label>Candidate Name:</label>
                <input type="text" name="candidate_name" value={formData.candidate_name} readOnly />

                <label>Job Title:</label>
                <input type="text" name="job_title" value={formData.job_title} readOnly />

                <label>Date:</label>
                <input type="date" name="interview_date" value={formData.interview_date} onChange={handleInputChange} required />

                <label>Time:</label>
                <input type="time" name="interview_time" value={formData.interview_time} onChange={handleInputChange} required />

                <label>Link:</label>
                <input type="text" name="link" value={formData.link} onChange={handleInputChange} required />

                <label>Duration (minutes):</label>
                <input type="number" name="duration" value={formData.duration} onChange={handleInputChange} required />

                <button type="submit" className="submit-btn">
                    Schedule Interview
                </button>
            </form>

            <h2>Scheduled Interviews</h2>
            {loading ? (
                <p>Loading interviews...</p>
            ) : interviews.length === 0 ? (
                <p>No scheduled interviews yet</p>
            ) : (
                <table className="interview-table">
                    <thead>
                        <tr>
                            <th>Candidate Name</th>
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
                                <tr key={interview.id} className={isUpcoming ? 'upcoming-interview' : ''}>
                                    <td>{interview.candidate_name}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {interview.job_title}
                                            {isUpcoming && (
                                                <span className="badge upcoming-badge">Upcoming</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>{interview.interviewer_name}</td>
                                    <td>{interviewTime.toLocaleString()}</td>
                                    <td className="action-buttons">
                                        <button
                                            className="reschedule-btn"
                                            onClick={() => handleEditClick(interview)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="cancel-btn"
                                            onClick={() => setDeleteInterviewId(interview.id)}
                                        >
                                            Cancel
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

            {modalMessage && modalTitle && (
                <Modal
                    title={modalTitle}
                    message={modalMessage}
                    onClose={() => setModalMessage(null)}
                />
            )}

            {editInterview && (
                <div className="modal">
                    <h3>Edit Interview</h3>
                    <label>Date:</label>
                    <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                    <label>Time:</label>
                    <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
                    <label>Link:</label>
                    <input type="text" value={newLink} onChange={(e) => setNewLink(e.target.value)} />
                    <label>Duration (minutes):</label>
                    <input type="number" value={newDuration} onChange={(e) => setNewDuration(Number(e.target.value))} />
                    <div className="modal-buttons">
                        <button className="reschedule-btn" onClick={handleReSchedule}>
                            Save
                        </button>
                        <button className="cancel-btn" onClick={() => setEditInterview(null)}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {deleteInterviewId && (
                <div className="modal">
                    <h3>Are you sure you want to cancel this interview?</h3>
                    <div className="modal-buttons">
                        <button className="cancel-btn" onClick={handleDeleteInterview}>Yes, Cancel</button>
                        <button className="reschedule-btn" onClick={() => setDeleteInterviewId(null)}>No, Go Back</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InterviewsRecruiter;
