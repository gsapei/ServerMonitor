#! /bin/bash

echo -e "\tEliminando link OMS..."
componente=$(ls $epe_dir_certa_appserver_components/deploy/oms/oms-server-EPE-*.4dl)
rm $epe_dir_certa_appserver_components/deploy/oms/oms-server-EPE-*.4dl

echo -e "\tLink eliminado: $componente"

echo -e "\tDesactivando container OMS..."
cd $epe_dir_certa_appserver_bin
./oms-control.sh stop
echo -e "\tSe ha desactivado el container OMS."
