import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GraduationCap, LayoutDashboard, CalendarDays, Coffee, Map, LogOut, Package, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { logout, user } = useContext(AuthContext);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Events', path: '/events', icon: CalendarDays },
    { name: 'Canteen', path: '/canteen', icon: Coffee },
    { name: 'Map', path: '/map', icon: Map },
    { name: 'Lost & Found', path: '/lostfound', icon: Package },
    { name: 'PingMe', path: '/pingme', icon: Users },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-700/50 mb-8 backdrop-blur-xl shadow-sm">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between h-16">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-9 h-9 bg-gradient-to-tr from-teal-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
              <GraduationCap size={22} className="text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400 hidden sm:block drop-shadow-sm">
              CampusX
            </span>
          </motion.div>

          <div className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `relative px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-200 group flex items-center gap-2 ${
                  isActive ? 'text-teal-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {({ isActive }) => (
                  <>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <item.icon size={18} className={isActive ? 'drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]' : ''} />
                    </motion.div>
                    <span className="hidden md:block relative z-10">{item.name}</span>
                    
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-slate-800/80 rounded-xl border border-slate-700/50 shadow-inner -z-10"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    
                    {!isActive && (
                      <div className="absolute inset-0 bg-slate-800/0 group-hover:bg-slate-800/40 rounded-xl transition-colors duration-200 -z-10" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(20,184,166,0.3)" }}
              className="hidden sm:flex items-center gap-2 bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-700/80 backdrop-blur-sm cursor-default"
            >
              <div className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)] animate-pulse"></div>
              <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">
                {user?.points || 0} pts
              </span>
            </motion.div>
            
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              onClick={logout}
              className="text-slate-400 hover:text-rose-400 transition-colors p-2 rounded-xl hover:bg-rose-500/10"
              title="Logout"
            >
              <LogOut size={20} />
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
