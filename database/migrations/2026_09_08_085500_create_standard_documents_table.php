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
        Schema::create('standard_documents', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('item_no')->default(1)->index();
            $table->string('title');
            $table->text('description')->nullable();
            $table->boolean('required')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // รายการเอกสารมาตรฐานเริ่มต้น 27 รายการ
        $initialDocuments = [
            ['item_no' => 1, 'title' => 'สำเนาบัตรประจำตัวประชาชน', 'description' => 'สำเนาบัตรประจำตัวประชาชน พร้อมลงลายมือชื่อรับรองสำเนาถูกต้อง', 'required' => true],
            ['item_no' => 2, 'title' => 'สำเนาทะเบียนบ้าน', 'description' => 'สำเนาทะเบียนบ้านหน้าแรกและหน้าที่มีชื่อตนเอง', 'required' => true],
            ['item_no' => 3, 'title' => 'สำเนาวุฒิการศึกษา / ปริญญาบัตร', 'description' => 'สำเนาปริญญาบัตรหรือประกาศนียบัตรตามคุณวุฒิที่ใช้สมัคร', 'required' => true],
            ['item_no' => 4, 'title' => 'สำเนาใบแสดงผลการศึกษา (Transcript)', 'description' => 'สำเนาใบรายงานผลการเรียนตลอดหลักสูตรฉบับสมบูรณ์', 'required' => true],
            ['item_no' => 5, 'title' => 'สำเนาใบอนุญาตประกอบวิชาชีพ', 'description' => 'สำเนาใบอนุญาตประกอบวิชาชีพหรือหลักฐานการต่ออายุ', 'required' => true],
            ['item_no' => 6, 'title' => 'หนังสือรับรองการทำงาน / ประวัติการทำงาน', 'description' => 'หนังสือรับรองประสบการณ์การทำงานหรือประวัติการทำงานที่ผ่านมา', 'required' => false],
            ['item_no' => 7, 'title' => 'ใบรับรองแพทย์ตรวจสุขภาพ', 'description' => 'ใบรับรองแพทย์จากสถานพยาบาลของรัฐ (อายุไม่เกิน 1 เดือน)', 'required' => true],
            ['item_no' => 8, 'title' => 'สำเนาสมุดบัญชีเงินฝากธนาคาร', 'description' => 'หน้าสมุดบัญชีธนาคารสำหรับรับโอนเงินเดือนและค่าตอบแทน', 'required' => true],
            ['item_no' => 9, 'title' => 'รูปถ่ายหน้าตรงชุดสุภาพ / เครื่องแบบ', 'description' => 'รูปถ่ายหน้าตรง ขนาด 1 หรือ 2 นิ้ว ถ่ายไว้ไม่เกิน 6 เดือน', 'required' => true],
            ['item_no' => 10, 'title' => 'สำเนาใบเปลี่ยนชื่อ - นามสกุล', 'description' => 'เอกสารการเปลี่ยนชื่อตัวหรือชื่อสกุล (ถ้ามี)', 'required' => false],
            ['item_no' => 11, 'title' => 'สำเนาทะเบียนสมรส / ทะเบียนการหย่า', 'description' => 'เอกสารแสดงสถานภาพครอบครัว (ถ้ามี)', 'required' => false],
            ['item_no' => 12, 'title' => 'สำเนาหลักฐานการเกณฑ์ทหาร (สด.8 / สด.43)', 'description' => 'หนังสือสำคัญทางทหารสำหรับบุคลากรเพศชาย', 'required' => false],
            ['item_no' => 13, 'title' => 'หนังสือรับรองการช่วยชีวิตขั้นพื้นฐาน (BLS / CPR)', 'description' => 'ประกาศนียบัตรการฝึกอบรมการช่วยฟื้นคืนชีพขั้นพื้นฐาน', 'required' => false],
            ['item_no' => 14, 'title' => 'หนังสือยินยอมการคุ้มครองข้อมูลส่วนบุคคล (PDPA)', 'description' => 'หนังสือให้ความยินยอมเก็บรวบรวม ใช้ หรือเปิดเผยข้อมูลส่วนบุคคล', 'required' => true],
            ['item_no' => 15, 'title' => 'สัญญาจ้างงาน / หนังสือแต่งตั้งปฏิบัติหน้าที่', 'description' => 'สำเนาสัญญาจ้างงานหรือคำสั่งแต่งตั้งการปฏิบัติงาน', 'required' => true],
            ['item_no' => 16, 'title' => 'บันทึกข้อตกลงการปฏิบัติงาน (PA / Agreement)', 'description' => 'แบบข้อตกลงและเป้าหมายการปฏิบัติงานประจำปี', 'required' => false],
            ['item_no' => 17, 'title' => 'สำเนาบัตรประจำตัวเจ้าหน้าที่ / ข้าราชการ', 'description' => 'สำเนาบัตรแสดงตนในฐานะบุคลากรสังกัดกระทรวงสาธารณสุข', 'required' => false],
            ['item_no' => 18, 'title' => 'เอกสารการทดสอบสมรรถนะการปฏิบัติงาน', 'description' => 'ผลการประเมินทักษะหรือสมรรถนะทางวิชาชีพ', 'required' => false],
            ['item_no' => 19, 'title' => 'หนังสือรับรองความประพฤติ / ตรวจประวัติอาชญากรรม', 'description' => 'เอกสารการตรวจสอบประวัติอาชญากรรมจากสำนักงานตำรวจแห่งชาติ', 'required' => false],
            ['item_no' => 20, 'title' => 'แผนพัฒนาตนเองรายบุคคล (IDP)', 'description' => 'แบบจัดทำแผนพัฒนาศักยภาพตนเองประจำปีงบประมาณ', 'required' => false],
            ['item_no' => 21, 'title' => 'ประวัติการฉีดวัคซีนและผลตรวจภูมิคุ้มกัน', 'description' => 'หลักฐานการรับวัคซีนป้องกันโรคตับอักเสบ ไข้หวัดใหญ่ โควิด-19 ฯลฯ', 'required' => true],
            ['item_no' => 22, 'title' => 'สำเนาใบอนุญาตขับขี่รถยนต์', 'description' => 'สำหรับเจ้าหน้าที่ขับขี่รถพยาบาลหรือยานพาหนะของทางราชการ', 'required' => false],
            ['item_no' => 23, 'title' => 'คำสั่งแต่งตั้งคณะกรรมการ / คณะทำงาน', 'description' => 'คำสั่งหรือหนังสือแต่งตั้งมอบหมายงานเฉพาะกิจ', 'required' => false],
            ['item_no' => 24, 'title' => 'สำเนาบัตรประกันสังคม / สิทธิการรักษาพยาบาล', 'description' => 'เอกสารแสดงสิทธิหลักประกันสุขภาพหรือสวัสดิการรักษาพยาบาล', 'required' => false],
            ['item_no' => 25, 'title' => 'หนังสือยินยอมการหักเงินเดือนและสวัสดิการ', 'description' => 'แบบแสดงความจำนงหักเงินเดือนเข้ากองทุนหรือสวัสดิการ', 'required' => false],
            ['item_no' => 26, 'title' => 'แบบประเมินค่างานและการกำหนดตำแหน่ง', 'description' => 'เอกสารประเมินภาระงานและมาตรฐานกำหนดตำแหน่ง', 'required' => false],
            ['item_no' => 27, 'title' => 'แบบฟอร์มแสดงความประสงค์ผู้รับผลประโยชน์', 'description' => 'หนังสือระบุผู้รับผลประโยชน์กรณีเสียชีวิตหรือเงินสงเคราะห์', 'required' => true],
        ];

        $now = now();
        foreach ($initialDocuments as &$doc) {
            $doc['is_active'] = true;
            $doc['created_at'] = $now;
            $doc['updated_at'] = $now;
        }

        DB::table('standard_documents')->insert($initialDocuments);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('standard_documents');
    }
};
