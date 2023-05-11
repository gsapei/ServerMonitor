#! /bin/bash
. ~/.bashrc > /dev/null

# Borramos el backup anterior
rm /u/prometium/vigente/business-updater/env/epe/repo/backup/*

# Utilizamos la base actual como backup
find /u/prometium/vigente/business-updater/env/epe/repo/ -maxdepth 1 -type f -exec mv {} /u/prometium/vigente/business-updater/env/epe/repo/backup \;

# Recreamos la base
/u/prometium/vigente/business-updater/bin/update.sh -e epe -m clientes