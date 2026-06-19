# PickUpPal

A full-stack ride-sharing platform inspired by Uber. The system supports rider, driver, and admin workflows, real-time ride updates through WebSockets, location-based services using Leaflet maps, and a PostgreSQL-backed backend built with Express.js. It was for our Database Sessional Course CSE 216.

## Features

### Rider
- User registration and login
- Ride booking
- Ride history
- Payment management
- Profile settings

### Driver
- Driver registration
- Accept ride requests
- Ride history
- Earnings dashboard
- Profile settings

### Admin
- Admin dashboard
- User and ride management

### General
- Real-time ride updates using WebSockets
- Interactive maps using Leaflet
- Responsive UI

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Axios
- Tailwind CSS
- Leaflet
- React Leaflet
- WebSocket
- Framer Motion

### Backend
- Node.js
- Express.js
- WebSocket

### Database
- PostgreSQL

---

## Project Structure

```
PickUpPal/
├── frontend/
│   ├── src/
│   └── package.json
│
├── backend/
│   ├── src/
│   ├── database/
│   │   └── schema.sql
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## Setup Instructions

### 1. Clone Repository

```bash
git clone <repository-url>
cd PickUpPal
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure Environment Variables

Create a `.env` file from `.env.example`.

Backend:

```bash
copy .env.example .env
```

Update the database credentials inside `.env`.

### 5. Create Database

Create a PostgreSQL database:

```sql
CREATE DATABASE pickupal;
```

Run:

```bash
psql -U postgres -d pickupal -f database/schema.sql
```


### 6. Start Backend

```bash
cd backend
npm start
```

### 7. Start Frontend

```bash
cd frontend
npm run dev
```

---

## Environment Variables

Example:

```env
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=

JWT_SECRET=
```

---

## Future Improvements

* Docker support
* CI/CD pipeline
* Automated testing
* Ride history analytics

```
```
