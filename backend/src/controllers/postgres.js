const {Client} = require('pg')
const format = require('pg-format');

//Conectamos a la BD Postgres
const cliente = new Client(global.postgresConn);
cliente.connect(err => {
    if (err) {
      console.error('[Error al conectarse a la base de datos postgres]', err.stack)
    } else {
      console.log('[Connectado exitosamente a la base de datos postgres]')
    }
})

//Funciones:
async function leerBD(){
    return new Promise((resolve, reject) => {
        const query = {
            text: 'SELECT * from servidores',
            rowMode: 'json',
        };
        cliente.query(query)
        .then(res => {
            resolve(res.rows);
        })
        .catch(e => {
            console.error(e.stack);
            reject('Error al leer la tabla servidores de la base de datos');
        })
    });
}

async function leerLogs(){
    return new Promise((resolve, reject) => {
        const query = {
            text: 'SELECT * from updatetime',
            rowMode: 'json',
        };
        cliente.query(query)
        .then(res => {
            resolve(res.rows);
        })
        .catch(e => {
            console.error(e.stack);
            reject('Error al leer la tabla UpdateTime de la base de datos');
        })
    });
}  

async function escribirBD(datos, loguear){  
    return new Promise((resolve, reject) => { 
        //atributos, valores y fechas: cadenas que se van concatenando con los datos que iran en la consulta dinamica
        let atributos = ''
        let valores = "'"
        let fechas = "'"
        
        let posicion = 0
        let total = Object.keys(datos).length
        
        for (const [key, value, index] of Object.entries(datos)) {
            atributos += key;
            valores += value;
            // para la tabla de logs se verifica que no se sobreescriba el ip
            if(key=='serverip' || key=='tiposervidor_id' || key=='rolservidor'){fechas+=value;}
            else{fechas+='now()'}
            posicion++;
            if(posicion<total){ atributos +=', '; valores +="', '"; fechas +="', '"; }
            else{ atributos +=''; valores +="'"; fechas +="'";
            }
        }

        //se arman las consultas completas con campos dinamicos
        const consultaServidores = format('INSERT INTO servidores(%s) VALUES(%s) ON CONFLICT(serverip) DO UPDATE SET(%s) = (%s)',atributos,valores,atributos,valores);
        const consultaUpdateTime = format('INSERT INTO updatetime(%s) VALUES(%s) ON CONFLICT(serverip) DO UPDATE SET(%s) = (%s)',atributos,fechas,atributos,fechas);
        
        //console.log(consultaServidores); //consulta explicita
        //console.log(consultaUpdateTime); //consulta explicita

        // se ejecuta la consulta servidores y se guarda el resultado bool
        cliente.query(consultaServidores)
        .then(res => {
            //si se ejecuta correctamente el insert/update se llama a la consulta que llena la tabla de logs
            if(loguear){ cliente.query(consultaUpdateTime).catch(err => {console.error(err.stack);}); }
            resolve(res);
            })
        .catch(err => {
            console.error(consultaServidores);
            reject(err.stack);
            })
        //se devuelve el resultado positivo si se llevo a cabo la transaccion
    });
}

//elimina el servidor en la base de datos (de las tablas servidores y updatetime)
async function eliminarServidorBD(serverip){
    const consultaServidores = format("DELETE from servidores WHERE serverip = '%s'",serverip);
    const consultaUpdateTime = format("DELETE from updatetime WHERE serverip = '%s'",serverip);
    //console.log(consultaServidores)
    resultado = await cliente.query(consultaServidores)
    .then( res => {
        cliente.query(consultaUpdateTime).catch(err => {console.error(err.stack);});
    })
    .catch( err => {
        console.error(err.stack)
        return false;
    })
}  

async function escribirEvento(usuario,tipo,mensaje){
    return new Promise((resolve, reject) => {
        // evento_tipo --> 1 = Info, 2 = Error, 3 = Warning
        let tipo_int;
        switch(tipo){
            case "INFO": tipo_int=1; break;
            case "ERROR": tipo_int=2; break;
            case "WARNING": tipo_int=3; break;
        }
        const consultaEventos = format('INSERT INTO eventos(evento_usuario,evento_tipo,evento_mensaje) VALUES(%L,%s,%L)',usuario,tipo_int,mensaje);
        // se ejecuta la consulta servidores y se guarda el resultado bool
        cliente.query(consultaEventos)
        .then(res => {
            resolve(res)
        })
        .catch(err => {
            reject(err.stack)
        })
    });
}

async function leerEventos(){
    return new Promise((resolve, reject) => {
        const query = {
            text: 'SELECT * from eventos',
            rowMode: 'json',
        };
        cliente.query(query)
        .then(res => {
            resolve(res.rows);
        })
        .catch(e => {
            console.error(e.stack);
            reject('Error al leer la tabla Eventos de la base de datos');
        })
    });
}  

module.exports = {
    escribirBD,
    eliminarServidorBD,
    leerLogs,
    leerBD,
    escribirEvento,
    leerEventos
}
