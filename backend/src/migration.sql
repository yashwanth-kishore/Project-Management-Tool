-- Migration: Add missing columns to projects and tasks tables
-- Run with: psql -U postgres -d pmtool -f backend/src/migration.sql

-- ========== PROJECTS TABLE ==========
-- Add columns only if they don't already exist

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='description') THEN
    ALTER TABLE projects ADD COLUMN description TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='status') THEN
    ALTER TABLE projects ADD COLUMN status VARCHAR(50) DEFAULT 'active';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='priority') THEN
    ALTER TABLE projects ADD COLUMN priority VARCHAR(50) DEFAULT 'medium';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='start_date') THEN
    ALTER TABLE projects ADD COLUMN start_date DATE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='due_date') THEN
    ALTER TABLE projects ADD COLUMN due_date DATE;
  END IF;

  -- ========== TASKS TABLE ==========

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='description') THEN
    ALTER TABLE tasks ADD COLUMN description TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='priority') THEN
    ALTER TABLE tasks ADD COLUMN priority VARCHAR(50) DEFAULT 'medium';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='status') THEN
    ALTER TABLE tasks ADD COLUMN status VARCHAR(50) DEFAULT 'todo';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='assignee' AND data_type='integer') THEN
    ALTER TABLE tasks ALTER COLUMN assignee TYPE VARCHAR(255) USING assignee::VARCHAR(255);
    ALTER TABLE tasks ALTER COLUMN assignee SET DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='assignee') THEN
    ALTER TABLE tasks ADD COLUMN assignee VARCHAR(255) DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='due_date') THEN
    ALTER TABLE tasks ADD COLUMN due_date DATE;
  END IF;
END
$$;
