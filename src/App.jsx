import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setCredentials,
  logOut,
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsSuperAdmin
} from './store/slices/authSlice';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isSuperAdmin = useSelector(selectIsSuperAdmin);
  const user = useSelector(selectCurrentUser);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // MOCK LOGIN LOGIC
    // In a real app, this would be an API call
    if (username && password) {
      // Simple mock: if username is 'admin', they are superadmin
      const role = username === 'admin' ? 'superadmin' : 'user';
      const mockToken = 'mock-jwt-token-' + Math.random();

      dispatch(setCredentials({
        user: username,
        token: mockToken,
        role: role
      }));
    } else {
      alert('Please enter username and password');
    }
  };

  const handleLogout = () => {
    dispatch(logOut());
  };

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <h1>Login</h1>
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter 'admin' for superadmin access"
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit">Login</button>
        </form>
        <p className="hint">Hint: Use username <strong>admin</strong> for SuperAdmin access.</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome, {user}!</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <main className="dashboard-content">
        {isSuperAdmin ? (
          <div className="admin-panel">
            <h2>SuperAdmin Dashboard</h2>
            <div className="card success">
              <h3>Access Granted</h3>
              <p>You have full access to everything.</p>
              <ul>
                <li>Manage Users</li>
                <li>System Settings</li>
                <li>View All Logs</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="user-panel">
            <h2>User Dashboard</h2>
            <div className="card">
              <h3>Limited Access</h3>
              <p>You have standard user access.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
