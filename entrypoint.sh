#!/bin/sh

# Ruta donde Nginx sirve los archivos (según tu Dockerfile)
HTML_DIR=/usr/share/nginx/html

# Creamos el archivo de configuración JS
echo "window.ENV = {" > $HTML_DIR/env-config.js

# Añade aquí TODAS las variables que tu app ADMIN necesita.

echo "  VITE_API_URL: \"$VITE_API_URL\"," >> $HTML_DIR/env-config.js

echo "}" >> $HTML_DIR/env-config.js

echo ">>> env-config.js para ADMIN generado:"
cat $HTML_DIR/env-config.js

echo ">>> Iniciando Nginx..."
# Ejecuta el comando original del Dockerfile (nginx)
exec "$@"