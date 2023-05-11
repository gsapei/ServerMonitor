#! /bin/bash
. ~/.bashrc > /dev/null

COMP=$(ls $epe_dir_certa_appserver_components/deploy/tca/ |grep -i Kpi-Mobile)
if [ -n "$COMP" ]
then
	echo "SI"
else
	echo "NO"
fi

