const fs = require('fs').promises;
const path = require('path');

const DB_FILE = path.join(__dirname, '../data/db.json');

const defaultData = {
  users: [],
  events: [
    {
      id: '1',
      title: 'Tech Symposium 2026',
      description: 'Annual technology symposium featuring AI and Web3 talks.',
      category: 'Tech',
      date: '2026-05-10',
      participants: []
    },
    {
      id: '2',
      title: 'Cultural Fest - Rhapsody',
      description: 'Music, dance, and art from across the campus.',
      category: 'Cultural',
      date: '2026-05-15',
      participants: []
    },
    {
      id: '3',
      title: 'Inter-Department Basketball',
      description: 'Cheer for your department in the basketball finals.',
      category: 'Sports',
      date: '2026-05-20',
      participants: []
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
      "status": "report",
      "userId": "f8eedad3-cb50-4268-99df-f61291d22e03",
      "createdAt": "2026-04-17T11:15:00.000Z"
    },
    {
      "id": "4",
      "title": "Claiming Water Bottle",
      "description": "I would like to claim the blue water bottle that was posted earlier. I can provide the brand and details.",
      "location": "Admin Office",
      "image": "",
      "status": "claim",
      "userId": "768fd5fe-ae9e-4d51-ba95-bdcc814e8470",
      "createdAt": "2026-04-17T12:00:00.000Z"
    }
  ],
  teamRequests: []
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
