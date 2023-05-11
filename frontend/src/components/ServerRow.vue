<template>
    <!-- DENTRO DE TBODY -->
    <tr>
        <td style="text-align:center; padding: 1px;"> <!--  TIPO SERVER  -->
            <q-btn no-caps flat class="tablaGenerico" v-if="server.tiposervidor_id==1 && server.estado" @click="dialogo_mostrar_tarjeta = true"> Generico </q-btn>
            <q-btn no-caps class="tablaGenerico" v-else-if="server.tiposervidor_id==1 && !server.estado" disable> Generico </q-btn>

            <q-btn no-caps flat class="tablaAppserverProductivo" v-else-if="server.tiposervidor_id==2 && server.estado && server.rolservidor=='productivo'" @click="dialogo_mostrar_tarjeta = true"> AppServer </q-btn>
            <q-btn no-caps flat class="tablaAppserverDesarrollo" v-else-if="server.tiposervidor_id==2 && server.estado && server.rolservidor=='desarrollo'" @click="dialogo_mostrar_tarjeta = true"> AppServer </q-btn>
            <q-btn no-caps class="tablaAppserverProductivo" v-else-if="server.tiposervidor_id==2 && !server.estado && server.rolservidor=='productivo'" disable> AppServer </q-btn>
            <q-btn no-caps class="tablaAppserverDesarrollo" v-else-if="server.tiposervidor_id==2 && !server.estado && server.rolservidor=='desarrollo'" disable> AppServer </q-btn>
            
            <q-btn no-caps flat class="tablaCromoProductivo" v-else-if="server.tiposervidor_id==3 && server.estado && server.rolservidor=='productivo'" @click="dialogo_mostrar_tarjeta = true"> Cromo </q-btn>
            <q-btn no-caps flat class="tablaCromoDesarrollo" v-else-if="server.tiposervidor_id==3 && server.estado && server.rolservidor=='desarrollo'" @click="dialogo_mostrar_tarjeta = true"> Cromo </q-btn>
            <q-btn no-caps class="tablaCromoProductivo" v-else-if="server.tiposervidor_id==3 && !server.estado && server.rolservidor=='productivo'" disable> Cromo </q-btn>
            <q-btn no-caps class="tablaCromoDesarrollo" v-else-if="server.tiposervidor_id==3 && !server.estado && server.rolservidor=='desarrollo'" disable> Cromo </q-btn>

            <q-btn no-caps flat class="tablaDatabaseProductivo" v-else-if="server.tiposervidor_id==4 && server.estado && server.rolservidor=='productivo'" @click="dialogo_mostrar_tarjeta = true"> Database </q-btn>
            <q-btn no-caps flat class="tablaDatabaseDesarrollo" v-else-if="server.tiposervidor_id==4 && server.estado && server.rolservidor=='desarrollo'" @click="dialogo_mostrar_tarjeta = true"> Database </q-btn>
            <q-btn no-caps class="tablaDatabaseProductivo" v-else-if="server.tiposervidor_id==4 && !server.estado && server.rolservidor=='productivo'" disable> Database </q-btn>
            <q-btn no-caps class="tablaDatabaseDesarrollo" v-else-if="server.tiposervidor_id==4 && !server.estado && server.rolservidor=='desarrollo'" disable> Database </q-btn>
        </td>    
        <td> <!--  ROL  -->
            <span> {{server.rolservidor}} </span>
        </td>           
           
        <td style="text-align:center;"> <!-- ESTADO APP -->
            <q-icon v-if="!server.estado" name="cancel" size="25px" color="grey" />
            <q-icon v-else-if="server.tiposervidor_id==2 && server.appserverestado === 'UP'" name="check_circle" size="25px" color="positive" />
            <q-icon v-else-if="server.tiposervidor_id==2 && server.appserverestado === 'DOWN'" name="cancel" size="25px" color="grey" />
            <q-icon v-else-if="server.tiposervidor_id==3 && server.cromoalive === 'SI'" name="check_circle" size="25px" color="positive" />
            <q-icon v-else-if="server.tiposervidor_id==3 && server.cromoalive === 'NO'" name="cancel" size="25px" color="grey" />
            <q-icon v-else-if="server.tiposervidor_id!=2 && server.tiposervidor_id!=3" name="help_outline" size="25px" color="grey" />

            <q-tooltip v-if="server.estado && (server.tiposervidor_id==2 || server.tiposervidor_id==3)" class="tooltipGenerico" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">          
                <div class="tooltipText_Updatetime" v-if="server.tiposervidor_id==2"> {{ parseTimestamp(getServerLogsPorIp(server.serverip).appserverestado) }} </div>
                <div class="tooltipText_Updatetime" v-else-if="server.tiposervidor_id==3"> {{ parseTimestamp(getServerLogsPorIp(server.serverip).cromoalive) }} </div>
            </q-tooltip>
        </td>
        <td>{{server.serverhostname.split('.')[0]}}</td>    
        <td>{{server.serverip}}</td>     
        <td> <!-- MEMORIA  -->
            <q-linear-progress v-if="parsePorcentaje(server.servermem)<0.33" rounded size="20px" color="positive" :value="parsePorcentaje(server.servermem)" stripe padding>
                <div class="absolute-full flex flex-center text-subtitle1">
                <q-badge color="transparent" text-color="black" :label="(parsePorcentaje(server.servermem)*100).toFixed(1)+'%'" />
                </div>
            </q-linear-progress>
            <q-linear-progress v-else-if="0.33<parsePorcentaje(server.servermem) && parsePorcentaje(server.servermem)<0.66" rounded size="20px" color="warning" :value="parsePorcentaje(server.servermem)" stripe>
                <div class="absolute-full flex flex-center text-subtitle1">
                <q-badge color="transparent" text-color="black" :label="(parsePorcentaje(server.servermem)*100).toFixed(1)+'%'" />
                </div>
            </q-linear-progress>
            <q-linear-progress v-else-if="parsePorcentaje(server.servermem)>0.66" rounded size="20px" color="negative" :value="parsePorcentaje(server.servermem)" stripe>
                <div class="absolute-full flex flex-center text-subtitle1">
                <q-badge color="transparent" text-color="white" :label="(parsePorcentaje(server.servermem)*100).toFixed(1)+'%'" />
                </div>
            </q-linear-progress>
            <q-linear-progress v-else rounded size="20px" color="negative" :value="0" stripe>
                <div class="absolute-full flex flex-center text-subtitle1">
                    <q-badge color="transparent" text-color="white" label="Error" />
                </div>
            </q-linear-progress>

            <q-tooltip v-if="server.estado" class="tooltipGenerico" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">          
                <div class="tooltipText_Updatetime">
                    {{ parseTimestamp(getServerLogsPorIp(server.serverip).servermem) }}
                </div>
            </q-tooltip>
        </td>
        <td> <!-- CPU  -->
            <q-linear-progress v-if="parsePorcentaje(server.servercpu)<0.33" rounded size="20px" color="positive" :value="parsePorcentaje(server.servercpu)" stripe padding>
                <div class="absolute-full flex flex-center text-subtitle1">
                <q-badge color="transparent" text-color="black" :label="(parsePorcentaje(server.servercpu)*100).toFixed(1)+'%'" />
                </div>
            </q-linear-progress>
            <q-linear-progress v-else-if="0.33<parsePorcentaje(server.servercpu) && parsePorcentaje(server.servercpu)<0.66" rounded size="20px" color="warning" :value="parsePorcentaje(server.servercpu)" stripe>
                <div class="absolute-full flex flex-center text-subtitle1">
                <q-badge color="transparent" text-color="black" :label="(parsePorcentaje(server.servercpu)*100).toFixed(1)+'%'" />
                </div>
            </q-linear-progress>
                <q-linear-progress v-else-if="parsePorcentaje(server.servercpu)>0.66" rounded size="20px" color="negative" :value="parsePorcentaje(server.servercpu)" stripe>
                <div class="absolute-full flex flex-center text-subtitle1">
                <q-badge color="transparent" text-color="white" :label="(parsePorcentaje(server.servercpu)*100).toFixed(1)+'%'" />
                </div>
            </q-linear-progress>
            <q-linear-progress v-else rounded size="20px" color="negative" :value="0" stripe>
                <div class="absolute-full flex flex-center text-subtitle1">
                    <q-badge color="transparent" text-color="white" label="Error" />
                </div>
            </q-linear-progress>            
            <q-tooltip v-if="server.estado"  class="tooltipGenerico" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">          
                <div class="tooltipText_Updatetime">
                    {{ parseTimestamp(getServerLogsPorIp(server.serverip).servercpu) }}
                </div>
            </q-tooltip>
        </td>
        <td> <!-- DISCO  -->  
            <q-linear-progress v-if="server.serverdisco<33" rounded size="20px" color="positive" :value="parsePorcentaje(server.serverdisco)" stripe padding>
                <div class="absolute-full flex flex-center text-subtitle1">
                    <q-badge color="transparent" text-color="black" :label="server.serverdisco + '%'" />
                </div>
            </q-linear-progress>
            <q-linear-progress v-else-if="33<server.serverdisco && server.serverdisco<66" rounded size="20px" color="warning" :value="parsePorcentaje(server.serverdisco)" stripe>
                <div class="absolute-full flex flex-center text-subtitle1">
                    <q-badge color="transparent" text-color="black" :label="server.serverdisco + '%'" />
                </div>
            </q-linear-progress>
            <q-linear-progress v-else-if="server.serverdisco>=66" rounded size="20px" color="negative" :value="parsePorcentaje(server.serverdisco)" stripe>
                <div class="absolute-full flex flex-center text-subtitle1">
                    <q-badge color="transparent" text-color="white" :label="server.serverdisco + '%'" />
                </div>
            </q-linear-progress>
            <q-linear-progress v-else rounded size="20px" color="negative" :value="0" stripe>
                <div class="absolute-full flex flex-center text-subtitle1">
                    <q-badge color="transparent" text-color="black" label="Error" />
                </div>
            </q-linear-progress>

            <q-tooltip v-if="server.estado"  class="tooltipGenerico" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">          
                <div class="tooltipText_Updatetime">
                    {{ parseTimestamp(getServerLogsPorIp(server.serverip).serverdisco) }}
                </div>
            </q-tooltip>
            
        </td>        
        <td style="text-align: center;"> <!--  DIAS ONLINE  -->
            {{server.serveruptime}}
            <q-tooltip v-if="server.estado"  class="tooltipGenerico" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">          
                <div class="tooltipText_Updatetime">
                    {{ parseTimestamp(getServerLogsPorIp(server.serverip).serveruptime) }}
                </div>
            </q-tooltip>        
        </td>
        <td style="text-align: center;"> <!--  USUARIOS  -->
            {{server.serverusuarios}}
            <q-tooltip v-if="server.estado"  class="tooltipGenerico" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">          
                <div class="tooltipText_Updatetime">
                    {{ parseTimestamp(getServerLogsPorIp(server.serverip).serverusuarios) }}
                </div>
            </q-tooltip>        
        </td>
    </tr>
   
    <q-dialog v-model="dialogo_mostrar_tarjeta" >
        <div style="overflow: hidden">
            <ServerCard :server="getServerPorIp(server.serverip)"/>
        </div>
    </q-dialog>

</template>

<script>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import ServerCard from "./ServerCard.vue";

export default {
    props: ['server'],
    components: {
        ServerCard
    },
    setup(props){
        const store = useStore();
        // manejo de ventanas de dialogo
        var dialogo_mostrar_tarjeta = ref(false);


        //---------- METHODS ------------
        // formatea los valores en porcentaje
        function parsePorcentaje (cadena) {
            let valor = parseFloat((cadena)/100);
            return valor;
        };

        // formatea la fecha y le agrega ceros a los valores menores a 10
        function parseTimestamp (timestamp) {
            const fecha = new Date(timestamp);
            const addZero = (num) => `${num}`.padStart(2, '0');
            return('Leido: ' + addZero(addZero(fecha.getHours()) +':'+ addZero(fecha.getMinutes()) +':'+ addZero(fecha.getSeconds())  +' - '+ fecha.getDate()) +'/'+ addZero(fecha.getMonth()+1) +'/'+ fecha.getFullYear()  )
        };

        // --------- GETTERS -----------
        const getServerPorIp = computed(() => store.getters['getServerPorIp']);
        const getServerLogsPorIp = computed(() => store.getters['getServerLogsPorIp']);
        const authGetActiveUser = computed(() => store.getters['auth/getActiveUser']);
        const canExecute = computed(() => store.getters['auth/getUserRol']);

        return {
            canExecute,
            dialogo_mostrar_tarjeta,
            //metodos
            parsePorcentaje,
            parseTimestamp,
            //computed (getters)
            authGetActiveUser,
            getServerLogsPorIp,
            getServerPorIp
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

.label{
    margin-top: 0px; 
    margin-bottom: 0px;
    padding-top: 0px; 
    padding-bottom: 10px;
    font-size: 10pt;
    text-align: center;
}

</style>
