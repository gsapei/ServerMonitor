#! /bin/bash
. ~/.bashrc > /dev/null

if [ "$1" = "true" ]; then
	sed -i -e 's/available-prediction enabled="false"/available-prediction enabled="true"/g' $epe_dir_certa_appserver_configuration/oms.conf
	cp $epe_dir_certa_appserver_configuration/runtime/available/ClaimLoader-start.command $epe_dir_certa_appserver_configuration/runtime/incoming
elif [ "$1" = "false" ]; then
	sed -i -e 's/available-prediction enabled="true"/available-prediction enabled="false"/g' $epe_dir_certa_appserver_configuration/oms.conf
	cp $epe_dir_certa_appserver_configuration/runtime/available/ClaimLoader-stop.command $epe_dir_certa_appserver_configuration/runtime/incoming
fi


