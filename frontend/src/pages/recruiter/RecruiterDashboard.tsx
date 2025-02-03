import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import './RecruiterDashboard.css';
import { useAuth } from '../../context/AuthContext';
import { fetchRecruiterOverview, fetchUpcomingInterviews, fetchApplicationStatusData, fetchWeeklyApplicationsData } from '../../services/api';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as LineTooltip } from 'recharts';

const RecruiterDashboard: React.FC = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState({
    totalInterviews: 0,
    totalOffersApproved: 0,
    totalOpenJobs: 0,
    totalCandidates: 0,
  });

  interface UpcomingInterview {
    interview_id: number;
    start_time: string;
    link: string;
    duration: number;
    job_title: string;
    candidate_name: string;
  }

  interface WeeklyApplicationData {
    week: string;
    applications: number;
  }

  interface ApplicationStatusData {
    name: string;
    value: number;
  }

  const [upcomingInterviews, setUpcomingInterviews] = useState<UpcomingInterview[]>([]);
  const [applicationStatusData, setApplicationStatusData] = useState<ApplicationStatusData[]>([]);
  const [weeklyApplicationsData, setWeeklyApplicationsData] = useState<WeeklyApplicationData[]>([]);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const overviewData = await fetchRecruiterOverview();
        setOverview(overviewData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    const fetchGraphData = async () => {
      try {
        const statusData: ApplicationStatusData[] = await fetchApplicationStatusData();
        const weeklyData: WeeklyApplicationData[] = await fetchWeeklyApplicationsData();

        const currentDate = new Date();
        const pastSevenDays = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(currentDate.getDate() - (6 - i));
          return date.toISOString().slice(0, 10);
        });

        const filledWeeklyData: WeeklyApplicationData[] = pastSevenDays.map((day) => {
          const existingEntry = weeklyData.find((entry) => entry.week === day);
          return existingEntry || { week: day, applications: 0 };
        });

        setApplicationStatusData(statusData);
        setWeeklyApplicationsData(filledWeeklyData);
      } catch (error) {
        console.error('Error fetching graph data:', error);
      }
    };

    fetchOverviewData();
    fetchGraphData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchUpcomingInterviews();
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="recruiter-dashboard-container">
      <Sidebar />
      <main className="main-content">
        <h1>Welcome, {user?.name || 'User'}!</h1>
        <div className="recruiter-dashboard-sections">
          <section className="recruiter-dashboard-section">
            <h2>Overview</h2>
            <p>Summary of key information</p>
            <div className="stats">
              <div className="stat-item">
                <h3>{overview.totalInterviews}</h3>
                <p>Interviews Scheduled</p>
              </div>
              <div className="stat-item">
                <h3>{overview.totalOffersApproved}</h3>
                <p>Offers Approved</p>
              </div>
              <div className="stat-item">
                <h3>{overview.totalOpenJobs}</h3>
                <p>Open Jobs</p>
              </div>
              <div className="stat-item">
                <h3>{overview.totalCandidates}</h3>
                <p>Candidates in Process</p>
              </div>
            </div>
          </section>

          <section className="recruiter-dashboard-section">
            <h2>Applications Overview</h2>
            <div className="charts-container">
              <div className="chart">
                <h3>Applications Status</h3>
                <PieChart width={400} height={300}>
                  <Pie
                    data={applicationStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label
                  >
                    {applicationStatusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </div>
              <div className="chart">
                <h3>Weekly Applications</h3>
                <LineChart width={510} height={300} data={weeklyApplicationsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="week"
                    tickFormatter={formatXAxis}
                    ticks={weeklyApplicationsData.map((entry) => entry.week)}
                  />
                  <YAxis />
                  <LineTooltip />
                  <Line
                    type="monotone"
                    dataKey="applications"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </div>
            </div>
          </section>

          <section className="recruiter-dashboard-section">
            <h2>Upcoming Interviews</h2>
            <div className="filter-container">
              <label htmlFor="filter-date">Filter by Date:</label>
              <input type="date" id="filter-date" onChange={handleFilter} />
            </div>
            {upcomingInterviews.length > 0 ? (
              <ul>
                {upcomingInterviews.map((interview) => (
                  <li key={interview.interview_id}>
                    <strong>Candidate:</strong> {interview.candidate_name}
                    <br />
                    <strong>Job:</strong> {interview.job_title}
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

          <section className="recruiter-dashboard-section">
            <h2>Quick Actions</h2>
            <div className="actions">
              <button onClick={() => (window.location.href = '/interviews-recruiter?action=quick')}>
                Schedule an Interview
              </button>
              <button onClick={() => (window.location.href = '/settings')}>Update Profile</button>
              <button onClick={() => (window.location.href = '/reports')}>View Reports</button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default RecruiterDashboard;
