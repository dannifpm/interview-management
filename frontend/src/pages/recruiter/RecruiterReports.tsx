import React, { useEffect, useState } from 'react';
import {
  fetchJobReportsCSV,
  fetchJobReportsPDF,
  fetchRecruiterJobReports,
} from '../../services/api';
import './RecruiterReports.css';
import Sidebar from '../../components/Sidebar';

const RecruiterReports: React.FC = () => {
  const [reports, setReports] = useState([]);
  const [dateRange, setDateRange] = useState<number | undefined>();
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<string | undefined>();
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await fetchRecruiterJobReports(dateRange, search, status);
        setReports(data);
      } catch (err) {
        console.error('Error fetching job reports:', err);
      }
    };

    fetchReports();
  }, [dateRange, search, status]);

  const handleExportCSV = async () => {
    try {
      const blob = await fetchJobReportsCSV();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'job_reports.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const handleExportPDF = async () => {
    try {
      const blob = await fetchJobReportsPDF();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'job_reports.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  const openModal = (item: any) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  return (
    <div className="job-reports">
      <Sidebar />
      <h1>Reports</h1>
      <div className="filters">
        <input
          type="text"
          placeholder="Search by title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select onChange={(e) => setDateRange(Number(e.target.value))} defaultValue="">
          <option value="">Select Date Range</option>
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
        <select onChange={(e) => setStatus(e.target.value)} defaultValue="">
          <option value="">Select Status</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Total Applications</th>
            <th>Approved</th>
            <th>Rejected</th>
            <th>Scheduled Interviews</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report: any) => (
            <tr key={report.job_id}>
              <td>{report.job_title}</td>
              <td>{report.total_applications}</td>
              <td>{report.approved_applications}</td>
              <td>{report.rejected_applications}</td>
              <td>{report.scheduled_interviews}</td>
              <td>{report.job_status}</td>
              <td>
                <button
                  className="view-details-button"
                  onClick={() => openModal(report)}
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Additional Details</h2>
            <div className="modal-body">
              <p><strong>Job Description:</strong></p>
              <p>{selectedItem.job_description || 'No detailed description available.'}</p>

              <p><strong>Requirements:</strong></p>
              <ul>
                {selectedItem.job_requirements
                  ? selectedItem.job_requirements.split('\n').map((req: string, index: number) => (
                      <li key={index}>{req}</li>
                    ))
                  : <li>No specific requirements provided.</li>}
              </ul>
            </div>
            <button className="close-btn" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}

      <div className="export-section">
        <button className="export-button" onClick={handleExportCSV}>Export as CSV</button>
        <button className="export-button" onClick={handleExportPDF}>Export as PDF</button>
      </div>
    </div>
  );
};

export default RecruiterReports;
