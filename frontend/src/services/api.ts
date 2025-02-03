import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchJobs = () => api.get('/jobs');
export const fetchJobDetails = (id: number) => api.get(`/jobs/${id}`);
export const createJob = (jobData: any) => api.post('/jobs', jobData);
export const updateJob = (id: number, jobData: any) => api.put(`/jobs/${id}`, jobData);
export const getApplications = (filters?: Record<string, string>) => {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.jobTitle) params.append('jobTitle', filters.jobTitle);
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
  }

  return api.get('/applications', { params });
};


export const updateApplicationStatus = (id: number, status: string) => {
  return api.put(`/applications/${id}/status`, { status });
};

export const createInterview = (interviewData: any) => {
  return api.post('/interviews', interviewData);
};

export const fetchAllScheduledInterviews = async () => {
  const response = await api.get('/interviews/scheduled');
  return response.data;
};

export const fetchRecruiterOverview = async () => {
  const response = await api.get('dashboard/overview');
  return response.data;
};

export const fetchUpcomingInterviews = async () => {
  const response = await api.get('dashboard/interviews/upcoming');
  return response.data;
};

export const fetchCandidateOverview = async () => {
  const response = await api.get('/dashboard/candidate/overview');
  return response.data;
};

export const fetchCandidateUpcomingInterviews = async () => {
  const response = await api.get('dashboard/interviews/candidate/upcoming');
  return response.data;
};

export const fetchRecruiterJobReports = async (
  dateRange?: number,
  search?: string,
  status?: string
) => {
  const params = { dateRange, search, status };
  const response = await api.get('/reports/jobs', { params });
  return response.data;
};

export const fetchJobReportsCSV = async () => {
  const response = await api.get('/reports/export/csv', {
    responseType: 'blob',
  });

  const blob = new Blob([response.data], { type: 'text/csv' });
  return blob;
};

export const fetchJobReportsPDF = async () => {
  const response = await api.get('/reports/export/pdf', {
    responseType: 'blob',
  });

  const blob = new Blob([response.data], { type: 'application/pdf' });
  return blob;
};

export const saveJob = async (jobId: number) => {
  const response = await api.post('jobs/saved-jobs', { jobId });
  return response.data;
};

export const removeSavedJob = async (jobId: number) => {
  const response = await api.delete(`jobs/saved-jobs`, { data: { jobId } });
  return response.data;
};

export const fetchSavedJobs = async () => {
  const response = await api.get('jobs/saved-jobs');
  return response.data;
};

export const fetchApplicationStatusData = async () => {
  const response = await api.get('dashboard/application-status');
  return response.data;
};

export const fetchWeeklyApplicationsData = async () => {
  const response = await api.get('dashboard/weekly-applications');
  return response.data;
};


export default api;