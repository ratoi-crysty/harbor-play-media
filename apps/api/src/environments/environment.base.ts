import { join } from 'node:path';

const dataPath = join(__dirname, '..', '..', '..', 'data');

export interface Environment {
  isProd: boolean;
  dataPath: string;
  dbPath: string;
  uploadsPath: string;
}

export const environmentBase: Environment = {
  isProd: false,
  dataPath,
  dbPath: join(dataPath, 'database.sqlite'),
  uploadsPath: join(dataPath, 'uploads'),
};

console.log('environmentBase', { environmentBase });
