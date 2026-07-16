FROM nginx:alpine

# Supprimer la configuration par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copier les fichiers HTML
COPY *.html /usr/share/nginx/html/

# Configuration Nginx intégrée
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index sidebar.html; \
    location / { \
        try_files $uri $uri/ /sidebar.html; \
        add_header Cache-Control "no-cache, no-store, must-revalidate"; \
    } \
    location /api/ { \
        proxy_pass http://api:8000/api/; \
        proxy_http_version 1.1; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
    location /docs { \
        proxy_pass http://api:8000/docs; \
        proxy_http_version 1.1; \
        proxy_set_header Host $host; \
    } \
    location /health { \
        proxy_pass http://api:8000/health; \
        proxy_http_version 1.1; \
        proxy_set_header Host $host; \
    } \
    error_page 404 /sidebar.html; \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]