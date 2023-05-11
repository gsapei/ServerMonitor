#!/bin/sh
ROOT_DIR=/usr/share/nginx/html/csm

echo "Remplazando ApiURL en archivos JS"
sed -i 's|BACKEND_API|'${BACKEND_API}'|g' $ROOT_DIR/js/app.*.js

#nginx -g 'daemon off;'