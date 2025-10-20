# Trello Clone

A modern, full-stack Trello Clone application built with ASP.NET Core backend and React frontend, featuring drag-and-drop functionality, JWT authentication, and email verification.

## 🚀 Features

- **Drag & Drop**: Intuitive task management with drag-and-drop functionality between task lists
- **User Authentication**: Secure JWT-based authentication with refresh tokens and email verification
- **Boards Management**: Create, organize, and manage multiple boards
- **Task Lists**: Categorize tasks into columns/lists with custom ordering
- **Task Management**: Create, edit, complete, and delete individual tasks
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Email Verification**: Account activation via email verification
- **Password Recovery**: Secure password reset functionality
- **Undo Functionality**: Undo task deletion with confirmation dialog

## 🛠️ Technology Stack

### Backend (.NET 9.0)
- **Framework**: ASP.NET Core 9.0 with minimal API design
- **Database**: PostgreSQL with Entity Framework Core 9.0
- **Authentication**: JWT Bearer tokens with custom refresh token implementation
- **ORM**: Entity Framework Core with PostgreSQL provider
- **Security**: BCrypt.Net for password hashing
- **Email**: SMTP integration for account verification and password recovery
- **Containerization**: Docker support

### Frontend (React + TypeScript)
- **Framework**: React 19.1.1 with TypeScript
- **Build Tool**: Vite 7.1.0
- **Styling**: Tailwind CSS 4.1.11
- **Routing**: React Router DOM 7.8.0
- **Icons**: Lucide React and React Icons
- **Development**: ESLint 9.32.0 with React-specific plugins

## 📦 Prerequisites

- **Node.js** (v18 or higher)
- **.NET 9.0 SDK**
- **PostgreSQL** (v12 or higher)
- **Git**
- **Docker** (optional, for containerized deployment)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/trello-clone.git
cd trello-clone
```

### 2. Backend Setup

#### Environment Configuration
```bash
cd server
cp .env.example .env
```

Edit `.env` with your database connection:
```env
# Database
POSTGRES_CONNECTION_STRING=Host=localhost;Username=postgres;Password=yourpassword;Database=trelloclone

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRY_MINUTES=15
JWT_REFRESH_EXPIRY_DAYS=7

# Email Configuration (for verification and recovery)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

#### Database Setup
```bash
# Install Microsoft.Extensions.Tools
dotnet tool install --global dotnet-ef

# Run database migrations
dotnet ef database update

# Run the backend
dotnet run
```

The backend will be available at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../client

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env` if needed:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

```bash
# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📖 Project Structure

```
trello-clone/
├── client/              # React Frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   └── utilities/   # Utility functions
│   └── .env            # Frontend environment variables
├── server/              # ASP.NET Core Backend
│   ├── Controllers/    # API Controllers
│   ├── Models/         # Data models
│   ├── Data/           # Data access layer
│   ├── Migrations/     # EF Core migrations
│   └── .env           # Backend environment variables
└── package.json        # Root package management
```

## 🔒 Authentication

The application uses JWT (JSON Web Token) authentication:

1. **Registration**: Users can create accounts with email verification
2. **Login**: Returns an access token (15 min) and refresh token (7 days)
3. **Token Refresh**: Use refresh tokens to get new access tokens
4. **Email Verification**: Required for account activation
5. **Password Recovery**: Self-service password reset via email

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Send password reset email
- `POST /api/auth/reset-password` - Reset password

### Boards & Tasks
- `GET /api/dashboard/boards` - Get user's boards
- `POST /api/dashboard/boards` - Create new board
- `GET /api/tasks/board/{boardId}` - Get board with task lists
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{taskId}` - Update task
- `DELETE /api/tasks/{taskId}` - Delete task
- `POST /api/tasks/move` - Move task between lists

## 🔧 Environment Variables

### Backend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| `POSTGRES_CONNECTION_STRING` | PostgreSQL connection string | ✅ |
| `JWT_SECRET` | JWT signing secret | ✅ |
| `JWT_EXPIRY_MINUTES` | Access token expiry in minutes (15) | ✅ |
| `JWT_REFRESH_EXPIRY_DAYS` | Refresh token expiry in days (7) | ✅ |
| `SMTP_HOST` | SMTP server host | ✅ |
| `SMTP_PORT` | SMTP server port | ✅ |
| `SMTP_USERNAME` | SMTP username | ✅ |
| `SMTP_PASSWORD` | SMTP password | ✅ |
| `EMAIL_FROM` | Sender email address | ✅ |
| `FRONTEND_URL` | Frontend application URL | ✅ |

### Frontend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_BASE_URL` | Backend API base URL | ✅ |

## 🚀 Deployment

### Docker Deployment

```bash
# Build backend container
cd server
docker build -t trello-clone-backend .

# Run with Docker Compose (recommended)
# See deploy.sh for deployment script
```

### Production Setup

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## 📚 Documentation

- [SETUP.md](SETUP.md) - Detailed setup and configuration guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture and design
- [API.md](API.md) - Complete API documentation
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues and solutions

## 🧪 Development

### Running Tests

```bash
# Backend tests
cd server
dotnet test

# Frontend tests
cd client
npm test
```

### Code Style

- Backend: Follow C# coding conventions with async/await patterns
- Frontend: Use ESLint with TypeScript and React rules

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Trello](https://trello.com/) for inspiration
- [ASP.NET Core](https://dotnet.microsoft.com/apps/aspnet) for the backend framework
- [React](https://reactjs.org/) for the frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for styling

---

**Built with ❤️ using modern web technologies**