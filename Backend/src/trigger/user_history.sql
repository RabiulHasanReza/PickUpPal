CREATE TABLE IF NOT EXISTS user_history (
    user_id INTEGER PRIMARY KEY,
    role TEXT CHECK (role IN ('rider', 'driver')),
    total_rides INTEGER NOT NULL DEFAULT 0,
    total_fare NUMERIC(10, 2) NOT NULL DEFAULT 0,
    last_trip_time TIMESTAMP
);

CREATE OR REPLACE FUNCTION update_user_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert rider's history
    INSERT INTO user_history (user_id, role, total_rides, total_fare, last_trip_time)
    VALUES (NEW.rider_id, 'rider', 1, NEW.fare, NEW.end_time)
    ON CONFLICT (user_id)
    DO UPDATE SET
        total_rides = user_history.total_rides + 1,
        total_fare = user_history.total_fare + NEW.fare,
        last_trip_time = NEW.end_time;

    -- Update or insert driver's history
    INSERT INTO user_history (user_id, role, total_rides, total_fare, last_trip_time)
    VALUES (NEW.driver_id, 'driver', 1, NEW.fare, NEW.end_time)
    ON CONFLICT (user_id)
    DO UPDATE SET
        total_rides = user_history.total_rides + 1,
        total_fare = user_history.total_fare + NEW.fare,
        last_trip_time = NEW.end_time;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_user_history ON rides;

CREATE TRIGGER trg_update_user_history
AFTER UPDATE ON rides
FOR EACH ROW
WHEN (NEW.status = 'completed' AND OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION update_user_history();