import { join } from 'node:path';

const dataPath = join(__dirname, '..', '..', '..', 'data');

export interface Environment {
  isProd: boolean;
  dataPath: string;
  dbPath: string;
  uploadsPath: string;
  bugsnagApiKey: string | undefined;
}

export const environmentBase: Environment = {
  isProd: false,
  dataPath,
  dbPath: join(dataPath, 'database.sqlite'),
  uploadsPath: join(dataPath, 'uploads'),
  bugsnagApiKey: process.env['BUGSNAG_API_KEY'],
};

console.log('environmentBase', { environmentBase });
