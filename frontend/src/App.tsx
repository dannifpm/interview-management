import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import { useAuth } from './context/AuthContext';
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import JobListingsRecruiter from './pages/recruiter/JobListingsRecruiter';
import JobDetailsRecruiter from './pages/recruiter/JobDetailsRecruiter';
import JobListingsCandidate from './pages/candidate/JobListingsCandidate';
import JobDetailsCandidate from './pages/candidate/JobDetailsCandidate';
import MyApplications from './pages/candidate/MyApplications';
import Applications from './pages/recruiter/Applications';
import InterviewsRecruiter from './pages/recruiter/InterviewsRecruiter';
import InterviewsCandidate from './pages/candidate/InterviewsCandidate';
import Settings from './pages/Settings';
import RecruiterReports from './pages/recruiter/RecruiterReports';
import SavedJobs from './pages/candidate/SavedJobs';


const App: React.FC = () => {
  const { user } = useAuth();

  const getDashboard = () => {
    if (!user) {
      return <Navigate to="/" />;
    }
    return user.role === 'recruiter' ? (
      <RecruiterDashboard />
    ) : (
      <CandidateDashboard />
    );
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={getDashboard()} />
        <Route path="/jobs-listings-recruiter" element={<JobListingsRecruiter />} />
        <Route
          path="/jobs/:id"
          element={
            <JobDetailsRecruiterWrapper />
          }
        />
        <Route path="/jobs-listings-candidate" element={<JobListingsCandidate />} />
        <Route path="/job-details-candidate/:id" element={<JobDetailsCandidate />} />
        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/interviews-recruiter" element={<InterviewsRecruiter />} />
        <Route path="/interviews-candidate" element={<InterviewsCandidate />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/reports" element={<RecruiterReports />} />
        <Route path="/saved-jobs" element={<SavedJobs />} />
      </Routes>
    </Router>
  );
};

const JobDetailsRecruiterWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const jobId = parseInt(id || '0', 10);

  if (!jobId) {
    return <div>Invalid job ID</div>;
  }

  return (
    <JobDetailsRecruiter
      jobId={jobId}
      onCancel={() => (window.location.href = '/jobs-listings')}
      onJobUpdated={() => window.location.reload()}
    />
  );
};

export default App;
