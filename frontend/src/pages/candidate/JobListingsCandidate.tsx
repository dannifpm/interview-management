import React, { useState, useEffect } from 'react';
import api, { fetchSavedJobs, removeSavedJob, saveJob } from '../../services/api';
import './JobListingsCandidate.css';
import Sidebar from '../../components/Sidebar';
import { useNavigate } from 'react-router-dom';

const JobListingsCandidate: React.FC = () => {
    const [jobs, setJobs] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [savedJobs, setSavedJobs] = useState<number[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await api.get('/jobs');
                setJobs(response.data.filter((job: any) => job.status === 'open'));
            } catch (error) {
                console.error('Error fetching jobs:', error);
            }
        };

        fetchJobs();
    }, []);

    useEffect(() => {
        const loadSavedJobs = async () => {
            try {
                const saved = await fetchSavedJobs();
                setSavedJobs(saved.map((job: any) => job.id)); 
            } catch (error) {
                console.error('Error fetching saved jobs:', error);
            }
        };

        loadSavedJobs();
    }, []);

    const handleSaveJob = async (jobId: number) => {
        if (savedJobs.includes(jobId)) {
            await removeSavedJob(jobId);
            setSavedJobs(savedJobs.filter((id) => id !== jobId));
        } else {
            await saveJob(jobId);
            setSavedJobs([...savedJobs, jobId]);
        }
    };

    const filteredJobs = jobs.filter((job) =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="job-listings-candidate-container">
            <Sidebar />
            <h1>Available Job Listings</h1>
            <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-bar"
            />
            <ul className="job-listings">
                {filteredJobs.map((job) => (
                    <li key={job.id} className="job-item">
                        <div className="job-info">
                            <h3>{job.title}</h3>
                            <p className="description">{job.description}</p>
                            <p>
                                <strong>Location:</strong> {job.location}
                            </p>
                        </div>
                        <div className="job-actions">
                            <button
                                className="apply-btn"
                                onClick={() => navigate(`/job-details-candidate/${job.id}`)}
                            >
                                Apply
                            </button>
                            <button
                                className={`save-btn ${savedJobs.includes(job.id) ? 'saved' : ''}`}
                                onClick={() => handleSaveJob(job.id)}
                            >
                                {savedJobs.includes(job.id) ? 'Unsave' : 'Save'}
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default JobListingsCandidate;
