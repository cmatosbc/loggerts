import { LogMessage } from './logger';
import { Client } from 'pg';

export const databaseLogging = async (logMessage: LogMessage) => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  await client.connect();

  const query = 'INSERT INTO logs(level, message, context, file, line, code, trace, tags) VALUES($1, $2, $3, $4, $5, $6, $7, $8)';
  const values = [logMessage.level, logMessage.message, logMessage.context, logMessage.file, logMessage.line, logMessage.code, logMessage.trace, logMessage.tags];

  try {
    await client.query(query, values);
  } catch (err) {
    console.error('Error saving log to database:', err);
  } finally {
    await client.end();
  }
};
