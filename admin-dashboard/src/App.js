import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Orders from './pages/Orders';

function RequireAuth({ children }) {
  const token = localStorage.getItem('admin_token');
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <div className="container mt-5">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RequireAuth><Orders /></RequireAuth>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
