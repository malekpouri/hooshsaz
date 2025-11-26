# HooshSaz - AI Chat Platform

HooshSaz is a modern, web-based multi-user AI chat platform designed with a modular architecture and containerized for easy deployment.

## Architecture

The project follows a clean, separated architecture:

- **Frontend**: Next.js (React) for a responsive, server-side rendered user interface.
- **Backend**: Node.js with Express, following a layered architecture (Controllers, Services, Data Access).
- **Database**: PostgreSQL, managed via Prisma ORM.
- **Containerization**: Docker and Docker Compose for consistent development and production environments.

### Folder Structure

```
hooshsaz/
├── backend/                # Node.js/Express Backend
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware (Auth, Logging)
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions & Prisma client
│   │   ├── app.js          # App configuration
│   │   └── index.js        # Server entry point
│   ├── prisma/             # Database schema
│   └── Dockerfile
├── frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── app/            # App router pages
│   │   ├── components/     # Reusable UI components
│   │   └── ...
│   └── Dockerfile
├── docker-compose.yml      # Orchestration
└── README.md
```

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js (for local development outside Docker)

### Running with Docker (Recommended)

1.  **Build and Start Services**:

    ```bash
    docker-compose up --build
    ```

2.  **Access the Application**:
    - Frontend: [http://localhost:3000](http://localhost:3000)
    - Backend API: [http://localhost:5000](http://localhost:5000)
    - API Documentation: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
    - Database: localhost:5432

### Local Development

**Backend**:

1.  Navigate to `backend/`.
2.  Copy `.env.example` to `.env` (create one if missing).
3.  `npm install`
4.  `npx prisma generate`
5.  `npm start`

**Frontend**:

1.  Navigate to `frontend/`.
2.  `npm install`
3.  `npm run dev`

## Features

- **User Authentication**: Secure JWT-based login/signup.
- **Multi-User Chat**: Real-time chat interface.
- **AI Models**: Selectable AI models for conversation.
- **History**: View and manage past conversations.
- **Admin Dashboard**: User management and stats.

## CI/CD

The project uses GitHub Actions for CI/CD. The pipeline is defined in `.github/workflows/ci.yml` and runs on every push and pull request to `main` or `develop`.

## Git Workflow

- **Feature Branches**: Create a new branch for each feature (`feature/feature-name`).
- **Pull Requests**: Open a PR to merge into `main`.
- **Automated Checks**: CI pipeline runs tests and builds.
