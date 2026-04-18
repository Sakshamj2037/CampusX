import { useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { motion, useInView, useAnimation } from 'framer-motion';
import { Trophy, Star, Medal, Bell, Calendar, Users } from 'lucide-react';

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 2 }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10);
    if (start === end) return;
    
    let totalMiliseconds = duration * 1000;
    let incrementTime = (totalMiliseconds / end) * 2;
    
    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);
    
    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count}</span>;
};

// Skeleton Component
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-800/60 rounded-xl ${className}`}></div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [leaderboardData, setLeaderboardData] = useState({ leaderboard: [], totalUsers: 0, liveUsers: 0, userRank: null });
  const [notices, setNotices] = useState([]);
  const [noticeFilter, setNoticeFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const noticeTypes = ['All', 'Academic', 'Events', 'General', 'Urgent'];

  const filteredNotices = noticeFilter === 'All' 
    ? notices 
    : notices.filter(n => n.type === noticeFilter);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lbRes, noticeRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/auth/leaderboard`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/notices`)
        ]);
        setLeaderboardData(lbRes.data);
        setNotices(noticeRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setTimeout(() => setLoading(false), 800); // Slight delay for smooth animation
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass-panel p-8 rounded-3xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">{user?.name}</span> 👋
            </h1>
            <p className="text-slate-400">Ready to explore the campus and earn points today?</p>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
            {/* Stats Cards */}
            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl flex items-center gap-4 shadow-lg cursor-default"
            >
              <div className="p-3 bg-teal-500/20 text-teal-400 rounded-xl">
                <Star size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Points</p>
                <p className="text-2xl font-bold">
                  {loading ? <Skeleton className="h-8 w-16 mt-1" /> : <AnimatedCounter value={user?.points || 0} />}
                </p>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl flex items-center gap-4 shadow-lg cursor-default"
            >
              <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
                <Users size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Users</p>
                <p className="text-2xl font-bold">
                  {loading ? <Skeleton className="h-8 w-16 mt-1" /> : <AnimatedCounter value={leaderboardData.totalUsers} />}
                </p>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl flex items-center gap-4 shadow-lg cursor-default"
            >
              <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center relative">
                <span className="w-3 h-3 bg-rose-500 rounded-full animate-ping absolute"></span>
                <span className="w-3 h-3 bg-rose-500 rounded-full relative"></span>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Live Now</p>
                <p className="text-2xl font-bold">
                  {loading ? <Skeleton className="h-8 w-16 mt-1" /> : <AnimatedCounter value={leaderboardData.liveUsers} />}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Badges Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-1 glass-panel p-6 rounded-3xl h-fit"
        >
          <div className="flex items-center gap-2 mb-6">
            <Medal className="text-blue-400" />
            <h2 className="text-xl font-bold">Your Badges</h2>
          </div>
          
          {loading ? (
            <div className="flex flex-wrap gap-3">
              {[1, 2].map(i => <Skeleton key={i} className="h-10 w-28 rounded-xl" />)}
            </div>
          ) : user?.badges?.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {user.badges.map((badge, idx) => (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + (idx * 0.1), type: "spring" }}
                  key={idx} 
                  className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium text-slate-200 shadow-sm"
                >
                  <span>🎖️</span> {badge}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800/50">
              <p className="text-sm">Join events to earn your first badge!</p>
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-slate-700/50 text-center">
            <a href="#badges-info" className="text-sm text-teal-400 hover:text-teal-300 font-medium transition-colors">
              Know more about badges &rarr;
            </a>
          </div>
        </motion.div>

        {/* Leaderboard Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="col-span-1 md:col-span-2 glass-panel p-6 rounded-3xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-400" />
              <h2 className="text-xl font-bold">Leaderboard</h2>
            </div>
          </div>
          
          <div className="space-y-3">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)
            ) : (
              leaderboardData.leaderboard.map((lbUser, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  whileHover={{ scale: 1.01, x: 5 }}
                  key={lbUser.id} 
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-default ${
                    lbUser.id === user?.id 
                      ? 'bg-teal-500/10 border-teal-500/30 shadow-[0_0_15px_rgba(20,184,166,0.15)]' 
                      : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-10 min-w-[2.5rem] px-2 rounded-full flex items-center justify-center font-bold shadow-inner ${
                      idx === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 text-slate-900 text-xl' :
                      idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-slate-900 text-xl' :
                      idx === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white text-xl' :
                      'bg-slate-700 text-slate-300 text-sm'
                    }`}>
                      {idx < 3 ? ['🥇', '🥈', '🥉'][idx] : `${idx + 1} ${['💎', '🌟', '🚀', '🔥', '⚡', '🎯', '✨'][idx - 3]}`}
                    </div>
                    <span className={`font-medium ${idx < 3 ? 'text-white' : 'text-slate-200'}`}>
                      {lbUser.name} {lbUser.id === user?.id && <span className="text-xs text-teal-400 ml-2">(You)</span>}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {lbUser.badges && lbUser.badges.length > 0 && (
                      <span className="text-xs px-2 py-1 bg-slate-900/80 rounded-md text-slate-300 border border-slate-700/50 hidden sm:block">
                        {lbUser.badges.includes('Campus Star') ? '🌟 Campus Star' : 
                         lbUser.badges.includes('Event Master') ? '🏅 Event Master' : 
                         '🎖️ Explorer'}
                      </span>
                    )}
                    <div className="flex items-center gap-1 font-bold text-teal-400 text-lg">
                      {lbUser.points} <span className="text-xs text-slate-500 font-normal">pts</span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}

            {!loading && leaderboardData.userRank && (
              <>
                <div className="text-center py-2 text-slate-500 font-bold text-xl">
                  ⋮
                </div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 rounded-2xl border bg-teal-500/10 border-teal-500/30 shadow-[0_0_15px_rgba(20,184,166,0.15)] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-slate-700 text-slate-300">
                      {leaderboardData.userRank.rank}
                    </div>
                    <span className="font-medium text-slate-200">
                      {leaderboardData.userRank.name} <span className="text-xs text-teal-400 ml-2">(You)</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {leaderboardData.userRank.badges && leaderboardData.userRank.badges.length > 0 && (
                      <span className="text-xs px-2 py-1 bg-slate-900/80 rounded-md text-slate-300 border border-slate-700/50 hidden sm:block">
                        {leaderboardData.userRank.badges.includes('Campus Star') ? '🌟 Campus Star' : 
                         leaderboardData.userRank.badges.includes('Event Master') ? '🏅 Event Master' : 
                         '🎖️ Explorer'}
                      </span>
                    )}
                    <div className="flex items-center gap-1 font-bold text-teal-400 text-lg">
                      {leaderboardData.userRank.points} <span className="text-xs text-slate-500 font-normal">pts</span>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Notice Board */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-panel p-6 rounded-3xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Bell className="text-rose-400" />
            <h2 className="text-xl font-bold">Notice Board</h2>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {noticeTypes.map(type => (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={type}
                onClick={() => setNoticeFilter(type)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  noticeFilter === type 
                    ? 'bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.4)]' 
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
              >
                {type}
              </motion.button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)
          ) : filteredNotices.length > 0 ? (
            filteredNotices.map((notice, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
                whileHover={{ y: -4, scale: 1.01 }}
                key={notice.id} 
                className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl relative overflow-hidden group hover:bg-slate-800/80 hover:border-slate-600 transition-all cursor-pointer"
              >
                {/* Type Indicator Line */}
                <div className={`absolute top-0 left-0 w-1 h-full ${
                  notice.type === 'Urgent' ? 'bg-red-500 shadow-[0_0_10px_red]' :
                  notice.type === 'Academic' ? 'bg-blue-500 shadow-[0_0_10px_blue]' :
                  notice.type === 'Events' ? 'bg-purple-500 shadow-[0_0_10px_purple]' :
                  'bg-teal-500 shadow-[0_0_10px_teal]'
                }`}></div>
                
                <div className="flex justify-between items-start mb-2 pl-2">
                  <h3 className="font-semibold text-lg text-slate-200 group-hover:text-white transition-colors">{notice.title}</h3>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white ${
                      notice.type === 'Urgent' ? 'bg-red-500/80' :
                      notice.type === 'Academic' ? 'bg-blue-500/80' :
                      notice.type === 'Events' ? 'bg-purple-500/80' :
                      'bg-teal-500/80'
                    }`}>
                      {notice.type || 'General'}
                    </span>
                    <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded-md">
                      {new Date(notice.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed pl-2">{notice.content}</p>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="col-span-1 md:col-span-2 text-center py-8 text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800/50"
            >
              <p>No notices found for this category.</p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Badges Info Box */}
      <motion.div 
        id="badges-info"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        className="glass-panel p-6 rounded-3xl scroll-mt-24"
      >
        <div className="flex items-center gap-2 mb-6">
          <Medal className="text-blue-400" />
          <h2 className="text-xl font-bold">About Badges</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <motion.div whileHover={{ scale: 1.05 }} className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl flex flex-col items-center text-center">
            <span className="text-4xl mb-3 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">🎖️</span>
            <h3 className="font-bold text-slate-200 mb-1">Explorer</h3>
            <p className="text-xs text-slate-400">Awarded when you reach <strong className="text-teal-400">100 points</strong>. The first step to being active!</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl flex flex-col items-center text-center">
            <span className="text-4xl mb-3 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">🏅</span>
            <h3 className="font-bold text-slate-200 mb-1">Event Master</h3>
            <p className="text-xs text-slate-400">Awarded when you reach <strong className="text-teal-400">500 points</strong>. Shows high dedication and engagement.</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl flex flex-col items-center text-center">
            <span className="text-4xl mb-3 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">🌟</span>
            <h3 className="font-bold text-slate-200 mb-1">Campus Star</h3>
            <p className="text-xs text-slate-400">Awarded when you reach <strong className="text-teal-400">1500 points</strong>. Reserved for true campus leaders.</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
