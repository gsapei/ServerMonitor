#! /bin/bash
. ~/.bashrc > /dev/null

INICIO=$(date +%s)

# Detencion del servidor
/u/prometium/vigente/cromo/bin/stop.sh -e epe -w
#/u/prometium/vigente/cromo/bin/updater.sh -e epe stop
#/u/prometium/vigente/cromo/bin/updater.sh -e epe remove
#/u/prometium/vigente/cromo/bin/cromo-trx-out.sh -e epe stop
#/u/prometium/vigente/cromo/bin/watchdog.sh -e epe stop

# Reinicio del servidor
/u/prometium/vigente/cromo/bin/start.sh -e epe -w
#/u/prometium/vigente/cromo/bin/update.sh -e epe --nodata
#/u/prometium/vigente/cromo/bin/updater.sh -e epe install
#/u/prometium/vigente/cromo/bin/updater.sh -e epe start
#/u/prometium/vigente/cromo/bin/cromo-trx-out.sh -e epe start
#/u/prometium/vigente/cromo/bin/watchdog.sh -e epe start

FIN=$(date +%s)
DEMORA=$(( FIN - INICIO ))
eval "echo Tiempo transcurrido: $(date -ud "@$DEMORA" +'%H:%M:%S')"
