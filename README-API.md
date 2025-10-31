# User Management System - API Setup

This guide will help you set up and run the User Management System with a real API backend.

## Prerequisites

- Node.js installed on your system
- npm or yarn package manager

## Quick Start

### 1. Install API Dependencies

```bash
# Install API server dependencies
npm install express cors
```

### 2. Start the API Server

Open a new terminal and run:

```bash
# Start the API server on port 3000
node api-server.js
```

You should see:
```
🚀 API Server running on http://localhost:3000
📊 Health check: http://localhost:3000/api/health

🔑 Test credentials:
   Email: admin@example.com
   Password: password
```

### 3. Start the Angular Frontend

In another terminal, run:

```bash
# Start the Angular development server with proxy
npm start
```

The frontend will be available at `http://localhost:4200` and will automatically proxy API requests to `http://localhost:3000`.

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/register` - Register a new user

### Users
- `GET /api/users` - Get list of users (with pagination and filtering)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Roles
- `GET /api/roles` - Get list of roles
- `GET /api/roles/permissions` - Get available permissions

### Audit Logs
- `GET /api/audit-logs` - Get audit logs
- `GET /api/audit-logs/summary` - Get audit summary

### Health Check
- `GET /api/health` - Check API server status

## Test Credentials

Use these credentials to login:

- **Email**: admin@example.com
- **Password**: password

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, you can either:
1. Stop the other service using port 3000
2. Modify the `api-server.js` to use a different port
3. Update the `proxy.conf.json` to point to the new port

### CORS Issues

The API server is configured with CORS enabled. If you still encounter CORS issues, make sure:
1. The API server is running before starting the frontend
2. The proxy configuration in `proxy.conf.json` is correct

### Connection Refused

If you get connection refused errors:
1. Verify the API server is running on port 3000
2. Check that the proxy configuration is correct
3. Ensure no firewall is blocking the connection

## Development

### API Server Development

For development with auto-reload, install nodemon:

```bash
npm install -g nodemon
nodemon api-server.js
```

### Frontend Development

The Angular frontend is configured to use the proxy during development. In production, you'll need to update the `src/environments/environment.prod.ts` file to point to your production API endpoint.

## Production Deployment

For production deployment:

1. Update `src/environments/environment.prod.ts` with your production API URL
2. Build the Angular app: `npm run build`
3. Deploy the built files to your web server
4. Deploy the API server to your backend infrastructure
5. Configure proper CORS and security settings