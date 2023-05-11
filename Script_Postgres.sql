CREATE DATABASE serverMonitor;
\connect serverMonitor;

CREATE TABLE tiposervidor(
      tiposervidor_id SERIAL,
      tiposervidor_descripcion VARCHAR(255) NOT NULL,
      PRIMARY KEY(tiposervidor_id)
);

INSERT INTO tiposervidor(tiposervidor_descripcion) VALUES('generico');
INSERT INTO tiposervidor(tiposervidor_descripcion) VALUES('appserver');
INSERT INTO tiposervidor(tiposervidor_descripcion) VALUES('cromo');
INSERT INTO tiposervidor(tiposervidor_descripcion) VALUES('database');

CREATE TABLE servidores ( 
      serverip varchar(15) not null,
      tiposervidor_id integer REFERENCES tiposervidor(tiposervidor_id),   
      rolservidor varchar(10),
      estado boolean not null default true,
      serverhostname varchar(100),
      servercpu varchar(10),
      servermem varchar(10),
      serveruptime varchar(10),
      serverusuarios varchar(10),
      serverdisco varchar(10),
      appserverestado varchar(10),
      appservercpu varchar(10),
      appserveruptime varchar(10),
      appserverusuarios varchar(10),
      estadoscada varchar(2),
      estadonbm varchar(2),
      estadotca varchar(2),
      estadokpi varchar(2),
      estadoomscontainer varchar(2),
      estadoomslink varchar(2),
      estadoomsagatha varchar(2),
      estadoomssituacion varchar(2),
      estadoomsnotificacion varchar(2),
      estadoomscustomer varchar(2),
      cromoinstalled varchar(2),
      cromoalive varchar(2),
      cromoversion varchar(10),
      cromodb varchar(100),
      cromomovilalive varchar(2),
      PRIMARY KEY (serverip)
);

CREATE TABLE updatetime (
      serverip varchar(15) not null, 
      tiposervidor_id integer REFERENCES tiposervidor(tiposervidor_id),
      rolservidor varchar(10),
      estado timestamp default now(),
      serverhostname timestamp default now(),
      servercpu timestamp default now(),
      servermem timestamp default now(),
      serveruptime timestamp default now(),
      serverusuarios timestamp default now(),
      serverdisco timestamp default now(),
      appserverestado timestamp default now(),
      appservercpu timestamp default now(),
      appserveruptime timestamp default now(),
      appserverusuarios timestamp default now(),
      estadoscada timestamp default now(),
      estadonbm timestamp default now(),
      estadotca timestamp default now(),
      estadokpi timestamp default now(),
      estadoomscontainer timestamp default now(),
      estadoomslink timestamp default now(),
      estadoomsagatha timestamp default now(),
      estadoomssituacion timestamp default now(),
      estadoomsnotificacion timestamp default now(),
      estadoomscustomer timestamp default now(),
      cromoinstalled timestamp default now(),      
      cromoalive timestamp default now(),
      cromoversion timestamp default now(),
      cromodb timestamp default now(),
      cromomovilalive timestamp default now(),
      PRIMARY KEY (serverip)
);

CREATE TABLE tipoevento(
      tipoevento_id SERIAL,
      tipoevento_descripcion VARCHAR(100) NOT NULL,
      PRIMARY KEY(tipoevento_id)
);

INSERT INTO tipoevento(tipoevento_descripcion) VALUES('Info');
INSERT INTO tipoevento(tipoevento_descripcion) VALUES('Error');
INSERT INTO tipoevento(tipoevento_descripcion) VALUES('Warning');

CREATE TABLE eventos(
      evento_id SERIAL,
      evento_horario timestamp default now(),
      evento_usuario VARCHAR(50) NOT NULL,
      evento_tipo integer REFERENCES tipoevento(tipoevento_id) NOT NULL,
      evento_mensaje VARCHAR(1000) NOT NULL,
      PRIMARY KEY(evento_id)
);