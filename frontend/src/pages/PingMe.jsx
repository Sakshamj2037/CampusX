import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { Users, Send, UserPlus, Check, X, CheckCircle, Github, Linkedin, Briefcase, Code, Terminal, ExternalLink } from 'lucide-react';

const PingMe = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('browse');
  const [usersList, setUsersList] = useState([]);
  const [requests, setRequests] = useState({ incoming: [], sent: [] });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      
      // Always fetch requests to know connection status
      const reqRes = await fetch(`${import.meta.env.VITE_API_URL}/api/requests`, { headers });
      let reqData = { incoming: [], sent: [] };
      if (reqRes.ok) reqData = await reqRes.json();
      setRequests(reqData);

      if (activeTab === 'browse') {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, { headers });
        if (res.ok) setUsersList(await res.json());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const sendRequest = async (e, toUserId) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ toUserId })
      });
      if (res.ok) {
        showToast('Connection request sent!');
        fetchData(); // Refresh to update button status
      } else {
        const data = await res.json();
        showToast(data.message || 'Error sending request');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateRequest = async (id, status) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast(`Request ${status} successfully`);
        fetchData(); 
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getConnectionStatus = (userId) => {
    const sent = requests.sent.find(r => r.toUserId === userId);
    if (sent) return sent.status; // 'pending' or 'accepted'
    const incoming = requests.incoming.find(r => r.fromUserId === userId);
    if (incoming) return incoming.status; // 'pending' or 'accepted'
    return 'none';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 relative">
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-teal-500 to-blue-500 text-white px-8 py-4 rounded-full shadow-[0_10px_40px_rgba(20,184,166,0.4)] font-bold text-xl flex items-center gap-3 border border-white/20 backdrop-blur-md"
          >
            <CheckCircle size={24} className="text-white" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500 drop-shadow-md">
            PingMe Network
          </h1>
          <p className="text-slate-400 mt-2">Discover and connect with top talent across the campus.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-700/50 pb-4 mb-6 overflow-x-auto scrollbar-hide">
        <button onClick={() => setActiveTab('browse')} className={`px-4 py-2 font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === 'browse' ? 'bg-teal-500/20 text-teal-400 border border-teal-500/50' : 'text-slate-400 hover:bg-slate-800'}`}>
          <Users size={18} className="inline mr-2 -mt-1" /> Discover
        </button>
        <button onClick={() => setActiveTab('incoming')} className={`px-4 py-2 font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === 'incoming' ? 'bg-teal-500/20 text-teal-400 border border-teal-500/50' : 'text-slate-400 hover:bg-slate-800'}`}>
          <UserPlus size={18} className="inline mr-2 -mt-1" /> Incoming
          {requests.incoming && requests.incoming.filter(r => r.status === 'pending').length > 0 && (
            <span className="ml-2 bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]">
              {requests.incoming.filter(r => r.status === 'pending').length}
            </span>
          )}
        </button>
        <button onClick={() => setActiveTab('sent')} className={`px-4 py-2 font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === 'sent' ? 'bg-teal-500/20 text-teal-400 border border-teal-500/50' : 'text-slate-400 hover:bg-slate-800'}`}>
          <Send size={18} className="inline mr-2 -mt-1" /> Sent
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : activeTab === 'browse' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {usersList.map(u => {
            const status = getConnectionStatus(u.id);
            const isLooking = u.availability === 'looking';
            return (
              <motion.div 
                key={u.id} 
                whileHover={{ y: -5, scale: 1.02 }} 
                onClick={() => setSelectedUser(u)}
                className="glass-panel p-6 border border-slate-700/50 flex flex-col justify-between cursor-pointer hover:shadow-[0_10px_30px_rgba(20,184,166,0.1)] transition-all relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                
                <div className="flex items-center gap-4 mb-5">
                  <div className="relative">
                    <img 
                      src={u.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}&backgroundColor=0d9488`} 
                      alt={u.name} 
                      className="w-16 h-16 rounded-2xl shadow-lg object-cover bg-slate-800 border-2 border-slate-700/50"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-slate-900 rounded-full ${isLooking ? 'bg-emerald-500' : 'bg-slate-500'}`} title={isLooking ? "Available" : "In Team"}></div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-100 group-hover:text-teal-300 transition-colors">{u.name}</h3>
                    <p className="text-teal-400 text-sm font-semibold">{u.role || 'Developer'}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6 h-[56px] overflow-hidden">
                  {(u.techStack && u.techStack.length > 0 ? u.techStack : ['General']).slice(0, 3).map(skill => (
                    <span key={skill} className="bg-slate-800/80 border border-slate-700 px-2.5 py-1 text-xs rounded-lg text-slate-300 flex items-center gap-1">
                      <Code size={12} className="text-slate-500" /> {skill}
                    </span>
                  ))}
                  {u.techStack?.length > 3 && (
                    <span className="px-2.5 py-1 text-xs text-slate-500">+{u.techStack.length - 3} more</span>
                  )}
                </div>
                
                <div className="mt-auto pt-4 border-t border-slate-700/30">
                  {status === 'none' ? (
                    <button
                      onClick={(e) => sendRequest(e, u.id)}
                      disabled={!isLooking}
                      className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:border disabled:border-slate-700 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      {isLooking ? <><Send size={16} /> Connect</> : <><Briefcase size={16} /> In Team</>}
                    </button>
                  ) : status === 'pending' ? (
                    <button disabled className="w-full py-2.5 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-xl font-bold flex items-center justify-center gap-2">
                      <Terminal size={16} /> Pending
                    </button>
                  ) : (
                    <button disabled className="w-full py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold flex items-center justify-center gap-2">
                      <CheckCircle size={16} /> Connected
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
          {usersList.length === 0 && <p className="text-slate-400 col-span-full text-center py-12 glass-panel border border-slate-700/50">No users found.</p>}
        </div>
      ) : activeTab === 'incoming' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.incoming && requests.incoming.length === 0 ? <p className="text-slate-400 col-span-full text-center py-12 glass-panel border border-slate-700/50">No incoming requests right now.</p> :
            requests.incoming.map(req => (
              <div key={req.id} className="glass-panel p-5 flex flex-col md:flex-row justify-between items-center border border-slate-700/50 hover:border-teal-500/30 transition-colors">
                <div className="flex items-center gap-4 mb-4 md:mb-0 w-full md:w-auto">
                   <img 
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(req.targetUser?.name || 'U')}&backgroundColor=0d9488`} 
                      alt="Avatar" 
                      className="w-12 h-12 rounded-xl object-cover bg-slate-800"
                    />
                  <div className="text-left">
                    <h4 className="font-bold text-lg text-white">{req.targetUser?.name || 'Unknown User'}</h4>
                    <p className="text-sm text-teal-400">{req.targetUser?.role || 'Hacker'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${req.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : req.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {req.status.toUpperCase()}
                  </span>
                  {req.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => updateRequest(req.id, 'accepted')} className="p-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 rounded-lg transition-colors" title="Accept"><Check size={18} /></button>
                      <button onClick={() => updateRequest(req.id, 'rejected')} className="p-2 bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 rounded-lg transition-colors" title="Reject"><X size={18} /></button>
                    </div>
                  )}
                </div>
              </div>
            ))
          }
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.sent && requests.sent.length === 0 ? <p className="text-slate-400 col-span-full text-center py-12 glass-panel border border-slate-700/50">You haven't sent any requests yet.</p> :
            requests.sent.map(req => (
              <div key={req.id} className="glass-panel p-5 flex flex-col md:flex-row justify-between items-center border border-slate-700/50 hover:border-teal-500/30 transition-colors">
                <div className="flex items-center gap-4 mb-4 md:mb-0 w-full md:w-auto">
                   <img 
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(req.targetUser?.name || 'U')}&backgroundColor=8b5cf6`} 
                      alt="Avatar" 
                      className="w-12 h-12 rounded-xl object-cover bg-slate-800"
                    />
                  <div className="text-left">
                    <h4 className="font-bold text-lg text-white">To: {req.targetUser?.name || 'Unknown User'}</h4>
                    <p className="text-sm text-teal-400">{req.targetUser?.role || 'Hacker'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${req.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : req.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                    {req.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* EXPANDED PROFILE MODAL */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedUser(null)}
              className="fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="glass-panel w-full max-w-2xl border border-slate-700/50 overflow-hidden shadow-2xl pointer-events-auto flex flex-col max-h-[90vh]">
                <div className="h-32 bg-gradient-to-r from-teal-600/40 to-blue-600/40 relative">
                  <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 p-2 bg-slate-900/50 hover:bg-slate-800 text-white rounded-full transition-colors backdrop-blur-md">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="px-8 pb-8 pt-0 relative flex-1 overflow-y-auto custom-scrollbar">
                  <div className="flex justify-between items-end mb-6 -mt-16">
                    <img 
                      src={selectedUser.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedUser.name)}&backgroundColor=0d9488`} 
                      alt={selectedUser.name} 
                      className="w-32 h-32 rounded-3xl border-4 border-slate-900 object-cover shadow-xl bg-slate-800"
                    />
                    <div className="flex gap-3 mb-2">
                      {selectedUser.socialLinks?.github && (
                        <a href={selectedUser.socialLinks.github} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl transition-all shadow-md">
                          <Github size={20} />
                        </a>
                      )}
                      {selectedUser.socialLinks?.linkedin && (
                        <a href={selectedUser.socialLinks.linkedin} target="_blank" rel="noreferrer" className="p-2.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 hover:text-blue-300 border border-blue-500/30 rounded-xl transition-all shadow-md">
                          <Linkedin size={20} />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h2 className="text-3xl font-bold text-white mb-1">{selectedUser.name}</h2>
                    <p className="text-teal-400 font-semibold text-lg flex items-center gap-2">
                      {selectedUser.role || 'Developer'} 
                      <span className="text-slate-600">•</span> 
                      <span className="text-slate-400 text-sm font-normal bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">{selectedUser.experienceLevel || 'Enthusiast'}</span>
                    </p>
                  </div>

                  <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800 mb-6">
                    <h3 className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-2">About</h3>
                    <p className="text-slate-200 leading-relaxed">
                      {selectedUser.bio || 'This user is mysterious and has not added a bio yet. They are probably busy coding something awesome!'}
                    </p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-3">Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {(selectedUser.techStack && selectedUser.techStack.length > 0 ? selectedUser.techStack : ['JavaScript', 'React', 'Node.js']).map(skill => (
                        <span key={skill} className="bg-slate-800 border border-slate-700 px-3 py-1.5 text-sm font-medium rounded-xl text-slate-200 flex items-center gap-2 shadow-sm">
                          <Code size={14} className="text-teal-500" /> {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedUser.projects && selectedUser.projects.length > 0 && (
                    <div className="mb-2">
                      <h3 className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-3">Featured Projects</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedUser.projects.map(proj => (
                          <div key={proj} className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl flex items-center gap-3 hover:bg-slate-800 transition-colors cursor-default">
                            <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400">
                              <ExternalLink size={16} />
                            </div>
                            <span className="font-semibold text-slate-200">{proj}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Modal Footer with Action */}
                <div className="p-5 border-t border-slate-700/50 bg-slate-900/80 backdrop-blur-md">
                  {getConnectionStatus(selectedUser.id) === 'none' ? (
                    <button
                      onClick={(e) => {
                        sendRequest(e, selectedUser.id);
                        setSelectedUser(null);
                      }}
                      disabled={selectedUser.availability !== 'looking'}
                      className="w-full py-3 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white rounded-xl font-bold transition-all shadow-lg text-lg flex items-center justify-center gap-2"
                    >
                      {selectedUser.availability === 'looking' ? <><Send size={20} /> Connect with {selectedUser.name.split(' ')[0]}</> : <><Briefcase size={20} /> Currently In Team</>}
                    </button>
                  ) : getConnectionStatus(selectedUser.id) === 'pending' ? (
                    <button disabled className="w-full py-3 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-xl font-bold flex items-center justify-center gap-2 text-lg">
                      <Terminal size={20} /> Request Pending
                    </button>
                  ) : (
                    <button disabled className="w-full py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold flex items-center justify-center gap-2 text-lg">
                      <CheckCircle size={20} /> Connected
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PingMe;
