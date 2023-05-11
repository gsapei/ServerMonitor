const nodemailer = require('nodemailer');
const ticker = require('node-cron');
const sockets = require('../controllers/sockets.js');
const postgres = require('../controllers/postgres.js');
const oracle = require('../controllers/oracle.js');
const resolve = require('../middleware/helpers/resolve.js');
const Datetime = require('../middleware/helpers/datetime.js');
const transporter = nodemailer.createTransport({ host: 'smtp.sfe.epesf', port: 25 })

class Alerta{

    activa = false;
    duracion = null; //en minutos (solo si se repite)
    repetir = false;
    tipo;
    header;
    footer;
    mensaje;
    destinatarios = null;
    horaInicio = null;
    objInterval = null; //para controlar el setInterval

    constructor(mensaje,duracion,repetir,tipo,destinatarios){
        let datetime = Datetime.getDateTime(new Date());

        this.horaInicio = datetime;
        this.destinatarios = destinatarios;
        this.mensaje = mensaje;
        this.duracion = duracion * 1000 * 60; //en minutos
        this.repetir = repetir;
        this.tipo = tipo;        
        this.header = "<h1 style='margin: 0px;'>Alerta ServerMonitor SITEGIS</h1><p style='margin-top: 0px;'>Emitida el "+datetime.fecha+' - '+datetime.hora+" hs. Desde: "+ resolve.getIp() +" </p>";
        this.footer = "<p>Consulte su estado en <a href='"+ global.gConfig.linkFrontend +"'>CSM ServerMonitor SITEGIS</a>. O verifique si el script del lado servidor dejo de funcionar.</p>";
        this.activar();

        postgres.escribirEvento("ServerMonitor",tipo,mensaje)
        .then(()=>{
            global.socketio.emit('updateEventos');
        })

    }

    //se activa y comienza a enviar mensajes
    activar(){
        if(this.activa==false){
            this.activa=true;
            // Si se repite el alerta se envia un mail cada x tiempo, sino se envia por unica vez
            this.enviarMail();
            if(this.repetir==true){ 
                this.objInterval = setInterval(()=>{this.enviarMail()}, this.duracion); 
            }
        }
    }
    
    //se desactiva la alerta y se detiene el objInterval
    desactivar(){
        if(this.activa==true && this.objInterval){
            clearTimeout(this.objInterval);
            this.activa=false;
        }
        
    }

    //enviar mail en formato HTML a las direcciones especificadas
    enviarMail(){
        let mail = {};
        let tipo = this.tipo;
        let mensaje = this.header + this.mensaje + this. footer;
        if(tipo=='WARNING'){
            mail = {
                from: "procesosDBSite@epe.santafe.gov.ar",
                to: this.destinatarios,
                subject: "(!) AVISO: ServerMonitor SITEGIS",
                html: mensaje
            }
        }
        else if(tipo=='ERROR'){
            mail = {
                from: "procesosDBSite@epe.santafe.gov.ar",
                to: this.destinatarios,
                subject: "(!!) ALERTA! ServerMonitor SITEGIS",
                html: mensaje
            }
        }
        else if(tipo=='INFO'){
            mail = {
                from: "procesosDBSite@epe.santafe.gov.ar",
                to: this.destinatarios,
                subject: "(-) INFO: ServerMonitor SITEGIS",
                html: mensaje
            }
        }    
  
    
        transporter.sendMail(mail, function(err, info) {
            if (err) {
            console.log(err)
            } 
            else {
            //console.log(tipo,mensaje);
            alerta = false;
            }
        });
    }

}

//pool de alertas lanzadas
global.listadoAlertas = []

global.hardwareMonitor = []
/*
se agregan los servidores cuando se supera el limite de hardware definido. 
Cuando sucede N veces >= reiteraciones se dispara la alarma

global.hardwareMonitor[] = {
    ip: serverip,
    valores: {
        cpu: [],
        mem: [],
        dsk: [],
    }
*/


//PROCESO PRINCIPAL QUE CHECKEA TODAS LAS ALERTAS
async function monitorearAlerta(frecuencia) {

    //filtra una lista de servidores y devuelve solo los productivos ACTIVOS
    function filtrarProductivos(lista){
        var servidoresProductivos = [];
        //filtro los servidores productivos
        lista.forEach(server => { 
        
            if(server.rolservidor=='productivo'){
                servidoresProductivos.push(server);
            }
        });
        if(servidoresProductivos.length>0) { return(servidoresProductivos); }
        else { return false; }
    }

    //frecuencia en segundos
    ticker.schedule('*/' + frecuencia + ' * * * * *', () => {
        
        //se consulta la base de datos
        postgres.leerBD()
        .then((servidores) => {
            if(servidores && servidores.length>0){
                let servidoresProductivos = filtrarProductivos(servidores);

                //checkeamos si los servidores estan funcionando o si estan ejecutando el script del lado servidor
                let datetime = Datetime.getDateTime(new Date());
                monitorearEstadoServidores(servidores, datetime)
                .then(estado => {   
                    //si las alertas estan activas en la config 
                    if(global.reglasAlerta.activa===true){             
                        let alerta = new Alerta(estado,null,false,"WARNING",global.reglasAlerta.hardware.destinatarios)
                        setTimeout(() => { delete alerta; }, 5000);
                     }
                })

                // ------- ALERTAS ON / OFF ----------
                if(global.reglasAlerta.activa===true){

                    //checkeamos todos los appservers para verificar ausencias y sobrepoblacion de componentes
                    if(global.reglasAlerta.componentes.alerta===true && servidoresProductivos!=false){ 
                        //si la alerta esta activa
                        let indice = global.listadoAlertas.findIndex(alerta => alerta.nombre === 'alertaProductivos');
                        
                        monitorearMinimosApps(servidoresProductivos)
                        .then((productivos)=>{
                            //si no existe la alerta en el pool de alertas se crea
                            if(indice==-1){
                                global.listadoAlertas.push({
                                    nombre: 'alertaProductivos',
                                    alerta: new Alerta(productivos,null,false,"ERROR",global.reglasAlerta.componentes.destinatarios) 
                                    });
                            }
                        })
                        .catch(()=> { 
                            if(indice!=-1){ 
                                //splice devuelve el objeto alarma, y se llama al metodo desactivar() y se desreferencia
                                (global.listadoAlertas.splice(indice,1)[0])['alerta'].desactivar();
                                
                                let mensaje = "<li style='color: green;'> Se han satisfecho todos los <b>Servidores PRODUCTIVOS</b> minimos necesarios</li>";
                                let alerta = new Alerta(mensaje,null,false,"INFO",global.reglasAlerta.componentes.destinatarios)
                                setTimeout(() => { delete alerta; }, 5000);
                            }
                        })
                        
                        //componentes appserver
                        monitorearComponentes(servidoresProductivos)
                        .then((componentes)=>{
                            //si no existe la alerta en el pool de alertas se crea
                            if(!global.listadoAlertas.find(alerta => alerta.nombre === 'alertaComponentes')){
                                global.listadoAlertas.push({
                                    nombre: 'alertaComponentes',
                                    alerta: new Alerta(componentes,null,false,"ERROR",global.reglasAlerta.componentes.destinatarios) 
                                    // creo una alerta que se repite cada 60 minutos
                                    });
                            }
                        })
                        .catch(()=> { 
                            //si la alerta esta activa
                            let indice = global.listadoAlertas.findIndex(alerta => alerta.nombre === 'alertaComponentes');
                            if(indice!=-1){ 
                                //splice devuelve el objeto alarma, y se llama al metodo desactivar() y se desreferencia
                                (global.listadoAlertas.splice(indice,1)[0])['alerta'].desactivar();
                                
                                let mensaje = "<li style='color: green;'> Se han restablecido todos los <b>componentes</b> en los AppServers productivos</li>";
                                let alerta = new Alerta(mensaje,null,false,"INFO",global.reglasAlerta.componentes.destinatarios)
                                setTimeout(() => { delete alerta; }, 5000);
                            }
                        })
                    }

                    //checkeamos alertas de hardware (CPU, MEM, DISK) si algun contador llega al valor "reiteraciones" dispara la alerta
                    if(global.reglasAlerta.hardware.alerta===true && servidoresProductivos!=false){
                        llenarTablahardwareMonitor(servidoresProductivos);
    
                       global.hardwareMonitor.forEach(srv=> {
                            let cuerpo = '';
                            let alertaEncontrada = false;
                            if(srv.valores.cpu==global.reglasAlerta.hardware.reiteraciones){
                                cuerpo += "<li style='color: red;'> el <b>CPU</b> del servidor <b>"+srv.ip+"</b> supero el "+global.reglasAlerta.hardware.maxCPU+"%</li>";
                                alertaEncontrada = true;
                            }
                            if(srv.valores.mem==global.reglasAlerta.hardware.reiteraciones){
                                cuerpo += "<li style='color: red;'> la <b>MEMORIA</b> del servidor <b>"+srv.ip+"</b> supero el "+global.reglasAlerta.hardware.maxMEM+"%</li>";
                                alertaEncontrada = true;
                            }
                            if(srv.valores.dsk==global.reglasAlerta.hardware.reiteraciones){
                                cuerpo += "<li style='color: red;'> el <b>DISCO</b> del servidor <b>"+srv.ip+"</b> supero el "+global.reglasAlerta.hardware.maxDSK+"%</li>";
                                alertaEncontrada = true;
                            }
                            if(alertaEncontrada){
                                let alerta = new Alerta(cuerpo,null,false,"WARNING",global.reglasAlerta.hardware.destinatarios)
                                setTimeout(() => { delete alerta; }, 5000);
                            }
                            
                        })
    
    
                    }                    
                    
                    //checkeamos ultima maniobra SCADA
                    if(global.reglasAlerta.scada.alerta===true){ 
                        oracle.consultaEstadoSCADA()
                        .then(res=>{
                            
                                let indice = global.listadoAlertas.findIndex(alerta => alerta.nombre === 'alertaScadaVencido');
                                //si no existe el alerta en el pool se lanza el alerta SCADA
                                if(res['SCADAN'] > global.reglasAlerta.scada.expirationTimeScada && indice==-1){
                                    let mensaje = "<li style='color: red;'> Tiempo ultima maniobra <b>SCADA</b> vencido</li>";
                                    global.listadoAlertas.push({
                                        nombre: 'alertaScadaVencido',
                                        alerta: new Alerta(mensaje,null,false,"ERROR",global.reglasAlerta.scada.destinatarios)
                                        });
                                }
                                //restaura el alerta SCADA
                                else if(res['SCADAN'] > global.reglasAlerta.scada.expirationTimeScada && indice!=-1){
                                    //splice devuelve el objeto alarma, y se llama al metodo desactivar() y se desreferencia
                                    (global.listadoAlertas.splice(indice,1)[0])['alerta'].desactivar();
                                    
                                    let mensaje = "<li style='color: green;'> Tiempo ultima maniobra <b>SCADA</b> restablecido</li>";
                                    let alerta = new Alerta(mensaje,null,false,"INFO",global.reglasAlerta.scada.destinatarios)
                                    setTimeout(() => { delete alerta; }, 5000);   
                                } 
    
                                indice = global.listadoAlertas.findIndex(alerta => alerta.nombre === 'alertaScadaCertaVencido');
                                //lanza el alerta SCADA (CERTA)
                                if(res['SCADAC'] > global.reglasAlerta.scada.expirationTimeScadaCerta && indice==-1){        
                                    let mensaje = "<li style='color: red;'> Tiempo ultima maniobra <b>SCADA (componente CERTA)</b> vencido</li>";
                                    global.listadoAlertas.push({
                                        nombre: 'alertaScadaCertaVencido',
                                        alerta: new Alerta(mensaje,null,false,"ERROR",global.reglasAlerta.scada.destinatarios)
                                        });
                                } 
                                //restaura el alerta SCADA (CERTA)
                                else if(res['SCADAC'] > global.reglasAlerta.scada.expirationTimeScadaCerta && indice!=-1){
                                    //splice devuelve el objeto alarma, y se llama al metodo desactivar() y se desreferencia
                                    (global.listadoAlertas.splice(indice,1)[0])['alerta'].desactivar();
                                    
                                    let mensaje = "<li style='color: green;'> Tiempo ultima maniobra <b>SCADA (componente CERTA)</b> restablecido</li>";
                                    let alerta = new Alerta(mensaje,null,false,"INFO",global.reglasAlerta.scada.destinatarios)
                                    setTimeout(() => { delete alerta; }, 5000);   
    
                            }
                        })
                        .catch(err=>{
                            console.error(err);
                        })
                    }
    
                    //checkeamos SGT
                    if(global.reglasAlerta.sgt.alerta===true){
                        oracle.consultaEstadoSGT()
                        .then(res=>{
                            let indice = global.listadoAlertas.findIndex(alerta => alerta.nombre === 'alertaSGT');
                            
                            //si el valor supera el valor de referencia y no existe el alerta la creo
                            if(res>global.reglasAlerta.sgt.max && indice==-1){
                                let mensaje = "<li style='color: red;'> Componente <b>SGT</b> desactivado</li>";
                                global.listadoAlertas.push({
                                    nombre: 'alertaSGT',
                                    alerta: new Alerta(mensaje,null,false,"ERROR",global.reglasAlerta.sgt.destinatarios)
                                    });
                            }
                            //restaura el alerta
                            else if(res<=global.reglasAlerta.sgt.max && indice!=-1){
                                //splice devuelve el objeto alarma, y se llama al metodo desactivar() y se desreferencia
                                (global.listadoAlertas.splice(indice,1)[0])['alerta'].desactivar();
                                
                                let mensaje = "<li style='color: green;'> Componente <b>SGT</b> restablecido</li>";
                                let alerta = new Alerta(mensaje,null,false,"INFO",global.reglasAlerta.sgt.destinatarios)
                                setTimeout(() => { delete alerta; }, 5000);   
                            } 
                        })
                        .catch(err=>{
                            console.error(err);
                        })                        
                    }
    
                    //checkeamos AfectacionesAT
                    if(global.reglasAlerta.afectacionesAT.alerta===true){
                        oracle.consultaAfectacionesAT()
                        .then(res=>{
                                let indice = global.listadoAlertas.findIndex(alerta => alerta.nombre === 'alertaAfectacionAT');
                                
                                //si hay documentosAT con afectaciones y no existe el alerta la creo
                                if(res>0 && indice==-1){
                                    let mensaje = "<li style='color: red;'> Existen documentos en <b>Alta Tension con afectaciones</b></li>";
                                    global.listadoAlertas.push({
                                        nombre: 'alertaAfectacionAT',
                                        alerta: new Alerta(mensaje,null,false,"WARNING",global.reglasAlerta.afectacionesAT.destinatarios)
                                        });
                                }
                                //si no hay documentos AT con afectaciones pero existia un alerta, avisa que se restablecio y borra el alerta
                                else if(res==0 && indice!=-1){
                                    //splice devuelve el objeto alerta, se llama al metodo desactivar() y luego se desreferencia
                                    (global.listadoAlertas.splice(indice,1)[0])['alerta'].desactivar();
                                    
                                    let mensaje = "<li style='color: green;'> documentos en <b>Alta Tension con afectaciones</b> restablecido</li>";
                                    let alerta = new Alerta(mensaje,null,false,"INFO",global.reglasAlerta.afectacionesAT.destinatarios)
                                    setTimeout(() => { delete alerta; }, 5000);   
                                } 
    
                        })
                        .catch(err=>{
                            console.error(err);
                        })                        
                    }
    
                    //checkeamos la ultima actualizacion de KPI
                    if(global.reglasAlerta.kpi.alerta===true){
                        oracle.consultaEstadoKPI()
                        .then(res=>{
                            let indice = global.listadoAlertas.findIndex(alerta => alerta.nombre === 'alertaKPI');

                            //si paso mas tiempo que el definido desde el ultimo ingreso de KPI
                            if(res>global.reglasAlerta.kpi.expirationTimekpi && indice==-1){
                                
                                let mensaje = "<li style='color: red;'> La aplicacion <b>KPI</b> dejo de funcionar </li>";
                                global.listadoAlertas.push({
                                    nombre: 'alertaKPI',
                                    alerta: new Alerta(mensaje,null,false,"WARNING",global.reglasAlerta.kpi.destinatarios)
                                    });
                            }
                            //si existia un alerta pero el ultimo ingreso de KPI esta dentro de los parametros, avisa que se restablecio y borra el alerta
                            else if(res<=global.reglasAlerta.kpi.expirationTimekpi && indice!=-1){
                                //splice devuelve el objeto alarma, y se llama al metodo desactivar() y se desreferencia
                                (global.listadoAlertas.splice(indice,1)[0])['alerta'].desactivar();
                                
                                let mensaje = "<li style='color: green;'> La aplicacion <b>KPI</b> se restablecio </li>";
                                let alerta = new Alerta(mensaje,null,false,"INFO",global.reglasAlerta.kpi.destinatarios)
                                setTimeout(() => { delete alerta; }, 5000); 
                            } 
                        })
                        .catch(err=>{
                            console.error(err);
                        })                        
                    }
                
                }
                
            }          
        })

    });

}

//si una app (cromo/appserver) se detiene se envia un mail dando aviso
function alertarCierreAplicacion(server){
    let cuerpo = ""; 
    if(server.tiposervidor_id==2){  cuerpo += "<li style='color: red;'> El <b>Appserver</b> en el servidor <b>" + server.serverhostname + "</b> (" + server.serverip + ") dejo de funcionar </li>"; }
    else if(server.tiposervidor_id==3){  cuerpo += "<li style='color: red;'> El <b>CromoServer</b> en el servidor <b>" + server.serverhostname + "</b> (" + server.serverip + ") dejo de funcionar </li>"; }
    
    let alerta = new Alerta(cuerpo,null,false,"ERROR",global.reglasAlerta.componentes.destinatarios);
    setTimeout(() => { delete alerta; }, 5000);
}

//si una app (cromo/appserver) estaba apagada y se restaura se envia un mail dando aviso
function alertarRestauracionAplicacion(server){
    let cuerpo = ""; 
    if(server.tiposervidor_id==2){  cuerpo += "<li style='color: green;'> Se restauro el <b>Appserver</b> en el servidor <b>" + server.serverhostname + "</b> (" + server.serverip + ") </li>"; }
    else if(server.tiposervidor_id==3){  cuerpo += "<li style='color: green;'> Se restauro el <b>CromoServer</b> en el servidor <b>" + server.serverhostname + "</b> (" + server.serverip + ") </li>"; }
    
    let alerta = new Alerta(cuerpo,null,false,"INFO", global.reglasAlerta.componentes.destinatarios)
    setTimeout(() => { delete alerta; }, 5000);
}

//revisa los componentes de los appservers y si se da algunas de las condiciones de sobrepoblacion o ausencia retorna el mensaje para enviar por mail
function monitorearComponentes(appserversProductivos){
    return new Promise((resolve) => {
        const minimoSCADA = global.reglasAlerta.componentes.scada.min;
        const maximoSCADA = global.reglasAlerta.componentes.scada.max;
        const minimoNBM = global.reglasAlerta.componentes.nbm.min;
        const maximoNBM = global.reglasAlerta.componentes.nbm.max;
        const minimoAGATHA = global.reglasAlerta.componentes.agatha.min;
        const maximoAGATHA = global.reglasAlerta.componentes.agatha.max;
        const minimoKPI = global.reglasAlerta.componentes.kpi.min;
        const maximoKPI = global.reglasAlerta.componentes.kpi.max;        

        //devuelve un arreglo con los hostname de los servidores que poseen el componente activo especificado 
        function listarComponente(componente){
            
            let resultado = [];
            Object.values(appserversProductivos).forEach(server => { 
                if(server.tiposervidor_id==2 && server.estado==true && server[componente]=='SI'){resultado.push(server.serverhostname);}
            });
            return resultado;
        }
        /*
        console.log("---------- Componentes en Produccion -------------")
        console.log("SCADA: " + listarComponente('estadoscada').length);
        console.log("NBM:" +listarComponente('estadonbm').length);
        console.log("AGATHA:" +listarComponente('estadoomsagatha').length);
        console.log("TCA:" +listarComponente('estadotca').length);   
        */
        let alerta = false;

        let mensaje = "<ul>"

        //SCADA:
        if(listarComponente('estadoscada').length < minimoSCADA) { 
            mensaje +="<li style='color: red;'> No hay ningun componente <b>SCADA</b> activo en los appservers</li>"; 
            alerta = true;
        }
        if(listarComponente('estadoscada').length > maximoSCADA) { 
            mensaje +="<li style='color: red;'> Hay mas de un appserver con el componente <b>SCADA</b> activo <ol>"; 
            listarComponente('estadoscada').forEach(server => {mensaje +="<li style='color: black;'> "+ server +" </li>"; } );
            mensaje +="</ol></li>";
            alerta = true;        
        }

        //NBM
        if(listarComponente('estadonbm').length < minimoNBM) { 
            mensaje +="<li style='color: red;'> No hay ningun componente <b>NBM</b> activo en los appservers</li>";
            alerta = true; 
        };
        if(listarComponente('estadonbm').length > maximoNBM) { 
            mensaje +="<li style='color: red;'> Hay mas de un appserver con el componente <b>NBM</b> activo <ol>"; 
            listarComponente('estadonbm').forEach(server => {mensaje +="<li style='color: black;'> "+ server +" </li>"; } )
            mensaje +="</ol></li>";  
            alerta = true;      
        }

        //AGATHA
        if(listarComponente('estadoomsagatha').length < minimoAGATHA) { 
            mensaje +="<li style='color: red;'> No hay ningun componente <b>AGATHA</b> activo en los appservers</li>";
            alerta = true; 
        };
        if(listarComponente('estadoomsagatha').length > maximoAGATHA) { 
            mensaje +="<li style='color: red;'> Hay mas de un appserver con el componente <b>AGATHA</b> activo <ol>"; 
            listarComponente('estadoomsagatha').forEach(server => {mensaje +="<li style='color: black;'> "+ server +" </li>"; } )
            mensaje +="</ol></li>" 
            alerta = true;       
        };

        //KPI:
        if(listarComponente('estadokpi').length < minimoKPI) { 
            mensaje +="<li style='color: red;'> No hay ningun componente <b>KPI Mobile</b> activo en los appservers</li>"; 
            alerta = true;
        }
        if(listarComponente('estadokpi').length > maximoKPI) { 
            mensaje +="<li style='color: red;'> Hay mas de un appserver con el componente <b>KPI Mobile</b> activo <ol>"; 
            listarComponente('estadokpi').forEach(server => {mensaje +="<li style='color: black;'> "+ server +" </li>"; } );
            mensaje +="</ol></li>";
            alerta = true;        
        };
        
        mensaje += "</ul>"

        if(alerta){resolve(mensaje)}
        else{reject(false);}
    })
}

//Revisa la lista de servidores y verifica que haya un minimo de CROMO, APPSERVERS y DATABASE productivos
function monitorearMinimosApps(servidoresProductivos){
    return new Promise((resolve) => {
        const minimoCROMO = global.reglasAlerta.componentes.cromoServer.min;
        const minimoAPPSERVER = global.reglasAlerta.componentes.appServer.min;
        const minimoDATABASE = global.reglasAlerta.componentes.databaseServer.min;

        function listarTipoServer(tipo){
            let resultado = [];
            Object.values(servidoresProductivos).forEach(server => { 
                if(server.tiposervidor_id==tipo && server.estado==true){resultado.push(server.serverhostname);}
            });
            return resultado;            
        }

        let alerta = false;

        // TIPO: se define al ejecutar el script del lado servidor --> 1 = generico ; 2 = appserver ; 3 = cromo ; 4 = database

        //APPSERVERS
        let appservers = listarTipoServer(2);
        if(appservers.length<minimoAPPSERVER){
            mensaje +="<li style='color: red;'> No se cumple la cantidad minima de servidores <b>APPSERVER</b> productivos activos. (Minimo "+ minimoAPPSERVER +") </li><ul>"; 
            appservers.forEach(srv => { mensaje +="<li style='color: black;'>" + srv +"</li> " })
            mensaje +="</ul>";
            alerta = true;
        }

        //CROMO
        let cromoservers = listarTipoServer(3);
        if(cromoservers.length<minimoCROMO){
            mensaje +="<li style='color: red;'> No se cumple la cantidad minima de servidores <b>CROMO</b> productivos activos. (Minimo "+ minimoCROMO +") </li><ul>"; 
            cromoservers.forEach(srv => { mensaje +="<li style='color: black;'> " + srv +" </li> " })
            mensaje +="</ul>";
            alerta = true;
        }

        //DATABASE
        let dbservers = listarTipoServer(4)
        if(dbservers.length<minimoDATABASE){
            mensaje +="<li style='color: red;'> No se cumple la cantidad minima de servidores <b>BASE DE DATOS</b> productivos activos. (Minimo "+ minimoDATABASE +") </li><ul>"; 
            dbservers.forEach(srv => { mensaje +="<li style='color: black;'> " + srv +" </li> " })
            mensaje +="</ul>";
            alerta = true;
        }

        if(alerta){resolve(mensaje)}
        else{reject(false);}
    });
}

//revisa los servidores productivos y llena la tabla hardware.Monitor con contadores agrupados x IP
function llenarTablahardwareMonitor(servidoresProductivos){
    const maxCPU = global.reglasAlerta.hardware.maxCPU;
    const maxMEM = global.reglasAlerta.hardware.maxMEM;
    const maxDSK = global.reglasAlerta.hardware.maxDSK;

    servidoresProductivos.forEach(srv => {
        
        //Busco el indice
        let indice = global.hardwareMonitor.findIndex(s => s.ip === srv.serverip);

        //------------------------------------ CPU -------------------------------------------
        
        //si sobrepasa el valor maximo
        if(srv.servercpu>maxCPU){
            //si existe el servidor en la tabla
            if(indice!=-1){
                //si existe el atributo se incrementa, sino se agrega el valor al objeto
                if(global.hardwareMonitor[indice].valores.cpu) {global.hardwareMonitor[indice].valores.cpu++;}
                else{global.hardwareMonitor[indice].valores.cpu=1;}
            }
            //si no existe el servidor en la tabla se agrega
            else{
               global.hardwareMonitor.push({
                    ip: srv.serverip,
                    valores: {
                        cpu: 1
                    }
                })
            }
        }      
        //si no sobrepaso el valor maximo lo reseteamos (o borramos si es el unico atributo)
        else{
            //si existe en la tabla
            if(indice!=-1){
                //si existe el valor y los demas valores son nulos borramos el servidor
                if(global.hardwareMonitor[indice].valores.cpu && !global.hardwareMonitor[indice].valores.mem && !global.hardwareMonitor[indice].valores.dsk){
                   global.hardwareMonitor.splice(indice,1);
                   //buscamos el indice nuevamente
                   indice = global.hardwareMonitor.findIndex(s => s.ip === srv.serverip);
                }
                else if(global.hardwareMonitor[indice].valores.cpu){
                   global.hardwareMonitor[indice].valores.cpu--;
                }
            }
        }       

        //------------------------------------ MEM -------------------------------------------
        if(srv.servermem>maxMEM){
            if(indice!=-1){
                if(global.hardwareMonitor[indice].valores.mem) {global.hardwareMonitor[indice].valores.mem++;}
                else{global.hardwareMonitor[indice].valores.mem=1;}
            }
            else{
               global.hardwareMonitor.push({
                    ip: srv.serverip,
                    valores: {
                        mem: 1
                    }
                })
            }
        }                    
        else{
            if(indice!=-1){
                if(global.hardwareMonitor[indice].valores.mem && !global.hardwareMonitor[indice].valores.cpu && !global.hardwareMonitor[indice].valores.dsk){
                   global.hardwareMonitor.splice(indice,1);
                   indice = global.hardwareMonitor.findIndex(s => s.ip === srv.serverip);
                }
                else if(global.hardwareMonitor[indice].valores.mem){
                   global.hardwareMonitor[indice].valores.mem--;
                }
            }
        }   
        
        
        //------------------------------------ DISCO -------------------------------------------
        if(srv.serverdisco>maxDSK){
            if(indice!=-1){
                if(global.hardwareMonitor[indice].valores.dsk) {global.hardwareMonitor[indice].valores.dsk++;}
                else{global.hardwareMonitor[indice].valores.dsk=1;}
            }
            else{
               global.hardwareMonitor.push({
                    ip: srv.serverip,
                    valores: {
                        dsk: 1
                    }
                })
            }
        }                    
        else{
            if(indice!=-1){
                if(global.hardwareMonitor[indice].valores.dsk && !global.hardwareMonitor[indice].valores.cpu && !global.hardwareMonitor[indice].valores.mem){
                   global.hardwareMonitor.splice(indice,1);
                }
                else if(global.hardwareMonitor[indice].valores.dsk){
                   global.hardwareMonitor[indice].valores.dsk--;
                }
            }
        }                        

    })
}

//recorre la lista de servidores y se llama a la funcion socket.estadoServidor para enviar un ping y leer la respuesta de cada uno
async function monitorearEstadoServidores(servidores, datetime) {
    return new Promise((resolve) => {
        let mensaje = '';
        //por cada servidor:
        //console.log(datetime.fecha+ " | " +datetime.hora+  " ------> PING:");
        servidores.forEach(server => {
            let msj;
            //console.log(server.serverip);

            //llama a la funcion estadoServidor
            sockets.estadoServidor(global.gConfig.socketPort,server)      
            
            //si esta online
            .then(() => {
                //console.log('     * ' + server.serverip + '(' + server.rolservidor +'): ALIVE');
                //si estaba offline y ahora esta online
                if(server.estado==false){
                    msj = {'serverip':server.serverip,'estado': true};
                    //guarda el estado actual del servidor en la BD
                    postgres.escribirBD(msj,true);
                    //envia un mensaje a los clientes para que actualicen los datos
                    global.socketio.emit('updateServer',msj);
                }
            })       
            
            //si no esta online
            .catch(() => {
                //console.log('     * ' + server.serverip + '(' + server.rolservidor +'): MUERTO');
                postgres.leerLogs()
                .then(logs => {
                    const ultimoLogin = logs.find(server => server.serverip === server.serverip).estado;
                    const unDia = 24 * 60 * 60 * 1000; // 24 hs en milisegundos
                    
                    //si paso mas de un dia se borra de la base de datos
                    if(Math.round(Math.abs(Date.now()-Date.parse(ultimoLogin))/unDia) > 0) {
                        postgres.eliminarServidorBD(server.serverip)
                        .then(msj => {
                        //se envia aviso a los clientes para que borren el servidor de la lista
                        global.socketio.emit('eliminarServidor',server.serverip);
                        //se elimina de la lista global de servidores              
                        servidores.splice(servidores.findIndex((r) => r.serverip === server.serverip),1);
                        global.listaServidores = servidores;
                        })
                    }
                    
                    //cuando no paso un dia offline
                    else{ 
                        //si es productivo
                        if(server.rolservidor=='productivo'){ 
                            //si el estado del servidore ERA true y ahora ya no, envia una alerta.
                            if(server.estado==true){
                                mensaje += "<li style='color: red;'> El servidor <b>" + server.serverhostname + "</b> (" + server.serverip + ") dejo de funcionar</li>"
                                
                                msj = {'serverip':server.serverip,'estado': false};
                                //guarda el estado actual del servidor en la BD (sin updatetime)
                                postgres.escribirBD(msj,false);
                                //envia un mensaje a los clientes para que actualicen los datos
                                global.socketio.emit('updateServer',msj);
                                //se guarda en global.listaServidores
                                global.listaServidores.find((srv) => srv.serverip == server.serverip).estado = false;    
                                //retorna el parrafo del mensaje
                                resolve(mensaje);
                            }
                        }   
                        //Si es servidor desarrollo
                        else{
                            if(server.estado==true){
                                msj = {'serverip':server.serverip,'estado': false};
                                //guarda el estado actual del servidor en la BD (sin updatetime)
                                postgres.escribirBD(msj,false);
                                //envia un mensaje a los clientes para que actualicen los datos
                                global.socketio.emit('updateServer',msj);
                                //se guarda en global.listaServidores
                                global.listaServidores.find((srv) => srv.serverip == server.serverip).estado = false;
                            }
                        }
                    }
                })
            })
        });
    });
}



module.exports = { monitorearAlerta, alertarCierreAplicacion, alertarRestauracionAplicacion }