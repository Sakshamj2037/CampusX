import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { Calendar, Users, Filter, CheckCircle2, Zap, Palette, Trophy } from 'lucide-react';

const SkeletonEventCard = () => (
  <div className="glass-panel rounded-3xl overflow-hidden flex flex-col h-full">
    <div className="h-48 bg-slate-800/60 animate-pulse"></div>
    <div className="p-6 flex-1 flex flex-col space-y-4">
      <div className="h-6 bg-slate-800/60 rounded-md w-3/4 animate-pulse"></div>
      <div className="h-4 bg-slate-800/60 rounded-md w-full animate-pulse"></div>
      <div className="h-4 bg-slate-800/60 rounded-md w-5/6 animate-pulse mt-1"></div>
      <div className="mt-auto pt-6 flex justify-between">
        <div className="h-4 bg-slate-800/60 rounded-md w-1/4 animate-pulse"></div>
        <div className="h-4 bg-slate-800/60 rounded-md w-1/4 animate-pulse"></div>
      </div>
      <div className="h-12 bg-slate-800/60 rounded-xl w-full animate-pulse mt-4"></div>
    </div>
  </div>
);

const Events = () => {
  const { user, setUser } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [showConfetti, setShowConfetti] = useState(false);
  const [joinedMessage, setJoinedMessage] = useState('');
  const { width, height } = useWindowSize();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/events');
      setEvents(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  const joinEvent = async (eventId) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/events/${eventId}/join`);
      
      // Update local user state
      setUser(prev => ({
        ...prev,
        points: res.data.totalPoints,
        badges: res.data.badges,
        joinedEvents: [...(prev.joinedEvents || []), eventId]
      }));

      // Show celebration
      setJoinedMessage(`+${res.data.pointsEarned} Points!`);
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setJoinedMessage('');
      }, 5000);

      fetchEvents(); // Refresh participants count
    } catch (error) {
      alert(error.response?.data?.message || 'Error joining event');
    }
  };

  const categories = ['All', ...new Set(events.map(e => e.category))];
  const filteredEvents = filter === 'All' ? events : events.filter(e => e.category === filter);

  // Helper function to generate dynamic gradient based on category
  const getCategoryGradient = (category) => {
    switch(category?.toLowerCase()) {
      case 'tech': return 'from-blue-600 to-indigo-900';
      case 'cultural': return 'from-purple-600 to-pink-900';
      case 'sports': return 'from-orange-500 to-red-900';
      default: return 'from-teal-600 to-emerald-900';
    }
  };

  const getCategoryIcon = (category) => {
    switch(category?.toLowerCase()) {
      case 'tech': return <Zap size={14} className="mr-1" />;
      case 'cultural': return <Palette size={14} className="mr-1" />;
      case 'sports': return <Trophy size={14} className="mr-1" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 pb-12 relative">
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <Confetti width={width} height={height} recycle={false} numberOfPieces={600} gravity={0.15} />
        </div>
      )}
      
      <AnimatePresence>
        {joinedMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-teal-500 to-blue-500 text-white px-8 py-4 rounded-full shadow-[0_10px_40px_rgba(20,184,166,0.4)] font-bold text-xl flex items-center gap-3 border border-white/20 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
            >
              <CheckCircle2 className="text-white drop-shadow-md" />
            </motion.div>
            {joinedMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glass-panel p-6 rounded-3xl"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Campus Events</h1>
          <p className="text-slate-400">Discover and join events to earn points.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800 overflow-x-auto max-w-full no-scrollbar">
          <Filter size={18} className="text-slate-400 ml-2 shrink-0" />
          {categories.map(c => (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${
                filter === c 
                  ? 'bg-teal-500/20 text-teal-400 shadow-sm border border-teal-500/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              {c}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3, 4, 5, 6].map(i => <SkeletonEventCard key={i} />)
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map((event, idx) => {
            const isJoined = user?.joinedEvents?.includes(event.id);
            const gradient = getCategoryGradient(event.category);
            
            return (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="glass-panel rounded-3xl overflow-hidden flex flex-col group cursor-default shadow-lg"
              >
                <div className={`h-48 bg-gradient-to-br ${gradient} relative border-b border-white/10 overflow-hidden flex items-center justify-center`}>
                  {/* Pattern Overlay */}
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                  
                  {event.image ? (
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                  ) : (
                    <h3 className="text-4xl font-bold text-white/30 tracking-wider mix-blend-overlay uppercase transform -rotate-12 scale-150 whitespace-nowrap">{event.category}</h3>
                  )}
                  
                  <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-white border border-white/20 z-10 shadow-lg flex items-center">
                    {getCategoryIcon(event.category)}
                    {event.category}
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col relative">
                  <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-teal-400 transition-colors">{event.title}</h3>
                  <p className="text-slate-400 text-sm mb-6 flex-1 line-clamp-2">{event.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-slate-400 mb-6 bg-slate-900/60 p-3 rounded-xl border border-slate-800/50">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={16} className="text-teal-500" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={16} className="text-blue-500" />
                      <span>{event.participants?.length || 0}</span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={!isJoined ? { scale: 1.03 } : {}}
                    whileTap={!isJoined ? { scale: 0.95 } : {}}
                    onClick={() => joinEvent(event.id)}
                    disabled={isJoined}
                    className={`w-full py-3.5 rounded-xl font-bold transition-all flex justify-center items-center gap-2 overflow-hidden relative ${
                      isJoined 
                        ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-700' 
                        : 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] border border-teal-400/30'
                    }`}
                  >
                    {!isJoined && <div className="absolute inset-0 bg-white/20 w-full transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>}
                    {isJoined ? (
                      <><CheckCircle2 size={18} /> Joined</>
                    ) : (
                      `Join Event (+50 pts)`
                    )}
                  </motion.button>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-16 text-slate-500 bg-slate-900/30 rounded-3xl border border-slate-800/50">
            <p className="text-lg">No events found for this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
