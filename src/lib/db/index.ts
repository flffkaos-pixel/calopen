import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// Supavisor pooler (port 6543, transaction mode) does not support
// prepared statements — required for serverless (Vercel).
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });

export type Database = typeof db;
