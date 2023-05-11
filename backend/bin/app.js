#!/usr/bin/env node
process.title = "serverMonitor"; //identifica al proceso en ejecucion
// config variables
//const config =
require("../config/config");
const moment = require("moment");
moment.locale("es");
const logger = require("../config/winston-config");

var app = require("../src/server");
const https = require("https");
const fs = require('fs');

const Datetime = require('middleware/helpers/datetime.js');
let datetime = Datetime.getDateTime(new Date());
console.log(datetime)

app.set("port", global.gConfig.port);

/**
 * Create https server.
 */
var server = https.createServer(
  {
    cert: fs.readFileSync('cert/cert.pem'),
    key: fs.readFileSync('cert/cert.key'),
    ca: fs.readFileSync('cert/ca.pem'),
    passphrase: fs.readFileSync('cert/cert.pass', 'utf8')
  },
  app
  );
server.listen(global.gConfig.port);

server.on("error", onError);
server.on("listening", onListening);

global.socketio = require("socket.io")(server, {
  cors: {
    origin: '*',
  }
});

/*global.socketio.on('connection', function(socket) {
  socket.emit('msg', 'exito al conectarse');
});
*/
/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  switch (error.code) {
    case "EADDRINUSE":
      logger.error("Puerto " + global.gConfig.port + " actualmente en uso");
      process.exit(1);
      break;
    default:
      logger.error(error);
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : addr.port;
  logger.notice("[FSE - Backend]: ", global.gConfig.name);
  logger.notice(global.gConfig.description);
  logger.notice("Escuchando en puerto: " + bind);
  logger.notice("Entorno: " + global.gConfig.environment);
  logger.notice("Inicio: ", moment().local().format(global.gConfig.timeFormat));
}
