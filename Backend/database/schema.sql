--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: generate_promo_code(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_promo_code() RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INT := 0;
BEGIN
    FOR i IN 1..5 LOOP
        result := result || substr(chars, FLOOR(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$;


ALTER FUNCTION public.generate_promo_code() OWNER TO postgres;

--
-- Name: set_random_code(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_random_code() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.code := generate_promo_code();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_random_code() OWNER TO postgres;

--
-- Name: update_user_history(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_user_history() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.update_user_history() OWNER TO postgres;

--
-- Name: update_user_rating(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_user_rating() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.update_user_rating() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: drivers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.drivers (
    driver_id integer NOT NULL,
    license_num character varying(255) NOT NULL,
    avg_rating real,
    stats character varying(255)
);


ALTER TABLE public.drivers OWNER TO postgres;

--
-- Name: promo_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promo_codes (
    code character varying(5) NOT NULL,
    rider_id integer,
    discount integer NOT NULL,
    expiry_date date DEFAULT (CURRENT_DATE + '10 days'::interval),
    status text DEFAULT 'open'::text,
    CONSTRAINT promo_codes_discount_check CHECK ((discount > 0)),
    CONSTRAINT promo_codes_status_check CHECK ((status = ANY (ARRAY['open'::text, 'used'::text, 'closed'::text])))
);


ALTER TABLE public.promo_codes OWNER TO postgres;

--
-- Name: ratings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ratings (
    ride_id integer,
    rating real,
    comment character varying(50),
    role text,
    CONSTRAINT ratings_role_check CHECK ((role = ANY (ARRAY['rider'::text, 'driver'::text])))
);


ALTER TABLE public.ratings OWNER TO postgres;

--
-- Name: ride_req; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ride_req (
    ride_id integer NOT NULL,
    rider_id integer,
    req_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    driver_id integer,
    res_time timestamp without time zone,
    arrived_time timestamp without time zone,
    status character varying(50)
);


ALTER TABLE public.ride_req OWNER TO postgres;

--
-- Name: ride_req_ride_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ride_req_ride_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ride_req_ride_id_seq OWNER TO postgres;

--
-- Name: ride_req_ride_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ride_req_ride_id_seq OWNED BY public.ride_req.ride_id;


--
-- Name: rider_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rider_messages (
    rider_id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    subject character varying(255) NOT NULL,
    message text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.rider_messages OWNER TO postgres;

--
-- Name: riders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.riders (
    rider_id integer NOT NULL
);


ALTER TABLE public.riders OWNER TO postgres;

--
-- Name: rides; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rides (
    ride_id integer,
    rider_id integer,
    source character varying(255),
    destination character varying(255),
    driver_id integer,
    vehicle character varying(255),
    fare integer,
    vehicle_id integer,
    start_time timestamp without time zone,
    end_time timestamp without time zone,
    status character varying(50)
);


ALTER TABLE public.rides OWNER TO postgres;

--
-- Name: user_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_history (
    user_id integer NOT NULL,
    role text,
    total_rides integer DEFAULT 0 NOT NULL,
    total_fare numeric(10,2) DEFAULT 0 NOT NULL,
    last_trip_time timestamp without time zone,
    avg_rating real,
    CONSTRAINT user_history_role_check CHECK ((role = ANY (ARRAY['rider'::text, 'driver'::text])))
);


ALTER TABLE public.user_history OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20) NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    role character varying(100)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicles (
    driver_id integer,
    vehicle_id integer NOT NULL,
    model character varying(255) NOT NULL,
    license_plate character varying(255) NOT NULL,
    capacity character varying(255) NOT NULL,
    color character varying(255) NOT NULL,
    vehicle character varying
);


ALTER TABLE public.vehicles OWNER TO postgres;

--
-- Name: vehicles_vehicle_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vehicles_vehicle_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehicles_vehicle_id_seq OWNER TO postgres;

--
-- Name: vehicles_vehicle_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vehicles_vehicle_id_seq OWNED BY public.vehicles.vehicle_id;


--
-- Name: ride_req ride_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ride_req ALTER COLUMN ride_id SET DEFAULT nextval('public.ride_req_ride_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vehicles vehicle_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles ALTER COLUMN vehicle_id SET DEFAULT nextval('public.vehicles_vehicle_id_seq'::regclass);


--
-- Name: drivers driver_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT driver_pk PRIMARY KEY (driver_id);


--
-- Name: drivers drivers_license_num_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_license_num_key UNIQUE (license_num);


--
-- Name: promo_codes promo_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promo_codes
    ADD CONSTRAINT promo_codes_pkey PRIMARY KEY (code);


--
-- Name: ride_req ride_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ride_req
    ADD CONSTRAINT ride_pk PRIMARY KEY (ride_id);


--
-- Name: riders rider_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.riders
    ADD CONSTRAINT rider_pk PRIMARY KEY (rider_id);


--
-- Name: ratings unique_ride_role; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT unique_ride_role UNIQUE (ride_id, role);


--
-- Name: user_history user_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_history
    ADD CONSTRAINT user_history_pkey PRIMARY KEY (user_id);


--
-- Name: users user_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT user_pk PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: vehicles vehicle_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicle_pk PRIMARY KEY (vehicle_id);


--
-- Name: vehicles vehicles_license_plate_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_license_plate_key UNIQUE (license_plate);


--
-- Name: promo_codes trg_generate_code; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_generate_code BEFORE INSERT ON public.promo_codes FOR EACH ROW WHEN ((new.code IS NULL)) EXECUTE FUNCTION public.set_random_code();


--
-- Name: rides trg_update_user_history; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_update_user_history AFTER UPDATE ON public.rides FOR EACH ROW WHEN ((((new.status)::text = 'completed'::text) AND ((old.status)::text IS DISTINCT FROM (new.status)::text))) EXECUTE FUNCTION public.update_user_history();


--
-- Name: ratings trg_update_user_rating; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_update_user_rating AFTER INSERT ON public.ratings FOR EACH ROW EXECUTE FUNCTION public.update_user_rating();


--
-- Name: drivers driver_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT driver_fk FOREIGN KEY (driver_id) REFERENCES public.users(id);


--
-- Name: ratings ratings_ride_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_ride_id_fkey FOREIGN KEY (ride_id) REFERENCES public.ride_req(ride_id);


--
-- Name: riders rider_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.riders
    ADD CONSTRAINT rider_fk FOREIGN KEY (rider_id) REFERENCES public.users(id);


--
-- Name: rides rides_ride_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rides
    ADD CONSTRAINT rides_ride_id_fkey FOREIGN KEY (ride_id) REFERENCES public.ride_req(ride_id);


--
-- Name: vehicles vehicles_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers(driver_id);


--
-- PostgreSQL database dump complete
--

