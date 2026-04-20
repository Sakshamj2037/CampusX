import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Users, Activity, Eye, BarChart3, PieChart as PieChartIcon, ShieldAlert } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart as RePieChart, Pie, Legend } from 'recharts';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#14b8a6', '#0ea5e9', '#8b5cf6', '#f43f5e', '#f59e0b'];

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl flex items-center space-x-4 hover:bg-slate-800/80 transition-colors"
  >
    <div className={`p-4 rounded-xl ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold text-white mt-1">{value}</p>
    </div>
  </motion.div>
);

const AdminAnalytics = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.email !== 'sakshamjainbbps@gmail.com') {
      navigate('/');
      return;
    }

    const fetchAnalytics = async () => {
      try {
        const [dashRes, usersRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/analytics/dashboard`, {
            headers: { 'x-auth-token': localStorage.getItem('token') }
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/analytics/users`, {
            headers: { 'x-auth-token': localStorage.getItem('token') }
          })
        ]);
        setStats(dashRes.data);
        setUsersList(usersRes.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err.response?.status === 403 ? 'Access Denied: Admin privileges required.' : 'Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Analytics Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-800/50 animate-pulse rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-800/50 animate-pulse rounded-2xl" />
          <div className="h-80 bg-slate-800/50 animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center mt-32 space-y-4">
        <ShieldAlert size={64} className="text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold text-white">{error}</h2>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors mt-6">
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">
            Analytics Dashboard
          </h1>
          <p className="text-slate-400 mt-2">Real-time platform usage and insights</p>
        </div>
        <div className="px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-full text-sm font-medium border border-emerald-500/20 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Live Data
        </div>
      </motion.div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="bg-teal-500" delay={0.1} />
        <StatCard title="Active Users (24h)" value={stats.activeUsers} icon={Activity} color="bg-sky-500" delay={0.2} />
        <StatCard title="Total Page Visits" value={stats.totalVisits} icon={Eye} color="bg-purple-500" delay={0.3} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl"
        >
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="text-teal-400" />
            <h3 className="text-xl font-semibold text-white">Feature Usage</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.featureUsage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} cursor={{ fill: '#334155', opacity: 0.4 }} />
                <Bar dataKey="visits" radius={[4, 4, 0, 0]}>
                  {stats.featureUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl"
        >
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon className="text-purple-400" />
            <h3 className="text-xl font-semibold text-white">Device Activity Breakdown</h3>
          </div>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={stats.activityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {stats.activityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* All Users Table Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-700/50 flex items-center gap-2">
          <Users className="text-blue-400" />
          <h3 className="text-xl font-semibold text-white">All Registered Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 text-slate-400 text-sm border-b border-slate-700/50">
                <th className="px-6 py-4 font-medium whitespace-nowrap">Name</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Email</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Join Date</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Last Active</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {usersList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No users found.</td>
                </tr>
              ) : (
                usersList.map((u) => {
                  const joinDate = new Date(u.createdAt).toLocaleDateString();
                  const lastActiveDate = new Date(u.lastActive);
                  const isActive = (Date.now() - lastActiveDate.getTime()) < 24 * 60 * 60 * 1000;

                  return (
                    <tr key={u._id || u.id} className="hover:bg-slate-700/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-200">{u.name}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{u.email}</td>
                      <td className="px-6 py-4 text-slate-400">{joinDate}</td>
                      <td className="px-6 py-4 text-slate-400">
                        {lastActiveDate.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                          isActive 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminAnalytics;
