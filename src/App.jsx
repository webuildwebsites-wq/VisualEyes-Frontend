import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from './store/slices/authSlice';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <div className="app-root">
      {isAuthenticated ? <Dashboard /> : <Auth />}
    </div>
  );
}

export default App;
