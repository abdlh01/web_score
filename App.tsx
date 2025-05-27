import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Background from './components/Background';
import SelectWilaya from './pages/SelectWilaya';
import Home from './pages/Home';
import Study from './pages/Study';
import Subjects from './pages/Subjects';
import Loading from './components/Loading';
import { useAuth } from './lib/useAuth';

function App() {
  const { isInitialized } = useAuth();

  if (!isInitialized) {
    return <Loading />;
  }

  return (
    <>
      <Background />
      <Routes>
        <Route path="/select-wilaya" element={<SelectWilaya />} />
        <Route path="/home" element={<Home />} />
        <Route path="/study" element={<Study />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </>
  );
}

function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWithRouter;