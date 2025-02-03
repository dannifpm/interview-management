import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { userRoutes, jobRoutes, interviewRoutes, applicationRoutes, dashboardRoutes, reportRoutes } from './routes';
import path from 'path';

dotenv.config();

const app = express();

app.use(cors({
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    credentials: true, 
  }));

app.use(express.json());

app.use('/users', userRoutes);
app.use('/jobs', jobRoutes);
app.use('/interviews', interviewRoutes);
app.use('/applications', applicationRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/reports', reportRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

