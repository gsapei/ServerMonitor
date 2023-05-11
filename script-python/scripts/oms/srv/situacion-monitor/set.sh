#! /bin/bash
. ~/.bashrc > /dev/null

if [ "$1" = "true" ]; then
	sed -i -e 's/monitor-cache-updater enabled="false"/monitor-cache-updater enabled="true"/g' $epe_dir_certa_appserver_configuration/oms.conf
	cp $epe_dir_certa_appserver_configuration/runtime/available/situacion-monitor-start.command $epe_dir_certa_appserver_configuration/runtime/incoming
elif [ "$1" = "false" ]; then
	sed -i -e 's/monitor-cache-updater enabled="true"/monitor-cache-updater enabled="false"/g' $epe_dir_certa_appserver_configuration/oms.conf
	cp $epe_dir_certa_appserver_configuration/runtime/available/situacion-monitor-stop.command $epe_dir_certa_appserver_configuration/runtime/incoming
fi
