//Config general del programa
const finalConfig = {
  environment: process.env.NODE_ENV || "production",
  name: "site.srvmonitor",
  description: "Monitor de servidores linux",
  port: 3950,
  timeFormat: "YYYY-MM-DD HH:mm:ss",
  authServer: "authserver.com",
  authPort: 3000,
  authPath: "/site/auth",
  authACL: "/site/acl",
  socketPort: 3951,
  frecuenciaPing: 20, //en segundos
  linkFrontend: 'https://external-frontend-access/csm/',
};

//Base de datos Postgres

const datosConexionPostgres = { 
  user: 'postgres',
  host: 'postgreSQL',
  database: 'serverMonitor',
  password: "srvmon",
  port: 5432,
};

//Base de datos Oracle
const datosConexionOracle = { 
  user: "oracleUser",
  password: "oraclePass",
  connectString: "oracleString",
};

//reglas y opciones para Alertas tempranas
const reglasAlerta = {
  //Alertas activadas
  activa: true,
  // limites de uso de cpu, mem y disco / server offline
  hardware: {
    alerta: true,
    maxCPU: 75,
    maxMEM: 100,
    maxDSK: 90,
    reiteraciones: 10, //si el valor maximo se repite x veces se dispara la alarma (freCuenciaPing x reiteraciones = tiempo total de valor alto)
    destinatarios: `alerted_user@email.com`
  },
  // revisa cada cierto tiempo que haya una maniobra SCADA en la base de datos
  scada: {
    alerta: true, 
    expirationTimeScada: 15, //minutos
    expirationTimeScadaCerta: 15, //para SCADA Certa 
    destinatarios: `alerted_user@email.com`
    },
  // chequeo de actualizaciones SGT
  sgt: {
    alerta: true,
    min: 1, 
    max: 7,
    destinatarios: `alerted_user@email.com`    
  },
  // verifica documentos en AT con afectaciones en la base de datos
  afectacionesAT: {
    alerta: true,
    destinatarios: `alerted_user@email.com`        
  },
  kpi: {
    alerta: true,
    expirationTimekpi: 15, //minutos sin actividad
    destinatarios: `alerted_user@email.com`    
  },  
  // verifica existencia minima de servidores dedicados y componentes appserver
  componentes: {
    alerta: true,
    destinatarios: `alerted_user@email.com`,   
    // cantidad minima en servidores productivos
    cromoServer: { min: 1 },
    appServer: { min: 3 },
    databaseServer: { min: 0 },

    // componentes minimos y maximos en los appserver
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
      min: 0,
      max: 1,
    }
  }
}

global.reglasAlerta = reglasAlerta;
global.gConfig = finalConfig;
global.postgresConn = datosConexionPostgres;
global.oracleConn = datosConexionOracle;
