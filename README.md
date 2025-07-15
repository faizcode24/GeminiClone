Kuvaka Tech Backend
This is the backend for the Kuvaka Tech application, a chat platform with user authentication, chatroom management, and subscription handling. It uses Node.js, Express, MongoDB Atlas, Redis, BullMQ, JWT, Stripe, and the Gemini API for AI-powered message processing.
Table of Contents

Setup and Run
Architecture Overview
Queue System
Gemini API Integration
Assumptions and Design Decisions
Testing with Postman
Access and Deployment

Setup and Run
Prerequisites

Node.js: v22.15.0
MongoDB Atlas: Cloud-hosted MongoDB instance
Redis: Local or hosted Redis instance
Docker: For containerized setup (optional)
Stripe Account: For subscription handling
Google Gemini API Key: For AI message processing
Postman: For API testing

Local Setup

Clone the Repository:
git clone <repository-url>
cd GeminiClone


Install Dependencies:
npm install


Configure Environment Variables:Create a .env file in the project root:
DATABASE_URL=mongodb+srv://mdfaiz589:QyAl7PGKTERybZ8B@gimini1.gfseumj.mongodb.net/?retryWrites=true&w=majority&appName=gimini1
JWT_SECRET=9b38f47dadc7fdddb7f9862a755aaee9
STRIPE_SECRET_KEY=sk_test_tR3PYbcVNZZ796tH88S4VQ2u
STRIPE_WEBHOOK_SECRET=whsec_...  # Get from Stripe CLI or Dashboard
GOOGLE_GEMINI_API_KEY=your_gemini_api_key  # Get from Google AI Studio
REDIS_URL=redis://localhost:6379
PORT=3000


MongoDB Atlas: Whitelist your IP in MongoDB Atlas (Network Access > Add IP Address > 0.0.0.0/0 for testing).
Redis: Install and run locally (redis-server) or use a hosted service.
Stripe Webhook Secret: Run stripe listen --forward-to http://localhost:3000/subscription/webhook/stripe to get STRIPE_WEBHOOK_SECRET.
Gemini API Key: Obtain from Google AI Studio.


Start Redis:
redis-server

Verify: redis-cli ping (should return PONG).

Run the Application:
npm start

Or for development with hot-reloading:
npm run dev

The app runs at http://localhost:3000.


Docker Setup

Install Docker:Download Docker Desktop and ensure it’s running.

Create .env File:Same as above, but update REDIS_URL=redis://redis:6379 to point to the Docker Redis service.

Build and Run:
docker-compose up --build

Access the app at http://localhost:3000.

Stop Containers:
docker-compose down



Testing Setup

Create .env.test:
DATABASE_URL=mongodb+srv://mdfaiz589:QyAl7PGKTERybZ8B@gimini1.gfseumj.mongodb.net/test?retryWrites=true&w=majority&appName=gimini1
JWT_SECRET=9b38f47dadc7fdddb7f9862a755aaee9
STRIPE_SECRET_KEY=sk_test_tR3PYbcVNZZ796tH88S4VQ2u
STRIPE_WEBHOOK_SECRET=whsec_...  # Get from Stripe CLI
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
REDIS_URL=redis://redis:6379
PORT=3000


Run Tests:
npm test

Or in Docker:
docker-compose run --rm app npm test



Architecture Overview
The backend is built with Node.js and Express, following a modular architecture:

Middleware:
helmet: Secures HTTP headers.
express.json: Parses JSON bodies.
express-rate-limit with rate-limit-redis: Limits API calls (5 prompts/day for Basic tier, 1000 for Pro).
Custom JWT middleware for authentication.


Routes:
/auth: Handles signup, OTP verification, password changes, and user details.
/chatroom: Manages chatroom creation, retrieval, and message sending.
/subscription: Handles Stripe checkout and subscription status.


Models:
User: Stores mobile number, password (hashed), subscription tier, and Stripe customer ID.
Chatroom: Stores chatroom title and user ID.
Message: Stores chatroom messages with sender (user/Gemini) and content.


Services:
Redis for caching chatrooms and rate-limiting.
BullMQ for queuing message processing tasks.


External Services:
MongoDB Atlas for persistent storage.
Stripe for subscription payments.
Gemini API for AI-generated responses.



Queue System
The queue system uses BullMQ with Redis to handle asynchronous message processing:

Purpose: Offloads Gemini API calls to prevent blocking the main thread and handle failures gracefully.
Implementation:
Messages sent to /chatroom/:id/message are added to a BullMQ queue (chat-queue).
A worker (src/services/queue.js) processes messages by calling the Gemini API and saves responses to MongoDB.
Redis stores queue data and rate-limiting counters.


Configuration:
REDIS_URL=redis://redis:6379 in Docker or redis://localhost:6379 locally.
Queue tasks are retried on failure (configurable in src/services/queue.js).


Flow:
User sends a message via /chatroom/:id/message.
Rate-limiting checks (Redis) ensure the user hasn’t exceeded their daily prompt limit.
Message is queued in BullMQ.
Worker processes the message, calls Gemini API, and stores the response in MongoDB.



Gemini API Integration
The Gemini API powers AI responses in chatrooms:

Usage: When a user sends a message (POST /chatroom/:id/message), the message is queued for processing.
Implementation:
Uses @google/generative-ai package.
Configured in src/services/gemini.js with GOOGLE_GEMINI_API_KEY.
Worker fetches the message, sends it to Gemini, and stores the response in the Message collection.


Error Handling:
Invalid API key returns a 500 error.
Rate limits or network issues are retried via BullMQ.


Setup:
Obtain GOOGLE_GEMINI_API_KEY from Google AI Studio.
Update .env and .env.test.



Assumptions and Design Decisions

MongoDB Atlas: Chosen for scalability and managed hosting, eliminating local MongoDB setup.
Redis: Used for caching (chatrooms), rate-limiting, and BullMQ queues for performance.
BullMQ: Replaced Kafka for simpler setup and reliability with Redis.
JWT Authentication: Stateless authentication for scalability; tokens expire after 1 hour.
Rate-Limiting: Basic tier limited to 5 prompts/day, Pro to 1000, stored in Redis with a 24-hour TTL.
Stripe: Handles subscriptions with a single Pro plan; webhook updates user tier.
Gemini API: Used for AI responses, assuming low latency and high availability.
Testing: Jest and Supertest used for unit/integration tests; .env.test isolates test data.
Docker: Simplifies deployment and ensures consistent environments.

Testing with Postman

Install Postman: Download from Postman.

Start the Application:
npm start

Or with Docker:
docker-compose up


Import Collection:

Create a new Postman collection named “Kuvaka Tech API”.
Add requests for each endpoint below.


API Endpoints:

Base URL: http://localhost:3000
Authentication:
POST /auth/signup:{
  "mobileNumber": "1234567890"
}


Expect: 201, { "message": "User created, please verify OTP" }


POST /auth/send-otp:{
  "mobileNumber": "1234567890"
}


Expect: 200, { "otp": "123456", "message": "OTP sent successfully" }


POST /auth/verify-otp:{
  "mobileNumber": "1234567890",
  "otp": "123456"
}


Expect: 200, { "token": "<jwt_token>" }
Save the token for authenticated requests.


POST /auth/forgot-password:{
  "mobileNumber": "1234567890"
}


Expect: 200, { "otp": "123456", "message": "OTP sent successfully" }


POST /auth/change-password:
Headers: Authorization: Bearer <jwt_token>
Body:{
  "password": "newPassword123"
}


Expect: 200, { "message": "Password changed successfully" }


GET /auth/me:
Headers: Authorization: Bearer <jwt_token>
Expect: 200, { "mobileNumber": "1234567890", "subscriptionTier": "BASIC", ... }




Chatroom:
POST /chatroom:
Headers: Authorization: Bearer <jwt_token>
Body:{
  "title": "Test Chatroom"
}


Expect: 201, { "_id": "<chatroom_id>", "title": "Test Chatroom", ... }
Save chatroom_id.


GET /chatroom:
Headers: Authorization: Bearer <jwt_token>
Expect: 200, [ { "_id": "<chatroom_id>", "title": "Test Chatroom", ... } ]


GET /chatroom/:id:
URL: /chatroom/<chatroom_id>
Headers: Authorization: Bearer <jwt_token>
Expect: 200, { "_id": "<chatroom_id>", "title": "Test Chatroom", "messages": [] }


POST /chatroom/:id/message:
URL: /chatroom/<chatroom_id>/message
Headers: Authorization: Bearer <jwt_token>
Body:{
  "content": "Hello, Gemini!"
}


Expect: 200, { "message": "Message sent, processing response" }
Note: Sending 6 messages as Basic tier user should return 429 ("error": "Daily prompt limit reached").




Subscription:
POST /subscription/pro:
Headers: Authorization: Bearer <jwt_token>
Body: {}
Expect: 500 until price_... is set in subscriptionController.js.


GET /subscription/status:
Headers: Authorization: Bearer <jwt_token>
Expect: 200, { "tier": "BASIC", "dailyPrompts": 5 }


POST /subscription/webhook/stripe:
Use Stripe CLI:stripe trigger customer.subscription.created


Expect: 200, { "received": true }






Testing Workflow:

Signup (POST /auth/signup).
Send and verify OTP (POST /auth/send-otp, POST /auth/verify-otp).
Create chatroom (POST /chatroom).
Send messages (POST /chatroom/:id/message) and test rate limit.
Check subscription status (GET /subscription/status).
Test Stripe webhook with Stripe CLI.



Access and Deployment
Local Access

URL: http://localhost:3000
Test endpoint: GET http://localhost:3000/ (returns “Hello World!”)

Deployment (e.g., Render)

Push to GitHub:
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push origin main


Create Render Service:

Sign up at Render.
Create a new Web Service, connect your GitHub repository.
Set Build Command: npm install
Set Start Command: npm start
Add environment variables (same as .env).


Configure Stripe Webhook:

In Stripe Dashboard, add a webhook endpoint for https://<your-render-url>/subscription/webhook/stripe.
Update STRIPE_WEBHOOK_SECRET in Render’s environment variables.


MongoDB Atlas:

Whitelist Render’s IP or set to 0.0.0.0/0.


Access:

Deployed URL provided by Render (e.g., https://kuvaka-backend.onrender.com).



Docker Deployment

Push Docker image to a registry (e.g., Docker Hub):docker build -t yourusername/kuvaka-backend .
docker push yourusername/kuvaka-backend


Deploy to a platform like Render or AWS ECS, updating REDIS_URL to a hosted Redis instance.
