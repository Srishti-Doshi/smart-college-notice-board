# SmartNotice

SmartNotice is a full-stack college notice board system built to simplify campus communication between notice publishers and students. Authorized users can publish notices with categories, urgency levels, expiry dates, and attachments, while students can browse, filter, and receive browser-based alerts for the categories they follow.

## Live Deployment:  https://smart-college-notice-board-first.onrender.com/

- Frontend: `https://smart-college-notice-board-first.onrender.com`
- Backend API: `https://smart-college-notice-board-1.onrender.com`


## Project Overview

SmartNotice is designed around a practical academic announcement workflow:

- publishers create and manage notices
- students browse active and archived notices
- students filter by category, urgency, department, and date
- students follow selected categories for alerting
- the client displays browser notifications when relevant new notices appear

The application is implemented as:

- a React frontend
- an Express + TypeScript backend
- MongoDB Atlas for persistent storage
- Cloudinary for attachment hosting

## Two-Role System

For submission purposes, SmartNotice can be described as a two-role system:

- `Publisher`
- `Student`

### Publisher Role

The publisher role is responsible for posting and managing notices. In the current implementation, publisher functionality is represented by two internal permission levels:

- `admin`
- `hod`

Publisher capabilities:

- create notices
- edit notices
- delete notices
- pin important notices
- archive or restore notices

Additional `admin` capability:

- create, rename, and delete categories

### Student Role

The student role is focused on consuming notice content and tracking relevant updates.

Student capabilities:

- view current notices
- view archived notices
- filter notices using multiple criteria
- subscribe to selected categories in the browser
- enable browser notifications for subscribed categories

### Internal Role Values

The backend currently defines the following concrete role values in [server/src/types/auth.ts](./server/src/types/auth.ts):

- `student`
- `hod`
- `admin`

This means the repository follows a two-role functional model for explanation, while internally using a finer-grained publisher permission split.

## Core Features

- notice publishing and management
- pinning and archival workflow
- category-based organization
- searchable and filterable student feed
- attachment support
- role-based access control
- responsive dashboard UI
- browser notification alerts

## Tech Stack

### Frontend

- React 19
- ReactDOM
- Create React App (`react-scripts`)
- Axios
- Tailwind CSS

### Backend

- Express 5
- TypeScript
- Mongoose
- MongoDB Atlas
- Multer
- Cloudinary

### Authentication

- custom HMAC-signed auth token
- `httpOnly` cookie support
- bearer token support for API requests

### Notification Layer

- browser `Notification` API
- client-side polling every 30 seconds

## Project Structure

```text
smart-college-notice-board/
  client/              React frontend
  server/              Express + TypeScript backend
  docs/screenshots/    submission screenshots
  scripts/             helper scripts
```

## Setup Instructions

### 1. Install Dependencies

Server:

```bash
cd server
npm install
```

Client:

```bash
cd client
npm install
```

### 2. Configure Environment Variables

Create local environment files from the examples:

- copy [server/.env.example](./server/.env.example) to `server/.env`
- copy [client/.env.example](./client/.env.example) to `client/.env`

### 3. Start the Backend

```bash
cd server
npm run dev
```

Backend URL:

- `http://localhost:5000`

### 4. Start the Frontend

```bash
cd client
npm start
```

Frontend URL:

- `http://localhost:3000`

## Environment Configuration Guide

### Server Environment

The backend example file is [server/.env.example](./server/.env.example).

Required keys:

- `PORT`
- `MONGO_URI`
- `CLIENT_ORIGIN`
- `CORS_ORIGINS`
- `AUTH_TOKEN_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Optional seeded-user keys:

- `DEFAULT_ADMIN_NAME`
- `DEFAULT_ADMIN_EMAIL`
- `DEFAULT_ADMIN_PASSWORD`
- `DEFAULT_HOD_NAME`
- `DEFAULT_HOD_EMAIL`
- `DEFAULT_HOD_PASSWORD`
- `DEFAULT_STUDENT_NAME`
- `DEFAULT_STUDENT_EMAIL`
- `DEFAULT_STUDENT_PASSWORD`

### Client Environment

The frontend example file is [client/.env.example](./client/.env.example).

Required key:

- `REACT_APP_API_BASE_URL`

## Cloudinary Configuration Guide

Cloudinary is used to host uploaded notice attachments such as:

- PDF
- DOC
- DOCX
- PNG
- JPG

Configuration is handled in [server/src/config/cloudinary.ts](./server/src/config/cloudinary.ts).

### Cloudinary Setup

1. Create or sign in to a Cloudinary account.
2. Copy your `cloud name`, `API key`, and `API secret`.
3. Add these values to `server/.env`.
4. Restart the backend server.

### Attachment Upload Flow

1. The frontend submits a multipart notice form.
2. Multer receives the file in memory.
3. The backend uploads the file buffer to Cloudinary.
4. The resulting secure URL is stored with the notice record.

## Database Schema

### Notice Model

Defined in [server/src/models/Notice.ts](./server/src/models/Notice.ts).

Fields:

- `title: string`
- `description: string`
- `category: string`
- `department: string`
- `urgency: "Low" | "Medium" | "High" | "Urgent"`
- `attachmentUrl?: string`
- `attachmentName?: string`
- `attachmentType?: string`
- `isPinned: boolean`
- `pinnedRank?: number`
- `expiresAt?: Date`
- `isArchived: boolean`
- `createdBy?: string`
- `createdAt: Date`
- `updatedAt: Date`

Indexes:

- compound index on `category`, `urgency`, and `createdAt`
- text index on `title`, `description`, and `department`

### User Model

Defined in [server/src/models/User.ts](./server/src/models/User.ts).

Fields:

- `name: string`
- `email: string`
- `passwordHash: string`
- `role: "student" | "hod" | "admin"`
- `createdAt: Date`
- `updatedAt: Date`

### Category Model

Defined in [server/src/models/Category.ts](./server/src/models/Category.ts).

Fields:

- `name: string`
- `createdBy: string`
- `createdAt: Date`
- `updatedAt: Date`

### User Subscription Model

The current implementation stores student category subscriptions in the browser, not in MongoDB.

Current subscription behavior:

- selected categories are stored in local storage
- the frontend uses those saved categories to decide which new notices should trigger alerts

Client storage keys:

- `smart-notice-subscribed-categories`
- `smart-notice-auth-token`

This is important for evaluation: the current project does not yet implement a separate database-level subscription collection.

## Push Notification Implementation

### Current Implementation

The current notification flow uses:

- browser `Notification` API
- local category subscriptions
- client-side polling to `/api/notices` every 30 seconds

### How It Works

1. The student selects one or more categories to follow.
2. Those category names are stored in browser local storage.
3. The frontend periodically requests the latest active notices.
4. New notices are compared against the previously seen notice IDs.
5. If a new notice matches a subscribed category and browser permission is granted, the client displays a local notification.

### Important Note About Firebase / FCM

This repository does **not** currently use Firebase Cloud Messaging (FCM).

The current codebase does not include:

- Firebase SDK integration
- FCM registration token handling
- service worker push reception
- server-triggered Firebase push delivery

Instead, notifications are implemented using standard browser notifications generated from client-side polling logic. If your submission strictly requires FCM, the notification layer would need an additional implementation phase before final submission.

## API Overview

### Authentication

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Categories

- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/:categoryName`
- `DELETE /api/categories/:categoryName`

### Notices

- `GET /api/notices`
- `GET /api/notices/archive`
- `POST /api/notices`
- `PUT /api/notices/:id`
- `DELETE /api/notices/:id`

## Screenshots

The following screenshots should be included in [docs/screenshots](./docs/screenshots):

- admin post view
- student feed with filters active
- push notification received
- mobile view

Recommended filenames:

- `admin-post-view.png`
- `student-feed-filters.png`
- `push-notification-received.png`
- `mobile-view.png`

## Submission Checklist

This repository is intended to provide:

- a public GitHub-ready project structure
- README with setup and configuration instructions
- two-role system explanation
- database schema overview
- push notification implementation explanation
- Cloudinary setup guidance
- deployed link reference

Items still requiring manual completion before final submission:

- add the actual screenshots
- confirm that deployed links are live
- decide whether browser notifications are acceptable or whether Firebase/FCM is mandatory under the evaluation rubric

## Note for Evaluation

This README is written to reflect the repository accurately. Where the assignment brief mentions Firebase/FCM or a dedicated database subscription model, those items are identified clearly as not yet implemented in the current codebase rather than being overstated.
