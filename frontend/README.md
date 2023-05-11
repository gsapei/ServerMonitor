# Interfaz web CSM (cliente ServerMonitor)
Interfaz web  para serverMonitor

### Login y permisos

Al loguearse con un usuario, se envia una peticion al Backend y este retorna un **token de seguridad** que sera utilizado en toda la sesion. 
Luego al ingresar se consulta nuevamente al Backend para verificar si el usuario tiene **permisos de administrador** o solo esta habilitado para realizar consultas. Y en base a esto se habilitan o deshabilitan los botones de control en las tarjetas.

### Sobre la interfaz:

En la esquina superior izquierda de la barra de titulo se accede al menu de usuario. Donde se puede filtrar el listado de servidores y visualizar por **tipo de servidor** (Appserver, Cromo, Database y genericos) y por **rol** (Desarrollo, Productivo). Desde este menu tambien se accede al **Tablero de alertas**, donde se encuentran los datos sensibles de los servidores (por ej. la cantidad minima de Appservers productivos) y tambien un listado con el **registro de eventos** de todas las alertas enviadas por el Backend y los comandos ejecutados en cada servidor.
En la esquina superior derecha se puede alternar entre **modo nocturno** y **modo dia**.

##### Disposicion de los servidores:

Existen 2 tipos de vistas para el listado de servidores, el **modo Tabla** y el **modo Tarjetas** (tipo Dashboard).
`Si se accede mediante un dispositivo movil, solo se puede visualizar en modo tarjetas`.

##### Modo Tabla:
Si se ingresa desde el navegador de una PC se visualiza por defecto el listado de servidores en modo tabla, donde se muestra cada servidor y los datos generales de los mismos (tipo de servidor, Rol, memoria, cpu, disco, usuarios, etc.).
Si el servidor esta online al hacer click en el boton de color de **tipo servidor** (primera celda de la tabla) se puede  visualizar la tarjeta del mismo, con todos los datos en detalle y los botones de control.
La lista de servidores en modo tabla se puede ordenar por columnas haciendo click en el nombre de la columna.


##### Modo Tarjetas:
Se muestran todos los servidores en forma de tarjetas, tipo dashboard.
`Si se ordeno el listado de sevidores en el modo tabla, al pasar a modo tarjetas se visualizan en la misma disposición en que fueron ordenadas anteriormente.`


