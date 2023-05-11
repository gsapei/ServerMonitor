#! /bin/bash
. ~/.bashrc > /dev/null

echo -e "\tDesactivando NBM-Updater..."
componente=$(ls $epe_dir_certa_appserver_components/deploy/oms/nbm-updater-*.4dl)

rm $epe_dir_certa_appserver_components/deploy/oms/nbm-updater-*.4dl

echo -e "\tLink eliminado: $componente"
echo -e "\tSe ha desactivado NBM-Updater."