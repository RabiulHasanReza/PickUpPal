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



















# Backend API Endpoints:

add longitude and latitude while sending ride request for both pickup and destination

remove the arrival messege add a start trip status 


# For accessing Database : 

### Copy the file that I have sent via Wtsap to the .env file
### Create a new server & then register with info in .env file


# In WebSocket : 

## Driver ::
### Driver Register/ Go Online - 
{
  "role" : "driver",
  "action" : "register",
  "driver_id" : _ _ 
}

### Go Offline - 
{
    "role" : "driver",
  "action" : "Go Offline",
  "driver_id" : _ _ 
}

### Accepted-    // After 20 sec request will be Expired
{
    "role" : "driver",
    "action" : "accepted"
}

### Start Trip- // after arriving at the pickup spot
{
    "role" : "driver",
    "action" : "Start Trip",
    "ride_id" : ___
}

### End Trip- // after reacing the destination
{
    "role" : "driver",
    "action" : "End Trip",
    "ride_id" : ___
}

### Rating Rider-
{
    "role" : "driver",
    "action" : "rider_rating",
    "ride_id" : 131,
    "rating" : 4,
    "comment" :  "gooood"
}



## Rider ::
### Rider register/ After giving origin & destination-
{
    "role" : "rider",
    "rider_id" : _ _,
    "action" : "ride_request",

    "origin" : "polashi",
    "origin_latitude" : 232.34,
    "origin_longitude" : 234.343,
    "destination" : "Mirpur",
    "destination_latitude" : 342.32,
    "destination_longitude" : 32.232,

    "distance" : 50
}

### Vehicle Choose- 
{
    "role" : "rider",
    "action" : "select_vehicle",
    "origin" : "polashi",
    "origin_latitude" : 232.34,
    "origin_longitude" : 234.343,
    "destination" : "Mirpur",
    "destination_latitude" : 342.32,
    "destination_longitude" : 32.232,
    "vehicle" : "bike",
    "fare" : 300
}

### Rating Driver-
{
    "role" : "rider",
    "action" : "driver_rating",
    "ride_id" : 131,
    "rating" : 4.5,
    "comment" :  "gooood"
}



