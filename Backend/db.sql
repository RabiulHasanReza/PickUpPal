CREATE TABLE USERS (
    id SERIAL CONSTRAINT USER_PK PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE riders(
    rider_id INTEGER CONSTRAINT rider_pk PRIMARY KEY,
    CONSTRAINT rider_fk FOREIGN KEY(rider_id) REFERENCES USERS(id)
);
CREATE TABLE drivers(
    driver_id INTEGER CONSTRAINT driver_pk PRIMARY KEY,
    CONSTRAINT driver_fk FOREIGN KEY(driver_id) REFERENCES USERS(id),

    license_num VARCHAR(255) UNIQUE NOT NULL,
    avg_rating REAL, 
    stats VARCHAR(255)
);

CREATE TABLE vehicles (
    driver_id INTEGER REFERENCES drivers(driver_id),

    vehicle_id SERIAL CONSTRAINT USER_PK PRIMARY KEY,
    model VARCHAR(255) NOT NULL,
    license_plate VARCHAR(255) UNIQUE NOT NULL,
    capacity VARCHAR(255) NOT NULL,
    color VARCHAR(255) NOT NULL
);

CREATE TABLE ride_req(
    ride_id SERIAL CONSTRAINT ride_PK PRIMARY KEY,
    rider_id INTEGER , 
    req_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    driver_id INTEGER ,
    res_time TIMESTAMP  ,
    arrived_time TIMESTAMP , 
    status VARCHAR(50)
);
CREATE TABLE rides(
    ride_id INTEGER REFERENCES ride_req(ride_id),
    rider_id INTEGER, 
    source VARCHAR2(255) ,
    destination VARCHAR2(255) ,
     driver_id INTEGER ,
     vehicle VARCHAR(255),
     Fare INTEGER,
     vehicle_id INTEGER,
     start_time TIMESTAMP,
     end_time TIMESTAMP,
     status VARCHAR(50)
);

CREATE TABLE ratings(
    ride_id INTEGER REFERENCES ride_req(ride_id),
    rating REAL,  
    comment VARCHAR(50),
    role TEXT CHECK (role IN ('rider', 'driver')),
    CONSTRAINT unique_ride_role UNIQUE (ride_id, role)
);

CREATE TABLE IF NOT EXISTS user_history (
    user_id INTEGER PRIMARY KEY,
    role TEXT CHECK (role IN ('rider', 'driver')),
    total_rides INTEGER NOT NULL DEFAULT 0,
    total_fare NUMERIC(10, 2) NOT NULL DEFAULT 0,
    last_trip_time TIMESTAMP,
    avg_rating REAL DEFAULT 0
);

CREATE TABLE promo_codes (
    code VARCHAR(5) PRIMARY KEY,                   -- Promo code (e.g., 'X9AB2')
    rider_id INTEGER ,    -- Rider who owns the promo
    discount INTEGER NOT NULL CHECK (discount > 0),
    expiry_date DATE DEFAULT CURRENT_DATE + INTERVAL '10 days',
    status TEXT CHECK (status IN ('open', 'used', 'closed')) DEFAULT 'open'
);




