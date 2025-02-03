import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './MyApplications.css';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';

const MyApplications: React.FC = () => {
    const [applications, setApplications] = useState<any[]>([]);
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');

    useEffect(() => {
        const fetchApplications = async () => {
            if (!user?.id) {
                console.error('User ID is undefined, cannot fetch applications.');
                return;
            }
            try {
                const response = await api.get(`/applications/candidate/${user.id}`);
                setApplications(response.data);
            } catch (error) {
                console.error('Error fetching applications:', error);
            }
        };

        fetchApplications();
    }, [user]);

    const handleCardClick = (app: any) => {
        const requirementsList = app.requirements
            ? app.requirements.split(/[\n]+/).filter((req: string) => req.trim() !== '')
            : [];
        setModalTitle(`Requirements for ${app.title}`);
        setModalMessage(requirementsList);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="my-applications-container">
            <Sidebar />
            <h1>My Applications</h1>
            {applications.length === 0 ? (
                <p>You haven't submitted any applications yet.</p>
            ) : (
                <div className="applications-grid">
                    {applications.map((app) => (
                        <div
                            className="application-card"
                            key={app.id}
                            onClick={() => handleCardClick(app)}
                            style={{ cursor: 'pointer' }}
                            title="Click to view job requirements"
                        >
                            <h3>{app.title}</h3>
                            <p className="description">{app.description}</p>
                            <p><strong>Location:</strong> {app.location}</p>
                            <span className={`status-tag ${app.status.toLowerCase()}`}>
                                {app.status}
                            </span>
                            <p className="tooltip-indicator">Click to view requirements</p>
                        </div>
                    ))}
                </div>
            )}
            {isModalOpen && (
                <Modal
                    title={modalTitle}
                    message={
                        Array.isArray(modalMessage) ? (
                            <div className="requirements-grid">
                                {modalMessage.map((req, index) => (
                                    <div key={index} className="requirement-box">
                                        {req.trim()}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            modalMessage
                        )
                    }
                    onClose={closeModal}
                />
            )}
        </div>
    );
};

export default MyApplications;
