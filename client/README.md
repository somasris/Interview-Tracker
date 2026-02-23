# INTERVIEW TRACKER

## Overview

Interview Tracker is a full-stack web application designed to help job seekers manage their interview pipeline. It provides a centralized platform to track applications, interviews, and outcomes, ensuring users never miss an opportunity.

## Features

- **User Authentication**: Secure registration and login system.
- **Interview Management**: Create, update, and delete interview records.
- **Status Tracking**: Track interviews through various stages (e.g., Applied, Phone Screen, Technical, Offer).
- **Responsive UI**: Modern, mobile-first interface built with React and Tailwind CSS.

## Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MySQL Server

### 1. Backend Setup

```bash
# Navigate to the server directory
cd server

# Install dependencies
pnpm install

# Create a .env file in the server directory
cp .env.example .env

# Configure your MySQL connection in .env
# DB_HOST=localhost
# DB_USER=root
# DB_PASS=your_password
# DB_NAME=interview_tracker
# JWT_SECRET=your_secret_key

# Run database migrations
pnpm db:migrate

# Start the server
pnpm start
```

### 2. Frontend Setup

```bash
# Navigate to the client directory
cd client

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

The application will be accessible at `http://localhost:5173`.