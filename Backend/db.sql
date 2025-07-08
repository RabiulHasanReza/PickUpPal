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
    ride_id SERIAL CONSTRAINT USER_PK PRIMARY KEY,
    rider_id INTEGER , 
    req_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    driver_id INTEGER ,
    res_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
    arrived_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP 

);
CREATE TABLE rides(
    ride_id INTEGER REFERENCES ride_req(ride_id),
    rider_id INTEGER, 
     driver_id INTEGER ,
     vehicle_id INTEGER

);