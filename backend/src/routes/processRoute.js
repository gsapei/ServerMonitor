var express = require("express");
var router = express.Router();
const errors = require("throw.js");
const tokenValidator = require("../middleware/validators/tokenValidator");
const requestValidator = require("../middleware/validators/requestValidator");
const { validationResult } = require('express-validator');
const postgres = require('../controllers/postgres.js');
const sockets = require('../controllers/sockets.js');
const alertas = require('../controllers/alertas.js');
const Datetime = require('../middleware/helpers/datetime.js');
const axios = require('axios');

//Mensajes de actualizacion enviados por el ServersideScript
router.post('/serverMonitor', async (req, res) => {
   //console.log(req.body)
   
   //si las alertas estan activas en la config
   if(global.reglasAlerta.activa===true){
      //----- CHECKEO POR CAMBIOS DE ESTADO EN LAS APP PRODUCTIVAS ----
      //si hay servidores en la lista local
      if(global.listaServidores && global.listaServidores.length>0){
         //buscamos el servidor en la lista local
         const temp = global.listaServidores.find((server) => server.serverip == req.body.serverip);
         //si el servidor existe en el listado y es productivo
         if(temp && temp.rolservidor=='productivo'){

            //se verifica si el appserver/cromoserver dejaron de funcionar
            if(req.body.appserverestado==='DOWN' || req.body.cromoalive==='NO'){
               //si es appserver
               if(temp.tiposervidor_id==2){
                  //si se apago se envia alerta
                  if(temp.appserverestado === 'UP' && req.body.appserverestado==='DOWN'){
                     alertas.alertarCierreAplicacion(temp);
                  }
               }
               //si es cromoserver productivo
               else if(temp.tiposervidor_id==3){ 
                  //si se apago se envia alerta
                  if(temp.cromoalive === 'SI' && req.body.cromoalive==='NO'){
                     alertas.alertarCierreAplicacion(temp);
                  }         
               }
            }
            //si el appserver/cromoserver se restablecieron de un corte se alerta
            if(req.body.appserverestado==='UP' || req.body.cromoalive==='SI'){
               //si es appserver
               if(temp.tiposervidor_id==2){
                  //si estaba apagado y se restauro se alerta
                  if(temp.appserverestado === 'DOWN' && req.body.appserverestado==='UP'){
                     alertas.alertarRestauracionAplicacion(temp);
                  }
               }
               //si es cromoserver productivo
               else if(temp.tiposervidor_id==3){ 
                  //si estaba apagado y se restauro se alerta
                  if(temp.cromoalive === 'NO' && req.body.cromoalive==='SI'){
                     alertas.alertarRestauracionAplicacion(temp);
                  }         
               }
            }   
         }
      
      }
   }
   
   //se escribe el mensaje recibido en la base de datos
   postgres.escribirBD(req.body,true)
   .then(() => {
         res.send('Recibido OK');
         postgres.leerBD()
         .then(servidores => {
            //actualizo los datos de la variable global
            global.listaServidores=servidores;
            //si se pudo leer los servidores se leen sus logs
            postgres.leerLogs()
            .then(logs => {
               global.listaLogs=logs;
               //console.log(req.body);
            })
            .catch(err => {console.log(err);})
         })
         .catch(err => {
            console.log(err);
         });
      })
   .then(()=>{
      //se envia un mensaje a los clientes con el json que llego por POST para que actualicen el dato
      global.socketio.emit('updateServer',req.body);
   })
   .catch(() =>{
      res.send('Error al actualizar la base de datos');
   })
   
});

//Mensajes de actualizacion de componentes enviados por el cliente
router.post('/serverMonitor/intermediar', tokenValidator.verifyToken, async (req, respuesta)  => {
   let grants = req.body.grants;
   const permission = grants.can(req.body.role).createAny("server");
   if (permission.granted) {
      let server = req.body.servidor;
      let datetime = Datetime.getDateTime(new Date());

      //Se muestra el log en consola
      console.log(datetime.fecha+ " | " +datetime.hora+ " ------> El usuario "+ req.body.usuario.toUpperCase() +" ejecuto el comando "+ req.body.comando.toUpperCase() + " en el servidor " +server);
      
      //se agrega al registro de eventos en la base de datos
      postgres.escribirEvento(req.body.usuario,'INFO'," Ejecuto el comando <b>"+ req.body.comando.toUpperCase() + "</b> en el servidor <b>" +server+ "</b>")
      .then(()=>{
         global.socketio.emit('updateEventos');
      })

      //cambio comandoenejecucion del servidor por true para deshabilitar los botones en la tarjeta del frontend
      global.listaEjecuciones.push({serverip: server});
      global.socketio.emit('updateServer',{serverip: server, comandoenejecucion: true});
      let msj = JSON.stringify({"comando":req.body.comando,"usuario":req.body.usuario});

      //ENVIAR comando a ServerSide-Script mediante SOCKET
      sockets.enviarComandoServidor(global.gConfig.socketPort,server,msj)
      .then(res => {
         let datetime = Datetime.getDateTime(new Date());
         //elimino el ip del servidor del arreglo
         let i = global.listaEjecuciones.findIndex(s => s.serverip == server)
         global.listaEjecuciones.splice(i,1);
         global.socketio.emit('updateServer',{serverip: server, comandoenejecucion: false});
         global.socketio.emit('updateServer',req.body);

         //Se muestra el log en consola
         if(res!='ERROR'){
            console.log(datetime.fecha+ " | " +datetime.hora+ " ------> El comando "+ req.body.comando.toUpperCase() + " se ejecuto correctamente en el servidor " +server);
            //se agrega al registro de eventos en la base de datos
            postgres.escribirEvento('ServerMonitor','INFO',"El comando <b>"+ req.body.comando.toUpperCase() + "</b> se ejecuto correctamente en el servidor <b>" +server+ "</b>")
            .then(()=>{
               global.socketio.emit('updateEventos');
            })
         }
         else{
            console.log(datetime.fecha+ " | " +datetime.hora+ " ------> El comando "+ req.body.comando.toUpperCase() + " no se pudo ejecutar correctamente en el servidor " +server);
         }

         respuesta.status(200).send(res);
      })
      .catch(err => {
         //console.log(err)
      })     
   }
});

//Verifica las credenciales enviadas por el cliente y le devuelve un token si es correcto
router.post('/serverMonitor/login', requestValidator.validateLoginRequest(), async (req, res, next)  => {
   const result = validationResult(req);
   if (result.isEmpty()){
      try {
         const data = JSON.stringify(req.body);
         const options = {
           method: "POST",
           headers: { "content-type": "application/json" },
           data: data,
           url: 'https://' + global.gConfig.authServer + ':' + global.gConfig.authPort + global.gConfig.authPath,
         };
         axios(options)
           .then(function (response) {
               res.status(200).send(response.data);
           })
           .catch(function (err) {
               console.log(err)
               res.status(401).send(err.response.data);
           });
       } catch (err) {
         res.status(500).send(err.message);
       }
   }
   else{
      res.status(500).send(result.errors);
   }
});

//Presenta mediante API los permisos de ejecucion de usuarios
router.get("/serverMonitor/canExecute", tokenValidator.verifyToken, async (req, res, next) => {
   let grants = req.body.grants;
   const permission = grants.can(req.body.role).createAny("server");
   if (permission.granted) {
      res.status(200).send(permission.granted);
   } 
   else {
   // resource is forbidden for this user/role
   next(new errors.Forbidden("Sin permiso de acceso al recurso Server"));
   }
});

//Presenta mediante API la lista de servidores
router.get("/serverMonitor/status", tokenValidator.verifyToken, async (req, res, next) => {
   let grants = req.body.grants;
   const permission = grants.can(req.body.role).readAny("server");
   if (permission.granted) {
      //si hay ejecuciones en progreso se adjuntan a cada servidor en la lista de servidores
      global.listaEjecuciones.forEach(server => {
         let i = global.listaServidores.findIndex(s => s.serverip == server.serverip)
         global.listaServidores[i].comandoenejecucion = true;
      });
      res.status(200).send(global.listaServidores);
   } 
   else {
   // resource is forbidden for this user/role
   next(new errors.Forbidden("Sin permiso de acceso al recurso Server"));
   }
});

//Presenta mediante API la lista de ultimas actualizaciones en los servidores
router.get("/serverMonitor/logs", tokenValidator.verifyToken, async (req, res, next) => {
   let grants = req.body.grants;
   const permission = grants.can(req.body.role).readAny("server");
   if (permission.granted) {
      res.status(200).send(global.listaLogs);
      //console.log(global.listaLogs);
   } 
   else {
   // resource is forbidden for this user/role
   next(new errors.Forbidden("Sin permiso de acceso al recurso Server"));
   }
});

//Presenta mediante API la lista de eventos de error y ejecucion en los servidores
router.get("/serverMonitor/eventos", tokenValidator.verifyToken, async (req, res, next) => {
   let grants = req.body.grants;
   const permission = grants.can(req.body.role).readAny("server");
   if (permission.granted) {
      postgres.leerEventos()
      .then(response=>{
         res.status(200).send(response);
      })
      .catch(err=> {res.status(400).send("ERROR al leer la base de datos")})    
   } 
   else {
   // resource is forbidden for this user/role
   next(new errors.Forbidden("Sin permiso de acceso al recurso Server"));
   }
});

//Presenta mediante API las reglas de alerta de componentes y servidores minimos
router.get("/serverMonitor/reglasAlerta", tokenValidator.verifyToken, async (req, res, next) => {
   let grants = req.body.grants;
   const permission = grants.can(req.body.role).readAny("server");
   if (permission.granted) {
         res.status(200).send(global.reglasAlerta.componentes);
   } 
   else {
   // resource is forbidden for this user/role
   next(new errors.Forbidden("Sin permiso de acceso al recurso Server"));
   }
});

module.exports = router;
