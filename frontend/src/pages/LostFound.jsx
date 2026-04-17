import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { Package, Plus, MapPin, CheckCircle, Info, Image as ImageIcon, Search, Filter } from 'lucide-react';

const LostFound = () => {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    image: '',
    status: 'lost'
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/lostfound');
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Error fetching lost & found items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/lostfound', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ title: '', description: '', location: '', image: '', status: 'lost' });
        setShowForm(false);
        fetchItems(); // Refresh list
      }
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleClaim = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/lostfound/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: 'claimed' }),
      });

      if (response.ok) {
        fetchItems();
      }
    } catch (error) {
      console.error('Error claiming item:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const filterOptions = [
    { id: 'all', label: 'All Items' },
    { id: 'lost', label: 'Lost' },
    { id: 'found', label: 'Found' },
    { id: 'report', label: 'Reports' },
    { id: 'claim', label: 'Claims' }
  ];

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === 'all' || item.status === filter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500 drop-shadow-md">
            Lost & Found
          </h1>
          <p className="text-slate-400 mt-2">Report lost items or find what you're looking for.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl font-bold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-all flex items-center gap-2"
        >
          {showForm ? 'Cancel' : <><Plus size={20} /> Report Item</>}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-panel p-6 mb-8 border border-slate-700/50">
              <h2 className="text-xl font-bold mb-4 text-teal-400">Report an Item</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-teal-500"
                      placeholder="e.g. Blue Water Bottle"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Type</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-teal-500"
                    >
                      <option value="lost">Lost</option>
                      <option value="found">Found</option>
                      <option value="report">Report</option>
                      <option value="claim">Claim</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Location</label>
                    <div className="relative">
                      <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-teal-500"
                        placeholder="e.g. Library 2nd Floor"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Image URL (Optional)</label>
                    <div className="relative">
                      <ImageIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) => setFormData({...formData, image: e.target.value})}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-teal-500"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-teal-500 h-24 resize-none"
                    placeholder="Provide details about the item..."
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="px-6 py-2 bg-teal-500 hover:bg-teal-600 rounded-xl font-bold transition-colors">
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => setFilter(opt.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                filter === opt.id 
                  ? 'bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.4)]' 
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700/50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-64">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length === 0 ? (
          <div className="col-span-full text-center py-12 glass-panel border border-slate-700/30">
            <Package size={48} className="mx-auto text-slate-500 mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-slate-300">No Items Found</h3>
            <p className="text-slate-500">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -5 }}
              className={`glass-panel border overflow-hidden relative ${
                item.status === 'claimed' ? 'border-emerald-500/30 opacity-75' : 
                item.status === 'found' ? 'border-blue-500/30' : 
                item.status === 'report' ? 'border-amber-500/30' :
                item.status === 'claim' ? 'border-purple-500/30' :
                'border-rose-500/30'
              }`}
            >
              <div className={`absolute top-0 left-0 w-1 h-full ${
                item.status === 'claimed' ? 'bg-emerald-500' : 
                item.status === 'found' ? 'bg-blue-500' : 
                item.status === 'report' ? 'bg-amber-500' :
                item.status === 'claim' ? 'bg-purple-500' :
                'bg-rose-500'
              }`}></div>
              
              {item.image && (
                <div className="h-40 w-full overflow-hidden bg-slate-900">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                </div>
              )}
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-slate-100 truncate pr-2">{item.title}</h3>
                  <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                    item.status === 'claimed' ? 'bg-emerald-500/20 text-emerald-400' : 
                    item.status === 'found' ? 'bg-blue-500/20 text-blue-400' : 
                    item.status === 'report' ? 'bg-amber-500/20 text-amber-400' :
                    item.status === 'claim' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-rose-500/20 text-rose-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
                
                <p className="text-sm text-slate-400 mb-4 line-clamp-2 min-h-[40px]">{item.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs text-slate-300">
                    <MapPin size={14} className="mr-2 text-teal-400" />
                    <span className="truncate">{item.location}</span>
                  </div>
                  <div className="flex items-center text-xs text-slate-500">
                    <Info size={14} className="mr-2" />
                    <span>Reported: {new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {item.status !== 'claimed' && (
                  <button
                    onClick={() => handleClaim(item.id)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors border border-slate-700 hover:border-teal-500/50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} className="text-teal-400" />
                    Mark as Claimed
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default LostFound;
