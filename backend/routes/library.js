const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB } = require('../utils/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all books
router.get('/books', authMiddleware, async (req, res) => {
  try {
    const db = await readDB();
    res.json(db.books);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get issued books for the logged-in user
router.get('/issued', authMiddleware, async (req, res) => {
  try {
    const db = await readDB();
    const userIssued = db.issuedBooks.filter(ib => ib.userId === req.user.id && !ib.returned);
    
    // Attach book details
    const populated = userIssued.map(ib => {
      const book = db.books.find(b => b.id === ib.bookId);
      return { ...ib, book };
    });
    
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Issue a book
router.post('/issue/:bookId', authMiddleware, async (req, res) => {
  try {
    const db = await readDB();
    const bookId = req.params.bookId;
    const userId = req.user.id;

    const book = db.books.find(b => b.id === bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.availableCopies <= 0) return res.status(400).json({ message: 'Book is currently out of stock' });

    // Check if user already issued this book and hasn't returned it
    const alreadyIssued = db.issuedBooks.find(ib => ib.userId === userId && ib.bookId === bookId && !ib.returned);
    if (alreadyIssued) return res.status(400).json({ message: 'You have already issued this book' });

    // Decrease copies
    book.availableCopies -= 1;

    // Create issue record
    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(issueDate.getDate() + 15); // 15 days from now

    const newIssue = {
      id: uuidv4(),
      userId,
      bookId,
      issueDate: issueDate.toISOString(),
      dueDate: dueDate.toISOString(),
      returned: false
    };

    db.issuedBooks.push(newIssue);
    await writeDB(db);

    res.json({ message: 'Book issued successfully', issue: newIssue });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Return a book / pay fine
router.post('/return/:issueId', authMiddleware, async (req, res) => {
  try {
    const db = await readDB();
    const issueId = req.params.issueId;
    const userId = req.user.id;

    const issueRecord = db.issuedBooks.find(ib => ib.id === issueId && ib.userId === userId);
    if (!issueRecord) return res.status(404).json({ message: 'Issue record not found' });
    if (issueRecord.returned) return res.status(400).json({ message: 'Book already returned' });

    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const now = new Date();
    const dueDate = new Date(issueRecord.dueDate);
    
    // Fine calculation: 20 points per day overdue
    let fine = 0;
    if (now > dueDate) {
      const diffTime = Math.abs(now - dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      fine = diffDays * 20;
    }

    if (fine > 0) {
      if (user.points < fine) {
        return res.status(400).json({ message: 'Not enough points to pay fine', requiredPoints: fine });
      }
      user.points -= fine;
    }

    // Mark as returned and increment book copies
    issueRecord.returned = true;
    const book = db.books.find(b => b.id === issueRecord.bookId);
    if (book) {
      book.availableCopies += 1;
    }

    await writeDB(db);

    res.json({ 
      message: fine > 0 ? `Book returned and fine of ${fine} points paid` : 'Book returned successfully', 
      pointsRemaining: user.points 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
