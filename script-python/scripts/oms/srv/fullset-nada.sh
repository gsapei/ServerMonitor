#! /bin/bash
. ~/.bashrc > /dev/null

# Primero se detienen todos los servicios y luego se reinician los que corresponden
$epe_dir_epe_scripts/oms/srv/prediction/set.sh false
$epe_dir_epe_scripts/oms/srv/situacion-monitor/set.sh false
$epe_dir_epe_scripts/oms/srv/notification-panel/set.sh false
$epe_dir_epe_scripts/oms/srv/customer-situation/set.sh false

echo -e "\tSe ha cambiado el modo de trabajo a 'nada (ni Agatha ni OMS)'"
