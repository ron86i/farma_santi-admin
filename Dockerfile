# Usamos una imagen base de Nginx
FROM nginx:alpine

# Elimina la configuración por defecto de Nginx y usa la tuya personalizada
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia los archivos precompilados (build) de Vite
COPY dist /usr/share/nginx/html

# Expone el puerto estándar de HTTP
EXPOSE 4173

# Comando por defecto para ejecutar Nginx
CMD ["nginx", "-g", "daemon off;"]
