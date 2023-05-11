<template>
  <q-layout view="hHh Lpr fFf">
    <q-header class="cabecera text-white">
      <q-toolbar v-if="isLoggedIn">
          <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
          >
            <q-tooltip v-if="!$q.screen.lt.md" class="bg-transparent" anchor="center right" self="center left" :offset="[50, 10]" transition-show="scale" transition-hide="scale">
                <div class="text-subtitle1" style="text-align: center; font-family: customFont;"> Menu de servidores </div>
            </q-tooltip>
          </q-btn>
          
          <q-btn
          v-if="listadoTarjeta && !modoMovil"
          flat
          dense
          round
          icon="view_list"
          aria-label="Cambiar vista"
          @click="cambiarVistaListado(!listadoTarjeta)" 
          style="margin-left: 10px"                 
          >
            <q-tooltip v-if="!$q.screen.lt.md" class="bg-transparent" anchor="center right" self="center left" :offset="[10, 10]" transition-show="scale" transition-hide="scale">
                <div class="text-subtitle1" style="text-align: center; font-family: customFont;"> Vista Tabla </div>
            </q-tooltip>
          </q-btn>  
          <q-btn
          v-else-if="!modoMovil"
          flat
          dense
          round
          icon="grid_view"
          aria-label="Cambiar vista"
          @click="cambiarVistaListado(!listadoTarjeta)" 
          style="margin-left: 10px"          
          >
            <q-tooltip v-if="!$q.screen.lt.md" class="bg-transparent" anchor="center right" self="center left" :offset="[10, 10]" transition-show="scale" transition-hide="scale">
                <div class="text-subtitle1" style="text-align: center; font-family: customFont;"> Vista Dashboard </div>
            </q-tooltip>
          </q-btn>            

        <q-toolbar-title style="text-align: center; font-family: customFont;">
          ServerMonitor SITEGis
        </q-toolbar-title>  
        <q-btn
          flat
          dense
          round
          icon="dark_mode"
          aria-label="Modo oscuro"
          @click="cambiarOscuro"
        >
          <q-tooltip v-if="!$q.screen.lt.md" class="bg-transparent" anchor="center left" self="center right" :offset="[10, 10]" transition-show="scale" transition-hide="scale">
              <div class="text-subtitle1" style="text-align: center; font-family: customFont;"> Modo Noche/Dia </div>
          </q-tooltip>      
        </q-btn>
      </q-toolbar>
    </q-header>

      <q-drawer
        v-if="isLoggedIn && leftDrawerOpen"
        v-model="leftDrawerOpen"
        
        show-if-above
        :overlay="modoMovil ? true : false"
        :bordered="modoMovil ? true : false"
        :mini="miniState && !modoMovil"

        @mouseenter="miniState = false"
        @mouseleave="miniState = true"

        :width="200" 
        :breakpoint="1"
        class="leftDrawer"
      >
      <!-- :width="modoMovil ? $q.screen.width : 200"  -->
        <q-scroll-area class="fit">
          <q-list>

            <q-item active-class="botonTablero" clickable v-ripple :active="tableroAlertas" @click="cambiarTableroAlertas()">
              <q-item-section avatar>
                <q-icon name="monitor_heart" />
              </q-item-section>

              <q-item-section>
                Tablero Alertas
              </q-item-section>
            </q-item>            

            <q-separator />            

            <q-item active-class="botonGenerico" clickable v-ripple :active="filtroServidores.mostrarGenerico" @click="cambiarOpcionFiltro('mostrarGenerico',!filtroServidores.mostrarGenerico)">
              <q-item-section avatar>
                <q-icon name="build"/>
              </q-item-section>

              <q-item-section>
                Genericos
              </q-item-section>
            </q-item>

            <q-item active-class="botonAppserver" clickable v-ripple :active="filtroServidores.mostrarAppserver" @click="cambiarOpcionFiltro('mostrarAppserver',!filtroServidores.mostrarAppserver)">
              <q-item-section avatar>
                <q-icon name="star"/>
              </q-item-section>

              <q-item-section>
                Appserver
              </q-item-section>
            </q-item>

            <q-item active-class="botonCromo" clickable v-ripple :active="filtroServidores.mostrarCromo" @click="cambiarOpcionFiltro('mostrarCromo',!filtroServidores.mostrarCromo)">
              <q-item-section avatar>
                <q-icon name="place"/>
              </q-item-section>

              <q-item-section>
                Cromo
              </q-item-section>
            </q-item>

            <q-item active-class="botonDatabase" clickable v-ripple :active="filtroServidores.mostrarBD" @click="cambiarOpcionFiltro('mostrarBD',!filtroServidores.mostrarBD)">
              <q-item-section avatar>
                <q-icon name="storage" />
              </q-item-section>

              <q-item-section>
                BaseDatos
              </q-item-section>
            </q-item>

            <q-separator />

            <div v-if="!miniState || modoMovil">
              <q-item class="row q-px-sm" dense style="padding-left: 0px; padding-top: 3px; padding-bottom: 3px; ">
                <div class="col" style="margin-left: 7px;">
                  <q-checkbox size="42px" :model-value="rolServidores.mostrarDesarrollo" label="Desa" @click="cambiarRolFiltro('mostrarDesarrollo',!rolServidores.mostrarDesarrollo)" />
                </div>
      
                <div class="col">
                  <q-checkbox size="42px" :model-value="rolServidores.mostrarProductivo" label="Prod" @click="cambiarRolFiltro('mostrarProductivo',!rolServidores.mostrarProductivo)" />
                </div>
              </q-item>
           
            </div>
            <div v-else> 
              <q-item>
                <q-item-section avatar>
                  <q-icon name="settings"/>
                </q-item-section>
              </q-item>
            </div>

            <q-separator />            

            <q-item clickable v-ripple @click="dialogo_confirma_accion=true">
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>

              <q-item-section>
                Cerrar Sesion
              </q-item-section>
            </q-item>

          </q-list>    

          <q-item v-if="!miniState || modoMovil" class="footerVersion">ServerMonitor SITEGis - {{getVersion}} </q-item>
        </q-scroll-area>
      </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>

  <!-- DIALOG CONFIRMACION DE LOGOUT  -->
  <q-dialog v-model="dialogo_confirma_accion" persistent>
      <q-card style="width: 400px; max-width: 400px;">
          <q-card-section class="items-center">
              <div class="row text-center">
                  <div class="col-1">
                      <q-avatar icon="logout" color="negative" text-color="white" />
                  </div>
                  <div class="col-11">
                      <div class="q-mx-lg text-subtitle1">Esta seguro que desea</div>
                      <div class="q-mx-lg text-subtitle1"><span style="font-weight: bold;"> cerrar sesion? </span></div>
                  </div>
              </div>
          </q-card-section>
          <q-card-actions align="right">
              <q-btn flat label="Salir" color="primary" @click="desloguear" />
              <q-btn flat label="Cancelar" color="primary" v-close-popup />
          </q-card-actions>
      </q-card>
  </q-dialog>

</template>

<script>

import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useStore } from "vuex";
import { useRouter } from 'vue-router'

export default {
  name: 'MainLayout',
  setup() {
    
    const store = useStore();
    const quasar = useQuasar();
    const router = useRouter();
    var modoOscuro = false;
    var leftDrawerOpen = ref(false);
    var miniState = ref(true);
    var dialogo_confirma_accion = ref(false);
    inactivityTime();

    const modoMovil = computed(() => { return quasar.platform.is.mobile || quasar.screen.lt.md })

    const tableroAlertas = computed(() => store.getters['getTableroAlertas'])

    //opciones por defecto de visualizacion de servidores
    let filtroServidores = computed(() => store.getters['getFiltroServidores']);
    let rolServidores = computed(() => store.getters['getFiltroRoles']);

    const listadoTarjeta = computed(() => store.getters['getListadoTarjeta']);

    const isLoggedIn = computed(() => store.getters['auth/isLoggedIn']);
    const getVersion = computed(() => store.getters['getVersion']);
    //---------- METHODS ---------------
    
    function cambiarTableroAlertas(){
      store.commit('setTableroAlertas',!tableroAlertas.value);
    }

    function cambiarOpcionFiltro(opcion, valor){
      store.commit('setFiltroServidores', {opcion: opcion, valor: valor});
    }

    function cambiarRolFiltro(rol, valor){
      store.commit('setFiltroRoles', {rol: rol, valor: valor});
    }

    function cambiarVistaListado(valor){
      //desactiva el tablero si esta activo
      store.commit('setTableroAlertas',false);
      store.commit('setListadoTarjeta', valor);
    }

    function desloguear() {
      leftDrawerOpen.value=false;
      dialogo_confirma_accion.value=false;
      quasar.notify({
        color: 'negative',
        icon: 'logout',
        message: `Cerrando Sesión`,
      });
      store.dispatch('auth/logout');
      router.push('/login');
      //salimos del modo dark si estaba
      modoOscuro=false;
      quasar.dark.set(false);
    }

    function cambiarOscuro(){
      if(!modoOscuro){modoOscuro=true; console.log('Hello Darkness, my old friend'); }
      else{modoOscuro=false; console.log('Goodbye Darkness');}
      quasar.dark.toggle()
    }

    function inactivityTime() {
      let time;
      window.onload = resetTimer;
      // Eventos DOM 
      document.onmousemove = resetTimer;
      document.onkeydown = resetTimer;

      function expiro() {
        leftDrawerOpen.value=false;
        dialogo_confirma_accion.value=false;
        quasar.notify({
          color: 'negative',
          icon: 'logout',
          message: 'Sesion expirada por inactividad'
        });
        console.log('Sesion expirada por inactividad');
        store.dispatch('auth/logout');
        router.push('/login');
        //salimos del modo dark si estaba
        modoOscuro=false;
        quasar.dark.set(false);
      }

      function resetTimer() {
          clearTimeout(time);
          time = setTimeout(expiro, process.env.EXPIRE_TIME * 1000 * 60)
      }
    };


    return {
    dialogo_confirma_accion,
    modoMovil,
    cambiarOpcionFiltro,
    cambiarVistaListado,
    cambiarRolFiltro,
    modoOscuro,
    cambiarOscuro,
    leftDrawerOpen,
    miniState,
    desloguear,
    cambiarTableroAlertas,
    //computed (getters)
    tableroAlertas,
    listadoTarjeta,
    filtroServidores,
    rolServidores,
    isLoggedIn,
    getVersion
    }
  }
}
</script>

<style lang="scss" scoped>

.footerVersion{
    font-family: customFont;
    text-align: center;
    position: absolute;
    bottom: 2%;
    width: 100%;
}

.body--light .footer{
    color: black;
    opacity: 80%;
}

.body--dark .footer{
    color: white;
    opacity: 80%;
}


</style>