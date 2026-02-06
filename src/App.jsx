import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from './store/slices/authSlice';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Welcome from './pages/Welcome';
import Registration from './pages/Registration';

import './App.css';

function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // For verification purposes, we'll allow access to dashboard even without auth for now
  // or stick to the requirement. Let's assume user wants to see the dashboard immediately.
  // Actually, the user asked to "Login -> Dashboard".
  // I will keep the auth check but ensure Login redirects to /

  return (
    <BrowserRouter>
      <div className="app-root min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/register" element={<Registration />} />


        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
