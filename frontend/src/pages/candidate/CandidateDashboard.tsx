import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import './CandidateDashboard.css';
import { useAuth } from '../../context/AuthContext';
import { fetchCandidateOverview, fetchCandidateUpcomingInterviews } from '../../services/api';

const CandidateDashboard: React.FC = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState({
    totalApplications: 0,
    ongoingApplications: 0,
    scheduledInterviews: 0,
    totalInterviews: 0,
    approvedOffers: 0,
  });

  interface UpcomingInterview {
    interview_id: number;
    start_time: string;
    link: string;
    duration: number;
    job_title: string;
    interviewer_name: string;
  }

  const [upcomingInterviews, setUpcomingInterviews] = useState<UpcomingInterview[]>([]);


  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const data = await fetchCandidateOverview();
        setOverview(data);
      } catch (error) {
        console.error('Error fetching overview:', error);
      }
    };

    fetchOverview();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchCandidateUpcomingInterviews();
        setUpcomingInterviews(data);
      } catch (error) {
        console.error('Error fetching upcoming interviews:', error);
      }
    };

    fetchData();
  }, []);

  const handleFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(e.target.value).toISOString();
    const filteredInterviews = upcomingInterviews.filter(
      (interview) =>
        new Date(interview.start_time).toISOString().slice(0, 10) === selectedDate.slice(0, 10)
    );
    setUpcomingInterviews(filteredInterviews);
  };

  return (
    <div className="candidate-dashboard-container">
      <Sidebar />
      <main className="main-content">
        <h1>Welcome, {user?.name || 'User'}!</h1>
        <div className="candidate-dashboard-sections">
          <section className="candidate-dashboard-section">
            <h2>Overview</h2>
            <div className="stats">
              <div className="stat-item">
                <h3>{overview.totalApplications}</h3>
                <p>Total Applications</p>
              </div>
              <div className="stat-item">
                <h3>{overview.ongoingApplications}</h3>
                <p>Ongoing Applications</p>
              </div>
              <div className="stat-item">
                <h3>{overview.scheduledInterviews}</h3>
                <p>Scheduled Interviews</p>
              </div>
              <div className="stat-item">
                <h3>{overview.totalInterviews}</h3>
                <p>Total Interviews (All)</p>
              </div>
              <div className="stat-item">
                <h3>{overview.approvedOffers}</h3>
                <p>Approved Offers</p>
              </div>
            </div>
          </section>

          <section className="candidate-dashboard-section">
            <h2>Upcoming Interviews</h2>
            <div className="filter-container">
              <label htmlFor="filter-date">Filter by Date:</label>
              <input type="date" id="filter-date" onChange={handleFilter} />
            </div>
            {upcomingInterviews.length > 0 ? (
              <ul>
                {upcomingInterviews.map((interview) => (
                  <li key={interview.interview_id}>
                    <strong>Job:</strong> {interview.job_title}
                    <br />
                    <strong>Interviewer:</strong> {interview.interviewer_name}
                    <br />
                    <strong>Date:</strong> {new Date(interview.start_time).toLocaleDateString()}
                    <br />
                    <strong>Time:</strong> {new Date(interview.start_time).toLocaleTimeString()}
                    <br />
                    <strong>Duration:</strong> {interview.duration} minutes
                    <br />
                    <button
                      className="join-button"
                      onClick={() => window.open(interview.link, '_blank')}
                    >
                      Join Interview
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-interviews">No upcoming interviews</p>
            )}
          </section>

          <section className="candidate-dashboard-section">
            <h2>Quick Actions</h2>
            <div className="actions">
              <button onClick={() => (window.location.href = '/settings')}>
                Update Profile
              </button>
              <button onClick={() => (window.location.href = '/saved-jobs')}>
                Saved Jobs
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default CandidateDashboard;
