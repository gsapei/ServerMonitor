#! /bin/bash
. ~/.bashrc > /dev/null

# Se modifican ambos servicios a la vez
if [ "$1" = "true" ]; then
	sed -i -e 's/<customer-situation-updater enabled="false"/<customer-situation-updater enabled="true"/g' $epe_dir_certa_appserver_configuration/oms.conf
	sed -i -e 's/user-activity-customer-situation-updater enabled="false"/user-activity-customer-situation-updater enabled="true"/g' $epe_dir_certa_appserver_configuration/oms.conf
	cp $epe_dir_certa_appserver_configuration/runtime/available/customer-situation-start.command $epe_dir_certa_appserver_configuration/runtime/incoming
elif [ "$1" = "false" ]; then
	sed -i -e 's/<customer-situation-updater enabled="true"/<customer-situation-updater enabled="false"/g' $epe_dir_certa_appserver_configuration/oms.conf
	sed -i -e 's/user-activity-customer-situation-updater enabled="true"/user-activity-customer-situation-updater enabled="false"/g' $epe_dir_certa_appserver_configuration/oms.conf
	cp $epe_dir_certa_appserver_configuration/runtime/available/customer-situation-stop.command $epe_dir_certa_appserver_configuration/runtime/incoming
fi
