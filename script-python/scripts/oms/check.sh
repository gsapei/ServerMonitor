#! /bin/bash
. ~/.bashrc > /dev/null

_BL="\033(0m\033(B"
_HL="\033(0q\033(B"

OMS_CONTAINER_ACTIVO=$($epe_dir_epe_scripts/oms/container-check.sh force)

if [ "$1" != "verbose" ]; then
	# Se debe chequear si el container esta activo y luego si el link esta creado
	# En ambos casos los scripts ya contemplan el estado del appserver por lo que no hace falta chequearlo nuevamente
	if [ "$OMS_CONTAINER_ACTIVO" == 'NO' ]
	then
		echo "NO"
	else
		$epe_dir_epe_scripts/oms/link-check.sh
	fi
else
	# En este caso informamos todo: el estado del appserver, del container y del link, en ese orden.
	if [ $epe_dir_epe_scripts/app/up-check.sh == "SI" ]; then SERVER_ACTIVO="AppServer               ACTIVO"; else SERVER_ACTIVO="AppServer               INACTIVO"; fi
	if [ $OMS_CONTAINER_ACTIVO == "SI" ]; then OMS_CONTAINER_ACTIVO="OMS Container     ACTIVO"; else OMS_CONTAINER_ACTIVO="OMS Container     INACTIVO"; fi
	if [ $($epe_dir_epe_scripts/oms/link-check.sh force) == "SI" ]; then LINK_ACTIVO="Link OMS      ACTIVO"; else LINK_ACTIVO="Link OMS      INACTIVO"; fi
	echo -e "$SERVER_ACTIVO"
	echo -e "    ${_BL}${_HL}$OMS_CONTAINER_ACTIVO"
	echo -e "        ${_BL}${_HL}$LINK_ACTIVO"
fi
