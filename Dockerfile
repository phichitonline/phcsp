# Stage 1: Frontend Build
FROM node:20-alpine AS node_builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: PHP Application
FROM php:8.3-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    git \
    oniguruma-dev \
    icu-dev \
    libzip-dev

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd intl zip

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy application files
COPY . .

# Copy all public files to a temp directory for syncing to the shared volume
COPY --from=node_builder /app/public ./public_temp

# Copy composer dependencies from previous stages or install them
# (Assuming composer.json and composer.lock are already copied)
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Copy entrypoint script
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Set permissions
RUN mkdir -p /var/www/storage/app/public
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# กำหนดสิทธิ์ให้สามารถ อ่าน/เขียน/เข้าถึง ได้ทั้งหมด
RUN chmod -R 777 /var/www/storage /var/www/bootstrap/cache

EXPOSE 9000

ENTRYPOINT ["entrypoint.sh"]
CMD ["php-fpm"]
