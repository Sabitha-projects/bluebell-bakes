# 1. Start from an official PHP image with version 8.2 (CLI version)
FROM php:8.2-cli

# 2. Install system packages and PHP extensions Laravel needs
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    libzip-dev \
    libpng-dev \
    && docker-php-ext-install pdo pdo_pgsql pgsql zip gd

# 3. Install Composer (PHP's package manager)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 4. Set the working directory inside the container
WORKDIR /app

# 5. Copy your project files into the container
COPY . .

# 6. Install PHP dependencies (no dev packages, optimized)
RUN composer install --no-dev --optimize-autoloader

# 7. Set permissions for Laravel's storage and cache folders
RUN chmod -R 775 storage bootstrap/cache

# 8. Expose the port the app will run on
EXPOSE 8000

# 9. The command that starts your app when the container runs
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=8000