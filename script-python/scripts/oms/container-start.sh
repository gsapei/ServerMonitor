#! /bin/bash

echo -e "\tCreando link OMS..."
# WARNING! Esto funciona solamente si hay una y solo una version del componente disponible!
cd $epe_dir_certa_appserver_components/deploy/oms/
ln -s $epe_dir_certa_appserver_components/available/oms-server-EPE-*.4dl

componente=$(ls $epe_dir_certa_appserver_components/deploy/oms/oms-server-EPE-*.4dl)
echo -e "\tLink creado: $componente"

echo -e "\tActivando container OMS..."
cd $epe_dir_certa_appserver_bin
./oms-control.sh start

echo -e "\tSe ha activado el container OMS."
