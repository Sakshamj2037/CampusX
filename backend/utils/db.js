const fs = require('fs').promises;
const path = require('path');

const DB_FILE = path.join(__dirname, '../data/db.json');

const defaultData = {
  users: [],
  events: [
    {
      id: '1',
      title: 'Technorax',
      description: 'Annual technology symposium featuring AI and Web3 talks.',
      category: 'Tech',
      date: '2026-04-09T18:30:00.000Z',
      time: '10:00 AM',
      participants: [],
      points: 300
    },
    {
      id: '2',
      title: 'Cultural Fest - Utkarsh',
      description: 'Music, dance, and art from across the campus.',
      category: 'Cultural',
      date: '2026-04-12T18:30:00.000Z',
      time: '05:00 PM',
      participants: [],
      points: 150
    },
    {
      id: '3',
      title: 'Inter-Department Basketball',
      description: 'Cheer for your department in the basketball finals.',
      category: 'Sports',
      date: '2026-04-15T18:30:00.000Z',
      time: '09:00 AM',
      participants: [],
      points: 100
    }
  ],
  notices: [
    {
      id: '1',
      title: 'Library Hours Extended',
      content: 'The central library will now remain open until midnight during exam week.',
      date: new Date().toISOString()
    }
  ],
  tokens: [],
  lostfound: [
    {
      "id": "1",
      "title": "Black Leather Wallet",
      "description": "Lost my black leather wallet near the library entrance. Contains my student ID and some cash.",
      "location": "Central Library",
      "image": "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=400",
      "status": "lost",
      "userId": "52940b42-43c9-428d-a360-105e793b7ecc",
      "createdAt": "2026-04-16T10:00:00.000Z"
    },
    {
      "id": "2",
      "title": "Keys Found",
      "description": "Found a bunch of keys with a red keychain near the canteen.",
      "location": "Main Canteen",
      "image": "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&q=80&w=400",
      "status": "found",
      "userId": "3da2f492-7083-4221-87aa-ad993a40ce92",
      "createdAt": "2026-04-17T09:30:00.000Z"
    },
    {
      "id": "3",
      "title": "Suspicious Bag",
      "description": "Unattended blue backpack left outside the auditorium for over an hour.",
      "location": "Auditorium",
      "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=400",
      "status": "lost",
      "userId": "f8eedad3-cb50-4268-99df-f61291d22e03",
      "createdAt": "2026-04-17T11:15:00.000Z"
    },
    {
      "id": "4",
      "title": "Claiming Water Bottle",
      "description": "I would like to claim the blue water bottle that was posted earlier. I can provide the brand and details.",
      "location": "Admin Office",
      "image": "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&q=80&w=400",
      "status": "claimed",
      "userId": "768fd5fe-ae9e-4d51-ba95-bdcc814e8470",
      "createdAt": "2026-04-17T12:00:00.000Z"
    },
    {
      "id": "5",
      "title": "AirPods Pro (Right Earbud missing)",
      "description": "I left my AirPods Pro case with the left earbud inside in the Computer Networks lab (Room 304).",
      "location": "Room 304 (Lab)",
      "image": "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=400",
      "status": "lost",
      "userId": "52940b42-43c9-428d-a360-105e793b7ecc",
      "createdAt": "2026-04-18T08:30:00.000Z"
    },
    {
      "id": "6",
      "title": "Casio Scientific Calculator",
      "description": "Found a grey Casio fx-991EX calculator on the second bench in the Physics lecture hall.",
      "location": "Physics Lecture Hall",
      "image": "https://images.unsplash.com/photo-1594980596826-6d601b0f191b?auto=format&fit=crop&q=80&w=400",
      "status": "found",
      "userId": "f8eedad3-cb50-4268-99df-f61291d22e03",
      "createdAt": "2026-04-18T09:15:00.000Z"
    },
    {
      "id": "7",
      "title": "Hostel Room Keys (Room 214)",
      "description": "Lost my room keys attached to a Marvel Avengers keychain.",
      "location": "Sports Ground",
      "image": "https://images.unsplash.com/photo-1620846618485-6ff14b3be288?auto=format&fit=crop&q=80&w=400",
      "status": "lost",
      "userId": "768fd5fe-ae9e-4d51-ba95-bdcc814e8470",
      "createdAt": "2026-04-18T07:45:00.000Z"
    },
    {
      "id": "8",
      "title": "Found Student ID Card - Rahul Kumar",
      "description": "Found a 2nd year CSE student ID card near the main gate.",
      "location": "Main Gate",
      "image": "https://images.unsplash.com/photo-1589828135805-728b7ca019db?auto=format&fit=crop&q=80&w=400",
      "status": "found",
      "userId": "3da2f492-7083-4221-87aa-ad993a40ce92",
      "createdAt": "2026-04-18T10:00:00.000Z"
    }
  ],
  teamRequests: [],
  books: [
    {
      id: '1',
      title: 'Introduction to Algorithms',
      author: 'Thomas H. Cormen',
      subject: 'Algorithms',
      branch: 'CSE',
      semester: 4,
      totalCopies: 5,
      availableCopies: 5,
      image: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: '2',
      title: 'Database System Concepts',
      author: 'Abraham Silberschatz',
      subject: 'DBMS',
      branch: 'CSE',
      semester: 4,
      totalCopies: 4,
      availableCopies: 2,
      image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: '3',
      title: 'Computer Networks',
      author: 'Andrew S. Tanenbaum',
      subject: 'Networking',
      branch: 'IT',
      semester: 5,
      totalCopies: 6,
      availableCopies: 6,
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: '4',
      title: 'Operating System Concepts',
      author: 'Silberschatz, Galvin, Gagne',
      subject: 'OS',
      branch: 'CSE',
      semester: 4,
      totalCopies: 3,
      availableCopies: 0,
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: '5',
      title: 'Microelectronic Circuits',
      author: 'Adel S. Sedra',
      subject: 'Electronics',
      branch: 'ECE',
      semester: 3,
      totalCopies: 5,
      availableCopies: 5,
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: '6',
      title: 'Data Structures and Algorithms in Java',
      author: 'Robert Lafore',
      subject: 'DSA',
      branch: 'CSE',
      semester: 3,
      totalCopies: 8,
      availableCopies: 7,
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: '7',
      title: 'Digital Signal Processing',
      author: 'John G. Proakis',
      subject: 'DSP',
      branch: 'ECE',
      semester: 5,
      totalCopies: 3,
      availableCopies: 1,
      image: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: '8',
      title: 'Artificial Intelligence: A Modern Approach',
      author: 'Stuart Russell, Peter Norvig',
      subject: 'AI',
      branch: 'CSE',
      semester: 7,
      totalCopies: 4,
      availableCopies: 4,
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=400'
    }
  ],
  issuedBooks: []
};

async function initDB() {
  try {
    await fs.access(DB_FILE);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
      await fs.writeFile(DB_FILE, JSON.stringify(defaultData, null, 2));
      console.log('Database initialized with default data.');
    } else {
      console.error('Error accessing database file:', error);
    }
  }
}

async function readDB() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return null;
  }
}

async function writeDB(data) {
  try {
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing to database:', error);
    return false;
  }
}

module.exports = { initDB, readDB, writeDB };
