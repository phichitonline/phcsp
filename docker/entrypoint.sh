#!/bin/sh
set -e

# สร้างโฟลเดอร์ที่จำเป็นหากยังไม่มี
mkdir -p /var/www/storage/logs
mkdir -p /var/www/storage/framework/sessions
mkdir -p /var/www/storage/framework/views
mkdir -p /var/www/storage/framework/cache
mkdir -p /var/www/storage/app/public
mkdir -p /var/www/bootstrap/cache
mkdir -p /var/www/public

# Sync public files from image to volume (ensures Nginx gets latest index.php and assets)
echo "Syncing public assets to volume..."
cp -rf /var/www/public_temp/* /var/www/public/

# สร้างไฟล์ log ถ้ายังไม่มี และตั้งสิทธิ์
touch /var/www/storage/logs/laravel.log
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
chmod -R 777 /var/www/storage /var/www/bootstrap/cache

# ฟังก์ชันรอ Database พร้อมทำงาน
wait_for_db() {
    echo "Waiting for database connection..."
    max_tries=30
    count=0
    # ใช้ php artisan เพื่อเช็คการเชื่อมต่อจริงผ่าน Laravel config
    until php artisan db:show > /dev/null 2>&1 || [ $count -eq $max_tries ]; do
        sleep 2
        count=$((count + 1))
        echo "Attempt $count: Database is not ready yet..."
    done

    if [ $count -eq $max_tries ]; then
        echo "Error: Database connection timed out."
        # ไม่หยุดการทำงาน เผื่อผู้ใช้จะแก้ไขทีหลัง
    else
        echo "Database connected!"
    fi
}

# รัน Migration อัตโนมัติ (Laravel จะเช็คเองว่าไฟล์ไหนรันไปแล้ว)
wait_for_db
echo "Checking and running migrations..."
php artisan migrate --force

# รันคำสั่งหลักของ Container (เช่น php-fpm)
exec "$@"
