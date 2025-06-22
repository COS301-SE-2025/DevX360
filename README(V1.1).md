# DOSKS API

## Overview

This API provides user authentication, profile management, and team collaboration features using **Node.js**, **Express**, and **MongoDB**.

### Key Features

- JWT Authentication
- Password Hashing with bcrypt
- Rate Limiting
- CORS Protection
- File Uploads (Avatars)
- Admin User Access Control

## ️ Setup

### Install Dependencies

```bash
npm install express bcryptjs jsonwebtoken cors express-rate-limit multer mongoose cookie-parser dotenv
```

### ️ Create `.env` File

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
```

### Start Server

```bash
node server.js
```

## API Endpoints

### Health Check

**GET** `/api/health`

#### Response:

```json
{
  "status": "OK",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "database": "Connected"
}
```

## Authentication

### Register

**POST** `/api/register`

#### Request:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

#### Response:

```json
{
  "message": "Login successful",
  "user": {
    "_id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Login

**POST** `/api/login`

#### Request:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Response:

```json
{
  "message": "Login successful",
  "user": {
    "_id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Logout

**POST** `/api/logout`

#### Response:

```json
{
  "message": "Logged out"
}
```

## User Profile

### Get Profile

**GET** `/api/profile`

#### Response:

```json
{
  "user": {
    "_id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "avatar": "filename.jpg",
    "teams": [
      {
        "_id": "team-id",
        "name": "Team A"
      }
    ]
  }
}
```

### ️ Update Profile

**PUT** `/api/profile`

#### Request:

```json
{
  "name": "Updated Name",
  "email": "new@example.com"
}
```

#### Response:

```json
{
  "message": "Profile updated successfully",
  "user": {
    "_id": "user-id",
    "name": "Updated Name",
    "email": "new@example.com",
    "role": "user"
  }
}
```

### ️ Upload Avatar

**POST** `/api/avatar`  
_(Content-Type: multipart/form-data, field: `avatar`)_

#### Response:

```json
{
  "message": "Avatar uploaded",
  "avatarUrl": "/uploads/filename.jpg"
}
```

## Teams

### Create Team

**POST** `/api/teams`

#### Request:

```json
{
  "name": "Team Alpha",
  "password": "team123"
}
```

#### Response:

```json
{
  "message": "Team created",
  "team": {
    "_id": "team-id",
    "name": "Team Alpha",
    "creator": "user-id"
  }
}
```

### Join Team

**POST** `/api/teams/join`

#### Request:

```json
{
  "name": "Team Alpha",
  "password": "team123"
}
```

#### Response:

```json
{
  "message": "Joined team",
  "teamId": "team-id"
}
```

### ️ View Team

**GET** `/api/teams/:name`

#### Response:

```json
{
  "team": {
    "_id": "team-id",
    "name": "Team Alpha",
    "creator": {
      "_id": "user-id",
      "name": "John Doe"
    },
    "members": [
      {
        "_id": "user-id",
        "name": "John Doe",
        "email": "john@example.com"
      }
    ]
  }
}
```

## ️ Admin

### Get All Users

**GET** `/api/users` _(Admin only)_

#### Response:

```json
{
  "users": [
    {
      "_id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  ]
}
```

## Error Responses

| Status | Description               |
| ------ | ------------------------- |
| 400    | Missing/Invalid fields    |
| 401    | Invalid credentials/token |
| 403    | Insufficient permissions  |
| 404    | Resource not found        |
| 500    | Internal server error     |

#### Example:

```json
{
  "message": "Error description"
}
```

## Security Features

- **Rate limiting:** 100 requests per 15 minutes
- ️ **CORS:** Restricted to allowed origins
- **Cookies:** HTTP-only for JWT storage
- **Password hashing:** Using bcrypt
- **Input sanitization:** Against injections
- ️ **CSRF protection:** Same-site cookies
- ️ **Configurable via `.env` file**

## Technologies Used

- **Backend**: Node.js, Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens), bcrypt for password hashing
- **File Uploads**: Multer
- **Security**:
  - Rate limiting (express-rate-limit)
  - CORS (Cross-Origin Resource Sharing)
  - HTTP-only cookies
  - CSRF protection via same-site cookies
- **Environment Configuration**: dotenv
