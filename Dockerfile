# Usa imagem base com PHP + Node
FROM php:8.2-fpm

# Instala utilitários
RUN apt-get update && \
    apt-get install -y \
    curl \
    zip \
    unzip \
    git \
    npm \
    supervisor

# Instala Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Define diretório de trabalho
WORKDIR /var/www

# Copia tudo
COPY ./API ./API
COPY ./Front-End ./Front-End
COPY ./supervisord.conf /etc/supervisord.conf

# Instala dependências Laravel
WORKDIR /var/www/API
RUN composer install

# Instala dependências Vue
WORKDIR /var/www/Front-End
RUN npm install

# Expõe as portas
EXPOSE 8000 5173

# Roda o Supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
