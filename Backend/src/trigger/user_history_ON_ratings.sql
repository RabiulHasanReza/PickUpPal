CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
DECLARE
    userId INTEGER;
    avgRating REAL;
BEGIN
    IF NEW.role = 'driver' THEN
        -- Get the driver_id for the ride
        SELECT driver_id INTO userId
        FROM rides
        WHERE ride_id = NEW.ride_id;

        -- Calculate average rating for the driver
        SELECT AVG(r.rating)::REAL INTO avgRating
        FROM ratings r
        JOIN rides ri ON r.ride_id = ri.ride_id
        WHERE r.role = 'driver' AND ri.driver_id = userId;

    ELSIF NEW.role = 'rider' THEN
        -- Get the rider_id for the ride
        SELECT rider_id INTO userId
        FROM rides
        WHERE ride_id = NEW.ride_id;

        -- Calculate average rating for the rider
        SELECT AVG(r.rating)::REAL INTO avgRating
        FROM ratings r
        JOIN rides ri ON r.ride_id = ri.ride_id
        WHERE r.role = 'rider' AND ri.rider_id = userId;
    END IF;

    -- Update the user's average rating in user_history
    UPDATE user_history
    SET avg_rating = avgRating
    WHERE user_id = userId AND role = NEW.role;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_update_user_rating
AFTER INSERT ON ratings
FOR EACH ROW
EXECUTE FUNCTION update_user_rating();


-- If want to delete the trigger : 
DROP TRIGGER IF EXISTS trg_update_user_rating ON ratings;

