# CampusX – Smart Campus Platform 🎓✨

CampusX is a full-stack, gamified campus management platform designed to enhance student life and streamline campus operations. Built with a modern, dark-themed glassmorphism UI, it offers a suite of interactive tools ranging from AI support to campus navigation.

## 🌟 Key Features

*   **🎮 Gamified Dashboard:** A highly interactive user dashboard featuring a dynamic leaderboard, ranking system based on point distribution, badges, and a categorized notice board.
*   **🗺️ Smart Campus Navigation:** A graph-based navigation system using Dijkstra's algorithm. Provides visually smooth SVG polyline routes between campus buildings with interactive markers and persistent location labels.
*   **🤖 AI Chatbot:** An integrated smart assistant providing instant support and answering student queries.
*   **🔍 Smart Lost & Found:** A complete module to report lost items, announce found items, and claim belongings. Features advanced search, real-time filtering, and a strict status workflow (Lost → Found → Claimed).
*   **📅 Event Management:** Discover and register for campus events. Earn points and badges by participating, fueling the platform's gamification engine.
*   **🍔 Canteen Token Service:** A streamlined digital system for ordering food and managing canteen tokens to avoid long queues.
*   **🔐 Secure Authentication:** Robust user authentication utilizing JWT (JSON Web Tokens) and bcrypt for password hashing.

## 🛠️ Technology Stack

### Frontend
*   **Framework:** React 19 + Vite
*   **Styling:** Tailwind CSS v4 (with dark-mode glassmorphism aesthetics)
*   **Animations:** Framer Motion
*   **Icons:** Lucide React
*   **Routing:** React Router DOM
*   **Other Utilities:** react-zoom-pan-pinch, react-confetti

### Backend
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Authentication:** jsonwebtoken, bcryptjs
*   **Data Storage:** Local JSON files (for high-speed hackathon prototyping)
*   **Middleware:** CORS, dotenv

## 🚀 Getting Started

### Prerequisites
*   Node.js installed on your machine.
*   npm or yarn package manager.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd "hackathon project"
    ```

2.  **Setup Backend:**
    ```bash
    cd backend
    npm install
    # Create a .env file and add necessary environment variables (e.g., JWT_SECRET, PORT)
    npm run dev
    ```
    The backend server will typically run on `http://localhost:5000`.

3.  **Setup Frontend:**
    Open a new terminal and navigate to the frontend directory:
    ```bash
    cd frontend
    npm install
    # Create a .env file if necessary (e.g., for API URLs)
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173`.

## 🎨 UI/UX Highlights
The platform prioritizes a **premium visual experience**:
*   Deep, sleek dark mode tailored for modern displays.
*   Micro-animations and smooth page transitions for a responsive feel.
*   Gamification elements like confetti effects on achievements and dynamic number counters.
*   Loading skeletons for seamless data fetching.

---
<<<<<<< HEAD
*Developed for Hackathon prototyping & demo purposes.*
=======
*Developed for Hackathon prototyping & demo purposes.*
>>>>>>> 2c0a337 (Added Analytics Dashboard)
