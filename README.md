# 🚀 Project Management Tool (PMTool)

A comprehensive, full-stack project management application designed to streamline workflows, enhance team collaboration, and provide actionable insights into project progress.

## ✨ Features

- **📂 Workspace Management**: Create and manage multiple workspaces for different teams or clients.
- **🏗️ Project & Task Tracking**: Organise work into projects and tasks with granular control.
- **📋 Kanban Boards**: Visualise progress with drag-and-drop task management (via `@hello-pangea/dnd`).
- **👥 Team Collaboration**: Invite members, assign roles (Admin/Member), and manage permissions.
- **📊 Analytics Dashboard**: Track project health and team productivity with interactive charts (via `recharts`).
- **📅 Calendar Integration**: View deadlines and schedules in an intuitive calendar view.
- **💬 Real-time Communication**: Integrated messaging and comments on tasks.
- **🔔 Notifications & Inbox**: Stay updated with real-time alerts for assignments, invites, and updates.
- **🔐 Secure Authentication**: JWT-based login, password hashing with Bcrypt, and email-based invitations.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: TailwindCSS 4
- **Routing**: React Router 7
- **Icons**: Lucide React / React Icons
- **Components**: Hello Pangea DND, Recharts, React Big Calendar

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (pg)
- **Security**: JWT, Bcrypt
- **Email**: Nodemailer

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd PMTool
   ```

2. **Install dependencies for all packages**:
   ```bash
   npm run install-all
   ```

3. **Environment Setup**:
   Create a `.env` file in the `backend/` directory and add the following:
   ```env
   PORT=5000
   DATABASE_URL=your_postgresql_url
   JWT_SECRET=your_jwt_secret
   SMTP_HOST=your_smtp_host
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_pass
   ```

4. **Run the application**:
   ```bash
   npm run dev
   ```
   This will start both the frontend and backend servers concurrently.

## 📂 Project Structure

```text
PMTool/
├── frontend/          # React application (Vite + Tailwind)
├── backend/           # Express server (Node.js + PostgreSQL)
└── package.json       # Root configuration & scripts
```

## 📜 License
This project is licensed under the ISC License.
