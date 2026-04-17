import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Plus, Hash, Clock, X, QrCode } from 'lucide-react';

const SkeletonMenuItem = () => (
  <div className="glass-panel p-5 rounded-2xl flex justify-between items-center h-24">
    <div className="space-y-3 w-1/2">
      <div className="h-5 bg-slate-800/60 rounded animate-pulse w-full"></div>
      <div className="h-4 bg-slate-800/60 rounded animate-pulse w-1/2"></div>
    </div>
    <div className="w-12 h-12 bg-slate-800/60 rounded-xl animate-pulse"></div>
  </div>
);

const SkeletonToken = () => (
  <div className="bg-slate-800/40 border border-slate-700 p-5 rounded-2xl h-40 animate-pulse"></div>
);

const Canteen = () => {
  const [menu, setMenu] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [menuRes, tokenRes] = await Promise.all([
        axios.get('http://localhost:5000/api/tokens/menu'),
        axios.get('http://localhost:5000/api/tokens/my-tokens')
      ]);
      setMenu(menuRes.data);
      setTokens(tokenRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleOrderClick = (item) => {
    setSelectedItem(item);
    setShowOrderModal(true);
  };

  const confirmOrder = async () => {
    try {
      await axios.post('http://localhost:5000/api/tokens/order', { itemId: selectedItem.id });
      setShowOrderModal(false);
      setSelectedItem(null);
      fetchData(); // refresh tokens
    } catch (error) {
      alert(error.response?.data?.message || 'Error placing order');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glass-panel p-6 rounded-3xl"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Campus Canteen</h1>
          <p className="text-slate-400">Pre-order your food and skip the line.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Menu Section */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Coffee className="text-amber-500" />
            Today's Menu
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {loading ? (
              [1, 2, 3, 4].map(i => <SkeletonMenuItem key={i} />)
            ) : (
              menu.map((item, idx) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="glass-panel p-5 rounded-2xl flex justify-between items-center group hover:border-amber-500/30 transition-all cursor-pointer shadow-sm hover:shadow-[0_4px_20px_rgba(245,158,11,0.1)]"
                  onClick={() => handleOrderClick(item)}
                >
                  <div>
                    <h3 className="font-semibold text-lg text-slate-200 group-hover:text-amber-400 transition-colors">{item.name}</h3>
                    <p className="text-slate-400 font-bold mt-1 text-sm">₹{item.price}</p>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="bg-slate-800 group-hover:bg-amber-500 group-hover:text-white text-slate-300 p-3 rounded-xl transition-all shadow-md group-hover:shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                    onClick={(e) => { e.stopPropagation(); handleOrderClick(item); }}
                  >
                    <Plus size={20} />
                  </motion.button>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Tokens Section */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Hash className="text-blue-400" />
            Your Active Tokens
          </h2>
          
          <div className="space-y-6">
            {loading ? (
              [1, 2].map(i => <SkeletonToken key={i} />)
            ) : tokens.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-8 rounded-2xl text-center text-slate-500 border border-slate-800/50 border-dashed">
                <p>No active orders</p>
              </motion.div>
            ) : (
              tokens.map((token, idx) => (
                <motion.div 
                  key={token.id}
                  initial={{ opacity: 0, rotateX: 90, y: 20 }}
                  animate={{ opacity: 1, rotateX: 0, y: 0 }}
                  transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
                  whileHover={{ y: -5, rotateY: 5 }}
                  style={{ perspective: 1000 }}
                  className="relative drop-shadow-2xl"
                >
                  {/* Digital Ticket Styling */}
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl overflow-hidden relative shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col">
                    {/* Top part */}
                    <div className="p-5 border-b border-dashed border-slate-600 relative bg-slate-800/80">
                      {/* Ticket notches */}
                      <div className="absolute -left-3 -bottom-3 w-6 h-6 bg-slate-950 rounded-full border-r border-t border-slate-700 rotate-45"></div>
                      <div className="absolute -right-3 -bottom-3 w-6 h-6 bg-slate-950 rounded-full border-l border-t border-slate-700 -rotate-45"></div>
                      
                      <div className="flex justify-between items-start mb-2 relative z-10">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-semibold mb-1">Token No.</p>
                          <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 tracking-tighter">
                            #{token.tokenNumber}
                          </p>
                        </div>
                        <span className="bg-amber-500/10 text-amber-500 text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                          {token.status}
                        </span>
                      </div>
                    </div>
                    
                    {/* Bottom part */}
                    <div className="p-5 bg-slate-900/90 flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Item</p>
                          <p className="font-bold text-slate-200 text-lg">{token.itemName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Time</p>
                          <div className="flex items-center justify-end gap-1 font-mono text-slate-300">
                            <Clock size={12} className="text-teal-500" />
                            {new Date(token.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      
                      {/* Fake Barcode */}
                      <div className="w-full h-12 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700/50 overflow-hidden px-2 relative">
                        <div className="absolute inset-0 opacity-30 flex items-center justify-between px-1">
                           {Array.from({ length: 40 }).map((_, i) => (
                             <div key={i} className={`h-full bg-slate-400 ${i%3===0 ? 'w-1' : i%5===0 ? 'w-2' : 'w-0.5'}`}></div>
                           ))}
                        </div>
                        <QrCode className="text-slate-500 z-10 opacity-50" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Order Confirmation Modal */}
      <AnimatePresence>
        {showOrderModal && selectedItem && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-slate-900 border border-slate-700 p-8 rounded-3xl w-full max-w-sm shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden"
            >
              {/* Decorative background glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-amber-500/10 blur-[50px] pointer-events-none"></div>

              <motion.button 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowOrderModal(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white bg-slate-800 p-2 rounded-full transition-colors z-10"
              >
                <X size={16} />
              </motion.button>
              
              <div className="text-center mb-8 mt-2 relative z-10">
                <motion.div 
                  initial={{ rotate: -10, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} transition={{ delay: 0.1, type: 'spring' }}
                  className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(245,158,11,0.3)]"
                >
                  <Coffee size={36} />
                </motion.div>
                <h3 className="text-3xl font-bold mb-2 text-white">Confirm Order</h3>
                <p className="text-slate-400">Would you like to place an order for this item?</p>
              </div>

              <div className="bg-slate-800/80 rounded-2xl p-5 flex justify-between items-center mb-8 border border-slate-700/50 backdrop-blur shadow-inner relative z-10">
                <span className="font-bold text-slate-200 text-lg">{selectedItem.name}</span>
                <span className="font-black text-amber-400 text-2xl">₹{selectedItem.price}</span>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={confirmOrder}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-4 px-4 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all relative z-10 text-lg"
              >
                Place Order & Get Token
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Canteen;
