
import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  TextField, 
  Typography, 
  Paper,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel
} from '@mui/material';

const AuthForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `${isLogin ? 'Login' : 'Registration'} failed`);
      }

      if (isLogin) {
        localStorage.setItem('token', data.token);
        onLogin({ username, token: data.token });
      } else {
        setIsLogin(true);
        setError('Registration successful. Please log in.');
      }
    } catch (error) {
      console.error(`Error during ${isLogin ? 'login' : 'registration'}:`, error);
      setError(error.message || `${isLogin ? 'Login' : 'Registration'} failed. Please try again.`);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%', backgroundColor: 'background.paper' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom color="text.primary">
            {isLogin ? 'Login' : 'Register'}
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              inputProps={{
                'aria-label': 'Username',
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              inputProps={{
                'aria-label': 'Password',
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              aria-label={isLogin ? "Sign In" : "Register"}
            >
              {isLogin ? 'Sign In' : 'Register'}
            </Button>
            <FormControlLabel
              control={<Switch checked={isLogin} onChange={() => setIsLogin(!isLogin)} />}
              label={isLogin ? "Switch to Register" : "Switch to Login"}
            />
          </Box>
        </Paper>
      </Box>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert onClose={() => setError('')} severity={error === 'Registration successful. Please log in.' ? "success" : "error"} sx={{ width: '100%' }} aria-live="assertive">
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AuthForm;
