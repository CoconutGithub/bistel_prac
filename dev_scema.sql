-- dev.category definition

-- Drop table

-- DROP TABLE dev.category;

CREATE TABLE dev.category (
	id bigserial NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT category_pkey PRIMARY KEY (id)
);


-- dev.p_email_history definition

-- Drop table

-- DROP TABLE dev.p_email_history;

CREATE TABLE dev.p_email_history (
	send_user varchar(40) NOT NULL,
	send_reciver varchar(40) NOT NULL,
	title varchar(100) NULL,
	"content" varchar(200) NULL,
	read_yn varchar(10) DEFAULT 'N'::character varying NULL,
	creation_time timestamp NULL
);


-- dev.p_expense definition

-- Drop table

-- DROP TABLE dev.p_expense;

CREATE TABLE dev.p_expense (
	expense_id serial4 NOT NULL,
	user_name varchar(100) NOT NULL,
	category varchar(50) NOT NULL,
	item varchar(255) NOT NULL,
	price numeric(10, 2) NOT NULL,
	file_group_id varchar(50) NULL,
	created_at timestamp DEFAULT now() NULL,
	created_by varchar(100) NULL,
	updated_at timestamp DEFAULT now() NULL,
	updated_by varchar(100) NULL,
	CONSTRAINT p_expense_pkey PRIMARY KEY (expense_id)
);
CREATE INDEX idx_expense_file_group_id ON dev.p_expense USING btree (file_group_id);

-- Table Triggers

create trigger expense_update_trigger before
update
    on
    dev.p_expense for each row execute function update_expense_timestamp();


-- dev.p_file definition

-- Drop table

-- DROP TABLE dev.p_file;

CREATE TABLE dev.p_file (
	file_id serial4 NOT NULL,
	file_group_id varchar(50) NOT NULL,
	file_name varchar(255) NOT NULL,
	file_path text NOT NULL,
	file_size int8 NOT NULL,
	created_at timestamp DEFAULT now() NULL,
	created_by varchar(100) NULL,
	updated_at timestamp DEFAULT now() NULL,
	updated_by varchar(100) NULL,
	CONSTRAINT p_file_pkey PRIMARY KEY (file_id)
);
CREATE INDEX idx_file_group_id ON dev.p_file USING btree (file_group_id);

-- Table Triggers

create trigger files_update_trigger before
update
    on
    dev.p_file for each row execute function update_files_timestamp();


-- dev.p_language definition

-- Drop table

-- DROP TABLE dev.p_language;

CREATE TABLE dev.p_language (
	lang_code varchar NOT NULL,
	lang_name varchar NOT NULL,
	lang_order int2 NOT NULL,
	CONSTRAINT p_language_unique UNIQUE (lang_code),
	CONSTRAINT p_language_unique_1 UNIQUE (lang_order)
);


-- dev.p_menu definition

-- Drop table

-- DROP TABLE dev.p_menu;

CREATE TABLE dev.p_menu (
	menu_id int4 NOT NULL,
	parent_menu_id int4 NULL,
	"depth" int4 NOT NULL,
	"path" varchar(200) NOT NULL,
	component_path varchar(200) NULL,
	"position" int4 NOT NULL,
	child_yn bpchar(1) DEFAULT 'N'::bpchar NULL,
	status varchar(20) DEFAULT 'ACTIVE'::character varying NULL,
	create_date timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	create_by varchar(100) NULL,
	update_date timestamp NULL,
	update_by varchar(100) NULL,
	msg_id int4 NULL,
	menu_name varchar(100) NULL,
	CONSTRAINT p_menu_pkey PRIMARY KEY (menu_id)
);


-- dev.p_msg_main definition

-- Drop table

-- DROP TABLE dev.p_msg_main;

CREATE TABLE dev.p_msg_main (
	msg_id int4 NOT NULL,
	msg_type varchar NOT NULL,
	msg_name varchar NOT NULL,
	msg_default varchar NOT NULL,
	status varchar DEFAULT 'ACTIVE'::character varying NULL,
	create_by varchar NULL,
	create_date timestamp NULL,
	update_by varchar NULL,
	update_date timestamp NULL,
	CONSTRAINT p_msg_main_pk PRIMARY KEY (msg_id),
	CONSTRAINT p_msg_main_unique UNIQUE (msg_type, msg_name)
);


-- dev.p_permission definition

-- Drop table

-- DROP TABLE dev.p_permission;

CREATE TABLE dev.p_permission (
	permission_id int4 NOT NULL,
	role_id int4 NOT NULL,
	menu_id int4 NOT NULL,
	can_create bpchar(1) DEFAULT 'N'::bpchar NULL,
	can_read bpchar(1) DEFAULT 'N'::bpchar NULL,
	can_update bpchar(1) DEFAULT 'N'::bpchar NULL,
	can_delete bpchar(1) DEFAULT 'N'::bpchar NULL,
	create_date timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	create_by varchar(100) NULL,
	update_date timestamp NULL,
	update_by varchar(100) NULL,
	CONSTRAINT p_permission_pkey PRIMARY KEY (permission_id)
);


-- dev.p_role definition

-- Drop table

-- DROP TABLE dev.p_role;

CREATE TABLE dev.p_role (
	role_id int4 NOT NULL,
	role_name varchar(100) NOT NULL,
	status varchar(20) DEFAULT 'INACTIVE'::character varying NULL,
	create_date timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	create_by varchar(100) DEFAULT 'SYSTEM'::character varying NULL,
	update_date timestamp NULL,
	update_by varchar(100) DEFAULT 'SYSTEM'::character varying NULL,
	is_mighty bpchar(1) DEFAULT 'N'::bpchar NULL,
	CONSTRAINT p_role_pkey PRIMARY KEY (role_id)
);


-- dev.p_scheduler definition

-- Drop table

-- DROP TABLE dev.p_scheduler;

CREATE TABLE dev.p_scheduler (
	job_name varchar NOT NULL,
	group_name varchar NOT NULL,
	trigger_key varchar NOT NULL,
	class_name varchar NOT NULL,
	cron_tab varchar NOT NULL,
	create_date timestamp NULL,
	create_by varchar NULL,
	update_date timestamp NULL,
	update_by varchar NULL,
	status varchar NULL,
	CONSTRAINT p_scheduler_unique_job_name UNIQUE (job_name),
	CONSTRAINT p_scheduler_unique_trigger_name UNIQUE (trigger_key)
);


-- dev.p_user definition

-- Drop table

-- DROP TABLE dev.p_user;

CREATE TABLE dev.p_user (
	user_id varchar(100) NOT NULL,
	user_name varchar(100) NOT NULL,
	"password" varchar(300) NOT NULL,
	email varchar(100) NULL,
	phone_number varchar(20) NULL,
	last_login_date timestamp NULL,
	status varchar(20) DEFAULT 'INACTIVE'::character varying NULL,
	footer_yn varchar(1) DEFAULT 'Y'::character varying NULL,
	header_color varchar(20) DEFAULT '#f8f9fa'::character varying NULL,
	create_date timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	create_by varchar(100) NULL,
	update_date timestamp NULL,
	update_by varchar(100) NULL,
	profile_image bytea NULL,
	lang_code varchar(2) DEFAULT 'KO'::character varying NULL,
	pagination_size int4 DEFAULT 50 NULL,
	CONSTRAINT p_user_pkey PRIMARY KEY (user_id)
);


-- dev.p_user_role definition

-- Drop table

-- DROP TABLE dev.p_user_role;

CREATE TABLE dev.p_user_role (
	user_id varchar(100) NULL,
	role_id int4 NULL,
	create_date timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	create_by varchar(100) NULL,
	update_date timestamp NULL,
	update_by varchar(100) NULL
);


-- dev.p_user_v3 definition

-- Drop table

-- DROP TABLE dev.p_user_v3;

CREATE TABLE dev.p_user_v3 (
	user_id varchar(100) NULL,
	user_name varchar(100) NULL,
	email varchar(100) NULL,
	"password" varchar(300) NULL,
	phone_number varchar(20) NULL,
	last_login_date timestamp NULL,
	status varchar(20) NULL,
	footer_yn varchar(1) NULL,
	header_color varchar(20) NULL,
	create_date timestamp NULL,
	create_by varchar(100) NULL,
	update_date timestamp NULL,
	update_by varchar(100) NULL
);


-- dev.resumes definition

-- Drop table

-- DROP TABLE dev.resumes;

CREATE TABLE dev.resumes (
	id serial4 NOT NULL,
	full_name varchar(100) NOT NULL,
	email varchar(255) NOT NULL,
	phone varchar(20) NULL,
	summary text NULL,
	experience jsonb NULL,
	education jsonb NULL,
	skills jsonb NULL,
	resume_file bytea NULL,
	resume_filename varchar(255) NULL,
	create_date timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	create_by varchar(100) NULL,
	update_date timestamp NULL,
	update_by varchar(100) NULL,
	gender varchar(10) NULL,
	company varchar(255) NULL,
	department varchar(255) NULL,
	"position" varchar(255) NULL,
	job_title varchar(255) NULL,
	address varchar(300) NULL,
	carrier_month int4 DEFAULT 0 NULL,
	resident_number varchar(100) NULL,
	military_service varchar(1) NULL,
	license jsonb NULL,
	training jsonb NULL,
	CONSTRAINT resumes_email_key UNIQUE (email),
	CONSTRAINT resumes_pkey PRIMARY KEY (id)
);


-- dev.p_code definition

-- Drop table

-- DROP TABLE dev.p_code;

CREATE TABLE dev.p_code (
	code_id numeric DEFAULT nextval('seq_p_code'::regclass) NOT NULL,
	parent_id numeric NULL,
	code_name varchar(255) NULL,
	default_text varchar(255) NULL,
	msg_id numeric NULL,
	"level" numeric NOT NULL,
	code_order numeric NULL,
	status varchar NULL,
	create_by varchar NULL,
	create_date timestamp NULL,
	update_by varchar NULL,
	update_date timestamp NULL,
	a_code varchar NULL,
	b_code varchar NULL,
	c_code varchar NULL,
	d_code varchar NULL,
	e_code varchar NULL,
	CONSTRAINT p_code_pkey PRIMARY KEY (code_id),
	CONSTRAINT p_code_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES dev.p_code(code_id) ON DELETE CASCADE
);


-- dev.p_msg_detail definition

-- Drop table

-- DROP TABLE dev.p_msg_detail;

CREATE TABLE dev.p_msg_detail (
	msg_id int4 NOT NULL,
	lang_code varchar NOT NULL,
	lang_text varchar NOT NULL,
	create_by varchar NULL,
	create_date timestamp NULL,
	update_by varchar NULL,
	update_date timestamp NULL,
	CONSTRAINT p_msg_detail_unique UNIQUE (msg_id, lang_code),
	CONSTRAINT fk_msg_id FOREIGN KEY (msg_id) REFERENCES dev.p_msg_main(msg_id) ON DELETE CASCADE
);


-- dev.product definition

-- Drop table

-- DROP TABLE dev.product;

CREATE TABLE dev.product (
	id bigserial NOT NULL,
	"name" varchar(255) NOT NULL,
	price numeric(10, 2) NOT NULL,
	category_id int8 NULL,
	CONSTRAINT product_pkey PRIMARY KEY (id),
	CONSTRAINT product_category_id_fkey FOREIGN KEY (category_id) REFERENCES dev.category(id) ON DELETE SET NULL
);

-- dev.category_id_seq definition

-- DROP SEQUENCE dev.category_id_seq;

CREATE SEQUENCE dev.category_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;


-- dev.p_expense_expense_id_seq definition

-- DROP SEQUENCE dev.p_expense_expense_id_seq;

CREATE SEQUENCE dev.p_expense_expense_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;


-- dev.p_file_file_id_seq definition

-- DROP SEQUENCE dev.p_file_file_id_seq;

CREATE SEQUENCE dev.p_file_file_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;


-- dev.product_id_seq definition

-- DROP SEQUENCE dev.product_id_seq;

CREATE SEQUENCE dev.product_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;


-- dev.resumes_id_seq definition

-- DROP SEQUENCE dev.resumes_id_seq;

CREATE SEQUENCE dev.resumes_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;


-- dev.seq_p_code definition

-- DROP SEQUENCE dev.seq_p_code;

CREATE SEQUENCE dev.seq_p_code
	INCREMENT BY 1
	MINVALUE 100
	MAXVALUE 9223372036854775807
	START 100
	CACHE 1
	NO CYCLE;


-- dev.seq_p_menu definition

-- DROP SEQUENCE dev.seq_p_menu;

CREATE SEQUENCE dev.seq_p_menu
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;


-- dev.seq_p_msg definition

-- DROP SEQUENCE dev.seq_p_msg;

CREATE SEQUENCE dev.seq_p_msg
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 100
	CACHE 1
	NO CYCLE;


-- dev.seq_p_msg_detail definition

-- DROP SEQUENCE dev.seq_p_msg_detail;

CREATE SEQUENCE dev.seq_p_msg_detail
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 200
	CACHE 1
	NO CYCLE;


-- dev.seq_p_permission definition

-- DROP SEQUENCE dev.seq_p_permission;

CREATE SEQUENCE dev.seq_p_permission
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;


-- dev.seq_p_role definition

-- DROP SEQUENCE dev.seq_p_role;

CREATE SEQUENCE dev.seq_p_role
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;


-- dev.seq_p_user definition

-- DROP SEQUENCE dev.seq_p_user;

CREATE SEQUENCE dev.seq_p_user
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;