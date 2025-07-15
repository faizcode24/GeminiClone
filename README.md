
# Kuvaka Tech Backend

This is the backend for the Kuvaka Tech application, a chat platform with user authentication, chatroom management, and subscription handling. Built with Node.js, Express, MongoDB Atlas, Redis, BullMQ, JWT, Stripe, and the Gemini API for AI-powered message processing.



# Table of Contents





Setup and Run



Architecture Overview



Queue System



Gemini API Integration



Assumptions and Design Decisions



Testing with Postman



Access and Deployment
## Installation

Clone the repository:

```bash
git clone https://github.com/faizcode24/GeminiClone.git
cd GeminiClone
npm install
```

Create a virtual environment:

```bash
DATABASE_URL=mongodb+srv://mdfaiz589:QyAl7PGKTERybZ8B@gimini1.gfseumj.mongodb.net/?retryWrites=true&w=majority&appName=gimini1
JWT_SECRET=9b38f47dadc7fdddb7f9862a755aaee9
STRIPE_SECRET_KEY=sk_test_tR3PYbcVNZZ796tH88S4VQ2u
STRIPE_WEBHOOK_SECRET=whsec_...  # Get from Stripe CLI or Dashboard
GOOGLE_GEMINI_API_KEY=your_gemini_api_key  # Get from Google AI Studio
REDIS_URL=redis://localhost:6379
PORT=3000
```

# Run the Application:
```bash
npm start
```

 # Or for development with hot-reloading:
```bash
npm run dev
```
# Access at http://localhost:3000.


# Docker Setup
Install Docker: Download Docker Desktop for Windows and ensure it’s running.
Create .env File: Same as above, but set REDIS_URL=redis://redis:6379.

# Build and Run:

```bash'
cd F:\GeminiClone
docker-compose up --build
```

# Access at http://localhost:3000.


# Queue System
1. The queue system uses BullMQ with Redis for asynchronous message processing:
Purpose: Offloads Gemini API calls to avoid blocking the main thread and handle retries.

#Implementation:
1.Messages sent to /chatroom/:id/message are added to a chat-queue in BullMQ.
A worker (src/services/queue.js) processes messages, calls the Gemini API, and saves responses to MongoDB.
Redis stores queue data and rate-limiting counters.



**Configuration:**


REDIS_URL=redis://redis:6379 (Docker) or redis://localhost:6379 (local).

Configurable retries and timeouts in src/services/queue.js.



