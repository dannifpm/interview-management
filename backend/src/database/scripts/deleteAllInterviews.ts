import {db} from '../db';

const deleteAllInterviews = async () => {
  try {
    await db.query('TRUNCATE TABLE interviews CASCADE;');
    console.log('All interviews deleted successfully along with dependent data.');
    process.exit(0);
  } catch (error) {
    console.error('Error deleting interviews:', error);
    process.exit(1);
  }
};

deleteAllInterviews();

