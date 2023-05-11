#! /bin/bash
. ~/.bashrc > /dev/null

COMP=$(ls $epe_dir_certa_appserver_components/deploy/oms/ |grep -i nbm-updater)
if [ -n "$COMP" ]
then
	echo "SI"
else
	echo "NO"
fi

