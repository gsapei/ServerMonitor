# Serverside Script CSM

Script en Python que sensa los servidores linux, los servicios del Appserver CERTA y sus componentes y el estado de los servidores Cromo. 
Y envia los cambios que detecta al servidor de monitores NodeJS.

## Uso: 
**python monitor.py -s [SERVER] -p [PUERTO] -a [PATH] ... [OPCIONES]**
```
   -s, --servidor           Direccion IP del servidor de escucha
   -p, --puerto             Puerto del servidor de escucha
   -a, --path               Path donde se envia la informacion mediante POST
   -f, --frecuencia         frecuencia del senso de datos (en segundos)
   -v, --version            Version actual del programa
   -d, --debug              Muestra salida por consola del programa (Apagado por defecto)
   -o, --output             Escribe archivo de logs en el archivo especificado (Apagado por defecto)
   -t, --tipo               Tipo de servidor: "generico", "appserver", "cromo" o "database" 
   -r, --rol                Rol del servidor: "productivo", "desarrollo"
   -h, --ayuda              Muestra esta ayuda
```

## Ejemplo:
```
   python monitor.py -s 127.0.0.1 -p 3000 -a '/status' --debug --output 'salida.log' --tipo 'cromo' --rol 'desarrollo'
```
