
# Real-Time Text Editor

## Setup

### Prerequisites
- Node.js
- npm
- SQLite

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/bc-rep-project/real-time-text-editor.git
   cd real-time-text-editor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the following environment variables:
   ```env
   JWT_SECRET=your_jwt_secret
   DATABASE_URL=sqlite://./database.sqlite
   ```

4. Start the server:
   ```bash
   node server.js
   ```

## Usage

### Register
To register a new user, send a POST request to `/register` with the following JSON payload:
```json
{
  "username": "your_username",
  "password": "your_password"
}
```

### Login
To login, send a POST request to `/login` with the following JSON payload:
```json
{
  "username": "your_username",
  "password": "your_password"
}
```
The response will include a JWT token.

### Access Protected Route
To access a protected route, send a GET request to `/protected` with the `Authorization` header set to `Bearer <your_token>`.

## Frontend Components
The frontend components for Register, Login, and Protected routes are located in the `src/components` directory.

### Register Component
- `src/components/Register.js`
- `src/components/Register.css`

### Login Component
- `src/components/Login.js`
- `src/components/Login.css`

### Protected Component
- `src/components/Protected.js`
- `src/components/Protected.css`
