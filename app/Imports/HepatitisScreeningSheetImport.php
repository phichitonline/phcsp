<?php

namespace App\Imports;

use App\Models\HepatitisScreening;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithStartRow;

class HepatitisScreeningSheetImport implements ToModel, WithStartRow
{
    public function startRow(): int
    {
        return 4; // Skip the first 3 rows which are complex headers
    }

    public function model(array $row)
    {
        $index = trim($row[0] ?? '');
        $name = trim($row[1] ?? '');
        
        // เอาเฉพาะตัวเลขสำหรับ cid (ลบขีด หรืออักขระอื่นๆ ออก)
        $cid = preg_replace('/[^0-9]/', '', trim($row[3] ?? ''));

        if (!is_numeric($index) || empty($name) || empty($cid) || $name === '-') {
            return null;
        }

        // ข้ามหากมีเลขบัตรประชาชนนี้ในระบบแล้ว
        if (HepatitisScreening::where('cid', $cid)->exists()) {
            return null;
        }

        $parseDate = function($val) {
            $val = trim((string)$val);
            if (empty($val) || $val === '-') return null;
            
            if (is_numeric($val)) {
                try {
                    return \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($val)->format('Y-m-d');
                } catch (\Exception $e) {
                    return null;
                }
            }
            
            $parts = explode('/', $val);
            if (count($parts) === 3) {
                $year = (int)$parts[2];
                if ($year > 2400) {
                    $year -= 543;
                }
                return sprintf('%04d-%02d-%02d', $year, (int)$parts[1], (int)$parts[0]);
            }
            
            return null;
        };

        return new HepatitisScreening([
            'full_name' => $row[1] ?? null,
            'age' => is_numeric($row[2]) ? (int)$row[2] : null,
            'cid' => $cid,
            'address' => $row[4] ?? null,
            'phone' => $row[5] ?? null,
            'hospital_name' => $row[6] ?? null,
            
            'hbv_positive' => $row[7] ?? null,
            'hcv_positive' => $row[8] ?? null,
            
            'hospital_entry_status' => $row[9] ?? null,
            'hbv_treatment_status' => $row[10] ?? null,
            
            'hbv_medication' => $parseDate($row[11] ?? null),
            'hbv_follow_up' => $parseDate($row[12] ?? null),
            
            'hcv_medication' => $parseDate($row[13] ?? null),
            'hcv_follow_up' => $parseDate($row[14] ?? null),
            
            'ultrasound' => $parseDate($row[15] ?? null),
            'referral' => $parseDate($row[16] ?? null),
            'diagnosis' => $row[17] ?? null,
            'remarks' => $row[18] ?? null,
        ]);
    }
}
