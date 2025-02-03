import React, { useState } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import './CreateJobForm.css';

interface CreateJobFormProps {
    onJobCreated: () => void;
}

const CreateJobForm: React.FC<CreateJobFormProps> = ({ onJobCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [requirements, setRequirements] = useState('');
    const [location, setLocation] = useState('');
    const [deadline, setDeadline] = useState('');
    const [modalMessage, setModalMessage] = useState<string | null>(null);
    const [modalTitle, setModalTitle] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCreateJob = async () => {
        if (!title || !description || !location || !deadline) {
            setModalTitle('Error');
            setModalMessage('All fields are required.');
            return;
        }

        try {
            setLoading(true);
            await api.post('/jobs', {
                title,
                description,
                requirements,
                location,
                deadline,
            });
            setModalTitle('Success');
            setModalMessage('Job created successfully!');
        } catch (error) {
            setModalTitle('Error');
            setModalMessage('Error creating job. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        if (modalTitle === 'Success') {
            onJobCreated();
        }
        setModalMessage(null);
        setModalTitle(null);
    };

    return (
        <div className="create-job-form-container">
            <form
                className="create-job-form"
                onSubmit={(e) => e.preventDefault()}
            >
                <h2>Create New Job</h2>

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
                        className="create-job-btn"
                        onClick={handleCreateJob}
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Job'}
                    </button>
                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={onJobCreated}
                    >
                        Cancel
                    </button>
                </div>
            </form>
            {modalMessage && modalTitle && (
                <Modal
                    title={modalTitle}
                    message={modalMessage}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default CreateJobForm;
