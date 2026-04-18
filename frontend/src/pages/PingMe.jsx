import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { Users, Send, UserPlus, Check, X } from 'lucide-react';

const PingMe = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('browse'); // 'browse', 'incoming', 'sent'
  const [usersList, setUsersList] = useState([]);
  const [requests, setRequests] = useState({ incoming: [], sent: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'browse') {
        const res = await fetch('http://localhost:5000/api/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) setUsersList(await res.json());
      } else {
        const res = await fetch('http://localhost:5000/api/requests', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setRequests(data);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async (toUserId) => {
    try {
      const res = await fetch('http://localhost:5000/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ toUserId })
      });
      if (res.ok) {
        alert('Request sent successfully!');
      } else {
        const data = await res.json();
        alert(data.message || 'Error sending request');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateRequest = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchData(); // Refresh requests list
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500 drop-shadow-md">
            PingMe Team Finder
          </h1>
          <p className="text-slate-400 mt-2">Find the perfect teammates for your next hackathon project.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-700/50 pb-4 mb-6 overflow-x-auto scrollbar-hide">
        <button onClick={() => setActiveTab('browse')} className={`px-4 py-2 font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === 'browse' ? 'bg-teal-500/20 text-teal-400 border border-teal-500/50' : 'text-slate-400 hover:bg-slate-800'}`}>
          <Users size={18} className="inline mr-2 -mt-1" /> Browse Users
        </button>
        <button onClick={() => setActiveTab('incoming')} className={`px-4 py-2 font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === 'incoming' ? 'bg-teal-500/20 text-teal-400 border border-teal-500/50' : 'text-slate-400 hover:bg-slate-800'}`}>
          <UserPlus size={18} className="inline mr-2 -mt-1" /> Incoming Requests
          {requests.incoming && requests.incoming.filter(r => r.status === 'pending').length > 0 && (
            <span className="ml-2 bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full">{requests.incoming.filter(r => r.status === 'pending').length}</span>
          )}
        </button>
        <button onClick={() => setActiveTab('sent')} className={`px-4 py-2 font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === 'sent' ? 'bg-teal-500/20 text-teal-400 border border-teal-500/50' : 'text-slate-400 hover:bg-slate-800'}`}>
          <Send size={18} className="inline mr-2 -mt-1" /> Sent Requests
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : activeTab === 'browse' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {usersList.map(u => (
            <motion.div key={u.id} whileHover={{ y: -5 }} className="glass-panel p-6 border border-slate-700/50 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-slate-100">{u.name}</h3>
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${u.availability === 'looking' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-600/20 text-slate-400'}`}>
                    {u.availability === 'looking' ? 'Looking' : 'In Team'}
                  </span>
                </div>
                <p className="text-teal-400 text-sm font-semibold mb-4">{u.role || 'Hacker'}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {(u.techStack && u.techStack.length > 0 ? u.techStack : ['General']).map(skill => (
                    <span key={skill} className="bg-slate-800 border border-slate-700 px-2 py-1 text-xs rounded-md text-slate-300">{skill}</span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => sendRequest(u.id)}
                disabled={u.availability !== 'looking'}
                className="w-full py-2 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Send size={16} /> Send Request
              </button>
            </motion.div>
          ))}
          {usersList.length === 0 && <p className="text-slate-400 col-span-full text-center py-12">No users found.</p>}
        </div>
      ) : activeTab === 'incoming' ? (
        <div className="space-y-4">
          {requests.incoming && requests.incoming.length === 0 ? <p className="text-slate-400 text-center py-12 glass-panel">No incoming requests.</p> :
            requests.incoming.map(req => (
              <div key={req.id} className="glass-panel p-4 flex flex-col md:flex-row justify-between items-center border border-slate-700/50">
                <div className="mb-4 md:mb-0 text-center md:text-left">
                  <h4 className="font-bold text-lg text-white">{req.targetUser?.name || 'Unknown User'}</h4>
                  <p className="text-sm text-teal-400">{req.targetUser?.role || 'Hacker'}</p>
                </div>
                <div className="flex items-center gap-4">
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
        <div className="space-y-4">
          {requests.sent && requests.sent.length === 0 ? <p className="text-slate-400 text-center py-12 glass-panel">No sent requests.</p> :
            requests.sent.map(req => (
              <div key={req.id} className="glass-panel p-4 flex flex-col md:flex-row justify-between items-center border border-slate-700/50">
                <div className="mb-4 md:mb-0 text-center md:text-left">
                  <h4 className="font-bold text-lg text-white">To: {req.targetUser?.name || 'Unknown User'}</h4>
                  <p className="text-sm text-teal-400">{req.targetUser?.role || 'Hacker'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${req.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : req.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {req.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </motion.div>
  );
};

export default PingMe;
