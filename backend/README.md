# Monitor de servidores (CSM)

Servicio de monitoreo de servidores Linux de SITEGIS y alertas tempranas.

#### Logica de funcionamiento:

**Serverside Script** `>> (POST Request) >>` **Monitor de servidores** `>> (SocketIO) >>` **Interfaz web**
**Serverside Script** `<< (Socket-IO) <<` **Monitor de servidores**

1) Al iniciar el servicio se cargan los datos almacenados en la base de datos Postgres por unica vez. 
2) Luego se queda a la escucha para recibir peticiones POST de los Serverside-scripts con cambios de estado y guarda esos cambios en la base de datos. 
3) A la vez envia las novedades que van llegando por websockets hacia los clientes conectados para que actualicen la informacion en tiempo real.
4) Cada determinado tiempo envia un ping a los servidores para verificar si el servidor y el Script esta funcionando, guarda el cambio en la base de datos y envia la novedad a los clientes.
5) Con la misma frecuencia que el PING se verifican las alertas tempranas.

---
## Configuracion
En el archivo `config.js` se encuentran algunos parametros a definir por el programa:

#### Configuracion general de ServerMonitor:

```
const finalConfig = {
  environment: process.env.NODE_ENV || "production",
  name: "site.srvmonitor",
  description: "Monitor de servidores linux",
  port: 3950, // Puerto para recibir peticiones POST de los scripts y de acceso al frontend
  timeFormat: "YYYY-MM-DD HH:mm:ss",
  authServer: "authServer.local",
  authPort: 3000,
  authPath: "/site/auth",
  authACL: "/site/acl",
  socketPort: 3951, //puerto de comunicacion de Socket con los Scripts para PING y enviar COMANDOS
  frecuenciaPing: 20, // Frecuencia de PING a los servidores y de evaluacion de alertas (en segundos)
  linkFrontend: 'https://external.access.URL',  // Para incluir el link en los mails de alerta
};
```
#### Conexion a las bases de datos (PostgreSQL y ORACLE):
```
//Base de datos Postgres
const datosConexionPostgres = {
  user: 'postgres',
  host: 'win-site12v',
  database: 'serverMonitor',
  password: '******',
  port: 5432,
};

//Base de datos Oracle
const datosConexionOracle = { 
  user: 'EPE',
  password: "********",
  connectString: "Oracledb01:1521/USER",
};
```

#### Parametros de Alertas Tempranas:
Objeto **JSON** con la configuracion de cada alerta. Activadas individualmente con `alerta: true`, se envia por email a  `destinatarios: 'email1@dominio.com, email2@dominio.com'` cuando no se cumplen los valores especificados.
```
const reglasAlerta = {

  hardware: { // limites de uso de cpu, mem y disco
    alerta: true,
    maxCPU: 75,
    maxMEM: 100,
    maxDSK: 90,
    reiteraciones: 10, //si el valor maximo se repite x veces se dispara la alarma
    destinatarios: `email@epe.santafe.gov.ar, email2@gmail.com`  // string de emails separados por coma 
  },
  
  
  scada: { // revisa cada determinado tiempo que haya una maniobra SCADA en la base de datos
    alerta: true, 
    expirationTimeScada: 15, //minutos
    expirationTimeScadaCerta: 15, //para SCADA Certa 
    destinatarios: `email@epe.santafe.gov.ar, email2@gmail.com`
    },
    
  
  sgt: { // chequeo de actualizaciones SGT
    alerta: true,
    min: 1, 
    max: 7,
    destinatarios: `email@epe.santafe.gov.ar, email2@gmail.com`
  },
  
  
  afectacionesAT: { // verifica documentos en AT con afectaciones en la base de datos
    alerta: true,
    destinatarios: `email@epe.santafe.gov.ar, email2@gmail.com`              
  },
  
  kpi: { // revisa cada determinado tiempo que haya una actualizacion de KPI en la base de datos
    alerta: true,
    expirationTimekpi: 5, //minutos sin actividad
    destinatarios: `email@epe.santafe.gov.ar, email2@gmail.com`
  },  
  
  
  componentes: { // verifica existencia minima de servidores dedicados y componentes appserver (minimos y maximos)
    alerta: true,
    destinatarios: `email@epe.santafe.gov.ar, email2@gmail.com`,
    
    // cantidad minima en servidores productivos
    cromoServer: { min: 2 },
    appServer: { min: 3 },
    databaseServer: { min: 2 },

    // componentes minimos y maximos en los Appserver
    scada: {
      min: 1, 
      max: 1,
      },
    nbm: {
      min: 1, 
      max: 1,
    },
    agatha: { //OMS Predictivo
      min: 1, 
      max: 1,
    },
    tca: {
      min: 1,
      max: 10,
    },
    kpi: {
      min: 1,
      max: 1,
    }
  }
}
```

En el archivo `Script_Postgres.sql` se encuentra la estructura inicial de la base de datos, para ser ejecutada por unica vez.