import React from 'react';
import { ReactComponent as DashboardIcon } from '../assets/icons/dashboard.svg';
import { ReactComponent as JobListingsIcon } from '../assets/icons/job-listings.svg';
import { ReactComponent as ApplicationsIcon } from '../assets/icons/applications.svg';
import { ReactComponent as InterviewsIcon } from '../assets/icons/interviews.svg';
import { ReactComponent as ReportsIcon } from '../assets/icons/reports.svg';
import { ReactComponent as SettingsIcon } from '../assets/icons/settings.svg';
import { ReactComponent as LogoutIcon } from '../assets/icons/logout.svg';
import { ReactComponent as myApplicationsIcon } from '../assets/icons/my-applications.svg';
import { ReactComponent as savedJobs } from '../assets/icons/saved-jobs.svg';

const icons = {
  dashboard: DashboardIcon,
  jobListings: JobListingsIcon,
  applications: ApplicationsIcon,
  interviews: InterviewsIcon,
  reports: ReportsIcon,
  settings: SettingsIcon,
  logout: LogoutIcon,
  myApplications: myApplicationsIcon,
  savedJobs: savedJobs
};

export type IconName = keyof typeof icons;

type IconProps = {
  name: IconName;
  className?: string;
};

const Icon: React.FC<IconProps> = ({ name, className }) => {
  const SvgIcon = icons[name];
  return <SvgIcon className={className} />;
};

export default Icon;
