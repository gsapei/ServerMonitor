#! /bin/bash
. ~/.bashrc > /dev/null

echo -e "\tDesactivando interfaz SCADA..."
componente=$(ls $epe_dir_certa_appserver_components/deploy/oms/epe-operation-interface-*.4dl)

rm $epe_dir_certa_appserver_components/deploy/oms/epe-operation-interface-*.4dl

echo -e "\tLink eliminado: $componente"
echo -e "\tSe ha desactivado la interfaz SCADA."