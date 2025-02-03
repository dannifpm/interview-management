import React, { useCallback, useEffect, useState } from 'react';
import { getApplications, updateApplicationStatus } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import './Applications.css';

const Applications: React.FC = () => {
    const [applications, setApplications] = useState<any[]>([]);
    const [filters, setFilters] = useState({ jobTitle: '', status: '', startDate: '', endDate: '' });
    const [loading, setLoading] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
    const [confirmationModal, setConfirmationModal] = useState<{ id: number; action: string } | null>(null);
    const [successModal, setSuccessModal] = useState<string | null>(null);

    const fetchApplications = useCallback(async () => {
        setLoading(true);
        try {
          const response = await getApplications(filters);
          setApplications(response.data);
        } catch (error) {
          console.error('Error fetching applications:', error);
        } finally {
          setLoading(false);
        }
      }, [filters]);
    
      useEffect(() => {
        fetchApplications();
      }, [fetchApplications]);
    

    const handleStatusChange = async (id: number, status: string) => {
        try {
            await updateApplicationStatus(id, status);
            fetchApplications();
            setSuccessModal(`The application has been ${status === 'approved' ? 'Approved' : 'Rejected'} successfully!`);
            closeConfirmationModal();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleScheduleInterview = (application: any) => {
        const params = new URLSearchParams({
            candidate_name: application.candidate_name,
            job_title: application.job_title,
            application_id: application.id.toString(),
        });
        window.location.href = `/interviews-recruiter?${params.toString()}`;
    };

    const openConfirmationModal = (id: number, action: string) => {
        setConfirmationModal({ id, action });
    };

    const closeConfirmationModal = () => {
        setConfirmationModal(null);
    };


    const openDetailsModal = (application: any) => {
        setSelectedApplication(application);
    };

    const closeDetailsModal = () => {
        setSelectedApplication(null);
    };

    const formatDate = (date: string | Date): string => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <div className="applications-container">
            <Sidebar />
            <div className="applications-content">
                <h1>Applications</h1>
                <div className="filters">
                    <input
                        placeholder="Job Title"
                        onChange={(e) => setFilters({ ...filters, jobTitle: e.target.value })}
                    />
                    <select onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <input
                        type="date"
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    />
                    <input
                        type="date"
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    />
                    <button onClick={() => setFilters({ jobTitle: '', status: '', startDate: '', endDate: '' })}>
                        Reset
                    </button>
                </div>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="applications-grid">
                        {applications.map((app) => (
                            <div className="application-card" key={app.id}>
                                <div className="card-header">
                                    <h3>{app.job_title}</h3>
                                    <span className={`status-badge status-${app.status}`}>{app.status}</span>
                                </div>
                                <p><strong>Candidate:</strong> {app.candidate_name}</p>
                                <p><strong>Submitted On:</strong> {formatDate(app.submitted_on)}</p>
                                <div className="card-actions">
                                    <button className="view-btn"
                                        onClick={() => window.open(`http://localhost:8080/${app.cv_path}`)}>
                                        View CV
                                    </button>
                                    <button
                                        className="details-btn"
                                        onClick={() => openDetailsModal(app)}
                                    >
                                        View Details
                                    </button>
                                    <button
                                        className="schedule-btn"
                                        onClick={() => handleScheduleInterview(app)}
                                    >
                                        Schedule Interview
                                    </button>
                                    <button
                                        className="approve-btn"
                                        onClick={() => openConfirmationModal(app.id, 'approved')}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        className="reject-btn"
                                        onClick={() => openConfirmationModal(app.id, 'rejected')}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {selectedApplication && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2 className="modal-title">Application Details</h2>
                            <div className="modal-body">
                                <p><strong>Candidate Name:</strong> {selectedApplication.candidate_name}</p>
                                <p><strong>Job Title:</strong> {selectedApplication.job_title}</p>

                                <div className="section">
                                    <h3>Job Description</h3>
                                    <p>{selectedApplication.job_description}</p>
                                </div>

                                <div className="section">
                                    <h3>Job Requirements</h3>
                                    <ul className="requirements-list">
                                        {selectedApplication.job_requirements
                                            .split(/(\n)/)
                                            .filter((req: string) => req.trim().length > 0 && req !== ".")
                                            .map((req: string, index: number) => (
                                                <li key={index}>{req.trim()}</li>
                                            ))}
                                    </ul>
                                </div>

                                {selectedApplication.candidate_message && (
                                    <div className="section">
                                        <h3>Candidate's Message</h3>
                                        <p className="candidate-message">{selectedApplication.candidate_message}</p>
                                    </div>
                                )}
                            </div>
                            <button className="close-btn" onClick={closeDetailsModal}>Close</button>
                        </div>
                    </div>
                )}
                {confirmationModal && (
                    <div className="modal-overlay">
                        <div className="modal-content confirm-modal">
                            <h2 className="modal-title">Confirm Action</h2>
                            <p className="modal-message">
                                Are you sure you want to <strong>{confirmationModal.action === 'approved' ? 'Approve' : 'Reject'}</strong> this application?
                            </p>
                            <div className="modal-buttons">
                                <button
                                    className="confirm-btn"
                                    onClick={() => handleStatusChange(confirmationModal.id, confirmationModal.action)}
                                >
                                    Confirm
                                </button>
                                <button className="cancel-btn" onClick={closeConfirmationModal}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {successModal && (
                    <div className="modal-overlay">
                        <div className="modal-content success-modal">
                            <h2 className="modal-title">Success</h2>
                            <p className="modal-message">{successModal}</p>
                            <button className="close-btn" onClick={() => setSuccessModal(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Applications;
