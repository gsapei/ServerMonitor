#! /bin/bash
. ~/.bashrc > /dev/null

# Chequeamos para ver si el container se encuentra activo
PID=$(ps -ef | grep $SERVER | grep 4713 | grep -v grep | awk '{print $2}')
if [ -z "$PID" ]; then
	CONTAINER_ACTIVO="NO"
else
	CONTAINER_ACTIVO="SI"
fi

# Si el parametro es "force" devolvemos el resultado anterior
if [ "$1" == "force" ]; then
	echo "$CONTAINER_ACTIVO"
else
	# Si no, nos fijamos si el server se encuentra activo, y este resultado tiene prioridad por sobre el otro
	SERVER_ACTIVO=$($epe_dir_epe_scripts/app/up-check.sh)
	if [ "$SERVER_ACTIVO" == 'SI' ]; then
		echo "$CONTAINER_ACTIVO"
	else
		echo "NO"
	fi
fi
