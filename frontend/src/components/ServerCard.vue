<template>
    <!-- APP SERVERS  -->
    <div v-if="server.tiposervidor_id==2">
        <!-- SI EL SERVER ESTA ONLINE -->
        <q-card class="tarjetas shadow-5" v-if="server.estado==true">
            
            <q-card-section class="text-white tarjetaCabeceraOnlineAppserverProductivo" v-if="server.rolservidor=='productivo'">
            <div class="text-h5 text-center">{{server.serverhostname.split('.')[0]}}</div>
            <div class="text-subtitle1 text-center">{{server.serverip}}</div>
            </q-card-section>

            <q-card-section class="text-white tarjetaCabeceraOnlineAppserverDesarrollo" v-else>
            <div class="text-h5 text-center">{{server.serverhostname.split('.')[0]}}</div>
            <div class="text-subtitle1 text-center">{{server.serverip}}</div>
            </q-card-section>
            
            <q-card-section class="tarjetaCuerpo" >
            <div class="row">
                <div class="col-6">

                <div>
                    <q-list dense bordered padding style="height: 205px; border-right: none; border-bottom: none;">     
                        <q-item-label  class="label" header>Servidor</q-item-label>
                        
                        <q-item clickable v-ripple>
                            <q-item-section>
                            <q-linear-progress v-if="parsePorcentaje(server.servermem)<0.33" rounded size="20px" color="positive" :value="parsePorcentaje(server.servermem)" stripe padding>
                                <div class="absolute-full flex flex-center text-subtitle1">
                                <q-badge color="transparent" size="13px" text-color="black" :label="'MEM: '+(parsePorcentaje(server.servermem)*100).toFixed(1)+'%'" />
                                </div>
                            </q-linear-progress>
                            <q-linear-progress v-if="0.33<parsePorcentaje(server.servermem) && parsePorcentaje(server.servermem)<0.66" rounded size="20px" color="warning" :value="parsePorcentaje(server.servermem)" stripe>
                                <div class="absolute-full flex flex-center text-subtitle1">
                                <q-badge color="transparent" text-color="black" :label="'MEM: '+(parsePorcentaje(server.servermem)*100).toFixed(1)+'%'" />
                                </div>
                            </q-linear-progress>
                                <q-linear-progress v-if="parsePorcentaje(server.servermem)>0.66" rounded size="20px" color="negative" :value="parsePorcentaje(server.servermem)" stripe>
                                <div class="absolute-full flex flex-center text-subtitle1">
                                <q-badge color="transparent" text-color="white" :label="'MEM: '+(parsePorcentaje(server.servermem)*100).toFixed(1)+'%'" />
                                </div>
                            </q-linear-progress>
                            <q-tooltip class="tooltipAppserver" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">          
                                <div class="tooltipText_Updatetime">
                                    {{ parseTimestamp(getServerLogsPorIp(server.serverip).servermem) }}
                                </div>
                            </q-tooltip>
                            </q-item-section>
                        </q-item>

                        <q-item clickable v-ripple>
                            <q-item-section>
                            <q-linear-progress v-if="parsePorcentaje(server.servercpu)<0.33" rounded size="20px" color="positive" :value="parsePorcentaje(server.servercpu)" stripe padding>
                                <div class="absolute-full flex flex-center text-subtitle1">
                                <q-badge color="transparent" size="13px" text-color="black" :label="'CPU: '+(parsePorcentaje(server.servercpu)*100).toFixed(1)+'%'" />
                                </div>
                            </q-linear-progress>
                            <q-linear-progress v-if="0.33<parsePorcentaje(server.servercpu) && parsePorcentaje(server.servercpu)<0.66" rounded size="20px" color="warning" :value="parsePorcentaje(server.servercpu)" stripe>
                                <div class="absolute-full flex flex-center text-subtitle1">
                                <q-badge color="transparent" text-color="black" :label="'CPU: '+(parsePorcentaje(server.servercpu)*100).toFixed(1)+'%'" />
                                </div>
                            </q-linear-progress>
                                <q-linear-progress v-if="parsePorcentaje(server.servercpu)>0.66" rounded size="20px" color="negative" :value="parsePorcentaje(server.servercpu)" stripe>
                                <div class="absolute-full flex flex-center text-subtitle1">
                                <q-badge color="transparent" text-color="white" :label="'CPU: '+(parsePorcentaje(server.servercpu)*100).toFixed(1)+'%'" />
                                </div>
                            </q-linear-progress>
                            <q-tooltip class="tooltipAppserver" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">          
                                <div class="tooltipText_Updatetime">
                                    {{ parseTimestamp(getServerLogsPorIp(server.serverip).servercpu) }}
                                </div>
                            </q-tooltip>
                            </q-item-section>
                        </q-item>

                        <q-item clickable v-ripple>
                            <q-item-section>
                            Dias Online:
                            </q-item-section>
                            <q-tooltip class="tooltipAppserver" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">          
                                <div class="tooltipText_Updatetime">
                                    {{ parseTimestamp(getServerLogsPorIp(server.serverip).serveruptime) }}
                                </div>
                            </q-tooltip>
                            <q-item-section side>
                            {{server.serveruptime}}
                            </q-item-section>                        
                        </q-item>

                        <q-item clickable v-ripple>
                            <q-item-section>
                            Usuarios:
                            </q-item-section>
                            <q-tooltip class="tooltipAppserver" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">          
                                <div class="tooltipText_Updatetime">
                                    {{ parseTimestamp(getServerLogsPorIp(server.serverip).serverusuarios) }}
                                </div>
                            </q-tooltip>    
                            <q-item-section side>
                            {{server.serverusuarios}}
                            </q-item-section>                                              
                        </q-item>

                        <q-item clickable v-ripple class="items-center">
                            <q-item-section> 
                                Uso disco: 
                            </q-item-section>
                            <q-item-section v-if="server.serverdisco!=''" side>  
                                {{server.serverdisco}}% 
                            </q-item-section>
                            <q-item-section v-else side> N/A </q-item-section>
                            <q-tooltip class="tooltipAppserver" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">          
                                <div class="tooltipText_Updatetime">
                                    {{ parseTimestamp(getServerLogsPorIp(server.serverip).serverdisco) }}
                                </div>
                            </q-tooltip>                          
                        </q-item>
                    </q-list>
                </div>


                <div>
                    <q-list dense bordered padding style="height: 155px; border-right: none; border-bottom: none;">
                    <q-item-label  class="label" header>Appserver</q-item-label>
                    <q-item clickable v-ripple>
                        <q-item-section>
                        Estado: 
                        </q-item-section>
                        <q-tooltip class="tooltipAppserver" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">
                            <div class="tooltipText_Updatetime">          
                                {{ parseTimestamp(getServerLogsPorIp(server.serverip).appserverestado) }}
                            </div>
                        </q-tooltip>                            
                        <q-item-section side>
                        <q-icon v-if="server.appserverestado === 'UP'" name="check_circle" color="positive" />
                        <q-icon v-else-if="server.appserverestado === 'ZOMBIE'" name="local_fire_department" color="negative" />
                        <q-icon v-else name="cancel" color="grey-6" />
                        </q-item-section>
                    </q-item>
                    
                    <q-item clickable v-ripple>
                        <q-item-section>
                        Dias Online:
                        </q-item-section>
                        <q-tooltip class="tooltipAppserver" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">    
                            <div class="tooltipText_Updatetime">      
                                {{ parseTimestamp(getServerLogsPorIp(server.serverip).appserveruptime) }}
                            </div>
                        </q-tooltip>   
                        <q-item-section side>
                        {{server.appserveruptime}}
                        </q-item-section>                                             
                    </q-item>

                    <q-item clickable v-ripple>
                        <q-item-section>
                        Usuarios:
                        </q-item-section>
                        <q-tooltip class="tooltipAppserver" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">     
                            <div class="tooltipText_Updatetime">     
                                {{ parseTimestamp(getServerLogsPorIp(server.serverip).appserverusuarios) }}
                            </div>
                        </q-tooltip>  
                        <q-item-section side>
                        {{server.appserverusuarios}}
                        </q-item-section>                                              
                    </q-item>
                    </q-list>
                </div>
                </div>

                <div class="col-6">
                <div>
                    <q-list dense bordered padding style="height: 360px; border-bottom: none;">
                    <q-item-label  class="label" header>Componentes CERTA</q-item-label>
                    <q-item clickable v-ripple>
                        <q-item-section>
                        SCADA: 
                        </q-item-section>
                        <q-tooltip class="tooltipAppserver" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">     
                            <div class="tooltipText_Updatetime">     
                                {{ parseTimestamp(getServerLogsPorIp(server.serverip).estadoscada) }}
                            </div>
                        </q-tooltip>                               
                        <q-item-section side>
                        <q-icon v-if="server.estadoscada === 'SI'" name="check_circle" color="positive" />
                        <q-icon v-else name="cancel" color="grey-6" />
                        </q-item-section>
                    </q-item>

                    <q-item clickable v-ripple>
                        <q-item-section>
                        NBM: 
                        </q-item-section>
                        <q-tooltip class="tooltipAppserver" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]"> 
                            <div class="tooltipText_Updatetime">         
                                {{ parseTimestamp(getServerLogsPorIp(server.serverip).estadonbm) }}
                            </div>
                        </q-tooltip>                            
                        <q-item-section side>
                        <q-icon v-if="server.estadonbm === 'SI'" name="check_circle" color="positive" />
                        <q-icon v-else name="cancel" color="grey-6" />
                        </q-item-section>
                    </q-item>

                    <q-item clickable v-ripple>
                        <q-item-section>
                        Web Container:
                        </q-item-section>
                        <q-tooltip class="tooltipAppserver" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">          
                            <div class="tooltipText_Updatetime">
                                {{ parseTimestamp(getServerLogsPorIp(server.serverip).estadotca) }}
                            </div>
                        </q-tooltip>                            
                        <q-item-section side>
                        <q-icon v-if="server.estadotca === 'SI'" name="check_circle" color="positive" />
                        <q-icon v-else name="cancel" color="grey-6" />
                        </q-item-section>
                    </q-item>

                    <q-item clickable v-ripple>
                        <q-item-section>
                        OMS Container:
                        </q-item-section>
                        <q-tooltip class="tooltipAppserver" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">
                            <div class="tooltipText_Updatetime">          
                                {{ parseTimestamp(getServerLogsPorIp(server.serverip).estadoomscontainer) }}
                            </div>
                        </q-tooltip>                            
                        <q-item-section side>
                        <q-icon v-if="server.estadoomscontainer === 'SI'" name="check_circle" color="positive" />
                        <q-icon v-else name="cancel" color="grey-6" />
                        </q-item-section>
                    </q-item>

                    <q-item clickable v-ripple>
                        <q-item-section>
                        OMS Link:
                        </q-item-section>
                        <q-tooltip class="tooltipAppserver" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">
                            <div class="tooltipText_Updatetime">          
                                {{ parseTimestamp(getServerLogsPorIp(server.serverip).estadoomslink) }}
                            </div>
                        </q-tooltip>                              
                        <q-item-section side>
                        <q-icon v-if="server.estadoomslink === 'SI'" name="check_circle" color="positive" />
                        <q-icon v-else name="cancel" color="grey-6" />
                        </q-item-section>
                    </q-item>

                    <q-item clickable v-ripple>
                        <q-item-section>
                        OMS Agatha:
                        </q-item-section>
                        <q-tooltip class="tooltipAppserver" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">
                            <div class="tooltipText_Updatetime">          
                                {{ parseTimestamp(getServerLogsPorIp(server.serverip).estadoomsagatha) }}
                            </div>
                        </q-tooltip>                               
                        <q-item-section side>
                        <q-icon v-if="server.estadoomsagatha === 'SI'" name="check_circle" color="positive" />
                        <q-icon v-else name="cancel" color="grey-6" />
                        </q-item-section>
                    </q-item>

                    <q-item clickable v-ripple>
                        <q-item-section>
                        OMS Monitor:
                        </q-item-section>
                        <q-tooltip class="tooltipAppserver" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">
                            <div class="tooltipText_Updatetime">          
                                {{ parseTimestamp(getServerLogsPorIp(server.serverip).estadoomssituacion) }}
                            </div>
                        </q-tooltip>                               
                        <q-item-section side>
                        <q-icon v-if="server.estadoomssituacion === 'SI'" name="check_circle" color="positive" />
                        <q-icon v-else name="cancel" color="grey-6" />
                        </q-item-section>
                    </q-item>

                    <q-item clickable v-ripple>
                        <q-item-section>
                        OMS Notif.:
                        </q-item-section>
                        <q-tooltip class="tooltipAppserver" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">
                            <div class="tooltipText_Updatetime">          
                                {{ parseTimestamp(getServerLogsPorIp(server.serverip).estadoomsnotificacion) }}
                            </div>
                        </q-tooltip>                            
                        <q-item-section side>
                        <q-icon v-if="server.estadoomsnotificacion === 'SI'" name="check_circle" color="positive" />
                        <q-icon v-else name="cancel" color="grey-6" />
                        </q-item-section>
                    </q-item>
                    <q-item clickable v-ripple>
                        <q-item-section>
                        OMS Customer:
                        </q-item-section>
                        <q-tooltip class="tooltipAppserver" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">          
                            <div class="tooltipText_Updatetime">
                                {{ parseTimestamp(getServerLogsPorIp(server.serverip).estadoomscustomer) }}
                            </div>
                        </q-tooltip>                            
                        <q-item-section side>
                        <q-icon v-if="server.estadoomscustomer === 'SI'" name="check_circle" color="positive" />
                        <q-icon v-else name="cancel" color="grey-6" />
                        </q-item-section>
                    </q-item>  
                    <q-item clickable v-ripple>
                        <q-item-section>
                        KPI Mobile:
                        </q-item-section>
                        <q-tooltip class="tooltipAppserver" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">          
                            <div class="tooltipText_Updatetime">
                                {{ parseTimestamp(getServerLogsPorIp(server.serverip).estadokpi) }}
                            </div>
                        </q-tooltip>                            
                        <q-item-section side>
                        <q-icon v-if="server.estadokpi === 'SI'" name="check_circle" color="positive" />
                        <q-icon v-else name="cancel" color="grey-6" />
                        </q-item-section>
                    </q-item>                                     
                    </q-list>
                </div>
                </div>
            </div>
            <div class="row">
                <q-list dense bordered class="col-6 q-pt-sm q-pb-md" style="border-right: none;">
                    <q-item-label  class="label" header>Control Appserver</q-item-label>
                        <div class="q-pl-md q-pr-lg q-gutter-x-lg row">
                            <div class="col-2">
                                <q-btn v-if="server.appserverestado === 'DOWN' && canExecute==true && !server.comandoenejecucion" @click="confirmarDialogo('iniciar el Appserver?','iniciaappserver')"  class="botonAccionesSrv" padding="xs sm" outline icon="login"/>
                                    <q-btn v-else disable color="grey-6" class="botonAccionesSrv" padding="xs sm" outline icon="login"/>
                                <q-tooltip v-if="canExecute==true && !server.comandoenejecucion" class="tooltipAppserver"  transition-show="scale" transition-hide="scale" :offset="[0, 5]"><div class="tooltipText_General"> Iniciar Appserver </div></q-tooltip>
                                <q-tooltip v-else-if="canExecute==true && server.comandoenejecucion" class="tooltipAppserver"  transition-show="scale" transition-hide="scale" :offset="[0, 5]"><div class="tooltipText_General"> Ejecucion en curso </div></q-tooltip>
                                <q-tooltip v-else class="bg-negative"  transition-show="scale" transition-hide="scale" :offset="[0, 5]"> <div class="tooltipText_General"> Solo administradores </div> </q-tooltip> 
                            </div>
                            <div class="col-2">
                                <q-btn v-if="server.appserverestado === 'UP' && canExecute==true && !server.comandoenejecucion" @click="confirmarDialogo('apagar el Appserver?','apagaappserver')"  class="botonAccionesSrv" padding="xs sm" outline icon="power_settings_new"/>
                                    <q-btn v-else disable color="grey-6" class="botonAccionesSrv" padding="xs sm" outline icon="power_settings_new"/>
                                <q-tooltip v-if="canExecute==true && !server.comandoenejecucion" class="tooltipAppserver"  transition-show="scale" transition-hide="scale" :offset="[0, 5]"> <div class="tooltipText_General"> Detener Appserver </div></q-tooltip>   
                                <q-tooltip v-else-if="canExecute==true && server.comandoenejecucion" class="tooltipAppserver"  transition-show="scale" transition-hide="scale" :offset="[0, 5]"><div class="tooltipText_General"> Ejecucion en curso </div></q-tooltip>
                                <q-tooltip v-else class="bg-negative"  transition-show="scale" transition-hide="scale" :offset="[0, 5]"> <div class="tooltipText_General"> Solo administradores </div> </q-tooltip> 
                            </div>
                            <div class="col-2">
                            <q-btn v-if="server.appserverestado === 'UP' && canExecute==true && !server.comandoenejecucion" @click="confirmarDialogo('reiniciar el Appserver?','reiniciaappserver')"  class="botonAccionesSrv" padding="xs sm" outline icon="autorenew" />
                                <q-btn v-else disable color="grey-6" class="botonAccionesSrv" padding="xs sm" outline icon="autorenew" />
                                <q-tooltip v-if="canExecute==true && !server.comandoenejecucion" class="tooltipAppserver"  transition-show="scale" transition-hide="scale" :offset="[0, 5]"><div class="tooltipText_General"> Reiniciar Appserver </div></q-tooltip>
                                <q-tooltip v-else-if="canExecute==true && server.comandoenejecucion" class="tooltipAppserver"  transition-show="scale" transition-hide="scale" :offset="[0, 5]"><div class="tooltipText_General"> Ejecucion en curso </div></q-tooltip>
                                <q-tooltip v-else class="bg-negative"  transition-show="scale" transition-hide="scale" :offset="[0, 5]"> <div class="tooltipText_General"> Solo administradores </div> </q-tooltip>    
                            </div>
                        </div>
                </q-list>
                <q-list dense bordered class="col-6 q-pt-sm q-pb-md">
                    <q-item-label  class="label" header>Componentes</q-item-label>
                        <div class="q-px-md q-mx-sx q-gutter-x-sx text-center self-center">
                            <q-btn v-if="server.appserverestado === 'UP' && canExecute==true && !server.comandoenejecucion" @click="dialogo_switch_componentes = true" class="botonAccionesSrv" padding="xs md" outline icon="menu" style="width: 100%;"/>
                                <q-btn v-else disable color="grey-6" class="botonAccionesSrv" padding="xs md" outline icon="menu" style="width: 100%;"/>
                                <q-tooltip v-if="canExecute==true && !server.comandoenejecucion" class="tooltipAppserver"  transition-show="scale" transition-hide="scale" :offset="[0, 5]"> <div class="tooltipText_General"> Control de componentes </div> </q-tooltip>    
                                <q-tooltip v-else-if="canExecute==true && server.comandoenejecucion" class="tooltipAppserver"  transition-show="scale" transition-hide="scale" :offset="[0, 5]"><div class="tooltipText_General"> Ejecucion en curso </div></q-tooltip>
                                <q-tooltip v-else class="bg-negative"  transition-show="scale" transition-hide="scale" :offset="[0, 5]"> <div class="tooltipText_General"> Solo administradores </div> </q-tooltip>    
                        </div>
                </q-list>
            </div>
        </q-card-section>
        </q-card>
        <!-- SI EL SERVER NO ESTA ONLINE -->
        <q-card v-else class="tarjetas shadow-5">
            
            <q-card-section class="text-white tarjetaCabeceraOffline">
            <div class="text-h5 text-center">{{server.serverhostname}}</div>
            <div class="text-subtitle1 text-center">{{server.serverip}}</div>
            </q-card-section>
        
            <q-card-section class="tarjetaCuerpo">
            <div class="row">
                <div class="col-6">

                <div>
                    <q-list dense bordered padding style="height: 210px; border-right: none; border-bottom: none;">                   
                    <q-item-label class="label" header>Servidor</q-item-label>
                    
                    <q-item clickable v-ripple>
                        <q-item-section>
                        <q-linear-progress rounded size="20px" color="positive" :value="0" stripe padding>
                            <div class="absolute-full flex flex-center text-subtitle1">
                            <q-badge color="transparent" text-color="black" :label="'MEM: 0%'" />
                            </div>
                        </q-linear-progress>
                        </q-item-section>
                    </q-item>

                    <q-item clickable v-ripple>
                        <q-item-section>
                        <q-linear-progress rounded size="20px" color="positive" :value="0" stripe padding>
                            <div class="absolute-full flex flex-center text-subtitle1">
                            <q-badge color="transparent" text-color="black" :label="'CPU: 0%'" />
                            </div>
                        </q-linear-progress>
                        </q-item-section>
                    </q-item>

                    <q-item clickable v-ripple>
                        <q-item-section> Dias Online:</q-item-section>
                        <q-item-section side> 0 </q-item-section>
                    </q-item>

                    <q-item clickable v-ripple>
                        <q-item-section> Usuarios: </q-item-section>
                        <q-item-section side> N/A </q-item-section>                    
                    </q-item>

                    <q-item clickable v-ripple>
                        <q-item-section> Uso disco: </q-item-section>
                        <q-item-section side> N/A </q-item-section>
                    </q-item>
                    </q-list>
                </div>


                <div>
                    <q-list dense bordered padding style="height: 235px; border-right: none; ">
                    <q-item-label  class="label" header>Appserver</q-item-label>
                    <q-item clickable v-ripple>
                        <q-item-section>
                        Estado: 
                        </q-item-section>                          
                        <q-item-section side>
                        <q-icon name="cancel" color="grey-6" />
                        </q-item-section>
                    </q-item>
                    
                    <q-item clickable v-ripple>
                        <q-item-section> Dias Online: </q-item-section>
                        <q-item-section side> 0 </q-item-section>
                    </q-item>

                    <q-item clickable v-ripple>
                        <q-item-section> Usuarios: </q-item-section>
                        <q-item-section side> N/A </q-item-section>
                    </q-item>
                    </q-list>
                </div>
                </div>

                <div class="col-6">
                <div>
                    <q-list dense bordered padding style="height: 445px; border-bottom: true;">
                    <q-item-label  class="label" header>Componentes CERTA</q-item-label>
                    <q-item clickable v-ripple>
                        <q-item-section>
                            SCADA: 
                        </q-item-section>                           
                        <q-item-section side>
                            <q-icon name="cancel" color="grey-6" />
                        </q-item-section>
                    </q-item>

                    <q-item clickable v-ripple>
                        <q-item-section>
                            NBM: 
                        </q-item-section>                        
                        <q-item-section side>
                            <q-icon name="cancel" color="grey-6" />
                        </q-item-section>
                    </q-item>

                    <q-item clickable v-ripple>
                        <q-item-section>
                            Web Container: 
                        </q-item-section>                      
                        <q-item-section side>
                            <q-icon name="cancel" color="grey-6" />
                        </q-item-section>
                    </q-item>

                    <q-item clickable v-ripple>
                        <q-item-section>
                            OMS Container: 
                        </q-item-section>                         
                        <q-item-section side>
                            <q-icon name="cancel" color="grey-6" />
                        </q-item-section>
                    </q-item>

                    <q-item clickable v-ripple>
                        <q-item-section>
                            OMS Link: 
                        </q-item-section>                           
                        <q-item-section side>
                            <q-icon name="cancel" color="grey-6" />
                        </q-item-section>
                    </q-item>

                    <q-item clickable v-ripple>
                        <q-item-section>
                            OMS Agatha: 
                        </q-item-section>                           
                        <q-item-section side>
                            <q-icon name="cancel" color="grey-6" />
                        </q-item-section>
                    </q-item>

                    <q-item clickable v-ripple>
                        <q-item-section>
                            OMS Monitor: 
                        </q-item-section>                              
                        <q-item-section side>
                            <q-icon name="cancel" color="grey-6" />
                        </q-item-section>
                    </q-item>

                    <q-item clickable v-ripple>
                        <q-item-section>
                            OMS Notif.: 
                        </q-item-section>                        
                        <q-item-section side>
                            <q-icon name="cancel" color="grey-6" />
                        </q-item-section>
                    </q-item>

                    <q-item clickable v-ripple>
                        <q-item-section>
                            OMS Customer: 
                        </q-item-section>                         
                        <q-item-section side>
                            <q-icon name="cancel" color="grey-6" />
                        </q-item-section>
                    </q-item>  
                    <q-item clickable v-ripple>
                        <q-item-section>
                            KPI Mobile: 
                        </q-item-section>                         
                        <q-item-section side>
                            <q-icon name="cancel" color="grey-6" />
                        </q-item-section>
                    </q-item>                                      
                    </q-list>
                </div>
                </div>
            </div>
            </q-card-section>
        </q-card>
    </div>
    <!-- CROMO SERVERS  -->
    <div v-else-if="server.tiposervidor_id==3">
        <!-- SI EL SERVER ESTA ONLINE -->
        <q-card class="tarjetas shadow-5" v-if="server.estado==true">
            
            <q-card-section class="text-white tarjetaCabeceraOnlineCromoProductivo" v-if="server.rolservidor=='productivo'">
            <div class="text-h5 text-center">{{server.serverhostname.split('.')[0]}}</div>
            <div class="text-subtitle1 text-center">{{server.serverip}}</div>
            </q-card-section>

            <q-card-section class="text-white tarjetaCabeceraOnlineCromoDesarrollo" v-else>
            <div class="text-h5 text-center">{{server.serverhostname.split('.')[0]}}</div>
            <div class="text-subtitle1 text-center">{{server.serverip}}</div>
            </q-card-section>
            
            <q-card-section class="tarjetaCuerpo" >
                    <div class="col-12">
                        <div>
                            <q-list dense bordered padding style="height: 205px; border-bottom: none;">     
                                <q-item-label  class="label" header>Servidor</q-item-label>
                                
                                <q-item clickable v-ripple>
                                    <q-item-section>
                                    <q-linear-progress v-if="parsePorcentaje(server.servermem)<0.33" rounded size="20px" color="positive" :value="parsePorcentaje(server.servermem)" stripe padding>
                                        <div class="absolute-full flex flex-center text-subtitle1">
                                        <q-badge color="transparent" size="13px" text-color="black" :label="'MEM: '+(parsePorcentaje(server.servermem)*100).toFixed(1)+'%'" />
                                        </div>
                                    </q-linear-progress>
                                    <q-linear-progress v-if="0.33<parsePorcentaje(server.servermem) && parsePorcentaje(server.servermem)<0.66" rounded size="20px" color="warning" :value="parsePorcentaje(server.servermem)" stripe>
                                        <div class="absolute-full flex flex-center text-subtitle1">
                                        <q-badge color="transparent" text-color="black" :label="'MEM: '+(parsePorcentaje(server.servermem)*100).toFixed(1)+'%'" />
                                        </div>
                                    </q-linear-progress>
                                        <q-linear-progress v-if="parsePorcentaje(server.servermem)>0.66" rounded size="20px" color="negative" :value="parsePorcentaje(server.servermem)" stripe>
                                        <div class="absolute-full flex flex-center text-subtitle1">
                                        <q-badge color="transparent" text-color="white" :label="'MEM: '+(parsePorcentaje(server.servermem)*100).toFixed(1)+'%'" />
                                        </div>
                                    </q-linear-progress>
                                    <q-tooltip class="tooltipCromo" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">          
                                        <div class="tooltipText_Updatetime">
                                            {{ parseTimestamp(getServerLogsPorIp(server.serverip).servermem) }}
                                        </div>
                                    </q-tooltip>
                                    </q-item-section>
                                </q-item>

                                <q-item clickable v-ripple>
                                    <q-item-section>
                                    <q-linear-progress v-if="parsePorcentaje(server.servercpu)<0.33" rounded size="20px" color="positive" :value="parsePorcentaje(server.servercpu)" stripe padding>
                                        <div class="absolute-full flex flex-center text-subtitle1">
                                        <q-badge color="transparent" size="13px" text-color="black" :label="'CPU: '+(parsePorcentaje(server.servercpu)*100).toFixed(1)+'%'" />
                                        </div>
                                    </q-linear-progress>
                                    <q-linear-progress v-if="0.33<parsePorcentaje(server.servercpu) && parsePorcentaje(server.servercpu)<0.66" rounded size="20px" color="warning" :value="parsePorcentaje(server.servercpu)" stripe>
                                        <div class="absolute-full flex flex-center text-subtitle1">
                                        <q-badge color="transparent" text-color="black" :label="'CPU: '+(parsePorcentaje(server.servercpu)*100).toFixed(1)+'%'" />
                                        </div>
                                    </q-linear-progress>
                                        <q-linear-progress v-if="parsePorcentaje(server.servercpu)>0.66" rounded size="20px" color="negative" :value="parsePorcentaje(server.servercpu)" stripe>
                                        <div class="absolute-full flex flex-center text-subtitle1">
                                        <q-badge color="transparent" text-color="white" :label="'CPU: '+(parsePorcentaje(server.servercpu)*100).toFixed(1)+'%'" />
                                        </div>
                                    </q-linear-progress>
                                    <q-tooltip class="tooltipCromo" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">          
                                        <div class="tooltipText_Updatetime">
                                            {{ parseTimestamp(getServerLogsPorIp(server.serverip).servercpu) }}
                                        </div>
                                    </q-tooltip>
                                    </q-item-section>
                                </q-item>

                                <q-item clickable v-ripple>
                                    <q-item-section>
                                    Dias Online:
                                    </q-item-section>
                                    <q-tooltip class="tooltipCromo" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">          
                                        <div class="tooltipText_Updatetime">
                                            {{ parseTimestamp(getServerLogsPorIp(server.serverip).serveruptime) }}
                                        </div>
                                    </q-tooltip>
                                    <q-item-section side>
                                    {{server.serveruptime}}
                                    </q-item-section>                        
                                </q-item>

                                <q-item clickable v-ripple>
                                    <q-item-section>
                                    Usuarios:
                                    </q-item-section>
                                    <q-tooltip class="tooltipCromo" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">          
                                        <div class="tooltipText_Updatetime">
                                            {{ parseTimestamp(getServerLogsPorIp(server.serverip).serverusuarios) }}
                                        </div>
                                    </q-tooltip>    
                                    <q-item-section side>
                                    {{server.serverusuarios}}
                                    </q-item-section>                                              
                                </q-item>

                                <q-item clickable v-ripple class="items-center">
                                    <q-item-section> 
                                        Uso disco: 
                                    </q-item-section>
                                    <q-item-section v-if="server.serverdisco!=''" side>  
                                        {{server.serverdisco}}% 
                                    </q-item-section>
                                    <q-item-section v-else side> N/A </q-item-section>
                                    <q-tooltip class="tooltipCromo" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">          
                                        <div class="tooltipText_Updatetime">
                                            {{ parseTimestamp(getServerLogsPorIp(server.serverip).serverdisco) }}
                                        </div>
                                    </q-tooltip>                          
                                </q-item>
                            </q-list>
                        </div>
                    </div>

                    <div class="col-12">
                        <q-list class="q-py-sm" dense bordered style="height: 155px; border-bottom: none;">
                            <q-item-label class="label" header>CROMO</q-item-label>
                                
                                <q-list dense class="row">
                                    <q-item clickable v-ripple class="col-5" style="padding-top: 0px; padding-bottom: 0px;">
                                        <q-item-section>
                                        Instalado: 
                                        </q-item-section>
                                        <q-tooltip class="tooltipCromo" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">
                                            <div class="tooltipText_Updatetime">          
                                                {{ parseTimestamp(getServerLogsPorIp(server.serverip).cromoinstalled) }}
                                            </div>
                                        </q-tooltip>                            
                                        <q-item-section side>
                                        <q-icon v-if="server.cromoinstalled === 'SI'" name="check_circle" color="positive" />
                                        <q-icon v-else name="cancel" color="grey-6" />
                                        </q-item-section>
                                    </q-item>

                                    <q-item class="col-2"/>

                                    <q-item  clickable v-ripple class="col-5">
                                        <q-item-section>
                                        Version:
                                        </q-item-section>
                                        <q-tooltip class="tooltipCromo" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">    
                                            <div class="tooltipText_Updatetime">      
                                                {{ parseTimestamp(getServerLogsPorIp(server.serverip).cromoalive) }}
                                            </div>
                                        </q-tooltip>   
                                        <q-item-section side>
                                            {{server.cromoversion}}
                                        </q-item-section>                                            
                                    </q-item>
                                </q-list>

                                <q-list dense class="row">    

                                    <q-item clickable v-ripple class="col-5" style="padding-top: 0px; padding-bottom: 0px;">
                                        <q-item-section>
                                        Corriendo:
                                        </q-item-section>
                                        <q-tooltip class="tooltipCromo" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">    
                                            <div class="tooltipText_Updatetime">      
                                                {{ parseTimestamp(getServerLogsPorIp(server.serverip).cromoalive) }}
                                            </div>
                                        </q-tooltip>   
                                        <q-item-section side>
                                        <q-icon v-if="server.cromoalive === 'SI'" name="check_circle" color="positive" />
                                        <q-icon v-else-if="server.cromoalive === 'ER'" name="error" color="negative" />
                                        <q-icon v-else name="cancel" color="grey-6" />
                                        </q-item-section>                                             
                                    </q-item>

                                    <q-item class="col-2"/>

                                    <q-item  clickable v-ripple class="col-5">
                                        <q-item-section>
                                        CromoMovil:
                                        </q-item-section>
                                        <q-tooltip class="tooltipCromo" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">    
                                            <div class="tooltipText_Updatetime">      
                                                {{ parseTimestamp(getServerLogsPorIp(server.serverip).cromoalive) }}
                                            </div>
                                        </q-tooltip>   
                                        <q-item-section side>
                                        <q-icon v-if="server.cromomovilalive === 'SI'" name="check_circle" color="positive" />
                                        <q-icon v-else-if="server.cromomovilalive === 'ER'" name="error" color="negative" />
                                        <q-icon v-else name="cancel" color="grey-6" />
                                        </q-item-section>                                            
                                    </q-item>
                                </q-list>
                                
                                <q-item clickable v-ripple class="col-12">
                                    <q-item-section>
                                    Base de Datos:
                                    </q-item-section>
                                    <q-tooltip class="tooltipCromo" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">     
                                        <div class="tooltipText_Updatetime">     
                                            {{ parseTimestamp(getServerLogsPorIp(server.serverip).cromodb) }}
                                        </div>
                                    </q-tooltip>  
                                    <q-item-section side>
                                        {{server.cromodb.split('@')[1]}}
                                    </q-item-section>                                              
                                </q-item>                                


                        </q-list>
                    </div>

                    <div class="col-12">
                        <q-list dense bordered class="q-pt-sm q-pb-md">
                            <q-item-label  class="label" header>CROMO Controles</q-item-label>
                                <div class="q-gutter-x-lg row" style="max-width: 307px; position: relative; left: 20px;">
                                    <div class="col">
                                        <q-btn v-if="server.cromoalive === 'NO' && canExecute==true && !server.comandoenejecucion" @click="confirmarDialogo('iniciar Cromo?','cromostart')"  class="botonAccionesSrv" padding="xs sm" outline icon="login"/>
                                        <q-btn v-else disable color="grey-6" class="botonAccionesSrv" padding="xs sm" outline icon="login"/>
                                        <q-tooltip v-if="canExecute==true && !server.comandoenejecucion" class="tooltipCromo"  transition-show="scale" transition-hide="scale" :offset="[0, 5]"><div class="tooltipText_General"> Iniciar Cromo </div></q-tooltip>
                                        <q-tooltip v-else-if="canExecute==true && server.comandoenejecucion" class="tooltipCromo"  transition-show="scale" transition-hide="scale" :offset="[0, 5]"><div class="tooltipText_General"> Ejecucion en curso </div></q-tooltip>
                                        <q-tooltip v-else class="bg-negative"  transition-show="scale" transition-hide="scale" :offset="[0, 5]"> <div class="tooltipText_General"> Solo administradores </div> </q-tooltip> 
                                    </div>
                                    <div class="col">
                                        <q-btn v-if="server.cromoalive === 'SI' && canExecute==true && !server.comandoenejecucion" @click="confirmarDialogo('hacer quick-restart de Cromo?','cromoquickrestart')"  class="botonAccionesSrv" padding="xs sm" outline icon="bolt"/>
                                        <q-btn v-else disable color="grey-6" class="botonAccionesSrv" padding="xs sm" outline icon="bolt"/>
                                        <q-tooltip v-if="canExecute==true && !server.comandoenejecucion" class="tooltipCromo"  transition-show="scale" transition-hide="scale" :offset="[0, 5]"><div class="tooltipText_General"> Cromo Quick-Restart </div></q-tooltip>
                                        <q-tooltip v-else-if="canExecute==true && server.comandoenejecucion" class="tooltipCromo"  transition-show="scale" transition-hide="scale" :offset="[0, 5]"><div class="tooltipText_General"> Ejecucion en curso </div></q-tooltip>
                                        <q-tooltip v-else class="bg-negative"  transition-show="scale" transition-hide="scale" :offset="[0, 5]"> <div class="tooltipText_General"> Solo administradores </div> </q-tooltip>    
                                    </div>
                                    <div class="col">
                                        <q-btn v-if="server.cromoalive === 'SI' && canExecute==true && !server.comandoenejecucion" @click="confirmarDialogo('hacer full-stop de Cromo?','cromofullstop')"  class="botonAccionesSrv" padding="xs sm" outline icon="power_settings_new"/>
                                        <q-btn v-else disable color="grey-6" class="botonAccionesSrv" padding="xs sm" outline icon="power_settings_new"/>
                                        <q-tooltip v-if="canExecute==true && !server.comandoenejecucion" class="tooltipCromo"  transition-show="scale" transition-hide="scale" :offset="[0, 5]"> <div class="tooltipText_General"> Cromo Full-Stop </div></q-tooltip>   
                                        <q-tooltip v-else-if="canExecute==true && server.comandoenejecucion" class="tooltipCromo"  transition-show="scale" transition-hide="scale" :offset="[0, 5]"><div class="tooltipText_General"> Ejecucion en curso </div></q-tooltip>
                                        <q-tooltip v-else class="bg-negative"  transition-show="scale" transition-hide="scale" :offset="[0, 5]"> <div class="tooltipText_General"> Solo administradores </div> </q-tooltip> 
                                    </div>                        
                                    <div class="col">
                                        <q-btn v-if="server.cromoalive === 'SI' && canExecute==true && !server.comandoenejecucion" @click="confirmarDialogo('hacer full-restart de Cromo?','cromofullrestart')"  class="botonAccionesSrv" padding="xs sm" outline icon="autorenew"/>
                                        <q-btn v-else disable color="grey-6" class="botonAccionesSrv" padding="xs sm" outline icon="autorenew"/>
                                        <q-tooltip v-if="canExecute==true && !server.comandoenejecucion" class="tooltipCromo"  transition-show="scale" transition-hide="scale" :offset="[0, 5]"> <div class="tooltipText_General"> Cromo Full-Restart </div></q-tooltip>   
                                        <q-tooltip v-else-if="canExecute==true && server.comandoenejecucion" class="tooltipCromo"  transition-show="scale" transition-hide="scale" :offset="[0, 5]"><div class="tooltipText_General"> Ejecucion en curso </div></q-tooltip>
                                        <q-tooltip v-else class="bg-negative"  transition-show="scale" transition-hide="scale" :offset="[0, 5]"> <div class="tooltipText_General"> Solo administradores </div> </q-tooltip> 
                                    </div>
                                    <div class="col">
                                        <q-btn v-if="server.cromoalive === 'SI' && canExecute==true && !server.comandoenejecucion" @click="confirmarDialogo('recrear database clientes de Cromo?','cromorecrearbaseclientes')"  class="botonAccionesSrv" padding="xs sm" outline icon="storage" />
                                        <q-btn v-else disable color="grey-6" class="botonAccionesSrv" padding="xs sm" outline icon="storage" />
                                        <q-tooltip v-if="canExecute==true && !server.comandoenejecucion" class="tooltipCromo"  transition-show="scale" transition-hide="scale" :offset="[0, 5]"><div class="tooltipText_General"> Recrear Database Clientes </div></q-tooltip>
                                        <q-tooltip v-else-if="canExecute==true && server.comandoenejecucion" class="tooltipCromo"  transition-show="scale" transition-hide="scale" :offset="[0, 5]"><div class="tooltipText_General"> Ejecucion en curso </div></q-tooltip>
                                        <q-tooltip v-else class="bg-negative"  transition-show="scale" transition-hide="scale" :offset="[0, 5]"> <div class="tooltipText_General"> Solo administradores </div> </q-tooltip>    
                                    </div>
                                    <div class="col">
                                        <q-btn v-if="server.cromomovilalive === 'SI' && canExecute==true && !server.comandoenejecucion" @click="confirmarDialogo('exportar mapas de CromoMovil?','cromomovilexportarmapas')"  class="botonAccionesSrv" padding="xs sm" outline icon="map"/>
                                        <q-btn v-else disable color="grey-6" class="botonAccionesSrv" padding="xs sm" outline icon="map"/>
                                        <q-tooltip v-if="canExecute==true && !server.comandoenejecucion" class="tooltipCromo"  transition-show="scale" transition-hide="scale" :offset="[0, 5]"> <div class="tooltipText_General"> Exportar mapas de CromoMovil</div></q-tooltip>   
                                        <q-tooltip v-else-if="canExecute==true && server.comandoenejecucion" class="tooltipCromo"  transition-show="scale" transition-hide="scale" :offset="[0, 5]"><div class="tooltipText_General"> Ejecucion en curso </div></q-tooltip>
                                        <q-tooltip v-else class="bg-negative"  transition-show="scale" transition-hide="scale" :offset="[0, 5]"> <div class="tooltipText_General"> Solo administradores </div> </q-tooltip> 
                                    </div>                            
                                </div>
                        </q-list>
                    </div>
            </q-card-section>
        </q-card>
        <!-- SI EL SERVER NO ESTA ONLINE -->
        <q-card class="tarjetas shadow-5" v-else>
            
            <q-card-section class="text-white tarjetaCabeceraOffline">
            <div class="text-h5 text-center">{{server.serverhostname.split('.')[0]}}</div>
            <div class="text-subtitle1 text-center">{{server.serverip}}</div>
            </q-card-section>
            
            <q-card-section class="tarjetaCuerpo" >
            <div class="row">
                <div class="col-12">

                <div>
                    <q-list dense bordered padding style="height: 205px; border-bottom: none;">     
                        <q-item-label  class="label" header>Servidor</q-item-label>
                        
                    <q-item clickable v-ripple>
                        <q-item-section>
                        <q-linear-progress rounded size="20px" color="positive" :value="0" stripe padding>
                            <div class="absolute-full flex flex-center text-subtitle1">
                            <q-badge color="transparent" text-color="black" :label="'MEM: 0%'" />
                            </div>
                        </q-linear-progress>
                        </q-item-section>
                    </q-item>

                    <q-item clickable v-ripple>
                        <q-item-section>
                        <q-linear-progress rounded size="20px" color="positive" :value="0" stripe padding>
                            <div class="absolute-full flex flex-center text-subtitle1">
                            <q-badge color="transparent" text-color="black" :label="'CPU: 0%'" />
                            </div>
                        </q-linear-progress>
                        </q-item-section>
                    </q-item>

                    <q-item clickable v-ripple>
                        <q-item-section> Dias Online:</q-item-section>
                        <q-item-section side> 0 </q-item-section>
                    </q-item>

                    <q-item clickable v-ripple>
                        <q-item-section> Usuarios: </q-item-section>
                        <q-item-section side> N/A </q-item-section>                    
                    </q-item>

                    <q-item clickable v-ripple>
                        <q-item-section> Uso disco: </q-item-section>
                        <q-item-section side> N/A </q-item-section>
                    </q-item>                         
                    </q-list>
                </div>


                <div>
                    <q-list dense bordered padding style="height: 240px;">
                    <q-item-label  class="label" header>CROMO</q-item-label>
                    <q-item clickable v-ripple>
                        <q-item-section>
                        Instalado: 
                        </q-item-section>                         
                        <q-item-section side>
                            <q-icon name="cancel" color="grey-6" />
                        </q-item-section>
                    </q-item>
                    
                    <q-item clickable v-ripple>
                        <q-item-section>
                        Corriendo:
                        </q-item-section>
                        <q-item-section side>
                            <q-icon name="cancel" color="grey-6" />
                        </q-item-section>                                             
                    </q-item>

                    <q-item clickable v-ripple>
                        <q-item-section>
                        Base Datos:
                        </q-item-section>
                        <q-item-section side>
                            N/A
                        </q-item-section>                                              
                    </q-item>

                    </q-list>
                </div>
                </div>

            </div>
        </q-card-section>
        </q-card>
    </div>
    <!-- SERVERS GENERICOS  -->
    <div v-else-if="server.tiposervidor_id==1">
        <!-- SI EL SERVER ESTA ONLINE -->
        <q-card class="tarjetas shadow-5" v-if="server.estado==true">
            
            <q-card-section class="text-white tarjetaCabeceraOnlineGenericoProductivo" v-if="server.rolservidor=='productivo'">
                <div class="text-h5 text-center">{{server.serverhostname.split('.')[0]}}</div>
                <div class="text-subtitle1 text-center">{{server.serverip}}</div>
            </q-card-section>

            <q-card-section class="text-white tarjetaCabeceraOnlineGenericoDesarrollo" v-else>
                <div class="text-h5 text-center">{{server.serverhostname.split('.')[0]}}</div>
                <div class="text-subtitle1 text-center">{{server.serverip}}</div>
            </q-card-section>
            
            <q-card-section class="tarjetaCuerpo" >
            <div class="row">
                <div class="col-12">

                <div>
                    <q-list dense bordered padding style="height: 445px;">     
                        <q-item-label  class="label" header>Servidor</q-item-label>
                        
                        <q-item clickable v-ripple>
                            <q-item-section>
                            <q-linear-progress v-if="parsePorcentaje(server.servermem)<0.33" rounded size="20px" color="positive" :value="parsePorcentaje(server.servermem)" stripe padding>
                                <div class="absolute-full flex flex-center text-subtitle1">
                                <q-badge color="transparent" size="13px" text-color="black" :label="'MEM: '+(parsePorcentaje(server.servermem)*100).toFixed(1)+'%'" />
                                </div>
                            </q-linear-progress>
                            <q-linear-progress v-if="0.33<parsePorcentaje(server.servermem) && parsePorcentaje(server.servermem)<0.66" rounded size="20px" color="warning" :value="parsePorcentaje(server.servermem)" stripe>
                                <div class="absolute-full flex flex-center text-subtitle1">
                                <q-badge color="transparent" text-color="black" :label="'MEM: '+(parsePorcentaje(server.servermem)*100).toFixed(1)+'%'" />
                                </div>
                            </q-linear-progress>
                                <q-linear-progress v-if="parsePorcentaje(server.servermem)>0.66" rounded size="20px" color="negative" :value="parsePorcentaje(server.servermem)" stripe>
                                <div class="absolute-full flex flex-center text-subtitle1">
                                <q-badge color="transparent" text-color="white" :label="'MEM: '+(parsePorcentaje(server.servermem)*100).toFixed(1)+'%'" />
                                </div>
                            </q-linear-progress>
                            <q-tooltip class="tooltipGenerico" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">          
                                <div class="tooltipText_Updatetime">
                                    {{ parseTimestamp(getServerLogsPorIp(server.serverip).servermem) }}
                                </div>
                            </q-tooltip>
                            </q-item-section>
                        </q-item>

                        <q-item clickable v-ripple>
                            <q-item-section>
                            <q-linear-progress v-if="parsePorcentaje(server.servercpu)<0.33" rounded size="20px" color="positive" :value="parsePorcentaje(server.servercpu)" stripe padding>
                                <div class="absolute-full flex flex-center text-subtitle1">
                                <q-badge color="transparent" size="13px" text-color="black" :label="'CPU: '+(parsePorcentaje(server.servercpu)*100).toFixed(1)+'%'" />
                                </div>
                            </q-linear-progress>
                            <q-linear-progress v-if="0.33<parsePorcentaje(server.servercpu) && parsePorcentaje(server.servercpu)<0.66" rounded size="20px" color="warning" :value="parsePorcentaje(server.servercpu)" stripe>
                                <div class="absolute-full flex flex-center text-subtitle1">
                                <q-badge color="transparent" text-color="black" :label="'CPU: '+(parsePorcentaje(server.servercpu)*100).toFixed(1)+'%'" />
                                </div>
                            </q-linear-progress>
                                <q-linear-progress v-if="parsePorcentaje(server.servercpu)>0.66" rounded size="20px" color="negative" :value="parsePorcentaje(server.servercpu)" stripe>
                                <div class="absolute-full flex flex-center text-subtitle1">
                                <q-badge color="transparent" text-color="white" :label="'CPU: '+(parsePorcentaje(server.servercpu)*100).toFixed(1)+'%'" />
                                </div>
                            </q-linear-progress>
                            <q-tooltip class="tooltipGenerico" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">          
                                <div class="tooltipText_Updatetime">
                                    {{ parseTimestamp(getServerLogsPorIp(server.serverip).servercpu) }}
                                </div>
                            </q-tooltip>
                            </q-item-section>
                        </q-item>

                        <q-item clickable v-ripple>
                            <q-item-section>
                            Dias Online:
                            </q-item-section>
                            <q-tooltip class="tooltipGenerico" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">          
                                <div class="tooltipText_Updatetime">
                                    {{ parseTimestamp(getServerLogsPorIp(server.serverip).serveruptime) }}
                                </div>
                            </q-tooltip>
                            <q-item-section side>
                            {{server.serveruptime}}
                            </q-item-section>                        
                        </q-item>

                        <q-item clickable v-ripple>
                            <q-item-section>
                            Usuarios:
                            </q-item-section>
                            <q-tooltip class="tooltipGenerico" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">          
                                <div class="tooltipText_Updatetime">
                                    {{ parseTimestamp(getServerLogsPorIp(server.serverip).serverusuarios) }}
                                </div>
                            </q-tooltip>    
                            <q-item-section side>
                            {{server.serverusuarios}}
                            </q-item-section>                                              
                        </q-item>

                        <q-item clickable v-ripple class="items-center">
                            <q-item-section> 
                                Uso disco: 
                            </q-item-section>
                            <q-item-section v-if="server.serverdisco!=''" side>  
                                {{server.serverdisco}}% 
                            </q-item-section>
                            <q-item-section v-else side> N/A </q-item-section>
                            <q-tooltip class="tooltipGenerico" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">          
                                <div class="tooltipText_Updatetime">
                                    {{ parseTimestamp(getServerLogsPorIp(server.serverip).serverdisco) }}
                                </div>
                            </q-tooltip>                          
                        </q-item>
                    </q-list>
                </div>
                </div>
            </div>
        </q-card-section>
        </q-card>
        <!-- SI EL SERVER NO ESTA ONLINE -->
        <q-card class="tarjetas shadow-5" v-else>
            
            <q-card-section class="text-white tarjetaCabeceraOffline">
            <div class="text-h5 text-center">{{server.serverhostname.split('.')[0]}}</div>
            <div class="text-subtitle1 text-center">{{server.serverip}}</div>
            </q-card-section>
            
            <q-card-section class="tarjetaCuerpo" >
            <div class="row">
                <div class="col-12">

                <div>
                    <q-list dense bordered padding style="height: 445px;">     
                        <q-item-label  class="label" header>Servidor</q-item-label>
                        
                    <q-item clickable v-ripple>
                        <q-item-section>
                        <q-linear-progress rounded size="20px" color="positive" :value="0" stripe padding>
                            <div class="absolute-full flex flex-center text-subtitle1">
                            <q-badge color="transparent" text-color="black" :label="'MEM: 0%'" />
                            </div>
                        </q-linear-progress>
                        </q-item-section>
                    </q-item>

                    <q-item clickable v-ripple>
                        <q-item-section>
                        <q-linear-progress rounded size="20px" color="positive" :value="0" stripe padding>
                            <div class="absolute-full flex flex-center text-subtitle1">
                            <q-badge color="transparent" text-color="black" :label="'CPU: 0%'" />
                            </div>
                        </q-linear-progress>
                        </q-item-section>
                    </q-item>

                    <q-item clickable v-ripple>
                        <q-item-section> Dias Online:</q-item-section>
                        <q-item-section side> 0 </q-item-section>
                    </q-item>

                    <q-item clickable v-ripple>
                        <q-item-section> Usuarios: </q-item-section>
                        <q-item-section side> N/A </q-item-section>                    
                    </q-item>

                    <q-item clickable v-ripple>
                        <q-item-section> Uso disco: </q-item-section>
                        <q-item-section side> N/A </q-item-section>
                    </q-item>                         
                    </q-list>
                </div>

                </div>

            </div>
        </q-card-section>
        </q-card>
    </div>    
    <!-- SERVERS DATABASE  -->
    <div v-else-if="server.tiposervidor_id==4">
        <!-- SI EL SERVER ESTA ONLINE -->
        <q-card class="tarjetas shadow-5" v-if="server.estado==true">
            
            <q-card-section class="text-white tarjetaCabeceraOnlineDatabaseProductivo" v-if="server.rolservidor=='productivo'">
            <div class="text-h5 text-center">{{server.serverhostname.split('.')[0]}}</div>
            <div class="text-subtitle1 text-center">{{server.serverip}}</div>
            </q-card-section>

            <q-card-section class="text-white tarjetaCabeceraOnlineDatabaseDesarrollo" v-else>
            <div class="text-h5 text-center">{{server.serverhostname.split('.')[0]}}</div>
            <div class="text-subtitle1 text-center">{{server.serverip}}</div>
            </q-card-section>
            
            <q-card-section class="tarjetaCuerpo" >
            <div class="row">
                <div class="col-12">

                <div>
                    <q-list dense bordered padding style="height: 445px;">     
                        <q-item-label  class="label" header>Servidor</q-item-label>
                        
                        <q-item clickable v-ripple>
                            <q-item-section>
                            <q-linear-progress v-if="parsePorcentaje(server.servermem)<0.33" rounded size="20px" color="positive" :value="parsePorcentaje(server.servermem)" stripe padding>
                                <div class="absolute-full flex flex-center text-subtitle1">
                                <q-badge color="transparent" size="13px" text-color="black" :label="'MEM: '+(parsePorcentaje(server.servermem)*100).toFixed(1)+'%'" />
                                </div>
                            </q-linear-progress>
                            <q-linear-progress v-if="0.33<parsePorcentaje(server.servermem) && parsePorcentaje(server.servermem)<0.66" rounded size="20px" color="warning" :value="parsePorcentaje(server.servermem)" stripe>
                                <div class="absolute-full flex flex-center text-subtitle1">
                                <q-badge color="transparent" text-color="black" :label="'MEM: '+(parsePorcentaje(server.servermem)*100).toFixed(1)+'%'" />
                                </div>
                            </q-linear-progress>
                                <q-linear-progress v-if="parsePorcentaje(server.servermem)>0.66" rounded size="20px" color="negative" :value="parsePorcentaje(server.servermem)" stripe>
                                <div class="absolute-full flex flex-center text-subtitle1">
                                <q-badge color="transparent" text-color="white" :label="'MEM: '+(parsePorcentaje(server.servermem)*100).toFixed(1)+'%'" />
                                </div>
                            </q-linear-progress>
                            <q-tooltip class="tooltipGenerico" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">          
                                <div class="tooltipText_Updatetime">
                                    {{ parseTimestamp(getServerLogsPorIp(server.serverip).servermem) }}
                                </div>
                            </q-tooltip>
                            </q-item-section>
                        </q-item>

                        <q-item clickable v-ripple>
                            <q-item-section>
                            <q-linear-progress v-if="parsePorcentaje(server.servercpu)<0.33" rounded size="20px" color="positive" :value="parsePorcentaje(server.servercpu)" stripe padding>
                                <div class="absolute-full flex flex-center text-subtitle1">
                                <q-badge color="transparent" size="13px" text-color="black" :label="'CPU: '+(parsePorcentaje(server.servercpu)*100).toFixed(1)+'%'" />
                                </div>
                            </q-linear-progress>
                            <q-linear-progress v-if="0.33<parsePorcentaje(server.servercpu) && parsePorcentaje(server.servercpu)<0.66" rounded size="20px" color="warning" :value="parsePorcentaje(server.servercpu)" stripe>
                                <div class="absolute-full flex flex-center text-subtitle1">
                                <q-badge color="transparent" text-color="black" :label="'CPU: '+(parsePorcentaje(server.servercpu)*100).toFixed(1)+'%'" />
                                </div>
                            </q-linear-progress>
                                <q-linear-progress v-if="parsePorcentaje(server.servercpu)>0.66" rounded size="20px" color="negative" :value="parsePorcentaje(server.servercpu)" stripe>
                                <div class="absolute-full flex flex-center text-subtitle1">
                                <q-badge color="transparent" text-color="white" :label="'CPU: '+(parsePorcentaje(server.servercpu)*100).toFixed(1)+'%'" />
                                </div>
                            </q-linear-progress>
                            <q-tooltip class="tooltipGenerico" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">          
                                <div class="tooltipText_Updatetime">
                                    {{ parseTimestamp(getServerLogsPorIp(server.serverip).servercpu) }}
                                </div>
                            </q-tooltip>
                            </q-item-section>
                        </q-item>

                        <q-item clickable v-ripple>
                            <q-item-section>
                            Dias Online:
                            </q-item-section>
                            <q-tooltip class="tooltipGenerico" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">          
                                <div class="tooltipText_Updatetime">
                                    {{ parseTimestamp(getServerLogsPorIp(server.serverip).serveruptime) }}
                                </div>
                            </q-tooltip>
                            <q-item-section side>
                            {{server.serveruptime}}
                            </q-item-section>                        
                        </q-item>

                        <q-item clickable v-ripple>
                            <q-item-section>
                            Usuarios:
                            </q-item-section>
                            <q-tooltip class="tooltipGenerico" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">          
                                <div class="tooltipText_Updatetime">
                                    {{ parseTimestamp(getServerLogsPorIp(server.serverip).serverusuarios) }}
                                </div>
                            </q-tooltip>    
                            <q-item-section side>
                            {{server.serverusuarios}}
                            </q-item-section>                                              
                        </q-item>

                        <q-item clickable v-ripple class="items-center">
                            <q-item-section> 
                                Uso disco: 
                            </q-item-section>
                            <q-item-section v-if="server.serverdisco!=''" side>  
                                {{server.serverdisco}}% 
                            </q-item-section>
                            <q-item-section v-else side> N/A </q-item-section>
                            <q-tooltip class="tooltipGenerico" anchor="bottom middle" transition-show="scale" transition-hide="scale" :offset="[0, 5]">          
                                <div class="tooltipText_Updatetime">
                                    {{ parseTimestamp(getServerLogsPorIp(server.serverip).serverdisco) }}
                                </div>
                            </q-tooltip>                          
                        </q-item>
                    </q-list>
                </div>
                </div>
            </div>
        </q-card-section>
        </q-card>
        <!-- SI EL SERVER NO ESTA ONLINE -->
        <q-card class="tarjetas shadow-5" v-else>
            
            <q-card-section class="text-white tarjetaCabeceraOffline">
            <div class="text-h5 text-center">{{server.serverhostname.split('.')[0]}}</div>
            <div class="text-subtitle1 text-center">{{server.serverip}}</div>
            </q-card-section>
            
            <q-card-section class="tarjetaCuerpo" >
            <div class="row">
                <div class="col-12">

                <div>
                    <q-list dense bordered padding style="height: 445px;">     
                        <q-item-label  class="label" header>Servidor</q-item-label>
                        
                    <q-item clickable v-ripple>
                        <q-item-section>
                        <q-linear-progress rounded size="20px" color="positive" :value="0" stripe padding>
                            <div class="absolute-full flex flex-center text-subtitle1">
                            <q-badge color="transparent" text-color="black" :label="'MEM: 0%'" />
                            </div>
                        </q-linear-progress>
                        </q-item-section>
                    </q-item>

                    <q-item clickable v-ripple>
                        <q-item-section>
                        <q-linear-progress rounded size="20px" color="positive" :value="0" stripe padding>
                            <div class="absolute-full flex flex-center text-subtitle1">
                            <q-badge color="transparent" text-color="black" :label="'CPU: 0%'" />
                            </div>
                        </q-linear-progress>
                        </q-item-section>
                    </q-item>

                    <q-item clickable v-ripple>
                        <q-item-section> Dias Online:</q-item-section>
                        <q-item-section side> 0 </q-item-section>
                    </q-item>

                    <q-item clickable v-ripple>
                        <q-item-section> Usuarios: </q-item-section>
                        <q-item-section side> N/A </q-item-section>                    
                    </q-item>

                    <q-item clickable v-ripple>
                        <q-item-section> Uso disco: </q-item-section>
                        <q-item-section side> N/A </q-item-section>
                    </q-item>                         
                    </q-list>
                </div>

                </div>

            </div>
        </q-card-section>
        </q-card>
    </div>  

    <!-- DIALOG CONFIRMACION DE ACCIONES  -->
    <q-dialog v-model="dialogo_confirma_accion" persistent>
        <q-card style="width: 480px; max-width: 480px;">
            <q-card-section class="items-center">
                <div class="row text-center">
                    <div class="col-1">
                        <q-avatar icon="announcement" color="negative" text-color="white" />
                    </div>
                    <div class="col-11">
                        <div class="q-mx-lg text-subtitle1">Esta seguro que desea <span style="font-weight: bold;">{{dialogo_mensaje_confirmacion}}</span></div>
                        <div class="q-mx-lg text-subtitle1">en el servidor <span class="text-negative" style="font-weight: bold;">{{server.serverhostname.split('.')[0].toUpperCase()}}</span></div>
                    </div>
                </div>
            </q-card-section>

            <q-card-actions align="right">
                <q-btn flat :loading="boton_dialogo_confirma_accion" label="Aceptar" color="primary" @click="dialogo_seguridad_accion=true" />
                <q-btn flat label="Cancel" color="primary" v-close-popup />
            </q-card-actions>
        </q-card>
    </q-dialog>
        <!-- DIALOG SEGURIDAD DE ACCIONES  -->
    <q-dialog v-model="dialogo_seguridad_accion" persistent>
        <q-card>
            <q-card-section class="items-center text-center">
                <span class="q-mx-md text-subtitle1 text-bold">Vuelva a ingresar la contraseña para confirmar: </span>
                <q-form
                @submit.prevent.stop="onSubmit"
                >
                    <q-input
                    ref="formulario"
                    autofocus
                    item-aligned
                    label-color="negative"
                    color="negative"
                    v-model="password"
                    type="password"
                    label="Contraseña"
                    autocomplete="no"
                    lazy-rules
                    :rules="[(val) => !!val || 'La contraseña es obligatoria']"
                    >
                    <template v-slot:prepend>
                        <q-icon name="lock" color="negative"/>
                    </template>
                    </q-input>

                    <q-card-actions align="right">
                        <q-btn flat label="Aceptar" color="primary" type="submit"/>
                        <q-btn flat label="Cancel" color="primary" v-close-popup />
                    </q-card-actions>
            </q-form>
            </q-card-section>
        </q-card>
    </q-dialog>
    <!-- DIALOG SWITCH COMPONENTES APPSERVER -->
    <q-dialog v-model="dialogo_switch_componentes">
        <q-card class="dialogo_componentes">

            <q-card-section class="text-white row items-center tarjetaCabeceraOnlineAppserverProductivo" v-if="server.rolservidor=='productivo'">
                <div class="text-h5">{{server.serverhostname.split('.')[0]}}</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
                <div class="text-subtitle2 text-center">Control de componentes</div>
            </q-card-section>

            <q-card-section class="text-white row items-center tarjetaCabeceraOnlineAppserverDesarrollo" v-else>
                <div class="text-h5">{{server.serverhostname.split('.')[0]}}</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
                <div class="text-subtitle2 text-center">Control de componentes</div>
            </q-card-section>

            <q-card-section>
                <q-list dense bordered padding style="border-bottom: none;">                   
                <q-item-label  class="label" header>Componentes de appserver</q-item-label>
                    <q-item class="col-12">
                        <div class="row items-center" style="width: 100%;"> 
                            <div class="col-2">
                                <q-icon v-if="server.estadoscada === 'SI'" name="check_circle" color="positive" style="font-size: 25px;"/>
                                <q-icon v-else name="cancel" color="grey-6" style="font-size: 25px;"/>
                            </div>
                            <div class="col-8">SCADA </div>                    
                            <q-space/>
                            <div class="col-2 text-right" >
                                <q-btn unelevated class="q-py-xs q-mr-xs"  v-if="server.estadoscada === 'SI'" icon="power_settings_new" color="primary" size="11px" @click="confirmarDialogo('detener SCADA','switchscada')" style="width: 30px;"/>
                                <q-btn outline class="q-py-xs q-mr-xs"  v-if="server.estadoscada === 'NO'" icon="power_settings_new" color="primary" size="11px" @click="confirmarDialogo('iniciar SCADA','switchscada')" style="width: 30px;"/>
                                    <q-tooltip class="tooltipAppserver" v-if="server.estadoscada === 'SI'" anchor="center right" self="center left" :offset="[5, 10]"> 
                                        <div class="tooltipText_General">
                                            Detener servicio 
                                        </div>
                                    </q-tooltip>                            
                                    <q-tooltip class="tooltipAppserver" v-else anchor="center right" self="center left" :offset="[5, 10]">
                                        <div class="tooltipText_General">
                                            Iniciar servicio 
                                        </div>
                                    </q-tooltip>                            
                            </div>
                        </div>
                    </q-item>

                    <q-item class="col-12">
                        <div class="row items-center" style="width: 100%;"> 
                            <div class="col-2">
                                <q-icon v-if="server.estadonbm === 'SI'" name="check_circle" color="positive" style="font-size: 25px;"/>
                                <q-icon v-else name="cancel" color="grey-6" style="font-size: 25px;"/>
                            </div>
                            <div class="col-8">NBM </div>                    
                            <q-space/>
                            <div class="col-2 text-right" >
                                <q-btn unelevated class="q-py-xs q-mr-xs"  v-if="server.estadonbm === 'SI'" icon="power_settings_new" color="primary" size="11px" @click="confirmarDialogo('detener NBM','switchnbm')" style="width: 30px;"/>
                                <q-btn outline class="q-py-xs q-mr-xs"  v-if="server.estadonbm === 'NO'" icon="power_settings_new" color="primary" size="11px" @click="confirmarDialogo('iniciar NBM','switchnbm')" style="width: 30px;"/>
                                    <q-tooltip class="tooltipAppserver" v-if="server.estadonbm === 'SI'" anchor="center right" self="center left" :offset="[5, 10]"> 
                                        <div class="tooltipText_General">
                                            Detener servicio 
                                        </div>
                                    </q-tooltip>                            
                                    <q-tooltip class="tooltipAppserver" v-else anchor="center right" self="center left" :offset="[5, 10]">
                                        <div class="tooltipText_General">
                                            Iniciar servicio 
                                        </div> 
                                    </q-tooltip>                                                        
                            </div>
                        </div>
                    </q-item>

                    <q-item class="col-12">
                        <div class="row items-center" style="width: 100%;"> 
                            <div class="col-2">
                                <q-icon v-if="server.estadotca === 'SI'" name="check_circle" color="positive" style="font-size: 25px;"/>
                                <q-icon v-else name="cancel" color="grey-6" style="font-size: 25px;"/>
                            </div>
                            <div class="col-8">Web Container </div>                    
                            <q-space/>
                            <div class="col-2 text-right" >
                                <q-btn unelevated class="q-py-xs q-mr-xs"  v-if="server.estadotca === 'SI'" icon="power_settings_new" color="primary" size="11px" @click="confirmarDialogo('detener Web Container','switchtca')" style="width: 30px;"/>
                                <q-btn outline class="q-py-xs q-mr-xs"  v-if="server.estadotca === 'NO'" icon="power_settings_new" color="primary" size="11px" @click="confirmarDialogo('iniciar Web Container','switchtca')" style="width: 30px;"/>
                                    <q-tooltip class="tooltipAppserver" v-if="server.estadotca === 'SI'" anchor="center right" self="center left" :offset="[5, 10]">
                                        <div class="tooltipText_General">
                                            Detener servicio 
                                        </div>
                                    </q-tooltip>                            
                                    <q-tooltip class="tooltipAppserver" v-else anchor="center right" self="center left" :offset="[5, 10]"> 
                                        <div class="tooltipText_General">
                                            Iniciar servicio 
                                        </div>
                                    </q-tooltip>                                                        
                            </div>
                        </div>
                    </q-item>

                    <q-item class="col-12">
                        <div class="row items-center" style="width: 100%;"> 
                            <div class="col-2">
                                <q-icon v-if="server.estadoomscontainer === 'SI'" name="check_circle" color="positive" style="font-size: 25px;"/>
                                <q-icon v-else name="cancel" color="grey-6" style="font-size: 25px;"/>
                            </div>
                            <div class="col-8">OMS Container </div>                    
                            <q-space/>
                            <div class="col-2 text-right" >
                                <q-btn unelevated class="q-py-xs q-mr-xs"  v-if="server.estadoomscontainer === 'SI'" icon="power_settings_new" color="primary" size="11px" @click="confirmarDialogo('detener OMS Container','switchomscontainer')" style="width: 30px;"/>
                                <q-btn outline class="q-py-xs q-mr-xs"  v-if="server.estadoomscontainer === 'NO'" icon="power_settings_new" color="primary" size="11px" @click="confirmarDialogo('iniciar OMS Container','switchomscontainer')" style="width: 30px;"/>
                                    <q-tooltip class="tooltipAppserver" v-if="server.estadoomscontainer === 'SI'" anchor="center right" self="center left" :offset="[5, 10]">
                                       <div class="tooltipText_General">
                                            Detener servicio 
                                        </div> 
                                    </q-tooltip>                            
                                    <q-tooltip class="tooltipAppserver" v-else anchor="center right" self="center left" :offset="[5, 10]"> 
                                        <div class="tooltipText_General">
                                            Iniciar servicio 
                                        </div>
                                    </q-tooltip>                                                    
                            </div>
                        </div>
                    </q-item>

                    <q-item class="col-12">
                        <div class="row items-center q-mb-md" style="width: 100%;"> 
                            <div class="col-2">
                                <q-icon v-if="server.estadokpi === 'SI'" name="check_circle" color="positive" style="font-size: 25px;"/>
                                <q-icon v-else name="cancel" color="grey-6" style="font-size: 25px;"/>
                            </div>
                            <div class="col-8">KPI Mobile </div>                    
                            <q-space/>
                            <div class="col-2 text-right" >
                                <q-btn unelevated class="q-py-xs q-mr-xs"  v-if="server.estadokpi === 'SI'" icon="power_settings_new" color="primary" size="11px" @click="confirmarDialogo('detener KPI Mobile','switchkpi')" style="width: 30px;"/>
                                <q-btn outline class="q-py-xs q-mr-xs"  v-if="server.estadokpi === 'NO'" icon="power_settings_new" color="primary" size="11px" @click="confirmarDialogo('iniciar KPI Mobile','switchkpi')" style="width: 30px;"/>
                                    <q-tooltip class="tooltipAppserver" v-if="server.estadokpi === 'SI'" anchor="center right" self="center left" :offset="[5, 10]">
                                       <div class="tooltipText_General">
                                            Detener servicio 
                                        </div> 
                                    </q-tooltip>                            
                                    <q-tooltip class="tooltipAppserver" v-else anchor="center right" self="center left" :offset="[5, 10]"> 
                                        <div class="tooltipText_General">
                                            Iniciar servicio 
                                        </div>
                                    </q-tooltip>                                                    
                            </div>
                        </div>
                    </q-item>                    
                                       
                </q-list>
                <q-list dense bordered padding>                   
                <q-item-label  class="label" header>Herramientas de Prediccion</q-item-label>
                    <q-item class="col-12">
                        <div class="row items-center" style="width: 100%;"> 
                            <div class="col-2">
                                <q-icon v-if="server.estadoomsagatha === 'SI'" name="check_circle" color="positive" style="font-size: 25px;"/>
                                <q-icon v-else name="cancel" color="grey-6" style="font-size: 25px;"/>
                            </div>
                            <div class="col-8">Agatha </div>                    
                            <q-space/>
                            <div class="col-2 text-right" >
                                <q-btn unelevated class="q-py-xs q-mr-xs"  v-if="server.estadoomsagatha === 'SI'" icon="power_settings_new" color="primary" size="11px" @click="confirmarDialogo('detener Agatha','switchagatha')" style="width: 30px;"/>
                                <q-btn outline class="q-py-xs q-mr-xs"  v-if="server.estadoomsagatha === 'NO'" icon="power_settings_new" color="primary" size="11px" @click="confirmarDialogo('iniciar Agatha','switchagatha')" style="width: 30px;"/>
                                    <q-tooltip class="tooltipAppserver" v-if="server.estadoomsagatha === 'SI'" anchor="center right" self="center left" :offset="[5, 10]">
                                        <div class="tooltipText_General">
                                            Detener servicio 
                                        </div>
                                    </q-tooltip>                            
                                    <q-tooltip class="tooltipAppserver" v-else anchor="center right" self="center left" :offset="[5, 10]"> 
                                        <div class="tooltipText_General">
                                            Iniciar servicio 
                                        </div>
                                    </q-tooltip>                                                    
                            </div>
                        </div>
                    </q-item>   

                    <q-item class="col-12">
                        <div class="row items-center q-mb-md" style="width: 100%;"> 
                            <div class="col-2">
                                <q-icon v-if="server.estadoomscustomer === 'SI' && server.estadoomsnotificacion === 'SI' && server.estadoomssituacion ==='SI' " name="check_circle" color="positive" style="font-size: 25px;"/>
                                <q-icon v-else name="cancel" color="grey-6" style="font-size: 25px;"/>
                            </div>
                            <div class="col-8">OMS </div>   
                                             
                            <q-space/>
                            <div class="col-2 text-right">
                                <q-btn unelevated class="q-py-xs q-mr-xs"  v-if="server.estadoomscustomer === 'SI' && server.estadoomsnotificacion === 'SI' && server.estadoomssituacion ==='SI' " icon="power_settings_new" color="primary" size="11px" @click="confirmarDialogo('detener OMS','switchomsprediction')" style="width: 30px;"/>
                                <q-btn outline class="q-py-xs q-mr-xs"  v-else icon="power_settings_new" color="primary" size="11px" @click="confirmarDialogo('iniciar OMS','switchomsprediction')" style="width: 30px;"/>
                                    <q-tooltip class="tooltipAppserver" v-if="server.estadoomscustomer === 'SI' && server.estadoomsnotificacion === 'SI' && server.estadoomssituacion ==='SI' " anchor="center right" self="center left" :offset="[5, 10]"> 
                                        <div class="tooltipText_General">
                                            Detener servicio 
                                        </div>
                                    </q-tooltip>                            
                                    <q-tooltip class="tooltipAppserver" v-else anchor="center right" self="center left" :offset="[5, 10]"> 
                                        <div class="tooltipText_General">
                                            Iniciar servicio 
                                        </div>
                                    </q-tooltip>                                                    
                            </div>
                        </div>
                    </q-item>                               
                </q-list>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { useQuasar } from 'quasar'

import { serverURL } from 'boot/api'

import io from "socket.io-client";
var socket = io(serverURL, {
  path: '/socket',
  autoConnect: true,
  transports: ["websocket"],
});

export default {
    props: ['server'],
    setup(props){
        const store = useStore();
        const $q = useQuasar();

        // manejo de ventanas de dialogo
        var dialogo_confirma_accion = ref(false);
        var dialogo_seguridad_accion = ref(false);
        var boton_dialogo_confirma_accion = ref(false);
        var dialogo_switch_componentes = ref(false);
        var dialogo_mensaje_confirmacion = ref('');
        var password = ref('');  
        var comandoPost = ref('');  

        //para controlar los botones al ejecutar una accion
        socket.on('updateServer', (mensaje) => {
            store.dispatch('updateServer',mensaje)
        });

        //---------- METHODS ---------------
        function confirmarDialogo(prompt,comando){
            dialogo_mensaje_confirmacion.value = prompt;
            comandoPost.value = comando;
            dialogo_confirma_accion.value = true;
        };

        //envia una request HTTP POST al servidor con el comando a ejecutar
        function enviarMensajePost(){
            boton_dialogo_confirma_accion.value = true;
            // se envia un JSON {servidor,comando,usuario}
            let msj = {"servidor":props.server.serverip,"comando": comandoPost.value,"usuario":authGetActiveUser.value};

            boton_dialogo_confirma_accion.value = false;
            dialogo_switch_componentes.value = false; 
            dialogo_confirma_accion.value = false;
            $q.notify({
                color: 'cabecera',
                spinner: true,
                message: `Ejecutando comando`,
            });
            
            //se envia un mensaje y retorna una promesa resolve(ENCENDIDO, APAGADO) si se ejecuto correctamente, o reject(ERROR) si no.
            store.dispatch('enviarPost', msj)
            .then((res) => {
                if(res=='ENCENDIDO'){
                    $q.notify({
                        color: 'positive',
                        icon: 'check',
                        message: `Iniciado servicio en: `+ props.server.serverhostname.toUpperCase(),
                    });
                }
                else if(res=='APAGADO'){
                    $q.notify({
                        color: 'negative',
                        icon: 'info',
                        message: `Detenido servicio en: `+ props.server.serverhostname.toUpperCase(),
                    });    
                }            
            })
            .catch(() => {
                $q.notify({
                    color: 'negative',
                    icon: 'error',
                    message: `ERROR! al ejecutar comando en: `+ props.server.serverhostname.toUpperCase(),
                });
            })
            .finally(() => {
                boton_dialogo_confirma_accion.value = false;
                dialogo_switch_componentes.value = false; 
                dialogo_confirma_accion.value = false;
            })
        };
        function parsePorcentaje (cadena) {
            let valor = parseFloat((cadena)/100);
            return valor;
        };
        function parseTimestamp (timestamp) {
        //formatea la fecha y le agrega ceros a los valores menores a 10
        const fecha = new Date(timestamp);
        const addZero = (num) => `${num}`.padStart(2, '0');
        return('Leido: ' + addZero(addZero(fecha.getHours()) +':'+ addZero(fecha.getMinutes()) +':'+ addZero(fecha.getSeconds())  +' - '+ fecha.getDate()) +'/'+ addZero(fecha.getMonth()+1) +'/'+ fecha.getFullYear()  )
        };

        function onSubmit() {

            if (password.value) {
                const usuario = { username: authGetActiveUser.value, password: password.value };
                store.dispatch('auth/check_credentials',usuario)
                .then( res => {
                    enviarMensajePost();
                    password.value='';
                    dialogo_seguridad_accion.value=false;
                })
                .catch( err => {
                    $q.notify({
                    color: 'negative',
                    icon: 'error',
                    message: `La contraseña es incorrecta`,
                    });
                    password.value='';
                    dialogo_seguridad_accion.value=false;
                })
            }
        }

        // --------- GETTERS -----------
        const authGetActiveUser = computed(() => store.getters['auth/getActiveUser']);
        const getServerLogsPorIp = computed(() => store.getters['getServerLogsPorIp']);
        const canExecute = computed(() => store.getters['auth/getUserRol']);

        return {
            canExecute,
            dialogo_confirma_accion,
            dialogo_seguridad_accion, 
            boton_dialogo_confirma_accion,
            dialogo_mensaje_confirmacion, 
            comandoPost,
            password,
            dialogo_switch_componentes,
            //metodos
            confirmarDialogo,
            enviarMensajePost,
            parsePorcentaje,
            parseTimestamp,
            onSubmit,
            //computed (getters)
            authGetActiveUser,
            getServerLogsPorIp
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