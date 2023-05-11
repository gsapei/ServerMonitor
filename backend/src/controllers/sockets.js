var net = require('net')
  
//envia un mensaje PING al servidor y retorna la respuesta
function estadoServidor(puerto,servidor) {
    return new Promise((resolve, reject) => {
      
      //cuando se conecta envia el msj 'ping'
      const cliente = net.connect(puerto, servidor.serverip, () => {
        cliente.write('ping')
      });
  
      //si recibe una respuesta la devuelve como resolve
      cliente.on('data', (data) => {
        let msj = data.toString();
        cliente.end();
        cliente.destroy();
        resolve(msj);
      });
  
      //si no se puede conectar se devuelve 'muerto' como reject
      cliente.on('error', () => {
        reject('muerto');
      });
  
    });
}
 
//envia una peticion http POST al ServerSide Script con { comando, usuario }
function enviarComandoServidor(puerto,servidor,mensaje){
    return new Promise((resolve, reject) => {
      
      //cuando se conecta envia el msj
      const cliente = net.connect(puerto, servidor, () => {
        cliente.write(mensaje)
      });

      //si recibe una respuesta la devuelve como resolve
      cliente.on('data', (data) => {
        let msj = data.toString();
        cliente.end();
        cliente.destroy();
        resolve(msj);
      });
  
      //si no se puede conectar se devuelve 'muerto' como reject
      cliente.on('error', (err) => {
        let msj = 'muerto'
        reject(msj)
      });
  
    });
}

module.exports = { estadoServidor, enviarComandoServidor };