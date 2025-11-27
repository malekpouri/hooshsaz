# HooshSaz - AI Chat Platform

HooshSaz is a modern, web-based multi-user AI chat platform designed with a modular architecture and containerized for easy deployment. It leverages the power of local AI models via Ollama.

## Architecture

The project follows a clean, separated architecture designed for scalability and maintainability:

### High-Level Overview

1.  **Frontend (Presentation Layer)**:

    - Built with **Next.js (React)** using the App Router.
    - Handles user interaction, state management (Context API), and UI rendering.
    - Communicates with the backend via RESTful APIs.
    - Uses **Tailwind CSS** (implied by class names) for styling.

2.  **Backend (Application Layer)**:

    - Built with **Node.js** and **Express**.
    - **Layered Architecture**:
      - **Controllers**: Handle HTTP requests and responses.
      - **Services**: Contain business logic (e.g., Ollama integration).
      - **Data Access**: Uses **Prisma ORM** to interact with the database.
    - **Security**: JWT-based authentication, Helmet for headers, bcrypt for password hashing.
    - **Documentation**: Automated API documentation using Swagger (OpenAPI 3.0).

3.  **Database (Data Layer)**:

    - **PostgreSQL**: Relational database for storing users, chats, messages, and configuration.
    - Managed via **Prisma** for schema migrations and type-safe queries.

4.  **AI Integration**:

    - Integrates with **Ollama** for running LLMs locally.
    - Supports streaming responses for a real-time chat experience.

5.  **Infrastructure**:
    - **Docker**: All components (Frontend, Backend, DB) are containerized.
    - **Docker Compose**: Orchestrates the multi-container application.

### Folder Structure

```
hooshsaz/
├── backend/                # Node.js/Express Backend
│   ├── src/
│   │   ├── controllers/    # Request handlers (Auth, Chat, Admin)
│   │   ├── middleware/     # Express middleware (Auth, Logging)
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic (OllamaService)
│   │   ├── scripts/        # Utility scripts (Seeding)
│   │   ├── utils/          # Utility functions & Prisma client
│   │   ├── app.js          # App configuration & Swagger setup
│   │   └── index.js        # Server entry point
│   ├── prisma/             # Database schema
│   └── Dockerfile
├── frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── app/            # App router pages (Login, Chat, Admin)
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context (Auth)
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

2.  **Seed the Database** (First time only):

    To create the default admin user and configuration:

    ```bash
    docker-compose exec backend node src/scripts/seed.js
    ```

3.  **Access the Application**:

    - **Frontend**: [http://localhost:3000](http://localhost:3000)
    - **Backend API**: [http://localhost:5000](http://localhost:5000)
    - **API Documentation**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
    - **Database**: localhost:5432

    **Default Admin Credentials**:

    - Username: `admin`
    - Password: `adminpassword`

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
- **Multi-User Chat**: Real-time chat interface with Markdown support.
- **AI Models**: Selectable AI models (fetched from Ollama).
- **Streaming**: Real-time token streaming from AI models.
- **History**: View, search, and delete past conversations.
- **Admin Dashboard**:
  - Manage users (Create, Delete, View).
  - View all chat logs.
  - Configure System Settings (e.g., Ollama URL).
- **Dark/Light Mode**: Clean UI with theme support.

## API Documentation

The API documentation is automatically generated from the code using Swagger/OpenAPI.
Access it at `/api-docs` when the backend is running.

## CI/CD

The project uses GitHub Actions for CI/CD. The pipeline is defined in `.github/workflows/ci.yml` and runs on every push and pull request to `main` or `develop`. It handles:

- Building Docker images.
- Running tests (if configured).

## Git Workflow

- **Feature Branches**: Create a new branch for each feature (`feature/feature-name`).
- **Pull Requests**: Open a PR to merge into `main`.
- **Automated Checks**: CI pipeline runs tests and builds.
