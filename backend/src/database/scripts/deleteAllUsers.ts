import {db} from '../db';

const deleteAllUsers = async () => {
  try {
    await db.query('TRUNCATE TABLE users CASCADE;');
    console.log('All users deleted successfully along with dependent data.');
    process.exit(0);
  } catch (error) {
    console.error('Error deleting users:', error);
    process.exit(1);
  }
};

deleteAllUsers();

