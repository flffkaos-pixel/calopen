/**
 * Self-host database migrator.
 * Runs supabase/migrations/*.sql in filename order against DATABASE_URL.
 * Safe to re-run: migrations 002+ are idempotent (IF NOT EXISTS / ON CONFLICT).
 * NOTE: 001_initial.sql targets a FRESH database (plain CREATE TABLE).
 * Usage: node scripts/migrate.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, '..', 'supabase', 'migrations');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const files = readdirSync(MIGRATIONS_DIR)
  .filter((f) => f.endsWith('.sql'))
  .sort();

if (files.length === 0) {
  console.error(`No .sql files in ${MIGRATIONS_DIR}`);
  process.exit(1);
}

const sql = postgres(connectionString, { prepare: false, connect_timeout: 30 });

async function waitForDb(retries = 30) {
  for (let i = 1; i <= retries; i++) {
    try {
      await sql`SELECT 1`;
      console.log('Database reachable');
      return;
    } catch (e) {
      console.log(`Waiting for database... (${i}/${retries})`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error('Database unreachable after retries');
}

async function main() {
  await waitForDb();
  for (const file of files) {
    console.log(`Applying ${file}...`);
    const content = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
    await sql.unsafe(content);
    console.log(`Applied ${file}`);
  }
  console.log('All migrations applied');
  await sql.end();
}

main().catch((e) => {
  console.error('Migration failed:', e.message || e);
  process.exit(1);
});
