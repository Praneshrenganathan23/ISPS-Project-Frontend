# ISPS Project: Technical Report Overview

This document summarizes the technology stack and functional architecture of the **Integrated Student Project System (ISPS)**, focusing on the recent unified database architecture and real-time communication enhancements.

## 🚀 Technology Stack

### Frontend Architecture
- **Framework**: React.js (via Vite)
- **State Management**: React Hooks (`useState`, `useEffect`)
- **API Interaction**: Axios (with centralized Interceptor logic)
- **Styling**: Vanilla CSS with **Glassmorphism** aesthetics (Blur effects, semi-transparent panels, sleek gradients)
- **Icons**: Lucide-React
- **Real-time UI**: Contextual polling for live chat and notifications

### Backend Architecture
- **Environment**: Node.js (v18+)
- **Server Framework**: Express.js
- **Database**: MongoDB (NoSQL)
- **ODM**: Mongoose
- **Security**: 
  - **JWT (JSON Web Tokens)** for stateless authentication
  - **BcryptJS** for secure password hashing
  - **Role-Based Access Control (RBAC)** middleware

---

## 🛠️ Core Functional Features

### 1. Unified Authentication System
- **Multi-Role Portal**: Specialized access for **Students**, **Faculty Guides**, **Industry Mentors**, and **System Admins**.
- **Unified User Collection**: Centralized user management allowing for cleaner relationship mapping across the system.

### 2. End-to-End Project Workflow
- **Proposal Stage**: Industry Mentors post project requirements and skills.
- **Vetting Stage**: Faculty or Admins review and approve project proposals.
- **Application Stage**: Students apply for up to one active project.
- **Selection Stage**: A multi-step approval flow where Faculty "vets" applicants and Mentors "finalize" selection.

### 3. Dynamic Progress Monitoring
- **Real-time Tracking**: Students update progress percentages (0-100%).
- **Verification**: Submission of Project URLs (GitHub/Deployment) for mentor review.
- **Visual Analytics**: Interactive progress bars on both Mentor and Faculty dashboards.

### 4. Project-Specific Communication (Chat)
- **Context Isolation**: Chat histories are strictly separated by project context.
- **Unified Messaging**: Seamless interaction between all three primary roles (Student, Mentor, Faculty).
- **Notification System**: 
  - Dynamic **Unread Message Badges** (Red circles with numbers).
  - Context-aware clearing (Opening a chat only clears notifications for that specific project).

### 5. Administrative Oversight
- **System Stats**: Global count of total projects, active applications, and successful completions.
- **Data Integrity**: Unified database relationship management to prevent orphan records.

---

## 🏗️ Architectural Benefits
- **Scalability**: Decoupled frontend/backend allows for independent scaling.
- **Developer Experience**: Standardized RESTful API endpoints for easy maintenance.
- **User Interface**: Premium look-and-feel using modern CSS techniques to enhance engagement.
