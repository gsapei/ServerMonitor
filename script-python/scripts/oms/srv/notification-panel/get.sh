#! /bin/bash
. ~/.bashrc > /dev/null

SERVER_ACTIVO=$($epe_dir_epe_scripts/app/up-check.sh)
if [ "$SERVER_ACTIVO" == 'SI' ]
then
	ESTADO=$(cat $epe_dir_certa_appserver_configuration/oms.conf | grep "notification-panel-cache-updater enabled" | sed -r 's/^.+enabled="([^"]+)".+$/\1/')
	if [ $ESTADO = "true" ]; then
		echo "SI"
	else
		echo "NO"
	fi
else
	echo "NO"
fi
