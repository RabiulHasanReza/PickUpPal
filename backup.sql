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
-- Data for Name: drivers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.drivers (driver_id, license_num, avg_rating, stats) FROM stdin;
13	45f783	0	Active
15	443f783	0	Active
19	DRIVER2977	0	Active
\.


--
-- Data for Name: ratings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ratings (ride_id, rating, comment, role) FROM stdin;
131	4	gooood	driver
131	5	very good	rider
134	4.3	good	rider
134	3.3	bad	driver
136	4.5	gooood	driver
136	2.5	baad	rider
139	2	worst	driver
139	4	gooood	rider
141	4.5	gooood	driver
141	4	gooood	rider
\.


--
-- Data for Name: ride_req; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ride_req (ride_id, rider_id, req_time, driver_id, res_time, arrived_time, status) FROM stdin;
117	8	2025-07-18 00:45:20.118953	13	2025-07-18 00:45:29.907064	2025-07-18 00:46:06.425703	completed
118	5	2025-07-19 11:57:25.885526	15	2025-07-19 11:57:39.001277	\N	booked
87	8	2025-07-16 01:05:33.929748	13	2025-07-16 01:05:39.271647	2025-07-16 01:07:46.614092	completed
88	8	2025-07-16 01:13:46.724204	13	2025-07-16 01:13:52.525818	\N	booked
81	8	2025-07-16 00:21:01.910879	13	2025-07-16 00:33:37.568228	2025-07-16 01:14:02.304827	completed
89	11	2025-07-16 01:20:16.180183	15	2025-07-16 01:20:35.833374	2025-07-16 01:20:58.005882	completed
120	8	2025-07-20 13:14:14.153748	15	2025-07-20 13:14:20.208713	\N	booked
119	8	2025-07-20 13:09:23.565083	15	2025-07-20 13:09:28.774885	2025-07-20 13:14:39.229032	completed
93	11	2025-07-16 01:36:51.197487	15	2025-07-16 01:37:56.5761	\N	booked
94	11	2025-07-16 01:37:48.893961	15	2025-07-16 01:37:56.5761	\N	booked
90	11	2025-07-16 01:32:14.114193	15	2025-07-16 01:37:56.5761	2025-07-16 01:38:58.276184	completed
95	11	2025-07-16 01:48:49.123394	\N	\N	\N	Failed
96	11	2025-07-16 01:52:47.582546	13	2025-07-16 01:52:56.824396	\N	booked
97	12	2025-07-16 01:52:52.608671	15	2025-07-16 01:52:58.878957	\N	booked
82	8	2025-07-16 00:26:02.308001	13	2025-07-16 00:33:37.568228	2025-07-16 01:54:48.339664	completed
91	11	2025-07-16 01:34:50.931606	15	2025-07-16 01:37:56.5761	2025-07-16 01:55:36.755581	completed
98	11	2025-07-16 02:27:12.979194	13	2025-07-16 02:27:21.417648	\N	booked
100	11	2025-07-16 02:29:29.375141	13	2025-07-16 02:29:37.864988	\N	booked
99	12	2025-07-16 02:27:17.041921	15	2025-07-16 02:29:40.032982	\N	booked
101	12	2025-07-16 02:29:33.242258	15	2025-07-16 02:29:40.032982	\N	booked
83	8	2025-07-16 00:32:18.149974	13	2025-07-16 00:33:37.568228	2025-07-16 02:30:08.182553	completed
102	11	2025-07-16 02:36:29.215595	13	2025-07-16 02:36:37.881706	\N	booked
103	12	2025-07-16 02:36:33.53669	15	2025-07-16 02:36:39.736739	\N	booked
84	8	2025-07-16 00:33:20.190009	13	2025-07-16 00:33:37.568228	2025-07-16 02:37:00.186523	completed
92	11	2025-07-16 01:35:19.479138	15	2025-07-16 01:37:56.5761	2025-07-16 02:37:41.207334	completed
104	11	2025-07-16 02:39:07.65112	13	2025-07-16 02:39:13.563016	\N	booked
85	8	2025-07-16 00:59:36.53143	13	2025-07-16 00:59:44.118733	2025-07-16 02:39:20.569628	completed
105	11	2025-07-16 02:47:08.197014	13	2025-07-16 02:47:11.073525	\N	booked
86	8	2025-07-16 01:03:49.259677	13	2025-07-16 01:03:55.871187	2025-07-16 02:47:14.515482	completed
106	11	2025-07-16 02:54:28.438378	13	2025-07-16 02:54:34.761495	2025-07-16 02:54:57.801402	completed
121	5	2025-07-25 03:05:54.083073	13	2025-07-25 03:05:59.266815	2025-07-25 03:06:22.395834	completed
107	11	2025-07-16 02:56:09.244111	13	2025-07-16 02:56:14.257567	2025-07-16 02:56:25.904861	completed
108	11	2025-07-16 03:40:47.192508	15	2025-07-16 03:41:02.610226	2025-07-16 03:41:37.53243	completed
122	11	2025-07-25 15:11:20.903335	\N	\N	\N	Failed
110	12	2025-07-16 10:42:21.814802	\N	\N	\N	Failed
109	11	2025-07-16 10:42:16.643325	13	2025-07-16 10:42:26.825732	2025-07-16 10:44:09.28064	completed
111	11	2025-07-16 11:08:51.542232	13	2025-07-16 11:09:02.97358	\N	booked
112	12	2025-07-16 11:08:56.396346	\N	\N	\N	Failed
123	11	2025-07-25 15:16:19.771799	\N	\N	\N	Failed
114	8	2025-07-17 20:10:21.582375	15	2025-07-17 20:10:25.809591	\N	booked
115	8	2025-07-17 20:12:00.847285	15	2025-07-17 20:12:05.934676	\N	booked
113	8	2025-07-17 20:03:54.644755	15	2025-07-17 20:04:03.318388	2025-07-17 20:12:15.957316	completed
124	11	2025-07-25 15:18:00.180284	13	2025-07-25 15:18:02.972325	\N	booked
116	8	2025-07-18 00:39:15.476787	15	2025-07-18 00:39:19.994799	2025-07-18 00:39:38.99418	completed
125	11	2025-07-25 15:19:36.569151	11	2025-07-25 15:19:39.689879	\N	booked
126	18	2025-07-27 03:06:32.318573	19	2025-07-27 03:06:39.122863	2025-07-27 03:07:47.357115	completed
127	18	2025-07-27 03:22:57.351281	19	2025-07-27 03:23:03.506316	2025-07-27 03:23:28.99917	completed
128	12	2025-07-27 18:52:12.689123	15	2025-07-27 18:52:37.225653	\N	booked
129	11	2025-07-27 18:54:20.975445	\N	\N	\N	Failed
130	11	2025-07-27 19:59:28.350729	19	2025-07-27 19:59:32.716792	\N	booked
131	12	2025-07-27 20:04:17.645432	15	2025-07-27 20:04:23.070082	2025-07-27 20:05:59.048745	completed
132	12	2025-07-27 20:54:35.182627	15	2025-07-27 20:54:41.477387	2025-07-27 20:55:08.445682	completed
133	12	2025-07-27 22:19:13.023604	\N	\N	\N	Failed
134	11	2025-07-27 22:28:58.028961	19	2025-07-27 22:29:11.672792	2025-07-27 22:29:45.598417	completed
135	11	2025-07-27 22:34:31.720804	\N	\N	\N	Failed
136	11	2025-07-27 22:40:26.59185	19	2025-07-27 22:40:33.066244	2025-07-27 22:40:47.490661	completed
137	12	2025-07-27 22:43:58.001325	19	2025-07-27 22:44:12.366962	\N	booked
138	\N	2025-07-27 23:09:55.509244	\N	\N	\N	available
139	12	2025-07-27 23:10:46.590166	19	2025-07-27 23:10:50.051129	2025-07-27 23:11:14.20154	completed
140	12	2025-07-27 23:22:54.643158	\N	\N	\N	Failed
141	12	2025-07-27 23:53:17.927432	19	2025-07-27 23:53:22.687621	2025-07-27 23:53:38.742422	completed
142	12	2025-07-27 23:56:01.04862	19	2025-07-27 23:56:12.815025	\N	booked
143	\N	2025-07-28 00:35:40.596279	\N	\N	\N	available
144	12	2025-07-28 00:36:08.318795	19	2025-07-28 00:36:23.812292	\N	booked
\.


--
-- Data for Name: riders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.riders (rider_id) FROM stdin;
10
11
5
8
12
9
16
17
18
\.


--
-- Data for Name: rides; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rides (ride_id, rider_id, source, destination, driver_id, vehicle, fare, vehicle_id, start_time, end_time, status) FROM stdin;
87	8	polashi	Mirpur	13	Bike	300	1	2025-07-16 01:07:46.636107	\N	\N
88	8	polashi	Mirpur	13	Bike	300	1	\N	\N	\N
121	5	Dept. of Architecture Building, BUET Zahir Raihan Sharani Road, Azimpur, Dhaka - 1000, Bangladesh	Mirpur, Dhaka - 1216, Bangladesh	13	bike	\N	1	2025-07-25 03:06:22.401442	\N	\N
89	11	polashi	Mirpur	15	bike	300	2	2025-07-16 01:20:58.01	\N	\N
90	11	polashi	Mirpur	15	bike	300	2	2025-07-16 01:38:58.280596	\N	\N
96	11	polashi	Mirpur	13	Bike	300	1	\N	\N	\N
97	12	polashi	Mdpur	15	Car	600	2	\N	\N	\N
98	11	polashi	Mirpur	13	Bike	300	1	\N	\N	\N
99	12	polashi	Mdpur	15	Car	600	2	\N	\N	\N
124	11	Current Location	Khilkhet, Dhaka - 1229, Bangladesh	13	bike	\N	1	\N	\N	\N
103	12	polashi	Mdpur	15	Car	600	2	\N	\N	\N
104	11	polashi	Mirpur	13	Bike	300	1	\N	\N	\N
85	8	polashi	Mirpur	\N	Bike	300	\N	2025-07-16 02:39:20.573727	\N	\N
105	11	polashi	Mirpur	13	Bike	300	1	\N	\N	\N
86	8	polashi	Mirpur	13	Bike	300	1	2025-07-16 02:47:14.51971	\N	\N
125	11	Current Location	Mirpur, Dhaka - 1216, Bangladesh	\N	bike	\N	\N	\N	\N	\N
126	18	gec	crb	19	bike	500	3	2025-07-27 03:07:47.363116	2025-07-27 03:08:00.94766	completed
107	11	polashi	Mirpur	13	Bike	300	1	2025-07-16 02:56:25.910242	2025-07-16 03:34:52.833248	completed
106	11	polashi	Mirpur	13	Bike	300	1	2025-07-16 02:54:57.808339	2025-07-16 03:36:59.891458	completed
102	11	polashi	Mirpur	13	Bike	300	1	\N	2025-07-16 03:37:36.667952	completed
100	11	polashi	Mirpur	13	Bike	300	1	\N	2025-07-16 03:38:30.812107	completed
108	11	New Market	Khilkhet	15	bike	400	2	2025-07-16 03:41:37.539351	2025-07-16 03:42:07.171343	completed
127	18	2 no gate	crb	19	car	1000	3	2025-07-27 03:23:29.005322	2025-07-27 03:23:42.790296	completed
109	11	polashi	Mirpur	13	bike	300	1	2025-07-16 10:44:09.287781	2025-07-16 10:44:49.909119	completed
111	11	polashi	Mirpur	13	bike	300	1	\N	\N	\N
128	12	gec	crb	15	car	800	2	\N	\N	\N
114	8	polashi	Mirpur	15	bike	300	2	\N	\N	\N
130	11	Current Location	Uttara, Dhaka - 1231, Bangladesh	19	bike	\N	3	\N	\N	\N
115	8	polashi	Mirpur	15	bike	300	2	\N	\N	\N
113	8	polashi	Mirpur	15	bike	300	2	2025-07-17 20:12:15.959548	2025-07-17 20:12:21.06403	completed
131	12	gec	crb	15	car	800	2	2025-07-27 20:05:59.054165	2025-07-27 20:07:10.817852	completed
116	8	polashi	Mirpur	15	bike	300	2	2025-07-18 00:39:39.049125	2025-07-18 00:39:52.774675	completed
117	8	polashi	Mirpur	13	bike	300	1	2025-07-18 00:46:06.431292	2025-07-18 00:46:14.56162	completed
118	5	Azimpur, Dhaka - 1211, Bangladesh	Mirpur, Dhaka - 1216, Bangladesh	15	bike	\N	2	\N	\N	\N
120	8	polashi	Mirpur	15	bike	300	2	\N	\N	\N
119	8	polashi	Mirpur	15	bike	300	2	2025-07-20 13:14:39.239167	\N	\N
132	12	gec	crb	15	car	800	2	2025-07-27 20:55:08.45098	2025-07-27 20:55:16.127204	completed
134	11	gec	crb	19	car	300	3	2025-07-27 22:29:45.607512	2025-07-27 22:29:54.190451	completed
136	11	gec	crb	19	car	800	3	2025-07-27 22:40:47.49625	2025-07-27 22:40:55.912318	completed
137	12	2 no gate	Agrabad	19	car	600	3	\N	\N	\N
139	12	polashi	Mirpur	19	car	1000	3	2025-07-27 23:11:14.208346	2025-07-27 23:11:21.054689	completed
141	12	bahaddarhat	bali	19	car	1000	3	2025-07-27 23:53:38.746203	2025-07-27 23:53:43.119541	completed
142	12	polashi	Mirpur	19	car	1000	3	\N	\N	\N
144	12	polashi	Mirpur	19	car	300	3	\N	\N	\N
\.


--
-- Data for Name: user_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_history (user_id, role, total_rides, total_fare, last_trip_time, avg_rating) FROM stdin;
8	rider	3	900.00	2025-07-18 00:46:14.56162	\N
13	driver	5	1500.00	2025-07-18 00:46:14.56162	\N
18	rider	2	1500.00	2025-07-27 03:23:42.790296	\N
15	driver	5	2600.00	2025-07-27 20:55:16.127204	\N
11	rider	7	2700.00	2025-07-27 22:40:55.912318	3.4
19	driver	6	4600.00	2025-07-27 23:53:43.119541	3.575
12	rider	4	3600.00	2025-07-27 23:53:43.119541	4.3333335
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, phone, password, created_at, role) FROM stdin;
13	Omar	omaars@gmail.com	01733193431	ommasos565	2025-06-24 01:17:06.199694	driver
15	Reza	rrezars@gmail.com	01633193431	omdfsos565	2025-06-24 14:18:37.804029	driver
19	rakib	rakib@gmail.com	0134534543	121212	2025-07-08 18:51:05.463221	driver
10	Sayma	saymajns@gmail.com	01533193431	Kisos565	2025-06-17 20:38:26.972746	rider
11	Sami Sarwar	Ssir@gmail.com	01545193431	Lifesos565	2025-06-17 20:48:08.103047	rider
5	SolaimanSeyam	ss@gmail.com	01533193441	Kisos565	2025-06-17 20:16:16.22373	rider
8	Sayma	ks@gmail.com	01533193431	Kisos565	2025-06-17 20:23:22.395128	rider
12	Rahim	rahim@gmail.com	01533134531	0_97s565	2025-06-23 23:49:28.233991	rider
9	Sayma	ws@gmail.com	01533193431	Kisos565	2025-06-17 20:24:55.18201	rider
16	Rohan Rabby	rrabby@gmail.com	0198349274	rbbtsos565	2025-06-30 02:19:41.686455	rider
17	Sayma	sdfsd@gmail.com	0436345252	1234rf	2025-07-05 02:30:36.820807	rider
18	maruf hasan	maruf45@gmail.com	01987239423	asdf12	2025-07-08 18:48:46.280689	rider
\.


--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehicles (driver_id, vehicle_id, model, license_plate, capacity, color, vehicle) FROM stdin;
13	1	Hero Xtreme	23-7418	2	Black	Bike
15	2	Hero XBlade	23-4418	2	Red	Bike
19	3	Toyota Corolla	DHA-39	4	White	car
\.


--
-- Name: ride_req_ride_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ride_req_ride_id_seq', 144, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 19, true);


--
-- Name: vehicles_vehicle_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vehicles_vehicle_id_seq', 3, true);


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

