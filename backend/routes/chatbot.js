const express = require('express');
const router = express.Router();

router.post('/ask', (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  const lowerMsg = message.toLowerCase();
  let reply = "I'm sorry, I don't understand that yet. You can ask me about events, the canteen, library, or general campus navigation!";

  // Smart Mock Rules
  if (lowerMsg.includes('event') || lowerMsg.includes('happening') || lowerMsg.includes('fest')) {
    reply = "There are a few exciting events coming up! We have the Tech Symposium and Cultural Fest. Check out the Events tab to join and earn points!";
  } else if (lowerMsg.includes('canteen') || lowerMsg.includes('food') || lowerMsg.includes('eat')) {
    reply = "The canteen is open! You can check today's menu and pre-order your food in the Canteen section to avoid the queue.";
  } else if (lowerMsg.includes('library') || lowerMsg.includes('study')) {
    reply = "The Central Library is located in the North Block. It's open until midnight during exam week. Check the Notice Board for latest updates!";
  } else if (lowerMsg.includes('map') || lowerMsg.includes('where is') || lowerMsg.includes('navigate')) {
    reply = "You can use the Campus Map feature to find the auditorium, library, canteen, and sports complex. Just head over to the Map tab!";
  } else if (lowerMsg.includes('point') || lowerMsg.includes('badge') || lowerMsg.includes('gamification')) {
    reply = "You earn points by participating in events! 50 points per event. Earn enough points to get badges like 'Explorer' and 'Event Master' and climb the leaderboard!";
  } else if (lowerMsg.includes('hi') || lowerMsg.includes('hello') || lowerMsg.includes('hey')) {
    reply = "Hello! I am your CampusX assistant. How can I help you today?";
  }

  // Simulate slight delay for "AI" feel
  setTimeout(() => {
    res.json({ reply });
  }, 1000);
});

module.exports = router;
