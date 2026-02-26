
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from './store/slices/authSlice';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import { PATHS, routesConfig } from './routes/config';

import PermissionGuard from './components/PermissionGuard';

function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Dynamic Route Renderer
  const renderRoutes = (routes) => {
    return routes.map((route, index) => {
      const {
        element: Component,
        props = {},
        children,
        isPublic,
        index: isIndexRoute,
        path,
        requiredPermission
      } = route;

      let element = <Component {...props} />;

      // Authentication logic for public routes (e.g., redirect from Login if already logged in)
      if (isPublic && path === PATHS.LOGIN) {
        element = !isAuthenticated ? (
          <Component />
        ) : (
          <Navigate to={PATHS.WELCOME} state={{ from: 'login' }} replace />
        );
      } else if (requiredPermission) {
        // Enforce permission checks for protected routes
        element = (
          <PermissionGuard requiredPermission={requiredPermission}>
            <Component {...props} />
          </PermissionGuard>
        );
      }

      // Index routes
      if (isIndexRoute) {
        return <Route key={`index-${index}`} index element={element} />;
      }

      // Nested routes (Wrappers like AuthWrapper, MainLayout, or module groups)
      if (children) {
        return (
          <Route key={path || `wrapper-${index}`} path={path} element={element}>
            {renderRoutes(children)}
          </Route>
        );
      }

      // Standard routes
      return <Route key={path} path={path} element={element} />;
    });
  };

  return (
    <BrowserRouter>
      <div className="app-root min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Routes>
          {renderRoutes(routesConfig)}
        </Routes>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;
