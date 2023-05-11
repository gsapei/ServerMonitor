#! /bin/bash
. ~/.bashrc > /dev/null

# Chequeamos para ver si existe el link al componente
COMP=$(ls $epe_dir_certa_appserver_components/deploy/oms/ | grep -i OMS-SERVER)
SYMLINK="$epe_dir_certa_appserver_components/deploy/oms/$COMP"
if [ -h "$SYMLINK" ]; then
	EXISTE_LINK="SI"
else
	EXISTE_LINK="NO"
fi

# Si el parametro es "force" devolvemos el resultado anterior
if [ "$1" == "force" ]; then
	echo "$EXISTE_LINK"
else
	# Si no, nos fijamos si el server se encuentra activo, y este resultado tiene prioridad por sobre el otro
	SERVER_ACTIVO=$($epe_dir_epe_scripts/app/up-check.sh)
	if [ "$SERVER_ACTIVO" == 'SI' ]; then
		echo "$EXISTE_LINK"
	else
		echo "NO"
	fi
fi
