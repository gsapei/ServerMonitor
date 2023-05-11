<template>
    <q-page class="flex contenedor fondo">
    <q-scroll-area class="col">
      <div v-if="auth">
        <div v-if="!tableroAlertas">
          
          <div v-if="estadoMonitor">
            <div v-if="cargaCompleta">
              <!-- MODO DASHBOARD -->
              <div v-if="listadoTarjeta || modoMovil" class="q-px-xs q-py-lg justify-center row q-gutter-y-lg q-gutter-x-lg">
                <ServerCard v-for="server in servidoresFiltrados" :key="server.serverip" :server="server"/>
              </div>  
              
              <!-- MODO TABLA -->
              <div v-else class="q-pa-lg">
                <q-markup-table class="tablaServidores" separator="cell">
                  <thead>
                    <tr class="q-pa-md">
                      <th style="width: 10%;">
                        <q-btn flat no-caps @click="cambiarOrdenServidores('tiposervidor_id')">Tipo Servidor 
                          <q-icon v-if="ordenServidores.columna == 'tiposervidor_id' && ordenServidores.orden" name="arrow_drop_down" size="20px"/> 
                          <q-icon v-else-if="ordenServidores.columna == 'tiposervidor_id' && !ordenServidores.orden" name="arrow_drop_up" size="20px"/> 
                        </q-btn>
                      </th>
                      <th style="width: 10%;">
                        <q-btn flat no-caps @click="cambiarOrdenServidores('rolservidor')">Rol 
                          <q-icon v-if="ordenServidores.columna == 'rolservidor' && ordenServidores.orden" name="arrow_drop_down" size="20px"/> 
                          <q-icon v-else-if="ordenServidores.columna == 'rolservidor' && !ordenServidores.orden" name="arrow_drop_up" size="20px"/> 
                        </q-btn>
                      </th>
                      <th style="width: 08%;">
                        <q-btn flat no-caps @click="cambiarOrdenServidores('estado')">Estado App
                          <q-icon v-if="ordenServidores.columna == 'estado' && ordenServidores.orden" name="arrow_drop_down" size="20px"/> 
                          <q-icon v-else-if="ordenServidores.columna == 'estado' && !ordenServidores.orden" name="arrow_drop_up" size="20px"/> 
                        </q-btn>
                      </th>
                      <th style="width: 10%;">
                        <q-btn flat no-caps @click="cambiarOrdenServidores('serverhostname')">Hostname 
                          <q-icon v-if="ordenServidores.columna == 'serverhostname' && ordenServidores.orden" name="arrow_drop_down" size="20px"/> 
                          <q-icon v-else-if="ordenServidores.columna == 'serverhostname' && !ordenServidores.orden" name="arrow_drop_up" size="20px"/> 
                        </q-btn>
                      </th>
                      <th style="width: 10%;">
                        <q-btn flat no-caps @click="cambiarOrdenServidores('serverip')">IP 
                          <q-icon v-if="ordenServidores.columna == 'serverip' && ordenServidores.orden" name="arrow_drop_down" size="20px"/> 
                          <q-icon v-else-if="ordenServidores.columna == 'serverip' && !ordenServidores.orden" name="arrow_drop_up" size="20px"/> 
                        </q-btn>
                      </th>
                      <th style="width: 12%;">
                        <q-btn flat no-caps @click="cambiarOrdenServidores('servermem')">Memoria 
                          <q-icon v-if="ordenServidores.columna == 'servermem' && ordenServidores.orden" name="arrow_drop_down" size="20px"/> 
                          <q-icon v-else-if="ordenServidores.columna == 'servermem' && !ordenServidores.orden" name="arrow_drop_up" size="20px"/> 
                        </q-btn>
                      </th>
                      <th style="width: 12%;">
                        <q-btn flat no-caps @click="cambiarOrdenServidores('servercpu')">CPU 
                          <q-icon v-if="ordenServidores.columna == 'servercpu' && ordenServidores.orden" name="arrow_drop_down" size="20px"/> 
                          <q-icon v-else-if="ordenServidores.columna == 'servercpu' && !ordenServidores.orden" name="arrow_drop_up" size="20px"/> 
                        </q-btn>
                      </th>
                      <th style="width: 12%;">
                        <q-btn flat no-caps @click="cambiarOrdenServidores('serverdisco')">Disco 
                          <q-icon v-if="ordenServidores.columna == 'serverdisco' && ordenServidores.orden" name="arrow_drop_down" size="20px"/> 
                          <q-icon v-else-if="ordenServidores.columna == 'serverdisco' && !ordenServidores.orden" name="arrow_drop_up" size="20px"/> 
                        </q-btn>
                      </th>
                      <th style="width: 08%;">
                        <q-btn flat no-caps @click="cambiarOrdenServidores('serveruptime')">Dias Online 
                          <q-icon v-if="ordenServidores.columna == 'serveruptime' && ordenServidores.orden" name="arrow_drop_down" size="20px"/> 
                          <q-icon v-else-if="ordenServidores.columna == 'serveruptime' && !ordenServidores.orden" name="arrow_drop_up" size="20px"/> 
                        </q-btn>
                      </th>
                      <th style="width: 08%;">
                        <q-btn flat no-caps @click="cambiarOrdenServidores('serverusuarios')">Usuarios 
                          <q-icon v-if="ordenServidores.columna == 'serverusuarios' && ordenServidores.orden" name="arrow_drop_down" size="20px"/> 
                          <q-icon v-else-if="ordenServidores.columna == 'serverusuarios' && !ordenServidores.orden" name="arrow_drop_up" size="20px"/> 
                        </q-btn>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <ServerRow v-for="server in servidoresFiltrados" :key="server.serverip" :server="server"/>
                  </tbody>
                </q-markup-table>
              </div>
            </div>  
            <div v-else class="error_msj justify-center row absolute-full items-center"><q-spinner color="$cabecera" size="3em"/></div>
          </div>
          
          <div v-else class="error_msj justify-center row absolute-full items-center">No se puede conectar al servidor. Reintentando...</div>
        </div>
        
        <tablero v-else/>
        
      </div>
    <div v-else class="justify-center row absolute-full items-center">
        <q-btn class="error_msj" outline icon="login" label="Inicie sesion para continuar" style="width:80%; max-width: 500px; min-width: 300px;" @click="$router.push('/login')"/>
    </div>
    </q-scroll-area>
      <q-page-sticky position="bottom-right" :offset="[18, 18]" v-if="alertaVigente" class="shake">
        <q-btn 
          push 
          round
          size="md"
          color="negative"
          icon="priority_high"    
          @click="cambiarTableroAlertas()" 
        >
         <q-tooltip class="bg-negative" anchor="center left" self="center right" :offset="[10, 10]" transition-show="scale" transition-hide="scale">
              <div class="text-subtitle1" style="text-align: center; font-family: customFont;"> Alerta detectada </div>
          </q-tooltip>      
        </q-btn>
      </q-page-sticky>
    </q-page>
</template>

<script>

import { useStore } from "vuex";
import { useQuasar } from "quasar";
import { onMounted, computed, ref } from "vue";
import ServerCard from "./ServerCard.vue";
import ServerRow from "./ServerRow.vue";
import Tablero from "./Tablero.vue";
import { serverURL } from 'boot/api'

import io from "socket.io-client";
var socket = io(serverURL, {
  path: '/socket',
  autoConnect: true,
  transports: ["websocket"],
});

export default {
    head() {
    return {
      title: "Monitor de servidores Linux | SITEGIS EPE"
    }
  },
  components:{
    ServerCard,
    Tablero,
    ServerRow
},
  setup(){
    const store = useStore();
    const quasar = useQuasar();

    var cargaCompleta = ref(false);
    
    //GETTERS:
    //Variable booleana = true -> si se verifica que algun componente sensible de los servidores productivos no esta activado o esta duplicado
    const alertaVigente = computed(() => store.getters['getAlertaVigente']);
    //bandera para mostrar el tablero si = true
    const tableroAlertas = computed(() => store.getters['getTableroAlertas']);   

    const servidoresFiltrados = computed(() => store.getters['getServidoresFiltrados']);
    const listadoTarjeta = computed(() => store.getters['getListadoTarjeta']);
    const ordenServidores = computed(() => store.getters['getOrdenServidores']);
    const estadoMonitor = computed(() => store.getters['getEstadoMonitor']);
    const auth = computed(() => store.getters['auth/isLoggedIn']);
    //para forzar el modo tarjeta en telefonos
    const modoMovil = computed(() => { return quasar.platform.is.mobile || quasar.screen.lt.md })

    //METHODS:  
    function cambiarTableroAlertas(){ store.commit('setTableroAlertas',true); }

    function cambiarOrdenServidores(columna){
      let payload = {}
      if(columna == ordenServidores.value.columna){
        payload = {columna: columna, orden: !ordenServidores.value.orden};
      }
      else{
        payload = {columna: columna, orden: true};
      }
      store.commit('setOrdenServidores',payload);
    }

    onMounted(() => {
      //cuando se monta se llama a la accion getServers (VUEX)
      if(auth.value){
          return new Promise(function(resolve, reject) {
            store.dispatch('getServers');
            setTimeout(resolve, 1000);
          }).then(function() {
              cargaCompleta.value=true;
          });
        }
     
      }); //fin onMounted()

      
    //SOCKETS:
    //si recibe un mensaje de socketIO con actualizaciones llama a updateServer (VUEX)
    socket.on('updateServer', (mensaje) => {
      //console.log(mensaje);
      store.dispatch('updateServer',mensaje)
      .then(()=>{
        //se verifican las alertas
        store.dispatch('verificarAlertaProductivos');
      })
      .then(()=>{
        //si se actualiza algun dato de un servidor se actualiza tambien la hora de lectura de ese dato
        store.dispatch('updateLogs',mensaje);
      })
    });

    //si recibe un mensaje de socketIO para eliminar llama a eliminarServidor (VUEX)
    socket.on('eliminarServidor', (mensaje) => {
      store.dispatch('eliminarServidor',mensaje)
    });

    //si hay un error de conexion con el servidor se cambia el valor
    socket.on("connect_error", (err) => {
      store.commit('setEstadoMonitor',false);
    });

    socket.on("connect", (err) => {
      store.commit('setEstadoMonitor',true);
    });
      


    return {
      cargaCompleta,
      modoMovil,
      servidoresFiltrados,
      listadoTarjeta,
      estadoMonitor,
      ordenServidores, 
      auth, 
      tableroAlertas,
      alertaVigente,
      cambiarTableroAlertas,
      cambiarOrdenServidores
      }
  }
}
</script>

<style scoped>

.shake {
  animation: shake 0.82s ;
}

@keyframes shake {
  10%, 90% {
    transform: translate3d(-1px, 0, 0);
  }
  
  20%, 80% {
    transform: translate3d(2px, 0, 0);
  }

  30%, 50%, 70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%, 60% {
    transform: translate3d(4px, 0, 0);
  }
}

</style>
