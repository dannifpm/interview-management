import { db } from './db';

const createTables = async () => {
  try {
    console.log('Creating tables...');

    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255),
        role VARCHAR(50),
        last_name VARCHAR(100),
        position VARCHAR(100),
        profile_picture VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS jobs (
          id SERIAL PRIMARY KEY,
          recruiter_id INT REFERENCES users(id) ON DELETE SET NULL,
          title VARCHAR(100),
          description TEXT,
          requirements TEXT,
          location VARCHAR(100),
          deadline DATE,
          status VARCHAR(20) DEFAULT 'open', 
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS interviews (
          id SERIAL PRIMARY KEY,
          candidate_id INT REFERENCES users(id) ON DELETE CASCADE,
          job_id INT REFERENCES jobs(id) ON DELETE SET NULL,
          application_id INT REFERENCES applications(id) ON DELETE CASCADE,
          interviewer_id INT REFERENCES users(id),
          start_time TIMESTAMP,
          end_time TIMESTAMP,
          link VARCHAR(255), 
          duration INT, 
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS applications (
          id SERIAL PRIMARY KEY,
          job_id INT REFERENCES jobs(id) ON DELETE CASCADE,
          candidate_id INT REFERENCES users(id),
          message TEXT,
          cv_path TEXT,
          status VARCHAR(20) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS saved_jobs (
          id SERIAL PRIMARY KEY,
          user_id INT REFERENCES users(id) ON DELETE CASCADE,
          job_id INT REFERENCES jobs(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS notifications (
          id SERIAL PRIMARY KEY,
          user_id INT NOT NULL,
          type VARCHAR(50) NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          read BOOLEAN DEFAULT FALSE
      );

      CREATE INDEX IF NOT EXISTS idx_interviews_candidate_id ON interviews(candidate_id);
      CREATE INDEX IF NOT EXISTS idx_interviews_job_id ON interviews(job_id);
      CREATE INDEX IF NOT EXISTS idx_interviews_interviewer_id ON interviews(interviewer_id);

      CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id);
      CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON saved_jobs(job_id);
    `);

    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};

createTables();
