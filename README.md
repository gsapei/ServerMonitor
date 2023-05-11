# ServerMonitor 2.0 version Docker
Version Docker de ServerMonitor 2.0

### Contenedores
para funcionar se dispone de 3 contenedores que se comunican entre si:

`server-monitor-database` --> **PostgreSQL**

`server-monitor-core` --> Contenedor prebuildeado con: **nodeJS**, dependencias de node y drivers Oracle.

`server-monitor-frontend` --> **Nginx** que levanta la app desarrollada y compilada en Quasar

### Configuracion del backend
>**IMPORTANTE**: Cada vez que realizamos un cambio en la configuracion del backend, como este contenedor esta prebuildeado, debemos **eliminar el contenedor server-monitor-core** y volver a levantar el docker-compose para que se vuelva a buildear.
Para esto existe un script llamado `backend_reset.sh`.


# Despliegue

Para desplegar correctamente el sistema debemos llevar a cabo algunos pasos:

##### 1. configurar los certificados
1. Debemos copiar los certificados de seguridad del servidor dentro de la carpeta `./backend/cert`
2. Editar el archivo `./backend/bin/app.js` y cambiar el nombre de los certificados por los que correspondan al servidor:

        var server = https.createServer(
          {
            cert: fs.readFileSync('cert/ccsf-gis-cont01.pem'),
            key: fs.readFileSync('cert/ccsf-gis-cont01.key'),
            ca: fs.readFileSync('cert/ca.pem'),
            passphrase: fs.readFileSync('cert/ccsf-gis-cont01.pass', 'utf8')
          },
          app
          );
        server.listen(global.gConfig.port);

3. Editar el archivo `./frontend/nginx.conf` cambiando **solo el nombre** de los archivos correspondientes (no modificar el path /usr/share/nginx/cert/):

        listen 443 ssl;
        ssl_certificate /usr/share/nginx/cert/ccsf-gis-cont01.pem;
        ssl_certificate_key /usr/share/nginx/cert/ccsf-gis-cont01.key; 
        ssl_password_file /usr/share/nginx/cert/ccsf-gis-cont01.pass;

> La contraseña de los certificados debe estar contenida en un archivo de texto plano sin espacio ni lineas en blanco. En este caso esta contenida en **ccsf-gis-cont01.pass**

##### 2. Modificar archivo YML
En el archivo **docker-compose.yml** debemos cambiar un único valor del contenedor **server-monitor-frontend** por el nombre de servidor (o IP) donde esta alojado el backend. 
*Cabe aclarar que si ingresamos el nombre de un servidor o su IP en la intranet, luego los navegadores no podran acceder desde el exterior.*

    environment: 
        BACKEND_API: "https://servicios.epe.santafe.gov.ar"

>**IMPORTANTE**: Cuando corra por primera vez el programa va a remplazar en el archivo `./frontend/dist/spa/js/app.*.js` toda ocurrencia de la palabra **BACKEND_API** por el valor que le asignemos a la variable, y este proceso **no es reversible**.
Es decir, cuando volvamos a correr por segunda vez el programa ya no existirá la palabra BACKEND_API porque fue remplazada.
Si pusimos mal el nombre habrá que volver a copiar el archivo `./frontend/dist/spa/js/app.*.js` original y ahora si al levantar el programa para que sea remplazada por el valor que pongamos.

##### 3. Correr el programa por primera vez
Ahora solo queda correr el programa con el script **./start.sh** o directamente `docker-compose up -d`
>Cuando ejecutamos por primera vez el programa puede suceder que mientras esta creando la base de datos se quiera conectar a la misma y no funcione porque aún no esta lista. 
Si ocurre esto solo debemos reiniciar el programa con **./stop.sh** y luego **./start.sh** nuevamente y listo.
