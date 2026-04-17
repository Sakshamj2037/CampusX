import { useState, useRef, useEffect, useMemo } from 'react';
import { Map as MapIcon, MapPin, Search, Navigation2, Info, X, MapPinOff, Route as RouteIcon, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import campusMapImg from '../assets/campus-map.jpeg';

const LOCATIONS = [
  { id: 'gate', name: 'Main Gate', category: 'General', x: 46.7, y: 90.8, desc: 'Main entrance to the ADGIPS campus.' },
  { id: 'admin', name: 'Admin Block', category: 'Academic', x: 38.0, y: 76.1, desc: 'Administrative offices and student services.' },
  { id: 'b1', name: 'Block 1', category: 'Academic', x: 28.5, y: 24.9, desc: 'First year classrooms and labs.' },
  { id: 'b2', name: 'Block 2', category: 'Academic', x: 28.6, y: 50.0, desc: 'Computer Science and IT departments.' },
  { id: 'b3', name: 'Block 3', category: 'Academic', x: 31.3, y: 71.2, desc: 'MBA and BBA departments.' },
  { id: 'b4', name: 'Block 4', category: 'Academic', x: 15.4, y: 66.8, desc: 'Advanced engineering labs and research.' },
  { id: 'b5', name: 'Block 5', category: 'Academic', x: 14.6, y: 84.0, desc: 'Architecture and Design studios.' },
  { id: 'library', name: 'Library', category: 'Academic', x: 32.1, y: 73.2, desc: 'Central Library and study areas.' },
  { id: 'auditorium', name: 'Auditorium', category: 'Events', x: 20.6, y: 49.6, desc: 'Main auditorium for events and fests.' },
  { id: 'amphitheatre', name: 'Amphitheatre', category: 'Events', x: 43.7, y: 63.6, desc: 'Open-air venue for performances.' },
  { id: 'canteen', name: 'Canteen', category: 'Food', x: 50.4, y: 72.0, desc: 'Campus cafeteria and food stalls.' },
  { id: 'utkarsh', name: 'Utkarsh Ground (Football)', category: 'Sports', x: 43.1, y: 44.8, desc: 'Main football field.' },
  { id: 'sports', name: 'Sports Ground', category: 'Sports', x: 79.8, y: 24.6, desc: 'Open sports grounds.' },
  { id: 'basketball', name: 'Basketball Court', category: 'Sports', x: 80.6, y: 8.3, desc: 'Basketball courts and practice area.' },
  { id: 'workshop', name: 'Workshop', category: 'Academic', x: 32.6, y: 0.5, desc: 'Engineering workshops and labs.' }
];

// Hidden nodes to create realistic road paths
const WAYPOINTS = [
  { id: 'wp1', x: 45.0, y: 85.0 }, // Near Gate/Admin
  { id: 'wp2', x: 38.0, y: 70.0 }, // Central hub near Admin/Library/B3
  { id: 'wp3', x: 35.0, y: 50.0 }, // Near B2/Auditorium
  { id: 'wp4', x: 35.0, y: 35.0 }, // Near B1/Utkarsh
  { id: 'wp5', x: 50.0, y: 15.0 }, // Top paths towards Workshop/Sports
  { id: 'wp6', x: 55.0, y: 65.0 }, // East path near Amphitheatre/Canteen
  { id: 'wp7', x: 65.0, y: 40.0 }, // Mid-East connecting sports
  { id: 'wp8', x: 20.0, y: 75.0 }, // West path near B4/B5
  { id: 'wp9', x: 20.0, y: 55.0 }  // Deep west near Auditorium
];

const CATEGORIES = ['All', 'Academic', 'Food', 'Sports', 'General', 'Events'];

const ALL_NODES = [...LOCATIONS, ...WAYPOINTS];

// Connections between nodes (Locations and Waypoints)
const EDGES = [
  ['gate', 'wp1'],
  ['wp1', 'admin'],
  ['wp1', 'wp2'],
  ['wp1', 'wp6'],
  ['wp2', 'b3'],
  ['wp2', 'library'],
  ['wp2', 'wp8'],
  ['wp8', 'b4'],
  ['wp8', 'b5'],
  ['wp2', 'wp3'],
  ['wp3', 'b2'],
  ['wp3', 'auditorium'],
  ['wp3', 'wp9'],
  ['wp9', 'auditorium'],
  ['wp9', 'b4'],
  ['wp3', 'wp4'],
  ['wp4', 'b1'],
  ['wp4', 'utkarsh'],
  ['wp4', 'wp5'],
  ['wp5', 'workshop'],
  ['wp5', 'basketball'],
  ['wp5', 'sports'],
  ['wp6', 'canteen'],
  ['wp6', 'amphitheatre'],
  ['wp2', 'wp6'],
  ['wp6', 'wp7'],
  ['wp7', 'sports'],
  ['wp4', 'wp7'],
  ['utkarsh', 'wp7']
];

// Graph builder and Dijkstra algorithm
const buildGraph = () => {
  const graph = {};
  ALL_NODES.forEach(n => graph[n.id] = {});
  
  const getDistance = (n1, n2) => Math.sqrt(Math.pow(n1.x - n2.x, 2) + Math.pow(n1.y - n2.y, 2));

  EDGES.forEach(([id1, id2]) => {
    const n1 = ALL_NODES.find(n => n.id === id1);
    const n2 = ALL_NODES.find(n => n.id === id2);
    if(n1 && n2) {
      const dist = getDistance(n1, n2);
      graph[id1][id2] = dist;
      graph[id2][id1] = dist; // undirected graph
    }
  });
  return graph;
};

const calculateDijkstraPath = (graph, startId, endId) => {
  if (!startId || !endId || startId === endId) return null;
  
  const distances = {};
  const previous = {};
  const unvisited = new Set(ALL_NODES.map(n => n.id));

  ALL_NODES.forEach(n => distances[n.id] = Infinity);
  distances[startId] = 0;

  while(unvisited.size > 0) {
    let currNode = null;
    let minDistance = Infinity;
    
    // Get closest unvisited node
    unvisited.forEach(node => {
      if(distances[node] < minDistance) {
        minDistance = distances[node];
        currNode = node;
      }
    });

    if(!currNode || distances[currNode] === Infinity) break;
    if(currNode === endId) break;

    unvisited.delete(currNode);

    // Update neighbor distances
    for(let neighbor in graph[currNode]) {
      if(unvisited.has(neighbor)) {
        let alt = distances[currNode] + graph[currNode][neighbor];
        if(alt < distances[neighbor]) {
          distances[neighbor] = alt;
          previous[neighbor] = currNode;
        }
      }
    }
  }

  // Backtrack to build the path array
  const pathIds = [];
  let curr = endId;
  while(curr) {
    pathIds.unshift(curr);
    curr = previous[curr];
  }
  
  if (pathIds.length > 0 && pathIds[0] === startId) {
    return pathIds.map(id => ALL_NODES.find(n => n.id === id));
  }
  return null;
};


const MapView = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeLocation, setActiveLocation] = useState(null);
  const [navMode, setNavMode] = useState(false);
  const [navFrom, setNavFrom] = useState('gate'); 
  const [navTo, setNavTo] = useState('');
  const [path, setPath] = useState(null);

  const transformComponentRef = useRef(null);
  const graph = useMemo(() => buildGraph(), []);

  const filteredLocations = LOCATIONS.filter(loc => {
    const matchesSearch = loc.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === 'All' || loc.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const handleLocationClick = (loc) => {
    if (navMode) {
      if (!navFrom) setNavFrom(loc.id);
      else if (!navTo) setNavTo(loc.id);
    } else {
      setActiveLocation(loc);
      zoomToLocation(loc);
    }
  };

  const zoomToLocation = (loc) => {
    if (transformComponentRef.current) {
      const { zoomToElement } = transformComponentRef.current;
      zoomToElement(`marker-${loc.id}`, 3.5, 800); // Scale 3.5, 800ms
    }
  };

  const clearRoute = () => {
    setNavFrom('');
    setNavTo('');
    setPath(null);
  };

  useEffect(() => {
    if (navFrom && navTo) {
      const computedPath = calculateDijkstraPath(graph, navFrom, navTo);
      setPath(computedPath);
    } else {
      setPath(null);
    }
  }, [navFrom, navTo, graph]);

  return (
    <div className="h-[150vh] min-h-[1000px] flex flex-col gap-4">
      
      {/* Header & Controls */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-4 rounded-3xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shrink-0 z-10 relative shadow-xl border border-slate-700/50"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl shadow-[0_0_20px_rgba(20,184,166,0.3)]">
            <MapIcon className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">Smart Campus</h1>
            <p className="text-slate-400 text-sm font-medium">Intelligent Navigation System</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search locations..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 shadow-inner transition-all"
            />
          </div>
          
          {/* Nav Toggle */}
          <button 
            onClick={() => { setNavMode(!navMode); setActiveLocation(null); if(navMode) clearRoute(); }}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 ${
              navMode ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'bg-slate-800 text-teal-400 border border-slate-700 hover:bg-slate-700 hover:text-teal-300 shadow-md'
            }`}
          >
            <RouteIcon size={16} />
            {navMode ? 'Exit Navigation' : 'Navigate'}
          </button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 relative">
        
        {/* Map Container */}
        <div className="flex-1 glass-panel rounded-3xl overflow-hidden relative border border-slate-700/50 shadow-[0_0_30px_rgba(0,0,0,0.4)] bg-slate-950">
          <TransformWrapper
            ref={transformComponentRef}
            initialScale={1}
            minScale={0.3}
            maxScale={6}
            centerOnInit={true}
            wheel={{ step: 0.1 }}
          >
            <TransformComponent wrapperClass="w-full h-full" contentClass="w-full h-full">
              <div className="relative bg-slate-950 w-full max-w-[1600px] mx-auto flex items-center justify-center">
                
                {/* Fallback Grid Pattern */}
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, rgba(20,184,166,0.15) 1px, transparent 0)`,
                  backgroundSize: '30px 30px'
                }}></div>
                
                <img 
                  src={campusMapImg} 
                  alt="Campus Map" 
                  className="w-full h-auto block transition-all duration-500 contrast-125 saturate-[1.5] brightness-110 hue-rotate-[-5deg] drop-shadow-2xl rounded-xl pointer-events-none" 
                />

                {/* Animated Path Overlay */}
                <AnimatePresence>
                  {path && path.length > 1 && (
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                      <motion.polyline
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        points={path.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="none"
                        stroke="#14b8a6"
                        strokeWidth="0.5"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        className="drop-shadow-[0_0_12px_rgba(20,184,166,0.9)]"
                      />
                      {/* Animated moving dashed line indicating direction */}
                      <motion.polyline
                        initial={{ strokeDashoffset: 10 }}
                        animate={{ strokeDashoffset: 0 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        points={path.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="0.2"
                        strokeDasharray="1 1.5"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </AnimatePresence>

                {/* Interactive Markers */}
                {LOCATIONS.map((loc) => {
                  const isActive = activeLocation?.id === loc.id;
                  const isNavStart = navFrom === loc.id;
                  const isNavEnd = navTo === loc.id;
                  const isVisible = filteredLocations.some(l => l.id === loc.id);

                  if (!isVisible && !isNavStart && !isNavEnd && !isActive) return null;

                  return (
                    <motion.div
                      key={loc.id}
                      id={`marker-${loc.id}`}
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-20 ${isActive || isNavStart || isNavEnd ? 'z-30' : ''}`}
                      style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                    >
                      <motion.button
                        whileHover={{ scale: 1.15, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleLocationClick(loc)}
                        className="relative group flex flex-col items-center justify-center cursor-pointer"
                      >
                        {/* Glowing Background Pulse */}
                        {(isActive || isNavStart || isNavEnd) && (
                          <div className={`absolute w-14 h-14 rounded-full blur-xl animate-pulse ${isNavStart ? 'bg-blue-500/60' : isNavEnd ? 'bg-rose-500/60' : 'bg-teal-500/60'}`}></div>
                        )}
                        
                        <div className="relative">
                          <MapPin 
                            size={isActive || isNavStart || isNavEnd ? 40 : 32} 
                            className={`transition-colors duration-300 drop-shadow-[0_5px_8px_rgba(0,0,0,0.6)] ${
                              isNavStart ? 'text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.9)]' : 
                              isNavEnd ? 'text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.9)]' : 
                              isActive ? 'text-teal-400 drop-shadow-[0_0_15px_rgba(20,184,166,0.9)]' : 
                              'text-slate-200 hover:text-white'
                            }`} 
                            fill={isNavStart ? '#1e3a8a' : isNavEnd ? '#881337' : isActive ? '#134e4a' : '#0f172a'}
                          />
                        </div>

                        {/* Always-visible label underneath the marker */}
                        <span className={`absolute top-full mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shadow-md border transition-all duration-300 whitespace-nowrap pointer-events-none ${
                          isActive || isNavStart || isNavEnd 
                          ? 'bg-slate-900/90 text-white border-slate-600' 
                          : 'bg-slate-900/60 text-slate-300 border-transparent opacity-70 group-hover:opacity-100 group-hover:bg-slate-900/90'
                        }`}>
                          {loc.name}
                        </span>

                      </motion.button>
                    </motion.div>
                  );
                })}
              </div>
            </TransformComponent>
          </TransformWrapper>

          {/* Active Location Info Overlay */}
          <AnimatePresence>
            {activeLocation && !navMode && (
              <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-slate-900/95 backdrop-blur-xl border border-teal-500/40 p-5 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.7)] z-40"
              >
                <button onClick={() => setActiveLocation(null)} className="absolute top-3 right-3 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1 rounded-full transition-colors"><X size={16} /></button>
                <div className="flex justify-between items-start mb-2 pr-6">
                  <h3 className="font-bold text-2xl text-white tracking-tight">{activeLocation.name}</h3>
                </div>
                <span className="inline-block bg-teal-500/20 text-teal-300 text-[10px] uppercase tracking-widest font-black px-2.5 py-1 rounded-full border border-teal-500/30 mb-3 shadow-inner">
                  {activeLocation.category}
                </span>
                <p className="text-slate-300 text-sm leading-relaxed mb-5 flex items-start gap-2 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                  <Info size={18} className="text-teal-400 mt-0.5 shrink-0" />
                  {activeLocation.desc}
                </p>
                <button 
                  onClick={() => { setNavMode(true); setNavTo(activeLocation.id); setActiveLocation(null); }}
                  className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition-all shadow-[0_0_20px_rgba(20,184,166,0.4)] hover:shadow-[0_0_25px_rgba(20,184,166,0.6)] hover:scale-[1.02] active:scale-95"
                >
                  <Navigation2 size={18} /> Get Directions
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Directory & Route Planner */}
        <div className="w-full lg:w-80 glass-panel rounded-3xl flex flex-col overflow-hidden border border-slate-700/50 shrink-0 shadow-lg">
          
          {/* Navigation Route Planner Panel */}
          <AnimatePresence>
            {navMode && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="bg-slate-900/90 border-b border-slate-700 p-5 space-y-4 relative overflow-hidden backdrop-blur-md"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/10 blur-3xl rounded-full"></div>
                <div className="flex justify-between items-center relative z-10">
                  <h3 className="font-bold text-slate-100 flex items-center gap-2 text-lg"><RouteIcon size={18} className="text-teal-400"/> Route Planner</h3>
                  {(navFrom || navTo) && (
                    <button onClick={clearRoute} className="text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold" title="Clear Route">
                      <Trash2 size={14} /> Clear
                    </button>
                  )}
                </div>
                
                <div className="space-y-3 relative z-10">
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] border border-blue-400"></span>
                    <select 
                      value={navFrom} onChange={(e) => setNavFrom(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-9 pr-3 py-3 text-sm font-medium text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Select Starting Point</option>
                      {LOCATIONS.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                    </select>
                  </div>
                  
                  <div className="flex justify-center -my-3 relative z-20">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center shadow-lg">
                      <Navigation2 size={14} className="text-slate-400 rotate-180" />
                    </div>
                  </div>

                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)] border border-rose-400 animate-pulse"></span>
                    <select 
                      value={navTo} onChange={(e) => setNavTo(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-9 pr-3 py-3 text-sm font-medium text-slate-200 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Select Destination</option>
                      {LOCATIONS.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                    </select>
                  </div>
                </div>

                {!navTo && <p className="text-xs text-teal-400/80 flex items-center justify-center gap-1.5 mt-4 pt-3 border-t border-slate-800 font-medium">
                  <MapPinOff size={14}/> Click on map markers to select
                </p>}
                {path && <p className="text-xs text-green-400 flex items-center justify-center gap-1.5 mt-4 pt-3 border-t border-slate-800 font-bold">
                  <RouteIcon size={14}/> Route calculated successfully!
                </p>}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Directory */}
          <div className="p-5 border-b border-slate-800 flex flex-col gap-3 bg-slate-900/50">
            <h3 className="font-bold text-slate-200 text-lg">Directory</h3>
            
            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    activeCategory === cat ? 'bg-teal-500 text-white shadow-[0_0_10px_rgba(20,184,166,0.4)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 no-scrollbar bg-slate-900/30">
            {filteredLocations.map(loc => (
              <button
                key={loc.id}
                onClick={() => handleLocationClick(loc)}
                className={`w-full text-left p-3.5 rounded-2xl transition-all duration-200 flex justify-between items-center group ${
                  activeLocation?.id === loc.id || navTo === loc.id || navFrom === loc.id
                    ? 'bg-teal-500/15 border border-teal-500/40 shadow-[inset_0_0_15px_rgba(20,184,166,0.1)]' 
                    : 'bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <span className={`font-bold block text-sm mb-0.5 ${
                    activeLocation?.id === loc.id || navTo === loc.id || navFrom === loc.id 
                    ? 'text-teal-400' : 'text-slate-200 group-hover:text-white'
                  }`}>{loc.name}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 group-hover:text-slate-400">{loc.category}</span>
                </div>
                {(activeLocation?.id === loc.id || navTo === loc.id || navFrom === loc.id) && (
                  <MapPin size={18} className={`${navFrom === loc.id ? 'text-blue-500' : navTo === loc.id ? 'text-rose-500' : 'text-teal-500'} animate-bounce`} />
                )}
              </button>
            ))}
            {filteredLocations.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <Search size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">No locations found</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MapView;
