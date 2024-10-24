
import React, { useState } from 'react';

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
    <div className="container mx-auto max-w-xs mt-8">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-700">
          {isLogin ? 'Login' : 'Register'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              {isLogin ? 'Login' : 'Register'}
            </button>
          </div>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 hover:text-blue-800"
          >
            {isLogin ? 'Need to register?' : 'Already have an account?'}
          </button>
        </div>
        {error && (
          <div className="mt-4 text-red-500 text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
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
