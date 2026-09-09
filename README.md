# HOS-info V2

ระบบรายงานและจัดการข้อมูลตัวชี้วัด (KPI Management System) พัฒนาด้วย Laravel 12, Inertia.js และ React.

## การใช้งานด้วย Docker

โปรเจ็คนี้รองรับการรันผ่าน Docker เพื่อความสะดวกในการตั้งค่าสภาพแวดล้อม

### สิ่งที่ต้องมี
- [Docker](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### ขั้นตอนการรัน
1. **คัดลอกไฟล์ .env**
   ```bash
   cp .env.example .env
   ```
2. **ตั้งค่า .env สำหรับ Docker**
   แก้ไขไฟล์ `.env` ให้ตรงกับการตั้งค่าใน `docker-compose.yml`:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=db
   DB_PORT=3306
   DB_DATABASE=hosinfo
   DB_USERNAME=sail
   DB_PASSWORD=password
   ```
3. **Build และรัน Container**
   ```bash
   docker compose up -d --build
   ```
4. **ติดตั้ง Dependencies และตั้งค่าระบบ** (รันครั้งแรก)
   ```bash
   docker compose exec app composer install
   npm install
   npm run build
   docker compose exec app php artisan key:generate
   docker compose exec app php artisan storage:link
   docker compose exec app php artisan migrate --seed
   ```
5. **เข้าใช้งาน**
   เปิดเบราว์เซอร์ไปที่: `http://localhost:8080`

## โครงสร้างโปรเจ็ค
- `app/`: Logic ของ Laravel (Controllers, Models)
- `resources/js/`: Frontend (React Components, Pages)
- `docker/`: การตั้งค่า Docker (Nginx config)
- `public/`: ไฟล์สาธารณะและ Build artifacts

## ผู้พัฒนา
โรงพยาบาลสมเด็จพระยุพราชตะพานหิน (https://www.tphcp.go.th)
Developer : Dr.GHOST Email : phichitonline@gmail.com
