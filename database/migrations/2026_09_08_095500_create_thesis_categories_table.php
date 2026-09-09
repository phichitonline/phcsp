<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. สร้างตาราง thesis_categories (หมวดวิทยานิพนธ์)
        Schema::create('thesis_categories', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('category_no')->index(); // ลำดับหมวด (1 - 10)
            $table->string('name'); // ชื่อหมวด
            $table->string('suggested_name'); // ชื่อหมวดเสนอแนะ
            $table->text('description')->nullable(); // คำอธิบาย/แนวทางการใช้
            $table->string('item_reference')->nullable(); // ข้อในวงเล็บด้านหลังของชื่อหมวด
            $table->timestamps();
        });

        // 2. ข้อมูลหมวดวิทยานิพนธ์ 10 หมวดตามเอกสาร
        $now = now();
        $categories = [
            [
                'id' => 1,
                'category_no' => 1,
                'name' => 'การแต่งตั้งคณะกรรมการที่ปรึกษา',
                'suggested_name' => 'การแต่งตั้งและขอเปลี่ยนแปลงอาจารย์ที่ปรึกษา',
                'description' => 'เอกสารเกี่ยวกับการเสนอแต่งตั้งอาจารย์ที่ปรึกษาหลัก/ร่วม และคำร้องขอเปลี่ยนแปลงกรรมการที่ปรึกษาเมื่อมีการปรับเปลี่ยนโครงสร้างวิทยานิพนธ์',
                'item_reference' => 'ลำดับที่ 1 หรือ 21',
                'items' => [1, 21],
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 2,
                'category_no' => 2,
                'name' => 'การสอบโครงร่างวิทยานิพนธ์',
                'suggested_name' => 'การยื่นขอสอบและดำเนินการสอบโครงร่างวิทยานิพนธ์',
                'description' => 'คำร้องขออนุมัติสอบโครงร่าง, แต่งตั้งกรรมการสอบ, ใบลงคะแนน และรายงานผลการสอบโครงร่างวิทยานิพนธ์',
                'item_reference' => 'ลำดับที่ 2 ถึง 6',
                'items' => [2, 3, 4, 5, 6],
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 3,
                'category_no' => 3,
                'name' => 'การแก้ไขและรายงานผลสอบโครงร่าง',
                'suggested_name' => 'การส่งเอกสารแก้ไขและแจ้งผลการสอบโครงร่าง',
                'description' => 'แบบฟอร์มรายงานการแก้ไขเล่มโครงร่างตามคำแนะนำของกรรมการ และเอกสารยืนยันผลการอนุมัติโครงร่างวิทยานิพนธ์อย่างเป็นทางการ',
                'item_reference' => 'ลำดับที่ 8 ถึง 9',
                'items' => [8, 9],
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 4,
                'category_no' => 4,
                'name' => 'การขออนุมัติชื่อเรื่องและโครงร่างวิทยานิพนธ์',
                'suggested_name' => 'การขอเสนออนุมัติชื่อเรื่องและเค้าโครงวิทยานิพนธ์',
                'description' => 'หนังสือขออนุมัติขึ้นทะเบียนชื่อเรื่อง (ทั้งภาษาไทยและภาษาอังกฤษ) และเค้าโครงวิทยานิพนธ์หลังผ่านการสอบ',
                'item_reference' => 'ลำดับที่ 7',
                'items' => [7],
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 5,
                'category_no' => 5,
                'name' => 'จริยธรรมการวิจัยในมนุษย์',
                'suggested_name' => 'การรับรองและดำเนินการด้านจริยธรรมการวิจัย',
                'description' => 'แบบฟอร์มยื่นขอพิจารณาจริยธรรมการวิจัยในมนุษย์ (IRB), เอกสารยินยอมเข้าร่วมการวิจัย และแบบรายงานการดำเนินงานด้านจริยธรรม',
                'item_reference' => 'ลำดับที่ 10 และ (11 หรือ 12)',
                'items' => [10, 11, 12],
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 6,
                'category_no' => 6,
                'name' => 'การสอบป้องกันวิทยานิพนธ์',
                'suggested_name' => 'การยื่นขอสอบและดำเนินการสอบป้องกันวิทยานิพนธ์ (สอบจบ)',
                'description' => 'คำร้องขออนุมัติสอบป้องกันวิทยานิพนธ์, การแต่งตั้งกรรมการสอบจบ, เอกสารประเมินผลการสอบ และคำร้องขอแต่งตั้งกรรมการสอบกรณีพิเศษ/เพิ่มเติม',
                'item_reference' => 'ลำดับที่ 13 ถึง 16 และ 22',
                'items' => [13, 14, 15, 16, 22],
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 7,
                'category_no' => 7,
                'name' => 'การแก้ไขเล่มวิทยานิพนธ์สมบูรณ์',
                'suggested_name' => 'การส่งเล่มวิทยานิพนธ์แก้ไขและรายงานผลการสอบจบ',
                'description' => 'ตารางชี้แจงรายการแก้ไขเล่มวิทยานิพนธ์ฉบับสมบูรณ์ตามมติคณะกรรมการ และใบรับรองการตรวจแก้ไขเล่ม',
                'item_reference' => 'ลำดับที่ 17 และ 18',
                'items' => [17, 18],
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 8,
                'category_no' => 8,
                'name' => 'การเผยแพร่ผลงานและการสำเร็จการศึกษา',
                'suggested_name' => 'การยื่นหลักฐานการเผยแพร่ผลงานวิชาการและการขอสำเร็จการศึกษา',
                'description' => 'แบบฟอร์มแจ้งการตีพิมพ์/นำเสนอผลงานวิชาการ (Proceeding / Journal) และคำร้องขอนุมัติสำเร็จการศึกษาตามเงื่อนไขของหลักสูตร',
                'item_reference' => 'ลำดับที่ 19 และ 20',
                'items' => [19, 20],
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 9,
                'category_no' => 9,
                'name' => 'การส่งเล่มและจัดเก็บวิทยานิพนธ์ฉบับสมบูรณ์',
                'suggested_name' => 'การส่งมอบเล่มวิทยานิพนธ์สมบูรณ์และไฟล์ข้อมูล',
                'description' => 'ใบนำส่งเล่มวิทยานิพนธ์เข้าเล่มแข็ง, การส่งไฟล์ดิจิทัล (CD/Flash drive) และหนังสือยินยอมมอบสิทธิ์การเผยแพร่วิทยานิพนธ์ให้แก่วิทยาลัย/สถาบัน',
                'item_reference' => 'ลำดับที่ 25 ถึง 27',
                'items' => [25, 26, 27],
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 10,
                'category_no' => 10,
                'name' => 'คำร้องทั่วไปและบริการงานวิทยานิพนธ์',
                'suggested_name' => 'คำร้องทั่วไปและเอกสารอื่นๆ ที่เกี่ยวข้อง',
                'description' => 'คำร้องขอขยายเวลาการศึกษา, คำร้องขอพักการเรียน (Drop), การขอใช้อุปกรณ์/เครื่องมือวิจัย หรือคำร้องทั่วไปที่ไม่เข้าหมวดหมู่ข้างต้น',
                'item_reference' => 'ลำดับที่ 23 และ 24',
                'items' => [23, 24],
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        // แทรกข้อมูลลงตาราง thesis_categories
        foreach ($categories as $cat) {
            $items = $cat['items'];
            unset($cat['items']);
            DB::table('thesis_categories')->insert($cat);
        }

        // 3. เพิ่มฟิลด์เชื่อมโยง thesis_category_id ในตาราง standard_documents
        Schema::table('standard_documents', function (Blueprint $table) {
            $table->foreignId('thesis_category_id')->nullable()->after('id')->constrained('thesis_categories')->nullOnDelete();
        });

        // 4. อัปเดตฟิลด์เชื่อมโยงในตาราง standard_documents ตามข้อในวงเล็บด้านหลังของชื่อหมวด
        foreach ($categories as $cat) {
            $items = match ($cat['id']) {
                1 => [1, 21],
                2 => [2, 3, 4, 5, 6],
                3 => [8, 9],
                4 => [7],
                5 => [10, 11, 12],
                6 => [13, 14, 15, 16, 22],
                7 => [17, 18],
                8 => [19, 20],
                9 => [25, 26, 27],
                10 => [23, 24],
                default => [],
            };

            if (!empty($items)) {
                DB::table('standard_documents')
                    ->whereIn('item_no', $items)
                    ->update(['thesis_category_id' => $cat['id']]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('standard_documents', function (Blueprint $table) {
            $table->dropForeign(['thesis_category_id']);
            $table->dropColumn('thesis_category_id');
        });

        Schema::dropIfExists('thesis_categories');
    }
};
