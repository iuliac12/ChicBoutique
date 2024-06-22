CREATE TYPE roluri AS ENUM('admin', 'moderator', 'comun');


CREATE TABLE IF NOT EXISTS utilizatori (
   id serial PRIMARY KEY, /* incrementeaza id ul    ; pk - identificator unic pentru inregistrare*/
   username VARCHAR(50) UNIQUE NOT NULL,
   nume VARCHAR(100) NOT NULL,
   prenume VARCHAR(100) NOT NULL,
   parola VARCHAR(500) NOT NULL, /* criptata */
   rol roluri NOT NULL DEFAULT 'comun',
   email VARCHAR(100) NOT NULL,
   culoare_chat VARCHAR(50) NOT NULL,
   data_adaugare TIMESTAMP DEFAULT current_timestamp, /* data curenta */
   cod character varying(200),
   confirmat_mail boolean DEFAULT false,
   poza VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS accesari (
   id serial PRIMARY KEY,
   ip VARCHAR(100) NOT NULL,
   user_id INT NULL REFERENCES utilizatori(id),
   pagina VARCHAR(500) NOT NULL, /* ultima pagina accesata */
   data_accesare TIMESTAMP DEFAULT current_timestamp
);


GRANT ALL PRIVILEGES ON DATABASE cti_2024 TO iulia ;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO iulia;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO iulia;