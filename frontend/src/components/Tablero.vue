<template>
    <div v-if="!modoMovil" class="div_eventos row q-px-md q-py-md">
        <q-resize-observer @resize="setHeightTablaEventos" />
        <div class="col-4 q-pr-xs">
            <q-card class="tablero .inset-shadow-down">
            
            <q-card-section class="text-white tarjetaCabeceraOffline" v-if="alertaProductivos">
                <div class="text-h5 text-center">TABLERO DE ALERTAS</div>
                <div class="text-subtitle1 text-center">Servidores Linux SITEGIS</div>
            </q-card-section>
    
            <q-card-section class="text-white tarjetaCabeceraOnlineTablero" v-else>
                <div class="text-h5 text-center">TABLERO DE ALERTAS</div>
                <div class="text-subtitle1 text-center">Servidores Linux SITEGIS</div>
            </q-card-section>
            
            <q-card-section >
                <div class="row">
                    <q-list bordered padding style="width: 100%;" class="tablero_totales q-pb-md ">     
                        <q-item-label  style="text-align: center;" header>Total servidores activos SITEGIS</q-item-label>
                        
                        <q-item clickable class="item">
                            <q-item-section class="col-10">
                                Appservers Productivos: {{totalProductivos}}
                                <q-item-label caption>{{listaNombresServidor(servidoresProductivos)}}</q-item-label>
                            </q-item-section>                       
                            <q-item-section class="col-2" side>
                                <q-icon name="report_problem" color="negative" v-if="totalProductivos<reglasAlerta.appServer.min" size="md"/>
                                <q-icon name="check_circle" color="positive" v-else size="md"/>
                            </q-item-section>
                            <q-tooltip v-if="!modoMovil" class="bg-negative" anchor="center right" self="center left" :offset="[17, 0]" transition-show="slide-left" transition-hide="scale">
                                <div class="text-subtitle1" style="text-align: center; font-family: customFont;"> Regla: minimo {{reglasAlerta.appServer.min}} servidores productivos </div>
                            </q-tooltip>                          
                        </q-item>
    
                        <q-item clickable class="item">
                            <q-item-section class="col-10">
                                Cromo Productivos: {{totalCromo}}
                                <q-item-label caption>{{listaNombresServidor(servidoresCromo)}}</q-item-label>
                            </q-item-section>                       
                            <q-item-section class="col-2" side>
                                <q-icon name="report_problem" color="negative" v-if="totalCromo<reglasAlerta.cromoServer.min" size="md"/>
                                <q-icon name="check_circle" color="positive" v-else size="md"/>
                            </q-item-section>
                            <q-tooltip v-if="!modoMovil" class="bg-negative" anchor="center right" self="center left" :offset="[17, 0]" transition-show="slide-left" transition-hide="scale">
                                <div class="text-subtitle1" style="text-align: center; font-family: customFont;"> Regla: minimo {{reglasAlerta.cromoServer.min}} servidores Cromo </div>
                            </q-tooltip>                           
                        </q-item>
    
                        <q-item clickable class="item">
                            <q-item-section class="col-10">
                                Database Productivos: {{totalDatabase}}
                                <q-item-label caption>{{listaNombresServidor(servidoresDatabase)}}</q-item-label>
                            </q-item-section>                       
                            <q-item-section class="col-2" side>
                                <q-icon name="report_problem" color="negative" v-if="totalDatabase<reglasAlerta.databaseServer.min" size="md"/>
                                <q-icon name="check_circle" color="positive" v-else size="md"/>
                            </q-item-section>
                            <q-tooltip v-if="!modoMovil" class="bg-negative" anchor="center right" self="center left" :offset="[17, 0]" transition-show="slide-left" transition-hide="scale">
                                <div class="text-subtitle1" style="text-align: center; font-family: customFont;"> Regla: minimo {{reglasAlerta.databaseServer.min}} servidores Database </div>
                            </q-tooltip>   
                        </q-item>                   
    
                    </q-list>
                </div>
                <div class="row">
                    <q-list bordered class="q-mt-md q-pb-md tablero_componentes" style="width: 100%;">     
                        <q-item-label  style="text-align: center;" header>Alertas en AppServers PRODUCTIVOS</q-item-label>
                        <q-item clickable class="item">                 
                            <q-item-section avatar top class="col-2">
                                <q-icon name="subdirectory_arrow_right" size="34px" />
                            </q-item-section>
                            <q-item-section class="col-8">
                                Componentes SCADA activos: {{contarComponente(servidoresProductivos,'estadoscada')}}
                                <q-item-label caption>{{listaNombresServidorComponente(servidoresProductivos,'estadoscada')}}</q-item-label>
                            </q-item-section>                       
                            <q-item-section class="col-2" side>
                                <q-icon name="check_circle" color="positive" v-if="reglasAlerta.scada.min <= contarComponente(servidoresProductivos,'estadoscada') && contarComponente(servidoresProductivos,'estadoscada') <= reglasAlerta.scada.max" size="md"/>
                                <q-icon name="report_problem" color="negative" v-else size="md"/>
                            </q-item-section>
                            <q-tooltip v-if="!modoMovil" class="bg-negative" anchor="center right" self="center left" :offset="[17, 0]" transition-show="slide-left" transition-hide="scale">
                                <div class="text-subtitle1" style="text-align: center; font-family: customFont;"> Regla: minimo {{reglasAlerta.scada.min}} y maximo {{reglasAlerta.scada.max}} componente <b>SCADA</b> en todos los appservers </div>
                            </q-tooltip>
                        </q-item>
    
                        <q-item clickable class="item">                 
                            <q-item-section avatar top class="col-2">
                                <q-icon name="subdirectory_arrow_right" size="34px" />
                            </q-item-section>
                            <q-item-section class="col-8">
                                Componentes NBM activos: {{contarComponente(servidoresProductivos,'estadonbm')}}
                                <q-item-label caption>{{listaNombresServidorComponente(servidoresProductivos,'estadonbm')}}</q-item-label>
                            </q-item-section>                       
                            <q-item-section class="col-2" side>
                                <q-icon name="check_circle" color="positive" v-if="reglasAlerta.nbm.min <= contarComponente(servidoresProductivos,'estadonbm') &&  contarComponente(servidoresProductivos,'estadonbm') <= reglasAlerta.nbm.max" size="md"/>
                                <q-icon name="report_problem" color="negative" v-else size="md"/>
                            </q-item-section>
                            <q-tooltip v-if="!modoMovil" class="bg-negative" anchor="center right" self="center left" :offset="[17, 0]" transition-show="slide-left" transition-hide="scale">
                                <div class="text-subtitle1" style="text-align: center; font-family: customFont;"> Regla: minimo {{reglasAlerta.nbm.min}} y maximo {{reglasAlerta.nbm.max}} componente <b>NBM</b> en todos los appservers </div>
                            </q-tooltip>
                        </q-item>
    
                        <q-item clickable class="item">                 
                            <q-item-section avatar top class="col-2">
                                <q-icon name="subdirectory_arrow_right" size="34px" />
                            </q-item-section>
                            <q-item-section class="col-8">
                                Componentes Agatha activos: {{contarComponente(servidoresProductivos,'estadoomsagatha')}}
                                <q-item-label caption>{{listaNombresServidorComponente(servidoresProductivos,'estadoomsagatha')}}</q-item-label>
                            </q-item-section>                       
                            <q-item-section class="col-2" side>
                                <q-icon name="check_circle" color="positive" v-if="reglasAlerta.agatha.min <= contarComponente(servidoresProductivos,'estadoomsagatha') && contarComponente(servidoresProductivos,'estadoomsagatha') <= reglasAlerta.agatha.max" size="md"/>
                                <q-icon name="report_problem" color="negative" v-else size="md"/>
                            </q-item-section>
                            <q-tooltip v-if="!modoMovil" class="bg-negative" anchor="center right" self="center left" :offset="[17, 0]" transition-show="slide-left" transition-hide="scale">
                                <div class="text-subtitle1" style="text-align: center; font-family: customFont;"> Regla: minimo {{reglasAlerta.agatha.min}} y maximo {{reglasAlerta.agatha.max}} componente <b>OMS Predictivo</b> en todos los appservers </div>
                            </q-tooltip>
                        </q-item>
    
                        <q-item clickable class="item">                 
                            <q-item-section avatar top class="col-2">
                                <q-icon name="subdirectory_arrow_right" size="34px" />
                            </q-item-section>
                            <q-item-section class="col-8">
                                Componentes TCA activos: {{contarComponente(servidoresProductivos,'estadotca')}}
                                <q-item-label caption>{{listaNombresServidorComponente(servidoresProductivos,'estadotca')}}</q-item-label>
                            </q-item-section>                       
                            <q-item-section class="col-2" side>
                                <q-icon name="check_circle" color="positive" v-if="reglasAlerta.tca.min <= contarComponente(servidoresProductivos,'estadotca') && contarComponente(servidoresProductivos,'estadotca') <= reglasAlerta.tca.max" size="md"/>
                                <q-icon name="report_problem" color="negative" v-else size="md"/>
                            </q-item-section>
                            <q-tooltip v-if="!modoMovil" class="bg-negative" anchor="center right" self="center left" :offset="[17, 0]" transition-show="slide-left" transition-hide="scale">
                                <div class="text-subtitle1" style="text-align: center; font-family: customFont;"> Regla: minimo {{reglasAlerta.tca.min}} y maximo {{reglasAlerta.tca.max}} componente <b>TCA</b> en todos los appservers </div>
                            </q-tooltip>
                        </q-item>

                        <q-item clickable class="item">                 
                            <q-item-section avatar top class="col-2">
                                <q-icon name="subdirectory_arrow_right" size="34px" />
                            </q-item-section>
                            <q-item-section class="col-8">
                                Componentes KPI activos: {{contarComponente(servidoresProductivos,'estadokpi')}}
                                <q-item-label caption>{{listaNombresServidorComponente(servidoresProductivos,'estadokpi')}}</q-item-label>
                            </q-item-section>                       
                            <q-item-section class="col-2" side>
                                <q-icon name="check_circle" color="positive" v-if="reglasAlerta.kpi.min <= contarComponente(servidoresProductivos,'estadokpi') && contarComponente(servidoresProductivos,'estadokpi') <= reglasAlerta.kpi.max" size="md"/>
                                <q-icon name="report_problem" color="negative" v-else size="md"/>
                            </q-item-section>
                            <q-tooltip v-if="!modoMovil" class="bg-negative" anchor="center right" self="center left" :offset="[17, 0]" transition-show="slide-left" transition-hide="scale">
                                <div class="text-subtitle1" style="text-align: center; font-family: customFont;"> Regla: minimo {{reglasAlerta.kpi.min}} y maximo {{reglasAlerta.kpi.max}} componente <b>KPI</b> en todos los appservers </div>
                            </q-tooltip>
                        </q-item>                        
    
                    </q-list>
                </div>
            </q-card-section>
            </q-card>
        </div>
        <div class="col-8 q-pl-xs">
            <q-card class=".inset-shadow-down contenedor_logs">          
                <q-card-section class="text-white tarjetaCabeceraEventos">
                    <div class="text-h5 text-center">Registro de EVENTOS</div>
                    <div class="text-subtitle1 text-center">Informacion y alertas en servidores</div>
                </q-card-section>
                <q-card-section>
                    <q-table
                    class="tabla_eventos"
                    :rows="eventos_rows"
                    :columns="eventos_cols"
                    row-key="evento_id"
                    separator="cell"
                    flat
                    bordered
                    :rows-per-page-options="[0]"
                    v-model:pagination="pagination"
                    virtual-scroll
                    hide-bottom
                    wrap-cells
                    :loading="cargandoEventos"
                    >
                        <template v-slot:loading>
                            <q-inner-loading showing color="primary" />
                        </template>
                        <template v-slot:body="eventos_rows">
                            <q-tr :props="eventos_rows">
                                <q-td key="evento_horario" :props="eventos_rows">
                                    {{ formatFechaEvento(eventos_rows.row.evento_horario) }} hs
                                </q-td>
                                <q-td key="evento_usuario" :props="eventos_rows">
                                    {{ eventos_rows.row.evento_usuario }}
                                </q-td>                                                        
                                <q-td key="evento_tipo" :props="eventos_rows">
                                    <q-badge color="blue" v-if="eventos_rows.row.evento_tipo==1">
                                        {{ parseTipoEvento(eventos_rows.row.evento_tipo) }}
                                    </q-badge>
                                    <q-badge color="red" v-if="eventos_rows.row.evento_tipo==2">
                                        {{ parseTipoEvento(eventos_rows.row.evento_tipo) }}
                                    </q-badge>              
                                    <q-badge color="orange" v-if="eventos_rows.row.evento_tipo==3">
                                        {{ parseTipoEvento(eventos_rows.row.evento_tipo) }}
                                    </q-badge>                  
                                </q-td>
                                <q-td key="evento_mensaje" :props="eventos_rows">
                                    <q-item-label v-html="parseMensajeEvento(eventos_rows.row.evento_mensaje)"/>
                                </q-td>                            
                            </q-tr>
                        </template>
                        
                    </q-table>
                </q-card-section>
            </q-card>
        </div>
    </div>
    <div v-else class="div_eventos row q-px-xs q-py-xs justify-center row absolute-full items-center">
        <q-card class="tablero .inset-shadow-down">
            
            <q-card-section class="text-white tarjetaCabeceraOffline" v-if="alertaProductivos">
                <div class="text-h5 text-center">TABLERO DE ALERTAS</div>
                <div class="text-subtitle1 text-center">Servidores Linux SITEGIS</div>
            </q-card-section>
    
            <q-card-section class="text-white tarjetaCabeceraOnlineTablero" v-else>
                <div class="text-h5 text-center">TABLERO DE ALERTAS</div>
                <div class="text-subtitle1 text-center">Servidores Linux SITEGIS</div>
            </q-card-section>
            
            <q-card-section >
                <div class="row">
                    <q-list bordered padding style="width: 100%;" class="tablero_totales q-pb-md ">     
                        <q-item-label  style="text-align: center;" header>Total servidores activos SITEGIS</q-item-label>
                        
                        <q-item clickable class="item">
                            <q-item-section class="col-10">
                                Appservers Productivos: {{totalProductivos}}
                                <q-item-label caption>{{listaNombresServidor(servidoresProductivos)}}</q-item-label>
                            </q-item-section>                       
                            <q-item-section class="col-2" side>
                                <q-icon name="report_problem" color="negative" v-if="totalProductivos<reglasAlerta.appServer.min" size="md"/>
                                <q-icon name="check_circle" color="positive" v-else size="md"/>
                            </q-item-section>
                            <q-tooltip v-if="!modoMovil" class="bg-negative" anchor="center right" self="center left" :offset="[17, 0]" transition-show="slide-left" transition-hide="scale">
                                <div class="text-subtitle1" style="text-align: center; font-family: customFont;"> Regla: minimo {{reglasAlerta.appServer.min}} servidores productivos </div>
                            </q-tooltip>                          
                        </q-item>
    
                        <q-item clickable class="item">
                            <q-item-section class="col-10">
                                Cromo Productivos: {{totalCromo}}
                                <q-item-label caption>{{listaNombresServidor(servidoresCromo)}}</q-item-label>
                            </q-item-section>                       
                            <q-item-section class="col-2" side>
                                <q-icon name="report_problem" color="negative" v-if="totalCromo<reglasAlerta.cromoServer.min" size="md"/>
                                <q-icon name="check_circle" color="positive" v-else size="md"/>
                            </q-item-section>
                            <q-tooltip v-if="!modoMovil" class="bg-negative" anchor="center right" self="center left" :offset="[17, 0]" transition-show="slide-left" transition-hide="scale">
                                <div class="text-subtitle1" style="text-align: center; font-family: customFont;"> Regla: minimo {{reglasAlerta.cromoServer.min}} servidores Cromo </div>
                            </q-tooltip>                           
                        </q-item>
    
                        <q-item clickable class="item">
                            <q-item-section class="col-10">
                                Database Productivos: {{totalDatabase}}
                                <q-item-label caption>{{listaNombresServidor(servidoresDatabase)}}</q-item-label>
                            </q-item-section>                       
                            <q-item-section class="col-2" side>
                                <q-icon name="report_problem" color="negative" v-if="totalDatabase<reglasAlerta.databaseServer.min" size="md"/>
                                <q-icon name="check_circle" color="positive" v-else size="md"/>
                            </q-item-section>
                            <q-tooltip v-if="!modoMovil" class="bg-negative" anchor="center right" self="center left" :offset="[17, 0]" transition-show="slide-left" transition-hide="scale">
                                <div class="text-subtitle1" style="text-align: center; font-family: customFont;"> Regla: minimo {{reglasAlerta.databaseServer.min}} servidores Database </div>
                            </q-tooltip>   
                        </q-item>                   
    
                    </q-list>
                </div>
                <div class="row">
                    <q-list bordered class="q-mt-md q-pb-md tablero_componentes" style="width: 100%;">     
                        <q-item-label  style="text-align: center;" header>Alertas en AppServers PRODUCTIVOS</q-item-label>
                        <q-item clickable class="item">                 
                            <q-item-section avatar top class="col-2">
                                <q-icon name="subdirectory_arrow_right" size="34px" />
                            </q-item-section>
                            <q-item-section class="col-8">
                                Componentes SCADA activos: {{contarComponente(servidoresProductivos,'estadoscada')}}
                                <q-item-label caption>{{listaNombresServidorComponente(servidoresProductivos,'estadoscada')}}</q-item-label>
                            </q-item-section>                       
                            <q-item-section class="col-2" side>
                                <q-icon name="check_circle" color="positive" v-if="reglasAlerta.scada.min <= contarComponente(servidoresProductivos,'estadoscada') && contarComponente(servidoresProductivos,'estadoscada') <= reglasAlerta.scada.max" size="md"/>
                                <q-icon name="report_problem" color="negative" v-else size="md"/>
                            </q-item-section>
                            <q-tooltip v-if="!modoMovil" class="bg-negative" anchor="center right" self="center left" :offset="[17, 0]" transition-show="slide-left" transition-hide="scale">
                                <div class="text-subtitle1" style="text-align: center; font-family: customFont;"> Regla: minimo {{reglasAlerta.scada.min}} y maximo {{reglasAlerta.scada.max}} componente <b>SCADA</b> en todos los appservers </div>
                            </q-tooltip>
                        </q-item>
    
                        <q-item clickable class="item">                 
                            <q-item-section avatar top class="col-2">
                                <q-icon name="subdirectory_arrow_right" size="34px" />
                            </q-item-section>
                            <q-item-section class="col-8">
                                Componentes NBM activos: {{contarComponente(servidoresProductivos,'estadonbm')}}
                                <q-item-label caption>{{listaNombresServidorComponente(servidoresProductivos,'estadonbm')}}</q-item-label>
                            </q-item-section>                       
                            <q-item-section class="col-2" side>
                                <q-icon name="check_circle" color="positive" v-if="reglasAlerta.nbm.min <= contarComponente(servidoresProductivos,'estadonbm') &&  contarComponente(servidoresProductivos,'estadonbm') <= reglasAlerta.nbm.max" size="md"/>
                                <q-icon name="report_problem" color="negative" v-else size="md"/>
                            </q-item-section>
                            <q-tooltip v-if="!modoMovil" class="bg-negative" anchor="center right" self="center left" :offset="[17, 0]" transition-show="slide-left" transition-hide="scale">
                                <div class="text-subtitle1" style="text-align: center; font-family: customFont;"> Regla: minimo {{reglasAlerta.nbm.min}} y maximo {{reglasAlerta.nbm.max}} componente <b>NBM</b> en todos los appservers </div>
                            </q-tooltip>
                        </q-item>
    
                        <q-item clickable class="item">                 
                            <q-item-section avatar top class="col-2">
                                <q-icon name="subdirectory_arrow_right" size="34px" />
                            </q-item-section>
                            <q-item-section class="col-8">
                                Componentes Agatha activos: {{contarComponente(servidoresProductivos,'estadoomsagatha')}}
                                <q-item-label caption>{{listaNombresServidorComponente(servidoresProductivos,'estadoomsagatha')}}</q-item-label>
                            </q-item-section>                       
                            <q-item-section class="col-2" side>
                                <q-icon name="check_circle" color="positive" v-if="reglasAlerta.agatha.min <= contarComponente(servidoresProductivos,'estadoomsagatha') && contarComponente(servidoresProductivos,'estadoomsagatha') <= reglasAlerta.agatha.max" size="md"/>
                                <q-icon name="report_problem" color="negative" v-else size="md"/>
                            </q-item-section>
                            <q-tooltip v-if="!modoMovil" class="bg-negative" anchor="center right" self="center left" :offset="[17, 0]" transition-show="slide-left" transition-hide="scale">
                                <div class="text-subtitle1" style="text-align: center; font-family: customFont;"> Regla: minimo {{reglasAlerta.agatha.min}} y maximo {{reglasAlerta.agatha.max}} componente <b>OMS Predictivo</b> en todos los appservers </div>
                            </q-tooltip>
                        </q-item>
    
                        <q-item clickable class="item">                 
                            <q-item-section avatar top class="col-2">
                                <q-icon name="subdirectory_arrow_right" size="34px" />
                            </q-item-section>
                            <q-item-section class="col-8">
                                Componentes TCA activos: {{contarComponente(servidoresProductivos,'estadotca')}}
                                <q-item-label caption>{{listaNombresServidorComponente(servidoresProductivos,'estadotca')}}</q-item-label>
                            </q-item-section>                       
                            <q-item-section class="col-2" side>
                                <q-icon name="check_circle" color="positive" v-if="reglasAlerta.tca.min <= contarComponente(servidoresProductivos,'estadotca') && contarComponente(servidoresProductivos,'estadotca') <= reglasAlerta.tca.max" size="md"/>
                                <q-icon name="report_problem" color="negative" v-else size="md"/>
                            </q-item-section>
                            <q-tooltip v-if="!modoMovil" class="bg-negative" anchor="center right" self="center left" :offset="[17, 0]" transition-show="slide-left" transition-hide="scale">
                                <div class="text-subtitle1" style="text-align: center; font-family: customFont;"> Regla: minimo {{reglasAlerta.tca.min}} y maximo {{reglasAlerta.tca.max}} componente <b>TCA</b> en todos los appservers </div>
                            </q-tooltip>
                        </q-item>

                        <q-item clickable class="item">                 
                            <q-item-section avatar top class="col-2">
                                <q-icon name="subdirectory_arrow_right" size="34px" />
                            </q-item-section>
                            <q-item-section class="col-8">
                                Componentes KPI activos: {{contarComponente(servidoresProductivos,'estadokpi')}}
                                <q-item-label caption>{{listaNombresServidorComponente(servidoresProductivos,'estadokpi')}}</q-item-label>
                            </q-item-section>                       
                            <q-item-section class="col-2" side>
                                <q-icon name="check_circle" color="positive" v-if="reglasAlerta.kpi.min <= contarComponente(servidoresProductivos,'estadokpi') && contarComponente(servidoresProductivos,'estadokpi') <= reglasAlerta.kpi.max" size="md"/>
                                <q-icon name="report_problem" color="negative" v-else size="md"/>
                            </q-item-section>
                            <q-tooltip v-if="!modoMovil" class="bg-negative" anchor="center right" self="center left" :offset="[17, 0]" transition-show="slide-left" transition-hide="scale">
                                <div class="text-subtitle1" style="text-align: center; font-family: customFont;"> Regla: minimo {{reglasAlerta.kpi.min}} y maximo {{reglasAlerta.kpi.max}} componente <b>KPI</b> en todos los appservers </div>
                            </q-tooltip>
                        </q-item>                        
    
                    </q-list>
                </div>
            </q-card-section>
            </q-card>
    </div>

</template>

<script>
import { onMounted, computed, ref } from "vue";
import { useQuasar } from 'quasar'
import { useStore } from "vuex";
const moment = require('moment');
import { serverURL } from 'boot/api'

import io from "socket.io-client";
var socket = io(serverURL, {
  path: '/socket',
  autoConnect: true,
  transports: ["websocket", "polling"],
});

export default {
    props: ['tablero'],
    setup(){
        const store = useStore();
        const quasar = useQuasar();
        const modoMovil = computed(() => { return quasar.platform.is.mobile || quasar.screen.lt.md })
        const servidores = computed(() => store.getters['getServers'])
        if(servidores.value.length==0){ store.dispatch('getServers');}

        //filtra los servidores por tipo para hacer calculos
        const servidoresDesarrollo = computed(() => { return servidores.value.filter((server) => server.tiposervidor_id==2 && server.rolservidor=='desarrollo' && server.estado); });
        const servidoresProductivos = computed(() => { return servidores.value.filter((server) => server.tiposervidor_id==2 && server.rolservidor=='productivo' && server.estado); });
        const servidoresCromo = computed(() => { return servidores.value.filter((server) => server.tiposervidor_id==3 && server.estado && server.rolservidor=='productivo'); });
        const servidoresDatabase = computed(() => { return servidores.value.filter((server) => server.tiposervidor_id==4 && server.estado && server.rolservidor=='productivo'); });
        
        const totalProductivos = computed(() => contarServidores(servidoresProductivos) );
        const totalDesarrollo = computed(() => contarServidores(servidoresDesarrollo) );
        const totalCromo = computed(() => contarServidores(servidoresCromo) );
        const totalDatabase = computed(() => contarServidores(servidoresDatabase) );

        //devuelve verdadero si hay algun componente sensible repetido o apagado en todos los appservers
        const alertaProductivos = computed(() => store.getters['getAlertaVigente']);

        //se definen las columnas de la tabla de logs
        const eventos_cols = [
        { name: 'evento_horario', style: 'width: 120px', align: 'center', label: 'Fecha/Hora', field: row => row.evento_horario,  sortable: true },
        { name: 'evento_usuario', style: 'width: 120px', align: 'left', label: 'Usuario', field: row => row.evento_usuario, sortable: true },
        { name: 'evento_tipo', style: 'width: 100px', align: 'center', label: 'Tipo', field: row => row.evento_tipo, sortable: true },
        { name: 'evento_mensaje', align: 'left', label: 'Mensaje', sortable: false },
        ]
        
        //opciones de paginacion en tabla de logs
        const pagination = ref({
            sortBy: 'evento_horario',
            descending: true,
            rowsPerPage: 0
        })

        //loading en listado de eventos
        const cargandoEventos = ref(true);

        store.dispatch('setEventos')
        .then(()=>{ cargandoEventos.value = false; })

        const eventos_rows = computed(() => store.getters['getEventos']);
        const reglasAlerta = computed(() => store.getters['getReglasAlerta']);

        
        onMounted(() => {
            
            setHeightTablaEventos();            

            // si el backend guarda un evento en la base de datos avisa para actualizar los clientes
            socket.on('updateEventos', () => {
                store.dispatch('setEventos');
            });
        })



        //---------- METHODS ---------------       
        
        //redimensiona el alto de la tabla eventos segun su contenedor
        function setHeightTablaEventos() {
            if(!modoMovil.value){
                //redimensiono la lista componentes del Tablero
                let alto_tablero_totales = window.getComputedStyle(document.querySelector(".tablero_totales")).height;
                let tablero_componentes = document.querySelector(".tablero_componentes");
                tablero_componentes.style.setProperty('height', 'calc( 100vh - '+alto_tablero_totales+' - 210px)'); 

                //redimensiono la tabla eventos
                let tabla = document.querySelector(".tabla_eventos");
                tabla.style.setProperty('height', 'calc(100vh - 195px)'); // -195px aprox. (cabecera + paddings)
            }
        }

        //parsea el valor numerico a string
        function parseTipoEvento(tipo){
            switch(tipo){
                case 1: return("Info");
                case 2: return("Error");
                case 3: return("Warning");
            }
        }

        //formatea la fecha que se muestra en los logs
        function formatFechaEvento(fecha){
            return moment(fecha).format("DD-MM-YYYY HH:mm:ss")
        }
        
        //elimina los HTML tags <> del mensaje
        function parseMensajeEvento(mensaje){
            
            //provisorio! modificar mensajes desde el BACKEND
            /*
            let temp = mensaje;
            temp = temp.replace("<ul><li style='color: red;'>","<ul style='padding-left: 0; list-style-type: none;'><li style='color: red;'>")
            temp = temp.replace("<li style='color: green;'>","<li style='padding-left: 0; list-style-type: none;'>")
            temp = temp.replace("<li style='color: red;'> E","<li style='padding-left: 0; list-style-type: none;'> E")
            return temp;
            */
            return mensaje.replace(/<(?!(b|\/b)\s*\/?)[^>]+>/g, "") 
        }

        //pasada una lista de servidores devuelve una cadena con sus Hostnames concatenados
        function listaNombresServidor(lista){ 
            let cadena = ''
            let contador = 0;
            Object.values(lista).forEach(server => { 
                if(contador<lista.length-1) {cadena += server.serverhostname + " | "; contador++; }
                else{cadena += server.serverhostname;}
            });
            return cadena; 
        };

        function contarServidores(lista){
            let contador = 0;
            Object.values(lista.value).forEach(server => { 
                contador++;
            });
            return contador; 
        }
        
        //igual que listaNombresServidor pero solo lista el nombre segun tenga el componente activo
        function listaNombresServidorComponente(lista, componente){ 
            let cadena = ''
            let contador = 0;
            Object.values(lista).forEach(server => { 
                if(server[componente]=='SI'){
                    if(contador<lista.length-1) {cadena += server.serverhostname + " | "; contador++; }
                    else{cadena += server.serverhostname;}
                }
            });
            return cadena; 
        };

        //se pasa como parametro la lista de servidores y que componente (su nombre en la base de datos) se desea contabilizar. Solo cuenta ACTIVOS
        function contarComponente(lista,componente){
            let contador = 0;
            Object.values(lista).forEach(server => { 
                if(server[componente]=='SI' && server.estado){contador++;}
            });
            return contador;
        };

        return {
            servidores,
            servidoresProductivos,
            servidoresDesarrollo,
            servidoresCromo,
            servidoresDatabase,
            totalProductivos,
            totalDesarrollo,
            totalCromo,
            totalDatabase,
            listaNombresServidor,
            contarServidores,
            listaNombresServidorComponente,
            contarComponente,
            alertaProductivos,
            modoMovil,
            eventos_cols,
            eventos_rows,
            parseTipoEvento,
            formatFechaEvento,
            parseMensajeEvento,
            pagination,
            setHeightTablaEventos,
            reglasAlerta,
            cargandoEventos
            }
    }
}
</script>

<style scoped>

.tooltipText_General {
    font-size: 10pt;
}
.tooltipText_Updatetime {
    font-size: 8.75pt;
}

.body--dark .tablero {
    background-color: #2a2c33;
    color: white;
}
.label{
    margin-top: 0px; 
    margin-bottom: 0px;
    padding-top: 0px; 
    padding-bottom: 10px;
    font-size: 10pt;
    text-align: center;
}

</style>
