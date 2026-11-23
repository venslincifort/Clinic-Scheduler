Clinic Scheduler
A scheduling app for clinic providers, built as a full-stack portfolio project with a healthcare focus.
Only providers log in. Patients don't have accounts; they're just records that providers manage. It's still early, and everything in it uses fake data.

Where things stand
What I've done so far
Set up the project with a client folder and a server folder
Added Docker Compose so Postgres and Redis run locally
Wrote the Prisma schema for providers and an audit log, and ran the first migration
Set up the client with Vite, React, and TypeScript

What I'm working on now
The provider login page
What's left
Seed a test provider so I have an account to log in with
Build the backend and the login, logout, and "who am I" endpoints
Store sessions in Redis and sign providers out after 20 minutes of inactivity
Rate limit login attempts
Connect the login page to the backend and write tests for it
Add tables for patients, appointments, visit types, and provider availability
Generate open appointment slots, handling 

time zones
Stop double-booking at the database level
Book, cancel, and reschedule appointments
Build the provider calendar view and the patient intake forms
Send appointment reminders
Set up CI, deploy a live demo, and add screenshots

Tech stack
React, TypeScript, and Vite on the frontend
Node and TypeScript on the backend (not built yet)
PostgreSQL with Prisma
Redis for sessions (not built yet)
Docker Compose for local development

Running it locally
Start the databases from the project root:
bash
docker compose up -d
Set up the database:
bash
cd server
cp .env.example .env
npm install
npx prisma migrate dev
Start the client:
bash
cd ../client
cp .env.example .env.local
npm install
npm run dev
Then open http://localhost:5173.

A note on security
I'm following some habits from healthcare software, like keeping an audit log and signing people out after a period of inactivity. This is a demo with fake data, though, and it isn't HIPAA compliant.
