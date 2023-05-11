#! /bin/bash
. ~/.bashrc > /dev/null

COMP1=$(ls $epe_dir_certa_appserver_components/deploy/tca/ |grep -i web-container)
COMP2=$(ls $epe_dir_certa_appserver_components/deploy/tca/ |grep -i tca-web)
if [ -n "$COMP1" -a -n "$COMP2" ]
then
	echo "SI"
else
	echo "NO"
fi
