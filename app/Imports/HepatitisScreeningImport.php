<?php

namespace App\Imports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\SkipsUnknownSheets;

class HepatitisScreeningImport implements WithMultipleSheets, SkipsUnknownSheets
{
    public function sheets(): array
    {
        return [
            'Sheet1' => new HepatitisScreeningSheetImport(),
        ];
    }

    public function onUnknownSheet($sheetName)
    {
        // Skip unknown sheets silently
    }
}
