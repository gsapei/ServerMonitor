const oracledb = require('oracledb');

//Conectamos a la BD Oracle
oracledb.getConnection(global.oracleConn)
.then((connection) => { console.log("[Connectado exitosamente a la base de datos Oracle]"); global.oracleClient = connection; })
.catch((err) => {console.log(`[Error al conectarse a la base de datos Oracle] -> ${err}`);})

//verificar estado SCADA (N y C)
async function consultaEstadoSCADA(){
    return new Promise((resolve, reject) => {
        if(global.oracleClient){
            const consulta = `
            SELECT(SELECT ( sysdate - max(SCADA_OPERATION_TIMESTAMP) )*(1440) FROM int_operations) SCADAN, 
            (SELECT NVL (SYSDATE - MIN (scada_operation_timestamp), 0) * 24 * 60 FROM int_operations WHERE certa_process_status = 1) SCADAC 
            from dual
            `;
            global.oracleClient.execute(consulta)
            .then( res => {
                resolve({'SCADAN':res['rows'][0][0],'SCADAC':res['rows'][0][1]});
            })
            .catch( err => {
                console.log(`Error al realizar la consulta a Oracle -> ${err.stack}`);
            });
        }
        else{
            reject('No esta conectado a la base de datos Oracle');
        }
    });
} 

//verificar alertas SGT 
async function consultaEstadoSGT(){
    return new Promise((resolve, reject) => {
        if(global.oracleClient){        
            const consulta = `SELECT NVL (SYSDATE - MAX (fecha), 0) FROM sgtsgtgisint`;
            global.oracleClient.execute(consulta)
            .then( res => {
                resolve(res);
            })
            .catch( err => {
                console.log(`Error al realizar la consulta a Oracle -> ${err.stack}`);
            });
        }
        else{
            reject('No esta conectado a la base de datos Oracle');
        }            
    });
} 

//alerta correspondiente a Documentos AT Con Afectaciones 
async function consultaAfectacionesAT(){
    return new Promise((resolve,reject) => {
        if(global.oracleClient){         
            const consulta = `
            SELECT COUNT (*)
            FROM oms_document doc
                INNER JOIN oms_address addr ON DOC.ADDRESS_ID = ADDR.ID
            WHERE     type_id > 4
                AND last_state_id < 5
                AND affected_clients > 0
                AND ADDR.SMALL_AREA_ID IN (200, 223, 224, 225, 346, 348)
            `;
            global.oracleClient.execute(consulta)
            .then( res => {
                resolve(res.rows[0]);
            })
            .catch( err => {
                console.log(`Error al realizar la consulta a Oracle -> ${err.stack}`);
            });
        }
        else{
            reject('No esta conectado a la base de datos Oracle');
        }            
    });
} 

//alerta correspondiente a ultima actualizacion de KPI
async function consultaEstadoKPI(){
    return new Promise((resolve, reject) => {
        if(global.oracleClient){          
            const consulta = `SELECT ( SYSDATE - MAX(last_modified_date) )*(1440) FROM mobile_kpi_indicator_data`;
            global.oracleClient.execute(consulta)
            .then( res => {
                resolve(res.rows[0]);
            })
            .catch( err => {
                console.log(`Error al realizar la consulta a Oracle -> ${err.stack}`);
            });
        }
        else{
            reject('No esta conectado a la base de datos Oracle');
        }             
    });
} 

module.exports = {
    consultaEstadoSCADA,
    consultaEstadoSGT,
    consultaAfectacionesAT,
    consultaEstadoKPI

}