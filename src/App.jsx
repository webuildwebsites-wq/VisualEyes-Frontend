
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Welcome from './pages/Welcome';
import Registration from './pages/Registration';
import RegisterCustomer from './pages/RegisterCustomer';
import EmployeeList from './pages/EmployeeList';
import MainLayout from './components/layout/MainLayout';
import DashboardWizard from './pages/AddStore';
import OrderWizard from './pages/OrderWizard';
import PlaceholderPage from './pages/PlaceholderPage';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from './store/slices/authSlice';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import AuthWrapper from './components/AuthWrapper';

function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <BrowserRouter>
      <div className="app-root min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Routes>
          <Route
            path="/login"
            element={!isAuthenticated ? <Login /> : <Navigate to="/welcome" state={{ from: 'login' }} replace />}
          />
          {/* Protected Dashboard Routes */}
          <Route element={<AuthWrapper />}>
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/" element={<MainLayout />}>
              <Route index element={<PlaceholderPage title="Dashboard" />} />
              <Route
                path="/register"
                element={<Registration title="Register Employee" />}
              />
              <Route path="/register/list" element={<EmployeeList />} />
              <Route path="stores" element={<DashboardWizard />} />
              <Route path="new-order" element={<OrderWizard />} />
              <Route path="/customer-care/register" element={<RegisterCustomer />} />
              <Route path="/customer-care/list" element={<PlaceholderPage title="All Customers" />} />
              <Route path="surfacing" element={<PlaceholderPage title="Surfacing" />} />
              <Route path="tint" element={<PlaceholderPage title="Tint" />} />
              <Route path="hard-coat" element={<PlaceholderPage title="Hard Coat" />} />
              <Route path="arc" element={<PlaceholderPage title="ARC" />} />
              <Route path="qc" element={<PlaceholderPage title="QC" />} />
              <Route path="fitting" element={<PlaceholderPage title="Fitting" />} />
              <Route path="dispatch" element={<PlaceholderPage title="Dispatch" />} />
              <Route path="dms" element={<PlaceholderPage title="DMS" />} />
              <Route path="finance" element={<PlaceholderPage title="F&A" />} />
              <Route path="reports" element={<PlaceholderPage title="Reports" />} />
            </Route>
          </Route>
        </Routes>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;
