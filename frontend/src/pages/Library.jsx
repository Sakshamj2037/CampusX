import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Filter, CheckCircle2, AlertCircle, Coins, Clock } from 'lucide-react';

const Library = () => {
  const { user, setUser } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Filters
  const [branchFilter, setBranchFilter] = useState('All');
  const [semesterFilter, setSemesterFilter] = useState('All');
  const [availableOnly, setAvailableOnly] = useState(false);
  
  // UI States
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'recommended', 'issued'
  const [toast, setToast] = useState(null);

  // Default User Profile for Recommendations
  const defaultProfile = { branch: 'CSE', semester: 4 };

  const branches = ['All', 'CSE', 'IT', 'ECE', 'EE', 'ME', 'CE'];
  const semesters = ['All', 1, 2, 3, 4, 5, 6, 7, 8];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [booksRes, issuedRes] = await Promise.all([
        axios.get('http://localhost:5000/api/library/books'),
        axios.get('http://localhost:5000/api/library/issued')
      ]);
      setBooks(booksRes.data);
      setIssuedBooks(issuedRes.data);
    } catch (error) {
      console.error('Error fetching library data', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleIssueBook = async (bookId) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/library/issue/${bookId}`);
      showToast(res.data.message);
      fetchData(); // Refresh data
    } catch (error) {
      showToast(error.response?.data?.message || 'Error issuing book', 'error');
    }
  };

  const handleReturnBook = async (issueId, fine) => {
    if (fine > 0 && user.points < fine) {
      showToast('Not enough points to pay fine', 'error');
      return;
    }

    try {
      const res = await axios.post(`http://localhost:5000/api/library/return/${issueId}`);
      showToast(res.data.message);
      
      // Update user points in context
      if (res.data.pointsRemaining !== undefined) {
        setUser(prev => ({ ...prev, points: res.data.pointsRemaining }));
      }
      
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error returning book', 'error');
    }
  };

  // Filtering Logic
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(search.toLowerCase()) || 
                          book.author.toLowerCase().includes(search.toLowerCase()) ||
                          book.subject.toLowerCase().includes(search.toLowerCase());
    
    const matchesBranch = branchFilter === 'All' || book.branch === branchFilter;
    const matchesSemester = semesterFilter === 'All' || book.semester === parseInt(semesterFilter);
    const matchesAvailability = availableOnly ? book.availableCopies > 0 : true;

    return matchesSearch && matchesBranch && matchesSemester && matchesAvailability;
  });

  const recommendedBooks = books.filter(book => 
    book.branch === defaultProfile.branch && book.semester === defaultProfile.semester
  );

  const calculateFine = (dueDateStr) => {
    const now = new Date();
    const dueDate = new Date(dueDateStr);
    if (now > dueDate) {
      const diffTime = Math.abs(now - dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      return diffDays * 20;
    }
    return 0;
  };

  // Helper for overdue status
  const isOverdue = (dueDateStr) => {
    return new Date() > new Date(dueDateStr);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-xl border shadow-xl backdrop-blur-md flex items-center gap-3 ${
              toast.type === 'success' 
                ? 'bg-teal-500/20 border-teal-500/50 text-teal-100' 
                : 'bg-rose-500/20 border-rose-500/50 text-rose-100'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
            Smart Library
          </h1>
          <p className="text-slate-400 mt-1 flex items-center gap-2">
            <BookOpen size={16} /> Access academic resources & manage issued books
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-slate-800/50 p-1.5 rounded-2xl w-fit border border-slate-700/50 backdrop-blur-sm">
        {[
          { id: 'all', label: 'All Books' },
          { id: 'recommended', label: 'Recommended For You' },
          { id: 'issued', label: `My Issued Books (${issuedBooks.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 relative ${
              activeTab === tab.id ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="libraryTab"
                className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl -z-10 shadow-lg shadow-teal-500/20"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {tab.label}
          </button>
        ))}
      </div>

      {(activeTab === 'all' || activeTab === 'recommended') && (
        <>
          {/* Search and Filters */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-700/50 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by book title, author, or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-700/50">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Filter size={16} /> Filters:
              </div>
              
              <select 
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-teal-500"
              >
                <option disabled>Branch</option>
                {branches.map(b => <option key={b} value={b}>{b}</option>)}
              </select>

              <select 
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-teal-500"
              >
                <option disabled>Semester</option>
                {semesters.map(s => <option key={s} value={s}>{s === 'All' ? 'All Semesters' : `Sem ${s}`}</option>)}
              </select>

              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer ml-auto">
                <input 
                  type="checkbox" 
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 text-teal-500 focus:ring-teal-500 focus:ring-offset-slate-900 bg-slate-800"
                />
                Available Only
              </label>
            </div>
          </div>

          {/* Book Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="bg-slate-800/50 rounded-2xl h-80 animate-pulse border border-slate-700/50"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnimatePresence>
                {(activeTab === 'all' ? filteredBooks : recommendedBooks).map((book) => (
                  <motion.div
                    key={book.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -5 }}
                    className="glass-panel border border-slate-700/50 rounded-2xl overflow-hidden group flex flex-col"
                  >
                    <div className="h-48 overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10" />
                      <img src={book.image} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute bottom-3 left-3 z-20 flex gap-2">
                        <span className="bg-slate-800/80 backdrop-blur border border-slate-600 px-2 py-0.5 rounded text-xs font-semibold text-slate-200">
                          {book.branch} • Sem {book.semester}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-white leading-tight line-clamp-2">{book.title}</h3>
                      </div>
                      <p className="text-slate-400 text-sm mb-4">{book.author}</p>
                      
                      <div className="mt-auto space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400 text-xs px-2 py-1 bg-slate-800 rounded-md border border-slate-700">
                            Total: {book.totalCopies}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-md border font-medium ${
                            book.availableCopies > 0 
                              ? 'bg-teal-500/10 border-teal-500/30 text-teal-400' 
                              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          }`}>
                            {book.availableCopies > 0 ? `${book.availableCopies} Available` : 'Out of Stock'}
                          </span>
                        </div>

                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleIssueBook(book.id)}
                          disabled={book.availableCopies <= 0}
                          className={`w-full py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                            book.availableCopies > 0
                              ? 'bg-teal-500 hover:bg-teal-400 text-slate-900 shadow-lg shadow-teal-500/20'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                          }`}
                        >
                          <BookOpen size={18} />
                          {book.availableCopies > 0 ? 'Issue Book' : 'Unavailable'}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {(activeTab === 'all' ? filteredBooks : recommendedBooks).length === 0 && !loading && (
            <div className="text-center py-12 glass-panel rounded-2xl border border-slate-700/50">
              <BookOpen size={48} className="mx-auto text-slate-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-300">No books found</h3>
              <p className="text-slate-500 mt-2">Try adjusting your search or filters.</p>
            </div>
          )}
        </>
      )}

      {activeTab === 'issued' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8"><p className="text-slate-400">Loading issued books...</p></div>
          ) : issuedBooks.length === 0 ? (
            <div className="text-center py-12 glass-panel rounded-2xl border border-slate-700/50">
              <BookOpen size={48} className="mx-auto text-slate-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-300">No Issued Books</h3>
              <p className="text-slate-500 mt-2">You haven't issued any books yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {issuedBooks.map((issue) => {
                  const overdue = isOverdue(issue.dueDate);
                  const fine = calculateFine(issue.dueDate);
                  const canPayFine = user.points >= fine;

                  return (
                    <motion.div
                      key={issue.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`glass-panel p-5 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row gap-5 ${
                        overdue 
                          ? 'border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.1)]' 
                          : 'border-slate-700/50 hover:border-slate-600'
                      }`}
                    >
                      <div className="w-24 h-32 rounded-lg overflow-hidden shrink-0 border border-slate-700">
                        <img src={issue.book?.image} alt={issue.book?.title} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-lg text-white line-clamp-1">{issue.book?.title}</h3>
                          {overdue && (
                            <span className="bg-rose-500/20 text-rose-400 text-xs font-bold px-2 py-1 rounded border border-rose-500/30 flex items-center gap-1">
                              <AlertCircle size={12} /> OVERDUE
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm mb-4">{issue.book?.author}</p>
                        
                        <div className="space-y-1.5 mb-4 text-sm">
                          <div className="flex items-center gap-2 text-slate-300">
                            <span className="text-slate-500 w-20">Issued:</span> 
                            {new Date(issue.issueDate).toLocaleDateString()}
                          </div>
                          <div className={`flex items-center gap-2 font-medium ${overdue ? 'text-rose-400' : 'text-slate-300'}`}>
                            <span className="text-slate-500 w-20">Due Date:</span> 
                            {new Date(issue.dueDate).toLocaleDateString()}
                          </div>
                          {fine > 0 && (
                            <div className="flex items-center gap-2 text-amber-400 font-bold mt-2 bg-amber-500/10 w-fit px-3 py-1 rounded-md border border-amber-500/20">
                              <Coins size={16} />
                              Fine: {fine} points
                            </div>
                          )}
                        </div>

                        <div className="mt-auto pt-2 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                          {fine > 0 && !canPayFine ? (
                            <div className="text-xs text-rose-400 flex items-center gap-1">
                              <AlertCircle size={14} /> Not enough points to pay fine
                            </div>
                          ) : <div />}

                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleReturnBook(issue.id, fine)}
                            disabled={fine > 0 && !canPayFine}
                            className={`px-6 py-2 rounded-xl font-medium text-sm transition-all duration-300 w-full sm:w-auto ${
                              fine > 0 
                                ? canPayFine 
                                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-lg shadow-amber-500/20'
                                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                                : 'bg-slate-700 hover:bg-slate-600 text-white'
                            }`}
                          >
                            {fine > 0 ? `Pay Fine & Return` : 'Return Book'}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Library;
