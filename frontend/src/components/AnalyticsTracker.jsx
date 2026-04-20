import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

// Generate a simple session ID if not exists
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('campusx_session');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('campusx_session', sessionId);
  }
  return sessionId;
};

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const trackPageVisit = async () => {
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/analytics/track`, {
          page: location.pathname,
          sessionId: getSessionId(),
          device: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
        });
      } catch (error) {
        // Silently fail if analytics is down to not disrupt user experience
        console.error('Analytics tracking failed:', error);
      }
    };

    trackPageVisit();
  }, [location]);

  return null; // Invisible component
};

export default AnalyticsTracker;
