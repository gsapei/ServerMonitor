import sys, getopt #para procesar argumentos
import subprocess
import os
import time
import json
import copy #para copiar objetos
import socket #para enviar ping
import threading #multihilo para socket
import datetime
httplib = ''
SocketServer = ''

#Importamos librerias segun version de PYTHON
if sys.version_info > (2, 8):
    import socketserver as SocketServer
    import http.client as httplib
    #Fix error certificados
    import ssl
    ssl._create_default_https_context = ssl._create_unverified_context
else:
    import SocketServer
    import httplib
    #Fix error certificados
    import ssl
    ssl._create_default_https_context = ssl._create_unverified_context

#Variables Globales de configuracion (argumentos)
debug=False
output=False
server_url=''
post_path=''
post_port=''
tiposervidor_id='' #valor numerico del tipo de servidor -> 1='Generico', 2='Appserver' , 3='cromo' , 4='database'
rolservidor='' # Productivo / Desarrollo
frecuencia=5 #Tiempo en volver a sensar (en segundos)
salida='' #archivo de salida de logs
scriptPath='/home/gisdesa/epe/scripts/CSM/scripts' #directorio donde se encuentran los scripts de control de apps

#Constantes del programa
VERSION='1.9'
POST_HEADER={'Content-type': 'application/json', 'Accept': 'text/plain'}
POST_TIMEOUT=2 #tiempo intentando conectarse

# -------------------------------------SOCKETS! ------------------------------------
SOCKET_PORT = 3951

#Colorear salida de consola
class bcolors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

#Enviar datos mediante POST
def enviarDatos(datos):
    try:
        conn = httplib.HTTPSConnection(server_url,post_port,timeout=POST_TIMEOUT)
        conn.request("POST", post_path, datos, POST_HEADER)
        response = conn.getresponse()
        data = response.read()
        conn.close()
        return(data.decode("utf-8")) #Devuelve la respuesta del servidor
    except Exception as e: 
        print(e)
        return(False) #O falso si no se pudo conectar

#Log con Fecha-hora
def logging(mensaje, color):
    now = datetime.datetime.now()
    formateado = now.strftime("%d/%m/%y-%H:%M:%S")
    if debug == True:
        print(color + formateado + " -> " + mensaje + bcolors.ENDC)
    if output == True:
        log = open(salida,"a")
        log.write(formateado + " -> " + mensaje + "\n")

#Funcion para ejecutar comandos simples de lectura linux
def ejecutarComandoSimple(comando):
    stream = os.popen(comando,'r',-1) #unbuffered
    respuesta = stream.read().strip()
    return respuesta

#Comparara el estado del servidor y envia las diferencias (si existen) -> prevalecen los datos de srvNew
def verificaEstado(srvOld, srvNew):
    cadena = {}
    cadena['serverip'] = srvNew.serverIp #se agrega el serverIP a los datos que se van a enviar
    contador = 0
    for property, valor in vars(srvOld).items(): #recorremos cada item de los servidores
        if valor != vars(srvNew)[property]: #si difieren
            key = property.lower() #atributos a minusculas para evitar problemas comparando cadenas
            cadena[key] = vars(srvNew)[property] #se agrega el atributo de srvNew a la lista
            contador+=1
    if contador > 0: #si se encontro alguna diferencia
        logging('Encontrada diferencia: ' + json.dumps(cadena), bcolors.HEADER)
        cadena = json.dumps(cadena)
        while True:
            temp=enviarDatos(cadena)
            if temp != False:
                logging(temp,bcolors.OKCYAN) #Se envian los datos que cambiaron
                break
            else:
                logging('Error al conectarse al servidor! - Reintentando...',bcolors.OKCYAN) #ERROR DE CONEXION
                time.sleep(5)
                #Si se cayo el Backend se vuelve a mandar todo el bloque de datos
                cadena = getBloqueDatosJSON(srvNew)

#Dado un servidor parsea todos sus datos a JSON y lo devuelve
def getBloqueDatosJSON(servidor):
    lista = {}
    lista['estado']=True
    for property, valor in vars(servidor).items(): #recorremos cada item del servidor
        key = property.lower() #atributos a minusculas para evitar problemas comparando cadenas
        lista[key] = valor #se agrega el atributo a la lista
    return json.dumps(lista)

#muestra la ayuda
def ayuda():
    print('Uso: python monitor.py -s [SERVER] -p [PUERTO] -a [PATH] [OPCIONES]...')
    print('Monitorea servidores linux, los servicios del Appserver CERTA y sus componentes\n')
    print('   -s, --servidor           Direccion IP del servidor de escucha')
    print('   -p, --puerto             Puerto del servidor de escucha')
    print('   -a, --path               Path donde se envia la informacion')
    print('   -f, --frecuencia         frecuencia del senso de datos (en segundos)')    
    print('   -v, --version            Version actual del programa')
    print('   -d, --debug              Muestra salida por consola del programa (Apagado por defecto)')
    print('   -o, --output             Escribe archivo de logs en el archivo especificado (Apagado por defecto)')
    print('   -t, --tipo               Tipo de servidor: "generico", "appserver", "cromo" o "database"')
    print('   -r, --rol                Rol del servidor: "productivo", "desarrollo"')
    print('   -h, --ayuda              Muestra esta ayuda\n')
    print('Ejemplo:')
    print("   python monitor.py -s 127.0.0.1 -p 3000 -a '/status' --debug --output 'salida.log' --tipo 'cromo' --rol 'desarrollo'\n")

#valida y maneja argumentos al llamar el programa
def verificarArgumentos():
    try:
        opts, args = getopt.getopt(sys.argv[1:], "s:p:a:f:o:t:r:vd", ["servidor=","puerto=","path=","frecuencia=","output=","tipo=","rol=","version","debug"])
    except getopt.GetoptError:
        print(bcolors.FAIL+'Argumentos invalidos!'+bcolors.ENDC)
        ayuda() # presentar informacion de ayuda y salir:
        exit(2)
    for opt, arg in opts:
        if opt in ("-h", "--help"):
            ayuda() # presentar informacion de ayuda y salir:
            exit()
        if opt in ("-d", "--debug"):
            global debug #modo verbose
            debug = True
        if opt in ("-v", "--version"):
            print('ServerMonitor v'+VERSION)
            exit()
        if opt in ("-h", "--ayuda"):
            ayuda()
            exit()       
        if opt in ("-s", "--servidor"):
            #Verificamos que sea valida la direccion IP (por si se pasa un hostname)
            global server_url
            try:
                ip = socket.gethostbyname(arg)
                server_url=ip
            except socket.error:
                print(bcolors.FAIL+'La direccion IP del servidor no es valida!'+bcolors.ENDC)
                return False               
        if opt in ("-p", "--puerto"):
            global post_port
            post_port=arg
        if opt in ("-a", "--path"):
            global post_path
            post_path=arg            
        if opt in ("-f", "--frecuencia"):
            global frecuencia
            frecuencia=arg
        if opt in ("-o", "--output"):
            global output, salida
            output = True
            salida = arg    
        if opt in ("-t", "--tipo"):
            arg = arg.lower()
            global tiposervidor_id             
            if arg == 'generico':
                tiposervidor_id = 1
            elif arg == 'appserver':
                tiposervidor_id = 2
            elif arg == 'cromo':
                tiposervidor_id = 3
            elif arg == 'database':
                tiposervidor_id = 4
            else:
                print(bcolors.FAIL+'Tipos de servidor validos: "generico", "appserver", "cromo", "database"'+bcolors.ENDC)
                return False 
        if opt in ("-r", "--rol"):
            arg = arg.lower()
            global rolservidor             
            if arg == 'desarrollo':
                rolservidor = 'desarrollo'
            elif arg == 'productivo':
                rolservidor = 'productivo'
            else:
                print(bcolors.FAIL+'Roles de servidor validos: "productivo" o "desarrollo"'+bcolors.ENDC)
                return False                 
    if server_url == '' or post_path == '' or post_port == '': 
        print(bcolors.FAIL+'Faltan argumentos!'+bcolors.ENDC)
        return False
    else: return True

#Maneja los mensajes sockets
class TcpHandler(SocketServer.BaseRequestHandler):
    def handle(self):
        #datos del objeto servidor pasado como parametro
        srv = self.server.srv
        ip, puerto = self.request.getpeername()
        #por seguridad solo se puede enviar peticiones desde el servidor
        if ip == server_url: 
            #se recive el mensaje
            try:
                data = self.request.recv(1024).decode("utf-8")
                logging('Recibida solicitud del servidor: (' + data + ')', bcolors.OKBLUE)
            except:
                print('Error de socket')

            if data=='ping':
                self.request.send('alive'.encode("utf-8")) #se envia 'alive'
            else:
                dataJson = json.loads(data)
                #dataJSON es una cadena JSON con comando y usuario, al recibirla verificar que comando es y ejecutarlo   
                #--------------------------------------------------------------------------------------------+
                #                                     COMPONENTES CERTA                                      |
                #--------------------------------------------------------------------------------------------+                                    
                if dataJson['comando']=='switchscada':
                    msj = 'SCADA'
                    if srv.setEstadoSCADA()=='SI':
                        logging( msj + ': Detenido por el usuario: ' + dataJson['usuario'].upper() , bcolors.FAIL )
                        try:
                            proc = subprocess.Popen(scriptPath+"/scd/stop.sh", close_fds=True)
                            #Espera a que termine de leer la ultima linea de la salida
                            proc.wait()
                            self.request.send('APAGADO')                                 
                        except:
                            logging( "ERROR: no se pudo ejecutar el comando! (verificar permisos)" , bcolors.FAIL )
                            self.request.send('ERROR')

                    elif srv.setEstadoSCADA()=='NO':
                        logging( msj + ': Iniciando por el usuario: ' + dataJson['usuario'].upper() , bcolors.FAIL )
                        try:
                            proc = subprocess.Popen(scriptPath+"/scd/start.sh", close_fds=True)
                            #Espera a que termine de leer la ultima linea de la salida
                            proc.wait()
                            self.request.send('ENCENDIDO')                                    
                        except:
                            logging( "ERROR: no se pudo ejecutar el comando! (verificar permisos)" , bcolors.FAIL )
                            self.request.send('ERROR')
               
                #--------------------------------------------------------------------------------------------
                elif dataJson['comando']=='switchnbm':
                    msj = 'NBM'
                    if srv.setEstadoNBM()=='SI':
                        logging( msj + ': Detenido por el usuario: ' + dataJson['usuario'].upper() , bcolors.FAIL )
                        try:
                            proc = subprocess.Popen(scriptPath+"/nbm/stop.sh", close_fds=True)
                            #Espera a que termine de leer la ultima linea de la salida
                            proc.wait()
                            self.request.send('APAGADO')                                 
                        except:
                            logging( "ERROR: no se pudo ejecutar el comando! (verificar permisos)" , bcolors.FAIL )
                            self.request.send('ERROR')

                    elif srv.setEstadoNBM()=='NO':
                        logging( msj + ': Iniciando por el usuario: ' + dataJson['usuario'].upper() , bcolors.FAIL )
                        try:
                            proc = subprocess.Popen(scriptPath+"/nbm/start.sh", close_fds=True)
                            #Espera a que termine de leer la ultima linea de la salida
                            proc.wait()
                            self.request.send('ENCENDIDO')                                    
                        except:
                            logging( "ERROR: no se pudo ejecutar el comando! (verificar permisos)" , bcolors.FAIL )
                            self.request.send('ERROR')
                #--------------------------------------------------------------------------------------------
                elif dataJson['comando']=='switchtca':
                    msj = 'TCA'
                    if srv.setEstadoTCA()=='SI':
                        logging( msj + ': Detenido por el usuario: ' + dataJson['usuario'].upper() , bcolors.FAIL )
                        try:
                            proc = subprocess.Popen(scriptPath+"/tca/stop.sh", close_fds=True)
                            #lee la salida linea a linea
                            proc.wait()
                            self.request.send('APAGADO')                                 
                        except:
                            logging( "ERROR: no se pudo ejecutar el comando! (verificar permisos)" , bcolors.FAIL )
                            self.request.send('ERROR')

                    elif srv.setEstadoTCA()=='NO':
                        logging( msj + ': Iniciando por el usuario: ' + dataJson['usuario'].upper() , bcolors.FAIL )
                        try:
                            proc = subprocess.Popen(scriptPath+"/tca/start.sh", close_fds=True)
                            #Espera a que termine de leer la ultima linea de la salida
                            proc.wait()
                            self.request.send('ENCENDIDO')                                    
                        except:
                            logging( "ERROR: no se pudo ejecutar el comando! (verificar permisos)" , bcolors.FAIL )
                            self.request.send('ERROR')   
                #--------------------------------------------------------------------------------------------
                elif dataJson['comando']=='switchomscontainer':
                    msj = 'OMS Container'
                    if srv.setEstadoOMSContainer()=='SI':
                        logging( msj + ': Detenido por el usuario: ' + dataJson['usuario'].upper() , bcolors.FAIL )
                        try:
                            proc = subprocess.Popen(scriptPath+"/oms/container-stop.sh", close_fds=True)
                            #Espera a que termine de leer la ultima linea de la salida
                            proc.wait()
                            self.request.send('APAGADO')                                 
                        except:
                            logging( "ERROR: no se pudo ejecutar el comando! (verificar permisos)" , bcolors.FAIL )
                            self.request.send('ERROR')

                    elif srv.setEstadoOMSContainer()=='NO':
                        logging( msj + ': Iniciando por el usuario: ' + dataJson['usuario'].upper() , bcolors.FAIL )
                        try:
                            proc = subprocess.Popen(scriptPath+"/oms/container-start.sh", close_fds=True)
                            #Espera a que termine de leer la ultima linea de la salida
                            proc.wait()
                            self.request.send('ENCENDIDO')                                    
                        except:
                            logging( "ERROR: no se pudo ejecutar el comando! (verificar permisos)" , bcolors.FAIL )
                            self.request.send('ERROR')   
                #--------------------------------------------------------------------------------------------
                elif dataJson['comando']=='switchkpi':
                    msj = 'KPI'
                    if srv.setEstadoKPI()=='SI':
                        logging( msj + ': Detenido por el usuario: ' + dataJson['usuario'].upper() , bcolors.FAIL )
                        try:
                            proc = subprocess.Popen(scriptPath+"/kpi/stop.sh", close_fds=True)
                            #lee la salida linea a linea
                            proc.wait()
                            self.request.send('APAGADO')                                 
                        except:
                            logging( "ERROR: no se pudo ejecutar el comando! (verificar permisos)" , bcolors.FAIL )
                            self.request.send('ERROR')

                    elif srv.setEstadoKPI()=='NO':
                        logging( msj + ': Iniciando por el usuario: ' + dataJson['usuario'].upper() , bcolors.FAIL )
                        try:
                            proc = subprocess.Popen(scriptPath+"/kpi/start.sh", close_fds=True)
                            #Espera a que termine de leer la ultima linea de la salida
                            proc.wait()
                            self.request.send('ENCENDIDO')                                    
                        except:
                            logging( "ERROR: no se pudo ejecutar el comando! (verificar permisos)" , bcolors.FAIL )
                            self.request.send('ERROR')                               

                #--------------------------------------------------------------------------------------------+
                #                                         PREDICTION                                         |
                #--------------------------------------------------------------------------------------------+
                elif dataJson['comando']=='switchagatha':
                    msj = 'Agatha'
                    if srv.setEstadoOMSAgatha()=='SI' and srv.setEstadoOMSSituacion()=='NO' and srv.setEstadoOMSNotificacion()=='NO' and srv.setEstadoOMSCustomer()=='NO':
                        #APAGADO TOD0
                        logging( msj + ': desactivado por el usuario: ' + dataJson['usuario'].upper() , bcolors.FAIL )
                        try:
                            proc = subprocess.Popen(scriptPath+"/oms/srv/fullset-nada.sh", close_fds=True)
                            #Espera a que termine de leer la ultima linea de la salida
                            proc.wait()
                            self.request.send('APAGADO')                                 
                        except:
                            logging( "ERROR: no se pudo ejecutar el comando! (verificar permisos)" , bcolors.FAIL )
                            self.request.send('ERROR')
                            
                    elif srv.setEstadoOMSAgatha()=='SI' and srv.setEstadoOMSSituacion()=='SI' and srv.setEstadoOMSNotificacion()=='SI' and srv.setEstadoOMSCustomer()=='SI':
                        #APAGA AGATHA Y QUEDA OMS
                        logging( msj + ': desactivado por el usuario: ' + dataJson['usuario'].upper() , bcolors.FAIL )
                        try:
                            proc = subprocess.Popen(scriptPath+"/oms/srv/fullset-OMS_solo.sh", close_fds=True)
                            #Espera a que termine de leer la ultima linea de la salida
                            proc.wait()
                            self.request.send('APAGADO')                                 
                        except:
                            logging( "ERROR: no se pudo ejecutar el comando! (verificar permisos)" , bcolors.FAIL )
                            self.request.send('ERROR')                                           

                    elif srv.setEstadoOMSAgatha()=='NO' and srv.setEstadoOMSSituacion()=='NO' and srv.setEstadoOMSNotificacion()=='NO' and srv.setEstadoOMSCustomer()=='NO':
                        #QUEDA SOLO AGATHA
                        logging( msj + ': activado por el usuario: ' + dataJson['usuario'].upper() , bcolors.FAIL )
                        try:
                            proc = subprocess.Popen(scriptPath+"/oms/srv/fullset-Agatha_solo.sh", close_fds=True)
                            #Espera a que termine de leer la ultima linea de la salida
                            proc.wait()
                            self.request.send('ENCENDIDO')                                    
                        except:
                            logging( "ERROR: no se pudo ejecutar el comando! (verificar permisos)" , bcolors.FAIL )
                            self.request.send('ERROR') 

                    elif srv.setEstadoOMSAgatha()=='NO' and srv.setEstadoOMSSituacion()=='SI' and srv.setEstadoOMSNotificacion()=='SI' and srv.setEstadoOMSCustomer()=='SI':
                        #AGATHA + OMS
                        logging( msj + ': activado por el usuario: ' + dataJson['usuario'].upper() , bcolors.FAIL )
                        try:
                            proc = subprocess.Popen(scriptPath+"/oms/srv/fullset-completo_OMS_y_Agatha.sh", close_fds=True)
                            #Espera a que termine de leer la ultima linea de la salida
                            proc.wait()
                            self.request.send('ENCENDIDO')                                    
                        except:
                            logging( "ERROR: no se pudo ejecutar el comando! (verificar permisos)" , bcolors.FAIL )
                            self.request.send('ERROR')      
                #--------------------------------------------------------------------------------------------
                elif dataJson['comando']=='switchomsprediction':
                    msj = 'OMS Prediction'
                    if srv.setEstadoOMSAgatha()=='SI' and srv.setEstadoOMSSituacion()=='NO' and srv.setEstadoOMSNotificacion()=='NO' and srv.setEstadoOMSCustomer()=='NO':
                        #APAGADO TOD0
                        logging( msj + ': desactivado por el usuario: ' + dataJson['usuario'].upper() , bcolors.FAIL )
                        try:
                            proc = subprocess.Popen(scriptPath+"/oms/srv/fullset-nada.sh", close_fds=True)
                            #Espera a que termine de leer la ultima linea de la salida
                            proc.wait()
                            self.request.send('APAGADO')                                 
                        except:
                            logging( "ERROR: no se pudo ejecutar el comando! (verificar permisos)" , bcolors.FAIL )
                            self.request.send('ERROR')

                    elif srv.setEstadoOMSAgatha()=='SI' and srv.setEstadoOMSSituacion()=='SI' and srv.setEstadoOMSNotificacion()=='SI' and srv.setEstadoOMSCustomer()=='SI':
                        #APAGA OMS Y QUEDA AGATHA
                        logging( msj + ': desactivado por el usuario: ' + dataJson['usuario'].upper() , bcolors.FAIL )
                        try:
                            proc = subprocess.Popen(scriptPath+"/oms/srv/fullset-Agatha_solo.sh", close_fds=True)
                            #Espera a que termine de leer la ultima linea de la salida
                            proc.wait()
                            self.request.send('APAGADO')                                 
                        except:
                            logging( "ERROR: no se pudo ejecutar el comando! (verificar permisos)" , bcolors.FAIL )
                            self.request.send('ERROR') 
                                                 
                    elif srv.setEstadoOMSAgatha()=='NO' and srv.setEstadoOMSSituacion()=='NO' and srv.setEstadoOMSNotificacion()=='NO' and srv.setEstadoOMSCustomer()=='NO':
                        #QUEDA SOLO OMS
                        logging( msj + ': activado por el usuario: ' + dataJson['usuario'].upper() , bcolors.FAIL )
                        try:
                            proc = subprocess.Popen(scriptPath+"/oms/srv/fullset-OMS_solo.sh", close_fds=True)
                            #Espera a que termine de leer la ultima linea de la salida
                            proc.wait()
                            self.request.send('ENCENDIDO')                                    
                        except:
                            logging( "ERROR: no se pudo ejecutar el comando! (verificar permisos)" , bcolors.FAIL )
                            self.request.send('ERROR') 

                    elif srv.setEstadoOMSAgatha()=='NO' and srv.setEstadoOMSSituacion()=='SI' and srv.setEstadoOMSNotificacion()=='SI' and srv.setEstadoOMSCustomer()=='SI':
                        #AGATHA + OMS
                        logging( msj + ': activado por el usuario: ' + dataJson['usuario'].upper() , bcolors.FAIL )
                        try:
                            proc = subprocess.Popen(scriptPath+"/oms/srv/fullset-completo_OMS_y_Agatha.sh", close_fds=True)
                            #Espera a que termine de leer la ultima linea de la salida
                            proc.wait()
                            self.request.send('ENCENDIDO')                                    
                        except:
                            logging( "ERROR: no se pudo ejecutar el comando! (verificar permisos)" , bcolors.FAIL )
                            self.request.send('ERROR')                                    
                                        
                #--------------------------------------------------------------------------------------------+
                #                                          APPSERVER                                         |
                #--------------------------------------------------------------------------------------------+
                elif dataJson['comando']=='iniciaappserver':
                    msj = 'Appserver'
                    if srv.getAppserverEstado()==False:
                            logging( msj + ': Iniciando por el usuario: ' + dataJson['usuario'].upper() , bcolors.FAIL )
                            #inicia la llamada al proceso
                            try:
                                proc = subprocess.Popen(scriptPath+"/app/start.sh", stdout=subprocess.PIPE, close_fds=True)
                                #lee la salida linea a linea
                                for line in iter(proc.stdout.readline,''):
                                    #si el proceso llega a su fin envia un mensaje de aviso
                                    if(line.rstrip()=="System is running"):
                                        proc.terminate()
                                        self.request.send('ENCENDIDO')
                                        srv.getAppserverEstado()                                        
                            except:
                                logging( "ERROR: no se pudo ejecutar el comando! (verificar permisos)" , bcolors.FAIL )
                                self.request.send('ERROR')
                #--------------------------------------------------------------------------------------------  
                elif dataJson['comando']=='apagaappserver':
                    msj = 'Appserver'
                    print(srv.getAppserverEstado())
                    if srv.getAppserverEstado()==True:
                            logging( msj + ': Detenido por el usuario: ' + dataJson['usuario'].upper() , bcolors.FAIL )
                            #inicia la llamada al proceso
                            try:
                                proc = subprocess.Popen(scriptPath+"/app/stop.sh", stdout=subprocess.PIPE, close_fds=True)
                                #lee la salida linea a linea
                                for line in iter(proc.stdout.readline,''):
                                    #si el proceso llega a su fin envia un mensaje de aviso
                                    if(line.rstrip()=="Servidor detenido"):
                                        proc.terminate()
                                        self.request.send('APAGADO')
                                        srv.getAppserverEstado()                                        
                                        
                            except:
                                logging( "ERROR: no se pudo ejecutar el comando! (verificar permisos)" , bcolors.FAIL )
                                self.request.send('ERROR')
                #--------------------------------------------------------------------------------------------     
                elif dataJson['comando']=='reiniciaappserver':
                    msj = 'Appserver'
                    if srv.getAppserverEstado()==True:
                            logging( msj + ': Reiniciando por el usuario: ' + dataJson['usuario'].upper() , bcolors.FAIL )
                            #inicia la llamada al proceso
                            try:
                                #apaga el appserver
                                proc = subprocess.Popen(scriptPath+"/app/stop.sh", stdout=subprocess.PIPE, close_fds=True)
                                #lee la salida linea a linea
                                for line in iter(proc.stdout.readline,''):
                                    #si el proceso llega a su fin envia un mensaje de aviso
                                    if(line.rstrip()=="Servidor detenido"):                                     
                                        proc.terminate()
                                        logging( msj + ' apagado. Reiniciando...' , bcolors.FAIL )
                                        time.sleep(2)

                                        #inicia el appserver
                                        proc = subprocess.Popen(scriptPath+"/app/start.sh", stdout=subprocess.PIPE, close_fds=True)
                                        #lee la salida linea a linea
                                        for line in iter(proc.stdout.readline,''):
                                            #si el proceso llega a su fin envia un mensaje de aviso
                                            if(line.rstrip()=="System is running"):
                                                proc.terminate()
                                                self.request.send('ENCENDIDO')
                                                srv.getAppserverEstado()      
                            except:
                                logging( "ERROR: no se pudo ejecutar el comando! (verificar permisos)" , bcolors.FAIL )
                                self.request.send('ERROR')
                                           
                #--------------------------------------------------------------------------------------------+
                #                                          CROMO                                             |
                #--------------------------------------------------------------------------------------------+
                elif dataJson['comando']=='cromostart':
                    msj = 'Cromo'
                    if srv.getCromoAlive()=='NO':
                        logging( msj + ': Iniciado por el usuario: ' + dataJson['usuario'].upper() , bcolors.FAIL )
                        try:
                            proc = subprocess.Popen(scriptPath+"/cromo/cromo_start.sh", close_fds=True)
                            # Wait until process terminates (without using p.wait())
                            proc.wait()
                            self.request.send('ENCENDIDO')
                        except:
                            logging( "ERROR: no se pudo ejecutar el comando! (verificar permisos)" , bcolors.FAIL )
                            self.request.send('ERROR')
                #--------------------------------------------------------------------------------------------                             
                elif dataJson['comando']=='cromofullstop':
                    msj = 'Cromo'
                    if srv.getCromoAlive()=='SI':
                        logging( msj + ': Full-Stop realizado por el usuario: ' + dataJson['usuario'].upper() , bcolors.FAIL )  
                        try:
                            proc = subprocess.Popen(scriptPath+"/cromo/full_stop.sh", close_fds=True)
                            # Wait until process terminates (without using p.wait())
                            proc.wait()
                            self.request.send('APAGADO')
                        except:
                            logging( "ERROR: no se pudo ejecutar el comando! (verificar permisos)" , bcolors.FAIL )
                            self.request.send('ERROR')
                #--------------------------------------------------------------------------------------------                             
                elif dataJson['comando']=='cromofullrestart':
                    msj = 'Cromo'
                    if srv.getCromoAlive()=='SI':
                        logging( msj + ': Full-Restart realizado por el usuario: ' + dataJson['usuario'].upper() , bcolors.FAIL )  
                        try:
                            proc = subprocess.Popen(scriptPath+"/cromo/full_restart.sh", close_fds=True)
                            # Wait until process terminates (without using p.wait())
                            proc.wait()
                            self.request.send('ENCENDIDO')
                        except:
                            logging( "ERROR: no se pudo ejecutar el comando! (verificar permisos)" , bcolors.FAIL )
                            self.request.send('ERROR')
                #--------------------------------------------------------------------------------------------                             
                elif dataJson['comando']=='cromoquickrestart':
                    msj = 'Cromo'
                    if srv.getCromoAlive()=='SI':
                        logging( msj + ': Quick-Restart realizado por el usuario: ' + dataJson['usuario'].upper() , bcolors.FAIL )  
                        try:
                            proc = subprocess.Popen(scriptPath+"/cromo/quick_restart.sh", close_fds=True)
                            # Wait until process terminates (without using p.wait())
                            proc.wait()
                            self.request.send('ENCENDIDO')
                        except:
                            logging( "ERROR: no se pudo ejecutar el comando! (verificar permisos)" , bcolors.FAIL )
                            self.request.send('ERROR')                     
                #--------------------------------------------------------------------------------------------                             
                elif dataJson['comando']=='cromoquickstop':
                    msj = 'Cromo'
                    if srv.getCromoAlive()=='SI':
                        logging( msj + ': Quick-Stop realizado por el usuario: ' + dataJson['usuario'].upper() , bcolors.FAIL )  
                        try:
                            proc = subprocess.Popen(scriptPath+"/cromo/quick_stop.sh", close_fds=True)
                            # Wait until process terminates (without using p.wait())
                            proc.wait()
                            self.request.send('APAGADO')
                        except:
                            logging( "ERROR: no se pudo ejecutar el comando! (verificar permisos)" , bcolors.FAIL )
                            self.request.send('ERROR')
                #--------------------------------------------------------------------------------------------                             
                elif dataJson['comando']=='cromorecrearbaseclientes':
                    msj = 'Cromo'
                    logging( msj + ': Recreando base de datos de clientes por el usuario: ' + dataJson['usuario'].upper() , bcolors.FAIL )  
                    try:
                        proc = subprocess.Popen(scriptPath+"/cromo/recrear_base_clientes.sh", close_fds=True)
                        # Wait until process terminates (without using p.wait())
                        proc.wait()
                        self.request.send('ENCENDIDO')
                    except:
                        logging( "ERROR: no se pudo ejecutar el comando! (verificar permisos)" , bcolors.FAIL )
                        self.request.send('ERROR')
                
                #si se mando un comando que no existe:
                else: self.request.send('ERROR') 
        time.sleep(0.1)

class ThreadServer(SocketServer.ThreadingMixIn, SocketServer.TCPServer):
    def __init__(self, server_address, RequestHandlerClass, srv):
        self.srv = srv
        SocketServer.TCPServer.__init__(self, server_address, RequestHandlerClass)
    
    #Inicia el servidor en un thread separado
    def serve_on_thread(self):
        server_thread = threading.Thread(target=self.serve_forever)
        # Modo daemon: Cierra el thread cuando el thread principal se cierra
        server_thread.daemon = True
        server_thread.start()

    #Cierra el socket
    def clean_up(self):
        self.server_close()

class Servidor(object):

    #--------------------
    # Pseudo-constructor:
    #--------------------
    #Para todos los servers
    def setDatos(self):
        self.setTipoServidor()
        self.setRolServidor()
        self.setServerIp()
        self.setServerHostname()
        self.setServerMem()
        self.setServerUptime()
        self.setServerUsuarios()
        self.setServerDisco()
        self.setServerCpu()
        #Si es APPSERVER
        if self.tipoServidor_id ==2:
            if(self.getAppserverEstado()==True):
                self.serverCpu = ejecutarComandoSimple('top -bn1 | grep "Cpu(s)" | cut -d "%" -f 1 | cut -d " " -f 3')
                self.setAppserverCpu()
                self.setAppserverUptime()
                self.setAppserverUsuarios()
                self.setEstadoSCADA()
                self.setEstadoNBM()
                self.setEstadoTCA()
                self.setEstadoOMSContainer()
                self.setEstadoOMSLink()
                self.setEstadoOMSAgatha()
                self.setEstadoOMSSituacion()
                self.setEstadoOMSNotificacion()
                self.setEstadoOMSCustomer()
                self.setEstadoKPI()
            else:
                self.appserverCpu='-'
                self.appserverUptime='0'
                self.appserverUsuarios='0'
                self.estadoSCADA='NO'
                self.estadoNBM='NO'
                self.estadoTCA='NO'
                self.estadoOMSContainer='NO'
                self.estadoOMSLink='NO'
                self.estadoOMSAgatha='NO'
                self.estadoOMSSituacion='NO'
                self.estadoOMSNotificacion='NO'
                self.estadoOMSCustomer='NO'
        #si es CROMO server
        elif self.tipoServidor_id == 3:
            self.serverCpu = ejecutarComandoSimple('top -bn1 | grep "Cpu(s)" | awk \'{ print $2 }\'')
            self.setCromoStatus()

    #Setters Genericos
    def setServerIp(self):
        temp = ejecutarComandoSimple("hostname -i | awk '{print $2}'")
        if temp!='':
            self.serverIp = temp
        else:
            self.serverIp = ejecutarComandoSimple("hostname -i")
    def setServerHostname(self):
        self.serverHostname = ejecutarComandoSimple('hostname')
    def setServerCpu(self):
        self.serverCpu = ejecutarComandoSimple('top -bn1 | grep "Cpu(s)" | cut -d "%" -f 1 | cut -d " " -f 3')
    def setServerMem(self):
        self.serverMem = ejecutarComandoSimple("free -t | awk 'NR == 2 {printf(\"%.2f\"), $3/$2*100}'")
    def setServerUptime(self):
        self.serverUptime = ejecutarComandoSimple('uptime | cut -d " " -f 4')
    def setServerUsuarios(self):
        self.serverUsuarios = ejecutarComandoSimple('uptime | cut -d "," -f 3 | cut -d " " -f 3')
    def setServerDisco(self):
        #algunos de los filesystems tienen nombre y otros no. Hay una diferencia de campos en el comando DF, por eso aveces se hace print $4 y otras $5
        temp = ejecutarComandoSimple("df | grep -w '/u' | awk '{print $4}'")
        if temp:
            if temp[-1]=='%':
                self.serverDisco =  temp[:-1]
            else:
                temp = ejecutarComandoSimple("df | grep -w '/u' | awk '{print $5}'")
                self.serverDisco =  temp[:-1]
        else:
            temp = ejecutarComandoSimple("df | grep -w '/' | awk '{print $4}'")
            if temp[-1]=='%':
                self.serverDisco =  temp[:-1]
            else:
                temp = ejecutarComandoSimple("df | grep -w '/' | awk '{print $5}'")
                self.serverDisco =  temp[:-1]
    def setTipoServidor(self):
        self.tipoServidor_id = tiposervidor_id
    def setRolServidor(self):
        self.rolservidor = rolservidor     
    
    #APPSERVERS:            
    def getAppserverEstado(self):        
        self.appserverEstado = ejecutarComandoSimple(scriptPath+'/app/fullcheck.sh')
        if self.appserverEstado == 'UP':
            return True
        else:
            return False
    def setAppserverCpu(self):
        self.appserverCpu = ejecutarComandoSimple("pct=$(top -bn1 | grep container.bin | awk '{print $7}'); echo ${pct:-0}")
    def setAppserverUptime(self):
        self.appserverUptime = ejecutarComandoSimple("echo $(( $(( $(date -ud 'now' +'%s') - $(date -ud $(basename $(ls $epe_dir_certa_appserver_logs/*.restart_date)) +'%s'))) /60/60/24 ))")        
    def setAppserverUsuarios(self):
        temp = ejecutarComandoSimple("~/epe/scripts/gtq/epe-usu-conectados_totales.sh")
        try:
            temp = int(temp)
        except ValueError:
            temp = '-'
        self.appserverUsuarios = temp
    def setEstadoSCADA(self):
        self.estadoSCADA = ejecutarComandoSimple(scriptPath+"/scd/check.sh")  
        return self.estadoSCADA     
    def setEstadoNBM(self):
        self.estadoNBM = ejecutarComandoSimple(scriptPath+"/nbm/check.sh")    
        return self.estadoNBM
    def setEstadoTCA(self):
        self.estadoTCA = ejecutarComandoSimple(scriptPath+"/tca/check.sh")   
        return self.estadoTCA
    def setEstadoOMSContainer(self):
        self.estadoOMSContainer = ejecutarComandoSimple(scriptPath+"/oms/container-check.sh force")  
        return self.estadoOMSContainer  
    def setEstadoOMSLink(self):
        self.estadoOMSLink = ejecutarComandoSimple(scriptPath+"/oms/link-check.sh force")  
        return self.estadoOMSLink
    def setEstadoOMSAgatha(self):
        self.estadoOMSAgatha = ejecutarComandoSimple(scriptPath+"/oms/srv/prediction/get.sh")    
        return self.estadoOMSAgatha
    def setEstadoOMSSituacion(self):
        self.estadoOMSSituacion = ejecutarComandoSimple(scriptPath+"/oms/srv/situacion-monitor/get.sh")    
        return self.estadoOMSSituacion
    def setEstadoOMSNotificacion(self):
        self.estadoOMSNotificacion = ejecutarComandoSimple(scriptPath+"/oms/srv/notification-panel/get.sh")    
        return self.estadoOMSNotificacion
    def setEstadoOMSCustomer(self):
        self.estadoOMSCustomer = ejecutarComandoSimple(scriptPath+"/oms/srv/customer-situation/get.sh")  
        return self.estadoOMSCustomer
    def setEstadoKPI(self):
        self.estadoKPI = ejecutarComandoSimple(scriptPath+"/kpi/check.sh")   
        return self.estadoKPI
    #CROMO:
    def setCromoStatus(self):
        cromoCheck = ejecutarComandoSimple("python " + scriptPath + "/cromo/cromo_full-check.py")
        cromoCheck = json.loads(cromoCheck)
        self.cromoAlive = cromoCheck['getCromoAlive']
        self.cromoInstalled = cromoCheck['getCromoInstalled']
        self.cromoDB = cromoCheck['getDB'] 
        self.cromoMovilAlive = cromoCheck['getCromoMovilAlive']
        self.cromoVersion = cromoCheck['getCromoVersion']        

    def getCromoAlive(self): return self.cromoAlive
    def getCromoInstalled(self): return self.cromoInstalled
    def getCromoDB(self): return self.cromoDB
    def getCromoMovilAlive(self): return self.cromoMovilAlive
    def getCromoVersion(self): return self.cromoVersion

# ------------------------------------------------------- MAIN ----------------------------------------------------------------------

if verificarArgumentos() == False: #Verifica que se pasen los argumentos minimos-necesarios para funcionar
    ayuda()
    exit(2)
else:
    if debug == True:
        os.system('clear')
        print(bcolors.HEADER + "+--------------------------------------------------------------+" + bcolors.ENDC)
        print(bcolors.HEADER + "| " + bcolors.ENDC + bcolors.BOLD + "Iniciando ServerMonitor Script v" + VERSION + " : (CTRL+C para terminar)" + bcolors.ENDC + bcolors.HEADER + " |" + bcolors.ENDC)
        print(bcolors.HEADER + "+--------------------------------------------------------------+" + bcolors.ENDC)

    #creamos 2 instancias para ser comparadas con una diferencia de tiempo
    serverViejo = Servidor()
    serverNuevo = Servidor()
    logging('Iniciando...',bcolors.WARNING)
    serverViejo.setDatos()
    logging('Conectando al servidor ' + server_url,bcolors.OKGREEN)
    time.sleep(5)

    try:
        #Defino el servidor de sockets
        servidor = ThreadServer(('',SOCKET_PORT),TcpHandler,serverViejo)
        servidor.serve_on_thread()
    except Exception as e:
        print(e)
        print(bcolors.FAIL + 'Direccion en uso: Aguarde un momento y vuelva a intentarlo\n' + bcolors.ENDC)
        exit(2)

    #enviamos los datos del servidor por primera vez
    temp = enviarDatos(getBloqueDatosJSON(serverViejo))
    if temp != False:
        logging('Envio inicial de datos: ' + temp ,bcolors.OKCYAN) #Se envian los datos
    else:
        print(bcolors.FAIL + 'Error al conectarse al servidor: ' + server_url +':'+ post_port + ' - Verifique la conexion' + bcolors.ENDC)
        servidor.shutdown()
        del servidor
        exit()
    
    #Loop
    try:
        while True:
            serverNuevo.setDatos()
            verificaEstado(serverViejo,serverNuevo) #compara el servidor con el mismo X segundos despues
            serverViejo = copy.deepcopy(serverNuevo) #copia los datos de un objeto a otro para usarlo como nueva referencia
            time.sleep(float(frecuencia)) #Cada X segundos vuelve a monitorear los servicios
    except Exception as e:
        f = open("error-log.txt", "w")
        f.write(e)
        f.close()
    except KeyboardInterrupt:
        print(bcolors.FAIL + '\nInterrumpido por el usuario!\n' + bcolors.ENDC)
        servidor.clean_up()
        os._exit(0)

