#! /bin/bash
. ~/.bashrc > /dev/null

if [ "$1" = "true" ]; then
	sed -i -e 's/notification-panel-cache-updater enabled="false"/notification-panel-cache-updater enabled="true"/g' $epe_dir_certa_appserver_configuration/oms.conf
	cp $epe_dir_certa_appserver_configuration/runtime/available/notification-panel-start.command $epe_dir_certa_appserver_configuration/runtime/incoming
elif [ "$1" = "false" ]; then
	sed -i -e 's/notification-panel-cache-updater enabled="true"/notification-panel-cache-updater enabled="false"/g' $epe_dir_certa_appserver_configuration/oms.conf
	cp $epe_dir_certa_appserver_configuration/runtime/available/notification-panel-stop.command $epe_dir_certa_appserver_configuration/runtime/incoming
fi
