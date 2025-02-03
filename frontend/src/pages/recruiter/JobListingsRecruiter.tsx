import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import CreateJobForm from './CreateJobForm';
import JobDetails from './JobDetailsRecruiter';
import Sidebar from '../../components/Sidebar';
import './JobListingsRecruiter.css';

const JobListingsRecruiter: React.FC = () => {
    const [jobs, setJobs] = useState<any[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingJobId, setEditingJobId] = useState<number | null>(null);

    const fetchJobs = async () => {
        try {
            const response = await api.get('/jobs');
            setJobs(response.data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const toggleCreateForm = () => {
        setShowCreateForm(!showCreateForm);
    };

    const handleViewEdit = (jobId: number) => {
        setEditingJobId(jobId);
    };

    const handleCancelEdit = () => {
        setEditingJobId(null);
    };

    const handleJobUpdated = () => {
        fetchJobs();
        setEditingJobId(null);
    };

    return (
        <div className="job-listings-recruiter-container">
            <Sidebar />
            <div className="content">
                {showCreateForm ? (
                    <CreateJobForm
                        onJobCreated={() => {
                            fetchJobs();
                            setShowCreateForm(false);
                        }}
                    />
                ) : editingJobId ? (
                    <JobDetails
                        jobId={editingJobId}
                        onCancel={handleCancelEdit}
                        onJobUpdated={handleJobUpdated}
                    />
                ) : (
                    <>
                        <h1>Job Listings</h1>
                        {jobs.length === 0 && (
                            <p className="no-jobs-message">
                                No job listings available. Start by creating a new job!
                            </p>
                        )}
                        <ul className="job-listings">
                            {jobs.map((job) => (
                                <li key={job.id} className="job-item">
                                    <div className="job-info">
                                        <h3>{job.title}</h3>
                                        <p className="description">{job.description}</p>
                                        <p className="location">{job.location} </p>
                                        <p className={job.status === 'open' ? 'status-open' : 'status-closed'}>
                                            Status: {job.status}
                                        </p>
                                    </div>
                                    <div className="job-actions">
                                        <button
                                            className="view-edit-btn"
                                            onClick={() => handleViewEdit(job.id)}
                                        >
                                            View/Edit
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <button
                            className="create-job-btn"
                            onClick={toggleCreateForm}
                        >
                            Create New Job
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default JobListingsRecruiter;
