import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Canteen from './pages/Canteen';
import MapView from './pages/MapView';
import LostFound from './pages/LostFound';
import PingMe from './pages/PingMe';
import Library from './pages/Library';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center text-white space-y-4">
      <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-400 animate-pulse">Loading CampusX...</p>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4
};

function AnimatedRoutes() {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={
          <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            {user ? <Navigate to="/" /> : <Login />}
          </motion.div>
        } />
        <Route path="/" element={
          <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <PrivateRoute><Dashboard /></PrivateRoute>
          </motion.div>
        } />
        <Route path="/events" element={
          <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <PrivateRoute><Events /></PrivateRoute>
          </motion.div>
        } />
        <Route path="/canteen" element={
          <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <PrivateRoute><Canteen /></PrivateRoute>
          </motion.div>
        } />
        <Route path="/map" element={
          <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <PrivateRoute><MapView /></PrivateRoute>
          </motion.div>
        } />
        <Route path="/lostfound" element={
          <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <PrivateRoute><LostFound /></PrivateRoute>
          </motion.div>
        } />
        <Route path="/pingme" element={
          <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <PrivateRoute><PingMe /></PrivateRoute>
          </motion.div>
        } />
        <Route path="/library" element={
          <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <PrivateRoute><Library /></PrivateRoute>
          </motion.div>
        } />
      </Routes>
    </AnimatePresence>
  );
}

function AppContent() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <div className="min-h-screen bg-transparent text-slate-100 font-sans selection:bg-teal-500/30">
        {user && <Navbar />}
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <AnimatedRoutes />
        </main>
        {user && <Chatbot />}
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
