var express = require("express");
const errors = require("throw.js");
const helmet = require("helmet");
const Answer = require("./middleware/builders/answer");
const processRoute = require("./routes/processRoute");

var app = express();

const consultas = require('./controllers/postgres.js');
const alertas = require('./controllers/alertas.js');

//cuando se ejecuta un comando en un servidor se agrega el IP a esta lista
global.listaEjecuciones=new Array();

//leemos los datos de servidores de la base de datos y lo escribimos en la variable GLOBAL (global.listaServidores)
consultas.leerBD()
.then(respuesta => {
  //si se pudo leer los servidores se leen sus logs
  //console.log(respuesta)
  consultas.leerLogs()
  .then(res => {
    //console.log(res);
  })
  .catch(err => {console.log(err);})
})
.then( () => {
  //una vez se cargan las listas de servidores, se monitorea su estado (frecuencia en segundos, puerto de ping)
  console.log('[Frecuencia de ping]: ' + global.gConfig.frecuenciaPing + ' segundos');
  alertas.monitorearAlerta(global.gConfig.frecuenciaPing);
})
.catch(error => {
      console.log(error);
});

app.use(express.json()); //Used to parse JSON bodies
app.use(helmet());

// Add headers
app.use(function (req, res, next) {
  //res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, Content-Type, Authorization, X-Auth-Token"
  );
  res.setHeader("Access-Control-Allow-Credentials", false);
  res.setHeader("Content-Type", "application/json");

  //Handle Preflight
  if (req.method === "OPTIONS") {
    res.status(200).send();
  } else {
    next();
  }
});

// api
app.use("/site", processRoute);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new errors.NotFound();
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  let errors = err.errors
    ? err.errors
    : [
        {
          msg: err.message,
          param: "",
          location: "body",
        },
      ];
  res.status(err.statusCode || 500).json(new Answer().getWrongAnswer(errors));
});

console.log("Iniciando Servicio...");
console.log(`El servicio esta escuchando el puerto ${global.gConfig.port}.`);

module.exports = app;
