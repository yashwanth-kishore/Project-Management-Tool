CREATE TABLE IF NOT EXISTS workspaces (
  id SERIAL PRIMARY KEY,
  name CHARACTER VARYING(100),
  owner_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invites (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER,
  email CHARACTER VARYING(255) NOT NULL,
  token CHARACTER VARYING(255) NOT NULL,
  status CHARACTER VARYING(20) DEFAULT 'pending'::character varying,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  role CHARACTER VARYING(20) DEFAULT 'Member'::character varying,
  inviter_id INTEGER
);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name CHARACTER VARYING(100),
  workspace_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  description TEXT DEFAULT ''::text,
  status CHARACTER VARYING(50) DEFAULT 'active'::character varying,
  priority CHARACTER VARYING(50) DEFAULT 'medium'::character varying,
  start_date DATE,
  due_date DATE
);

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title CHARACTER VARYING(255),
  priority CHARACTER VARYING(20),
  status CHARACTER VARYING(20),
  assignee CHARACTER VARYING(255) DEFAULT ''::character varying,
  due_date DATE,
  project_id INTEGER,
  description TEXT DEFAULT ''::text
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name CHARACTER VARYING(100),
  email CHARACTER VARYING(100),
  password TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  job_title CHARACTER VARYING(255),
  phone CHARACTER VARYING(50),
  dob DATE,
  bio TEXT,
  profile_pic TEXT
);

CREATE TABLE IF NOT EXISTS project_members (
  id SERIAL PRIMARY KEY,
  project_id INTEGER,
  user_id INTEGER,
  role CHARACTER VARYING(50) DEFAULT 'member'::character varying
);

CREATE TABLE IF NOT EXISTS task_comments (
  id SERIAL PRIMARY KEY,
  task_id INTEGER,
  user_id INTEGER,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER,
  receiver_id INTEGER,
  content TEXT,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attachments (
  id SERIAL PRIMARY KEY,
  task_id INTEGER,
  file_url TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  action TEXT,
  project_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  workspace_id INTEGER
);

CREATE TABLE IF NOT EXISTS workspace_members (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER,
  user_id INTEGER,
  role CHARACTER VARYING(20) DEFAULT 'Member'::character varying,
  joined_at TIMESTAMP DEFAULT now()
);

