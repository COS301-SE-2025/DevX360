# DevX360 API Server

This is a Node.js and Express-based backend server for the DevX360 project. It includes secure user authentication, profile management, avatar uploads, and admin-level access controls. Built with MongoDB, JWT, and modern security best practices.

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/COS301-SE-2025/DevX360.git
cd DevX360
git checkout api
```

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root of the project and add the following:

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Replace `your_mongodb_connection_string` and `your_jwt_secret` with your actual credentials.

## Available Endpoints

### Health Check

```http
GET /api/health
```

Returns status of the server and MongoDB connection.

### Register a New User

```http
POST /api/register
```

**Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "inviteCode": "optional-code"
}
```

### Login

```http
POST /api/login
```

**Body:**

```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Get Authenticated User Profile

```http
GET /api/profile
Authorization: Bearer <token>
```

### Get All Users (Admin Only)

```http
GET /api/users
Authorization: Bearer <admin-token>
```

### Upload Avatar

```http
POST /api/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data
Form field: avatar (file)
```

### Logout

```http
POST /api/logout
Authorization: Bearer <token>
```

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt
- **File Uploads:** Multer
- **Security:** Rate limiting, CORS
- **Environment Configuration:** dotenv

## Project Structure

```
server.js         # Main server file
/uploads          # Directory for uploaded avatar images
.env              # Environment variables file (not committed)
```

## Security Features

- Passwords are hashed with bcrypt
- JWT used for token-based authentication
- Rate limiting to mitigate brute force attacks
- CORS enabled for cross-origin requests

## Future Improvements

- Email verification system
- Unit and integration tests
- Swagger/OpenAPI documentation
