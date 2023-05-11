import { createStore } from 'vuex'
import axios from "axios";
import auth from './auth';
import createPersistedState from 'vuex-persistedstate';
import { serverURL } from 'boot/api'
global.URL = serverURL

export default createStore({
    state:{
      servidores: [],
      servidoresLogs: [],
      eventos: [],
      estadoMonitor: Boolean, //Si el backend esta funcionando
      listadoTarjeta: false, //Si los servidores se muestran como tarjetas o como tabla
      tableroAlertas: false, //Muestra el trablero
      alertaVigente: false, //Si verifica si hay un alerta periodicamente
      filtroServidores: { mostrarGenerico: true, mostrarAppserver: true, mostrarCromo: true, mostrarBD: true }, //opciones definidas al inicio
      ordenServidores: { columna: 'tiposervidor_id', orden: false }, //orde: true = descendiente | false = ascendente
      filtroRoles: { mostrarDesarrollo: true, mostrarProductivo: true }, //mostrar servidores por rol
      reglasAlerta: {}, //Se establecen las reglas para el tablero de alertas (obtenidas mediante GET al server)
      version: "v2.0"
    },
    mutations:{
      setFiltroServidores(state, payload){
        state.filtroServidores[payload.opcion] = payload.valor;
      },
      setOrdenServidores(state, payload){
        state.ordenServidores = payload;
      },
      setFiltroRoles(state, payload){
        state.filtroRoles[payload.rol] = payload.valor;
      },      
      setServidores(state, payload){
        if(!payload) {payload = []}
        state.servidores = payload;
      },
      agregarServidor(state, payload){
        let posicion = state.servidores.length // se agrega un nuevo servidor y se le asigna la ultima posicion
        payload.posicion = posicion;
        state.servidores.push(payload);
      },
      modificarServidor(state, payload){
        //remplazamos el objeto en la linea (payload.indice) por el objeto srv
        state.servidores.splice(payload.indice,1,payload.srv);

      },
      eliminarServidor(state,payload){
        state.servidores.splice(state.servidores.findIndex((r) => r.serverip === payload),1);
      },
      eliminarLog(state,payload){
        state.servidoresLogs.splice(state.servidoresLogs.findIndex((r) => r.serverip === payload),1);
      },
      agregarLog(state, payload){
        state.servidoresLogs.push(payload);
      },
      modificarLog(state, payload){
        //remplazamos el objeto en la linea (payload.indice) por el objeto modificado
        state.servidoresLogs.splice(payload.indice,1,payload.encontrado);
        //console.log('modificado log', state.servidoresLogs)
      },
      setServidoresLogs(state, payload){
        if(!payload) {payload = []}
        state.servidoresLogs = payload;
      },
      setEstadoMonitor(state, payload){
        state.estadoMonitor = payload;
      },
      setServerMonitor(state, payload){
        state.estadoMonitor = payload;
      },
      modificarPosicion(state, payload){
        let origen = state.servidores.findIndex((servidor => servidor.posicion == payload.origen));
        let destino = state.servidores.findIndex((servidor => servidor.posicion == payload.destino));
        state.servidores[origen].posicion = destino;
        state.servidores[destino].posicion = origen;
      },
      setTableroAlertas(state, payload){
        state.tableroAlertas = payload;
      },
      setAlertaVigente(state, payload){
        state.alertaVigente = payload;
      },
      setListadoTarjeta(state, payload){
        state.listadoTarjeta = payload
      },
      setEventos(state, payload){
        state.eventos = payload
      },
      setReglasAlerta(state, payload){
        state.reglasAlerta = payload;
      },      
    },
    actions: {
      async getServers({commit, dispatch}){
        let token=sessionStorage.getItem('user_token').replace(/['"]+/g, '');
        await axios.get(URL+'/csm/backend/site/serverMonitor/status', {
          headers: {
          'Authorization': token
          }
        })
        .then(response => {
          commit('setServidores', response.data);
          commit('setEstadoMonitor', true);
        })
        .then(() => {
          //si se pudo leer los datos de los servidores se llama al action para leer los LOGS
          dispatch('getLogs');
          //se leen las reglas de alerta del server y se verifica que haya alertas activas
          dispatch('setReglasAlerta')
          .then(()=> { dispatch('verificarAlertaProductivos'); })        
        })        
        .catch(error => {
            console.log("El servidor no se esta ejecutando o hay un problema de red", error);
            commit('setEstadoMonitor', false);
        });
      },
      async getLogs({commit}){
        let token=sessionStorage.getItem('user_token').replace(/['"]+/g, '');
        await axios.get(URL+'/csm/backend/site/serverMonitor/logs', {
          headers: {
          'Authorization': token
          }
        })
        .then(response => {
                  const data = response.data;
                  commit('setServidoresLogs',data);
                  //console.log(this.servidoresLogs);
        })
        .catch(error => {
            console.log("El servidor no se esta ejecutando o hay un problema de red");
        });
      },
      updateServer({commit, state},mensaje){
        //paso los atributos a minusculas para evitar problemas de diferencia en las cadenas 
        Object.keys(mensaje).forEach(key => {
          key=key.toLowerCase();
        });
        //objeto servidor que se va a enviar
        let srv = {};
        //clonamos el argumento pasado a una variable para evitar referenciarla
        let cadena = {...mensaje};
        //buscamos el ip del objeto pasado en la lista de servidores, si existe, sino el indice es 0
        let indice
        state.servidores.length>0 ? indice = state.servidores.findIndex(server => server.serverip === cadena.serverip) : indice = -1;
        //si no existe en la lista de servidores actual (llego por primera vez)
        if(indice<0){
          //clonamos todos los datos a srv
          srv = {...cadena};
        }
        else{
          //buscamos el objeto en la lista de servidores y lo clonamos a srv
          srv = {...(state.servidores.find(server => server.serverip === cadena.serverip))};
          //a ese objeto le actualizamos los valores que cambiaron
          Object.assign(srv,cadena);
        }
        //Si srv no existe agregarlo a la lista : Si existe modificar los valores correspondientes 
        indice<0 ? commit('agregarServidor',cadena) : commit('modificarServidor', {indice, srv} );

      },
      updateLogs({commit, state, getters}, mensaje){
        //objeto servidor que se va a enviar con los valores remplazados por fechas
        let srv = {...mensaje};
  
        Object.entries(srv).forEach(([key]) => { 
          //pasamos los atributos a minusculas para evitar problemas de diferencia en las cadenas 
          key=key.toLowerCase();
          if(key!='serverip') { 
            //asignamos a todos los campos (salvo 'serverip') una cadena datetime
            srv[key] = getters.getHoy; 
          }
        });
        
        //buscamos el ip del objeto pasado en la lista de logs
        const indice = state.servidoresLogs.findIndex(server => server.serverip === mensaje.serverip);
        
        //si ya existe el log en la lista
        let encontrado = {};
        if(indice>=0){
          //buscamos el objeto en la lista de logs y lo clonamos
          encontrado = {...(state.servidoresLogs.find(server => server.serverip === mensaje.serverip))};
          //a ese objeto le actualizamos los valores que cambiaron
          Object.assign(encontrado,srv);
        }

        //Si log no existe agregarlo a la lista : Si existe modificar los valores correspondientes 
        indice<0 ? commit('agregarLog',srv) : commit('modificarLog', {indice, encontrado} );
      },
      eliminarServidor({commit},serverip){
        commit('eliminarServidor',serverip)
        commit('eliminarLog',serverip)
      },
      async enviarPost({},mensaje){
        return new Promise((resolve, reject) => {
          let token=sessionStorage.getItem('user_token').replace(/['"]+/g, '');
          const headers = { "Authorization": token };
          //Envio un mensaje y el token mediante POST
          axios.post(URL+'/csm/backend/site/serverMonitor/intermediar', mensaje, { headers })
          .then(res => {
              if(res.data!="ERROR"){resolve(res.data)}
              else{reject(res.data)}
          })
          .catch(err => {
              console.log(err);
          });
      });
      },
      async setEventos({commit}){
        let token=sessionStorage.getItem('user_token').replace(/['"]+/g, '');
        await axios.get(URL+'/csm/backend/site/serverMonitor/eventos', {
          headers: {
          'Authorization': token
          }
        })
        .then(response => {
            const data = response.data;
            commit('setEventos', data);
        })
        .catch(error => {
            console.log("El servidor no se esta ejecutando o hay un problema de red");
        });
      },
      async setReglasAlerta({commit}){
        let token=sessionStorage.getItem('user_token').replace(/['"]+/g, '');
        await axios.get(URL+'/csm/backend/site/serverMonitor/reglasAlerta', {
          headers: {
          'Authorization': token
          }
        })
        .then(response => {
                  const data = response.data;
                  commit('setReglasAlerta',data);
        })
        .catch(error => {
            console.log("El servidor no se esta ejecutando o hay un problema de red");
        });
      },      
      // se establecen las condiciones para que se produzca la alerta del tablero de alertas
      verificarAlertaProductivos({commit, state}){
        
        function contarComponente(lista,componente){
          let contador = 0;
          Object.values(lista).forEach(server => { 
              if(server[componente]=='SI' && server.estado){contador++;}
          });
          return contador;
        };

        let servidoresCromo = state.servidores.filter((server) => server.tiposervidor_id==3 && server.rolservidor=='productivo' && server.estado);
        let servidoresProductivos = state.servidores.filter((server) => server.tiposervidor_id==2 && server.rolservidor=='productivo' && server.estado);
        let servidoresDatabase = state.servidores.filter((server) => server.tiposervidor_id==4 && server.rolservidor=='productivo' && server.estado);
        //devuelve verdadero si hay algun componente sensible repetido o apagado en todos los appservers
          if(
             
              //verifico que se cumpla el minimo de servidores activos
              servidoresProductivos.length<state.reglasAlerta.appServer.min || 
              servidoresCromo.length<state.reglasAlerta.cromoServer.min  || 
              servidoresDatabase.length<state.reglasAlerta.databaseServer.min ||

              //verifico los componentes minimos y maximos en los appservers
              (state.reglasAlerta.scada.max < contarComponente(servidoresProductivos,'estadoscada') && contarComponente(servidoresProductivos,'estadoscada') < state.reglasAlerta.scada.min) || 
              (state.reglasAlerta.nbm.max < contarComponente(servidoresProductivos,'estadonbm') && contarComponente(servidoresProductivos,'estadonbm') < state.reglasAlerta.nbm.min) || 
              (state.reglasAlerta.tca.max < contarComponente(servidoresProductivos,'estadotca') && contarComponente(servidoresProductivos,'estadotca') < state.reglasAlerta.tca.min) || 
              (state.reglasAlerta.agatha.max < contarComponente(servidoresProductivos,'estadoomsagatha') && contarComponente(servidoresProductivos,'estadoomsagatha') < state.reglasAlerta.agatha.min) ||
              (state.reglasAlerta.kpi.max < contarComponente(servidoresProductivos,'estadokpi') && contarComponente(servidoresProductivos,'estadokpi') < state.reglasAlerta.kpi.min)
            )  
            { commit('setAlertaVigente',true); }
          
            else { commit('setAlertaVigente',false); }
      },
    },
    getters: {
      getServidoresFiltrados(state){
        var opciones = { 
          '1': state.filtroServidores.mostrarGenerico, 
          '2': state.filtroServidores.mostrarAppserver, 
          '3': state.filtroServidores.mostrarCromo, 
          '4': state.filtroServidores.mostrarBD 
        }
        let filtrados = [];
        Object.values(state.servidores).forEach(server => {
          Object.entries(opciones).forEach(opcion => {    
            // server.tiposervidor_id se define al ejecutar el script del lado servidor --> 1 = generico ; 2 = appserver ; 3 = cromo ; 4 = database
            if(server.tiposervidor_id==opcion[0] && opcion[1]==true){ 
              if((server.rolservidor=='desarrollo' && state.filtroRoles.mostrarDesarrollo==true)||(server.rolservidor=='productivo' && state.filtroRoles.mostrarProductivo==true))
                { filtrados.push(server); }
            }
          })
        })
        // si orden es verdadero se ordena de forma descendiente
        if(state.ordenServidores.orden){
          filtrados.sort((a,b) => {
            //Si es de tipo NUMERICO:
            if(state.ordenServidores.columna=='serverusuarios' || state.ordenServidores.columna=='serveruptime' || state.ordenServidores.columna=='servermem' || state.ordenServidores.columna=='servercpu') { 
              return b[state.ordenServidores.columna]-a[state.ordenServidores.columna]; 
            }
            //Si es direccion IP:
            if(state.ordenServidores.columna=='serverip'){
              const ip1 = Number(a[state.ordenServidores.columna].split(".").map((num) => (`000${num}`).slice(-3) ).join(""));
              const ip2 = Number(b[state.ordenServidores.columna].split(".").map((num) => (`000${num}`).slice(-3) ).join(""));
              return ip1-ip2;
            }     
            //Si es un STRING
            if(b[state.ordenServidores.columna] > a[state.ordenServidores.columna]) return 1;
            if(b[state.ordenServidores.columna] < a[state.ordenServidores.columna]) return -1;
            return 0;
          });
        }
        // sino ascendente
        else{
          filtrados.sort((a,b) => {
            //Si es de tipo NUMERICO:
            if(state.ordenServidores.columna=='serverusuarios' || state.ordenServidores.columna=='serveruptime' || state.ordenServidores.columna=='servermem' || state.ordenServidores.columna=='servercpu') { 
              return a[state.ordenServidores.columna]-b[state.ordenServidores.columna]; 
            }
            //Si es direccion IP:
            if(state.ordenServidores.columna=='serverip'){
              const ip1 = Number(a[state.ordenServidores.columna].split(".").map((num) => (`000${num}`).slice(-3) ).join(""));
              const ip2 = Number(b[state.ordenServidores.columna].split(".").map((num) => (`000${num}`).slice(-3) ).join(""));
              return ip2-ip1;
            }
            //Si es un STRING
            if(a[state.ordenServidores.columna] > b[state.ordenServidores.columna]) return 1;
            if(a[state.ordenServidores.columna] < b[state.ordenServidores.columna]) return -1;
            return 0;
          });          
        }
      return filtrados;
      },
      getFiltroServidores(state){
        return state.filtroServidores;
      },
      getFiltroRoles(state){
        return state.filtroRoles;
      },
      getVersion(state){
        return state.version
      },
      getServers(state) {
        return state.servidores
      },
      getServerPorIp: (state) => (ip) => {
        return state.servidores.find(server => server.serverip === ip)
      },      
      getServerLogsPorIp: (state) => (ip) => {
        return state.servidoresLogs.find(serverLog => serverLog.serverip === ip)
      },
      getHoy(){
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date+' '+time;
        return dateTime;
      },
      getTableroAlertas(state){
        return state.tableroAlertas;
      },
      getAlertaVigente(state){
        return state.alertaVigente;
      },
      getListadoTarjeta(state){
        return state.listadoTarjeta;
      },
      getOrdenServidores(state){
        return state.ordenServidores;
      },
      getEstadoMonitor(state){
        return state.estadoMonitor;
      },
      getEventos(state){
        return state.eventos;
      },
      getReglasAlerta(state){
        return state.reglasAlerta;
      },      
    },
    modules: {
      auth,
    },
    plugins: [createPersistedState({
      paths: ['auth'],
      storage: window.sessionStorage
    })], //solo persisto auth y en sessionStorage (se borra al cerrar la pestaña)
    strict: process.env.DEBUGGING
  })