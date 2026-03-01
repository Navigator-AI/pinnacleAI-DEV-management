--
-- PostgreSQL database dump
--

\restrict Ffyq47U0d2LEokq7mF408t2bbajykR30tcgOlWL4wlQQ4GZykpKf0ev4Fu6EBR1

-- Dumped from database version 15.16
-- Dumped by pg_dump version 15.16

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activities (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    project_id text,
    user_id text,
    action text NOT NULL,
    target text NOT NULL,
    target_type text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.activities OWNER TO postgres;

--
-- Name: calendar_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.calendar_events (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    title text NOT NULL,
    description text,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone NOT NULL,
    all_day boolean DEFAULT false,
    location text,
    user_id text NOT NULL,
    project_id text,
    type text DEFAULT 'event'::text NOT NULL,
    color text DEFAULT '#3b82f6'::text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.calendar_events OWNER TO postgres;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    task_id text NOT NULL,
    user_id text NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- Name: documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documents (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    project_id text NOT NULL,
    folder_id text,
    name text NOT NULL,
    type text NOT NULL,
    size integer NOT NULL,
    url text NOT NULL,
    uploaded_by text NOT NULL,
    uploaded_at timestamp without time zone DEFAULT now(),
    version integer DEFAULT 1
);


ALTER TABLE public.documents OWNER TO postgres;

--
-- Name: folders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.folders (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    project_id text NOT NULL,
    parent_id text,
    name text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.folders OWNER TO postgres;

--
-- Name: issues; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.issues (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    project_id text,
    title text NOT NULL,
    description text,
    type text DEFAULT 'bug'::text NOT NULL,
    severity text DEFAULT 'medium'::text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    assignee_id text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.issues OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    user_id text,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info'::text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: portfolios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.portfolios (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.portfolios OWNER TO postgres;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projects (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    name text NOT NULL,
    description text,
    owner_id text,
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    progress integer DEFAULT 0,
    status text DEFAULT 'on-track'::text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    portfolio_id text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.projects OWNER TO postgres;

--
-- Name: subtasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subtasks (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    task_id text NOT NULL,
    title text NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.subtasks OWNER TO postgres;

--
-- Name: task_assignees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.task_assignees (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    task_id text NOT NULL,
    user_id text NOT NULL,
    assigned_at timestamp without time zone DEFAULT now(),
    assigned_by text
);


ALTER TABLE public.task_assignees OWNER TO postgres;

--
-- Name: task_updates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.task_updates (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    task_id text NOT NULL,
    user_id text NOT NULL,
    content text NOT NULL,
    progress integer,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.task_updates OWNER TO postgres;

--
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    project_id text,
    title text NOT NULL,
    description text,
    assignee_id text,
    created_by text,
    priority text DEFAULT 'medium'::text NOT NULL,
    status text DEFAULT 'todo'::text NOT NULL,
    start_date timestamp without time zone,
    due_date timestamp without time zone,
    progress integer DEFAULT 0,
    "order" integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.tasks OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    teams_username text,
    avatar text,
    gender text DEFAULT 'male'::text,
    role text DEFAULT 'member'::text NOT NULL,
    status text DEFAULT 'online'::text NOT NULL,
    must_change_password boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activities (id, project_id, user_id, action, target, target_type, created_at) FROM stdin;
48ea1909-2c11-44c0-b87f-2b582d581c52	43edbe40-db46-4885-bf7f-9d116c150747	29833556-a3d3-42a2-afc7-a89bfe6f1a51	created	RTL vehcle status	task	2026-02-13 11:48:10.629855
9e92d0d5-e28e-4be7-9b11-4d04aa074d53	43edbe40-db46-4885-bf7f-9d116c150747	29833556-a3d3-42a2-afc7-a89bfe6f1a51	updated	RTL vehcle status	task	2026-02-13 11:48:17.968574
493829b4-81d5-4c87-be8c-3d642750a423	43edbe40-db46-4885-bf7f-9d116c150747	d45a4be0-cc49-4f9a-aa88-f9e90a75d613	added an update to	RTL vehcle status	task	2026-02-14 15:31:35.245787
e5076444-b838-4dde-8848-853b6a7e93fa	43edbe40-db46-4885-bf7f-9d116c150747	29833556-a3d3-42a2-afc7-a89bfe6f1a51	updated	RTL vehcle status	task	2026-02-14 15:36:12.668606
2acc72cd-a210-4a51-ae69-7e72723c8304	43edbe40-db46-4885-bf7f-9d116c150747	29833556-a3d3-42a2-afc7-a89bfe6f1a51	updated	RTL vehcle status	task	2026-02-14 15:36:45.346674
\.


--
-- Data for Name: calendar_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.calendar_events (id, title, description, start_time, end_time, all_day, location, user_id, project_id, type, color, created_at, updated_at) FROM stdin;
6f75ab21-6331-4a6a-b0bc-711818895c7c	Team Meeting	Weekly sync meeting	2026-02-17 10:00:00	2026-02-17 11:00:00	f	\N	29833556-a3d3-42a2-afc7-a89bfe6f1a51	\N	meeting	#3b82f6	2026-02-16 07:51:49.274229	2026-02-16 07:51:49.274229
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (id, task_id, user_id, content, created_at) FROM stdin;
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documents (id, project_id, folder_id, name, type, size, url, uploaded_by, uploaded_at, version) FROM stdin;
\.


--
-- Data for Name: folders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.folders (id, project_id, parent_id, name, created_at) FROM stdin;
\.


--
-- Data for Name: issues; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.issues (id, project_id, title, description, type, severity, status, assignee_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, title, message, type, read, created_at) FROM stdin;
\.


--
-- Data for Name: portfolios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.portfolios (id, name, description, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.projects (id, name, description, owner_id, start_date, end_date, progress, status, priority, portfolio_id, created_at, updated_at) FROM stdin;
43edbe40-db46-4885-bf7f-9d116c150747	Pinnacle AI	Chatbot Design	29833556-a3d3-42a2-afc7-a89bfe6f1a51	2026-02-13 00:00:00	2026-02-28 00:00:00	0	on-track	high	\N	2026-02-13 11:46:51.182695	2026-02-13 11:46:51.182695
\.


--
-- Data for Name: subtasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subtasks (id, task_id, title, completed, created_at) FROM stdin;
\.


--
-- Data for Name: task_assignees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.task_assignees (id, task_id, user_id, assigned_at, assigned_by) FROM stdin;
8be620a5-2fb5-4623-8639-214a84d05e1c	12086f0f-f555-411c-b265-cd0a37067e1d	d45a4be0-cc49-4f9a-aa88-f9e90a75d613	2026-02-13 11:48:10.622482	29833556-a3d3-42a2-afc7-a89bfe6f1a51
\.


--
-- Data for Name: task_updates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.task_updates (id, task_id, user_id, content, progress, created_at) FROM stdin;
833da41e-72a1-425c-80a9-1e03094d370b	12086f0f-f555-411c-b265-cd0a37067e1d	d45a4be0-cc49-4f9a-aa88-f9e90a75d613	Going through the task	10	2026-02-14 15:31:35.213419
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, project_id, title, description, assignee_id, created_by, priority, status, start_date, due_date, progress, "order", created_at, updated_at) FROM stdin;
12086f0f-f555-411c-b265-cd0a37067e1d	43edbe40-db46-4885-bf7f-9d116c150747	RTL vehcle status	design life cycle management 	d45a4be0-cc49-4f9a-aa88-f9e90a75d613	29833556-a3d3-42a2-afc7-a89bfe6f1a51	high	review	2026-02-13 11:48:10.58	2026-02-20 00:00:00	10	0	2026-02-13 11:48:10.604845	2026-02-14 15:36:45.342
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, name, email, teams_username, avatar, gender, role, status, must_change_password, created_at, updated_at) FROM stdin;
c549f017-d56b-4cc4-a2b2-4b6fe88fb752	Dinesh Kumar	$2b$10$gOElPtw2ko0ZOn2MsPTpruYOwX7zBGPMay57SH/NyElX6Ebc/hRkK	Dinesh Kumar	dinesh@sierraedge.ai	Dinesh Kumar	https://api.dicebear.com/7.x/avataaars/svg?seed=Dinesh Kumar&hairColor=BrownDark,Black,Brown&top=ShortHairShortFlat,ShortHairShortWaved,ShortHairDreads01	male	member	online	f	2026-02-13 10:17:24.416549	2026-02-13 10:47:33.99
d45a4be0-cc49-4f9a-aa88-f9e90a75d613	yaswanth	$2b$10$WqS5iguQTgyg3ZPrI.g8XuU3fO6IYqayilPBL032wFzzLWtiO5rK6	Ampolu Yaswanth	yaswanth@sierraedge.ai	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=ampolu yaswanth&top[]=shortHair	male	member	online	f	2026-02-13 06:53:13.59782	2026-02-13 11:48:32.74
f9840c24-14e9-49be-9e1a-5fe6fec266dd	Srinivas Rao	$2b$10$pu9XJ/9pief/xhqpy62ZOOtM488sLehJjrUcKpuzuvOqm.tAuPcYq	Veeragattapu Srinivasa Rao	srinivas@sierraedge.ai	Srinivas Rao	https://api.dicebear.com/7.x/avataaars/svg?seed=Veeragattapu Srinivasa Rao&hairColor=BrownDark,Black,Brown&top=ShortHairShortFlat,ShortHairShortWaved,ShortHairDreads01	male	member	online	t	2026-02-13 10:18:41.741514	2026-02-13 10:18:41.741514
b26cd0b9-1d09-4456-ae9c-e96c28bac53c	Ravi Teja	$2b$10$FbXxpz410IgMjrBVDSWJgOvBcftUosuLJftTuOAROAXgw4ZLF9hZu	Jana Ravi Teja	raviteja@sierraedge.ai	Ravi Teja	https://api.dicebear.com/7.x/avataaars/svg?seed=Jana Ravi Teja&hairColor=BrownDark,Black,Brown&top=ShortHairShortFlat,ShortHairShortWaved,ShortHairDreads01	male	member	online	t	2026-02-13 10:19:29.237438	2026-02-13 10:19:29.237438
61c62ef9-92e3-442e-96e9-9f7f6624b10d	Vinay Kumar	$2b$10$SIuo60p71azBJDUrQX1VJe0N/serQj7uLsE.Ml2Ot7tUivxrrbI8.	Boggula Vinay Kumar Reddy 	vinay@sierraedge.ai	Vinay Kumar 	https://api.dicebear.com/7.x/avataaars/svg?seed=Boggula Vinay Kumar Reddy &hairColor=BrownDark,Black,Brown&top=ShortHairShortFlat,ShortHairShortWaved,ShortHairDreads01	male	member	online	t	2026-02-13 10:20:30.558095	2026-02-13 10:20:30.558095
a46d5f52-7b81-40cb-a013-9935eaabd3e6	Eswar	$2b$10$CTxBaPRZpO5npsHDuCRc/OMevYWQ/9W4MuW55wPXFFrvyKXrneYgC	Kuna Eswar Rao	eswar@sierraedge.ai	Eswar	https://api.dicebear.com/7.x/avataaars/svg?seed=Kuna Eswar Rao&hairColor=BrownDark,Black,Brown&top=ShortHairShortFlat,ShortHairShortWaved,ShortHairDreads01	male	member	online	t	2026-02-13 10:20:54.65891	2026-02-13 10:20:54.65891
e8336061-d470-47f7-a88a-134de181474f	Rohan	$2b$10$a82tUIUVfX4zOK3YdM7lc.4jqZzgsAy23MGV3yU3IZXS.iyVpCxR2	Amudala Rohan	rohan@sierraedge.ai	Rohan	https://api.dicebear.com/7.x/avataaars/svg?seed=Amudala Rohan&hairColor=BrownDark,Black,Brown&top=ShortHairShortFlat,ShortHairShortWaved,ShortHairDreads01	male	member	online	t	2026-02-13 10:21:16.715663	2026-02-13 10:21:16.715663
d3e84d03-9018-4104-97f8-3e7a9d1a41dc	Giridhar	$2b$10$VACJx1fZH4Fw3DBxgzsEaeUkbUQD2EuM905dKJa/szrs4kIu5HD.G	Gujju Giridhar	giridhar@sierraedge.ai	Giridhar	https://api.dicebear.com/7.x/avataaars/svg?seed=Gujju Giridhar&hairColor=BrownDark,Black,Brown&top=ShortHairShortFlat,ShortHairShortWaved,ShortHairDreads01	male	member	online	t	2026-02-13 10:21:51.408033	2026-02-13 10:21:51.408033
e71f5afc-5835-4ca1-9a53-da85df8a9724	Prasanna	$2b$10$at5yL6ggHy3LuNxtwOvKDe.xUdCaef.kcZlrgJCcJc06/fLoEq6C2	Voona Prasanna Sai	prasanna@sierraedge.ai	Prasanna	https://api.dicebear.com/7.x/avataaars/svg?seed=Voona Prasanna Sai&hairColor=BrownDark,Black,Brown&top=ShortHairShortFlat,ShortHairShortWaved,ShortHairDreads01	male	member	online	t	2026-02-13 10:23:35.746048	2026-02-13 10:23:35.746048
29833556-a3d3-42a2-afc7-a89bfe6f1a51	admin	$2b$10$jbJF.hiCshM/KPWIWiA0HO9Tg0tgVBuvPfpTgEygHEn2yatWYDv2u	Girish Desai 	admin@pinnacle.ai	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=admin&top[]=shortHair	male	admin	online	f	2026-02-13 06:51:57.185185	2026-02-13 10:44:11.64
\.


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- Name: calendar_events calendar_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: folders folders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT folders_pkey PRIMARY KEY (id);


--
-- Name: issues issues_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT issues_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: portfolios portfolios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portfolios
    ADD CONSTRAINT portfolios_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: subtasks subtasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subtasks
    ADD CONSTRAINT subtasks_pkey PRIMARY KEY (id);


--
-- Name: task_assignees task_assignees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_assignees
    ADD CONSTRAINT task_assignees_pkey PRIMARY KEY (id);


--
-- Name: task_assignees task_assignees_task_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_assignees
    ADD CONSTRAINT task_assignees_task_id_user_id_key UNIQUE (task_id, user_id);


--
-- Name: task_updates task_updates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_updates
    ADD CONSTRAINT task_updates_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_calendar_events_project_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_calendar_events_project_id ON public.calendar_events USING btree (project_id);


--
-- Name: idx_calendar_events_start_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_calendar_events_start_time ON public.calendar_events USING btree (start_time);


--
-- Name: idx_calendar_events_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_calendar_events_user_id ON public.calendar_events USING btree (user_id);


--
-- Name: activities activities_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: activities activities_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: calendar_events calendar_events_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: calendar_events calendar_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: comments comments_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id);


--
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: documents documents_folder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES public.folders(id);


--
-- Name: documents documents_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: documents documents_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: folders folders_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT folders_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: issues issues_assignee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT issues_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES public.users(id);


--
-- Name: issues issues_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT issues_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: projects projects_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: subtasks subtasks_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subtasks
    ADD CONSTRAINT subtasks_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id);


--
-- Name: task_assignees task_assignees_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_assignees
    ADD CONSTRAINT task_assignees_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id);


--
-- Name: task_assignees task_assignees_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_assignees
    ADD CONSTRAINT task_assignees_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id);


--
-- Name: task_assignees task_assignees_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_assignees
    ADD CONSTRAINT task_assignees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: task_updates task_updates_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_updates
    ADD CONSTRAINT task_updates_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id);


--
-- Name: task_updates task_updates_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_updates
    ADD CONSTRAINT task_updates_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: tasks tasks_assignee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES public.users(id);


--
-- Name: tasks tasks_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: tasks tasks_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- PostgreSQL database dump complete
--

\unrestrict Ffyq47U0d2LEokq7mF408t2bbajykR30tcgOlWL4wlQQ4GZykpKf0ev4Fu6EBR1

