import pycurl, json
from io import BytesIO 
import socket
import os, glob

def getCromoAlive():
    '''
    cromoWebServer = os.popen("ps -ef | grep web | grep prometium | grep epe | grep -v grep").read()
    cromoDbServer = os.popen("ps -ef | grep reader | grep prometium | grep epe | grep -v grep").read()

    if (cromoWebServer and cromoDbServer):
        return('SI')
    else:
        return('NO')
    '''
    # CURL a /status del server CROMO
    cromoStatusURL = 'http://'+ socket.gethostbyname(socket.gethostname()) +':8080/status'
    data = BytesIO()
    c = pycurl.Curl()
    c.setopt(pycurl.CONNECTTIMEOUT, 5)
    c.setopt(pycurl.TIMEOUT, 5)    
    c.setopt(pycurl.URL, cromoStatusURL)
    c.setopt(pycurl.WRITEFUNCTION , data.write)
    try:
        c.perform()
        c.close
    except:
        return('NO') 

    # respuesta HTTP (200 = OK)
    codigoHTTP = c.getinfo(c.HTTP_CODE)
    if codigoHTTP == 200:
        # JSON para obtener el ultimo update
        body = json.loads(data.getvalue())
        webserver = body.get('cromo-web-server')
        dbserver = body.get('cromo-db-server')

        if (webserver =='ready' and dbserver=='ready'):
            return('SI')
        else:
            return('NO')
    else:
        return('NO')


def getCromoInstalled():  
    path = '/u/prometium/v*/'  
    result = glob.glob(path);
    if len(result) > 0:
        isdir = os.path.exists(result[0]) # Si existe el path /u/prometium/v* retorna True
        if isdir==True: return('SI')
    else:
        return('NO')

def getDB():
    path = '/u/prometium/v*/cromo/env/epe/conf/server.conf'  
    result = glob.glob(path)
    if len(result) > 0:
        dbhost= os.popen('cat '+result[0]+' | grep -A8 "database" | grep "host" | cut -f2 -d"=" | xargs').read().strip()
        dbport= os.popen('cat '+result[0]+' | grep -A8 "database" | grep "port" | cut -f2 -d"=" | xargs').read().strip()
        dbservice= os.popen('cat '+result[0]+' | grep -A8 "database" | grep "service" | cut -f2 -d"=" | xargs').read().strip()
        dbstring="jdbc:oracle:thin:@"+ dbhost +":"+ dbport +":"+ dbservice
        return dbstring
    else:
        return 'Error al leer el archivo server.conf de Cromo'

def getCromoMovilAlive():
    pid = os.popen("ps -ef | grep web | grep cm | grep -v grep | awk '{print $2}'").read()
    if(pid):
        return('SI')
    else:
        return('NO')

def getCromoVersion():
    version = os.popen("readlink /u/prometium/vigente").read().strip()
    if(version):
        return(version[1:-1])
    else:
        return('Error')            

print(json.dumps({'getDB':getDB(),'getCromoAlive':getCromoAlive(),'getCromoInstalled':getCromoInstalled(),'getCromoMovilAlive':getCromoMovilAlive(), 'getCromoVersion':getCromoVersion()}))