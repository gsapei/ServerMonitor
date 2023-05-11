#! /bin/bash
. ~/.bashrc > /dev/null

SERVER_ACTIVO=$($epe_dir_epe_scripts/app/up-check.sh)
if [ "$SERVER_ACTIVO" == 'SI' ]
then
	OMSCHECK=$($epe_dir_epe_scripts/oms/check.sh)
	if [ "$OMSCHECK" = "SI" ]
	then
		SRVCHECK=$($epe_dir_epe_scripts/oms/srv/fullget.sh)
		if [[ "$SRVCHECK" = *"OMS"* ]]
		then
			echo "SI"
		else
			echo "NO"
		fi
	else
		echo "NO"
	fi
else
	echo "NO"
fi
