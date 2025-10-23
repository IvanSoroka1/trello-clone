# Setup Guide

This guide provides detailed instructions for setting up and running the Trello Clone application.

## System Requirements

### Required Software
- **Node.js** (v18.0 or higher)
- **.NET 9.0 SDK**
- **PostgreSQL** (v12.0 or higher)
- **Git**

### Recommended Tools
- **Visual Studio Code** (with C# and extensions)
- **Visual Studio 2022** (for .NET development)
- **Docker Desktop** (for container development)
- **PostgreSQL management tool** (pgAdmin, DBeaver, etc.)

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/trello-clone.git
cd trello-clone
```

### 2. Backend Setup

#### 2.1 Install Prerequisites
Ensure you have the following installed:
- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- PostgreSQL database

#### 2.2 Configure Environment Variables
```bash
cd server
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database Configuration
POSTGRES_CONNECTION_STRING=Host=localhost;Username=postgres;Password=yourpassword;Database=trelloclone;

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRY_MINUTES=15
JWT_REFRESH_EXPIRY_DAYS=7

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
EMAIL_FROM=your-email@gmail.com

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

**Important Notes:**
- **JWT_SECRET**: Must be at least 32 characters long. Generate a secure random string.
- **PostgreSQL Connection**: Make sure your PostgreSQL is running and accessible.
- **SMTP Configuration**:
  - For Gmail, use an [App Password](https://myaccount.google.com/apppasswords)
  - Test your SMTP configuration before proceeding

#### 2.3 Database Setup

Install EF Core tools if not already installed:
```bash
dotnet tool install --global dotnet-ef
```

Create and run database migrations:
```bash
# Create database if it doesn't exist (using psql or GUI)
# psql -U postgres -c "CREATE DATABASE trelloclone;"

# Run EF migrations
dotnet ef database update

# Verify database was created
dotnet ef database info
```

#### 2.4 Build and Run Backend

```bash
# Restore packages
dotnet restore

# Build solution
dotnet build

# Run backend
dotnet run
```

The backend should be running on `http://localhost:5000`

Test the backend API:
```bash
curl http://localhost:5000/api/auth/register -X POST -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'
```

### 3. Frontend Setup

#### 3.1 Install Dependencies
```bash
cd ../client
npm install
```

#### 3.2 Configure Environment Variables
```bash
cp .env.example .env
```

Edit the `.env` file:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

#### 3.3 Start Development Server

```bash
npm run dev
```

The frontend should be running on `http://localhost:5173`

## Environment Configuration Details

### PostgreSQL Setup

#### Option 1: Manual Installation
1. Download and install PostgreSQL from [official website](https://www.postgresql.org/download/)
2. Create superuser and database:
```sql
CREATE DATABASE trelloclone;
CREATE USER trello_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE trelloclone TO trello_user;
ALTER DATABASE trelloclone OWNER TO trello_user;
```

#### Option 2: Docker
```bash
docker run --name trello-postgres \
  -e POSTGRES_DB=trelloclone \
  -e POSTGRES_USER=trello_user \
  -e POSTGRES_PASSWORD=secure_password \
  -p 5432:5432 \
  -d postgres:15
```

### Cloud Database Options

#### Heroku Postgres
```bash
# Add Heroku Postgres add-on
heroku addons:create heroku-postgresql:hobby-dev

# Get database URL
heroku config:get DATABASE_URL
```

#### AWS RDS PostgreSQL
1. Create RDS instance in AWS Console
2. Configure security groups to allow access
3. Use the endpoint in your connection string

## Email Configuration

### Gmail Setup
1. Enable 2-factor authentication on your Google account
2. [Generate an App Password](https://myaccount.google.com/apppasswords)
3. Use the app password in SMTP_PASSWORD

### Other SMTP Providers

#### Outlook/Hotmail
- SMTP Host: `smtp.office365.com`
- Port: `587`
- Requires TLS

#### Amazon SES
- SMTP Host: `email-smtp.us-east-1.amazonaws.com`
- Port: `587` or `25`
- Requires AWS IAM credentials

### Testing Email Configuration

Test email functionality by:
```bash
cd server
dotnet run --environment Development
```

Then register a new account and check for verification emails.

## Docker Setup

### 1. Backend Container
```bash
cd server
docker build -t trello-clone-backend .
```

### 2. Frontend Container
```bash
cd client
docker build -t trello-clone-frontend .
```

### 3. Docker Compose
Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: trelloclone
      POSTGRES_USER: trello_user
      POSTGRES_PASSWORD: secure_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./server
    ports:
      - "5000:80"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - POSTGRES_CONNECTION_STRING=Host=postgres;Username=trello_user;Password=secure_password;Database=trelloclone
      - JWT_SECRET=your-super-secret-jwt-key
      - SMTP_HOST=smtp.gmail.com
      - SMTP_PORT=587
      - SMTP_USERNAME=your-email@gmail.com
      - SMTP_PASSWORD=your-app-password
      - EMAIL_FROM=your-email@gmail.com
    depends_on:
      - postgres

  frontend:
    build: ./client
    ports:
      - "80:80"
    environment:
      - VITE_API_BASE_URL=http://localhost:5000/api

volumes:
  postgres_data:
```

Run with Docker Compose:
```bash
docker-compose up --build
```

## Development Workflow

### 1. Making Changes

#### Backend Changes
```bash
cd server
# Make code changes
dotnet build
dotnet ef database update
```

#### Frontend Changes
```bash
cd client
# Make code changes
npm run build
```

### 2. Running Tests

#### Backend Tests
```bash
cd server
dotnet test
```

#### Frontend Tests
```bash
cd client
npm test
```

### 3. Debugging

#### Backend Debugging
- Use Visual Studio or VS Code with C# extension
- Set breakpoints in controllers and services
- Use `dotnet watch run` for hot reload

#### Frontend Debugging
- Use browser dev tools (F12)
- React Developer Tools extension
- Use npm script with `--debug` flag

## Common Setup Issues

### 1. Database Connection Issues

**Problem**: `Cannot open database requested by the login`
**Solution**:
- Check PostgreSQL is running
- Verify connection string in `.env`
- Check database credentials
- Ensure database exists

```bash
# Test connection
psql -U postgres -d trelloclone
```

### 2. JWT Secret Issues

**Problem**: Tokens not generating or validating
**Solution**:
- Ensure JWT_SECRET is at least 32 characters
- Use different secrets for development/production
- Check no extra whitespace in .env file

### 3. Email Configuration Issues

**Problem**: Verification emails not being sent
**Solution**:
- Test SMTP configuration separately
- Check firewall settings
- Ensure email provider allows apps
- Verify password/app password is correct

### 4. CORS Issues

**Problem**: Frontend can't connect to backend
**Solution**:
- Check `FRONTEND_URL` in backend .env
- Ensure URLs match exactly (no trailing slashes)
- Test with exact ports

### 5. Build Errors

**Problem**: Package resolution issues
**Solution**:
- Delete `node_modules` and `bin/obj` folders
- Clear NuGet cache: `dotnet nuget locals --clear all`
- Clear npm cache: `npm cache clean --force`

## Production Deployment

For production deployment, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Getting Help

If you encounter setup issues:

1. Check existing issues on GitHub
2. Review this setup guide
3. Check browser console for errors
4. Test API endpoints directly with curl
5. Verify environment variables are correct

## Performance Optimization

### Backend
- Use connection pooling for PostgreSQL
- Implement caching for frequently accessed data
- Optimize database queries
- Use compression middleware

### Frontend
- Implement code splitting
- Use React.memo for component optimization
- Optimize bundle size
- Use CDN for static assets

## Security Considerations

- Use HTTPS in production
- Configure proper CORS policies
- Implement rate limiting
- Use strong JWT secrets
- Regular dependency updates
- SQL injection prevention via EF Core

---

Need help? Check the [TROUBLESHOOTING.md](TROUBLESHOOTING.md) guide for common solutions.