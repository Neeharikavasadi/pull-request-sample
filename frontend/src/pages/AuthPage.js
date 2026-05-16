import { useState } from 'react';
import { login, register } from '../api';

function AuthPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    try {
      const payload = isRegister ? { username, email, password } : { username, password };
      
      if (isRegister) {
        await register(payload);
        setMessage('Registration successful. Please login.');
        setIsRegister(false);
        setPassword('');
      } else {
        const response = await login(payload);
        localStorage.setItem('userId', response.userId);
        localStorage.setItem('username', response.username);
        localStorage.setItem('token', response.token);
        localStorage.setItem('loyaltyPoints', response.loyaltyPoints || 0);
        localStorage.setItem('role', response.role);
        setMessage(response.message);
        setTimeout(() => {
          if (response.role === 'ROLE_ADMIN') {
            window.location.href = '/admin';
          } else {
            window.location.href = '/';
          }
        }, 1000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to process request');
    }
  };

  return (
    <div className="page-container auth-page">
      <div className="auth-wrapper">
        <div className="auth-card glass-panel">
          <h1>{isRegister ? 'Create Account' : 'Welcome Back'}</h1>
          <form onSubmit={submit} className="auth-form">
            <label>
              Username
              <input value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="Enter your username" />
            </label>
            {isRegister && (
              <label>
                Email
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Enter your email" />
              </label>
            )}
            <label>
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter your password" />
            </label>
            <button className="primary" type="submit">{isRegister ? 'Register' : 'Login'}</button>
          </form>
          <button className="toggle-auth" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Already have an account? Login' : 'Need an account? Register'}
          </button>
          {message && <div className="message">{message}</div>}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
