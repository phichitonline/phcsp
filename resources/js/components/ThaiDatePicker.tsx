import React, { useState, useEffect, useRef, useMemo } from 'react';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

export interface ThaiDatePickerProps {
    value?: string; // Format: "YYYY-MM-DD" (ค.ศ. เช่น "1990-05-15")
    onChange: (dateStr: string) => void; // Emits: "YYYY-MM-DD" (ค.ศ.)
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    isInvalid?: boolean;
    id?: string;
    name?: string;
    maxDate?: string; // "YYYY-MM-DD"
    minDate?: string; // "YYYY-MM-DD"
    showThaiDatePreview?: boolean;
}

const THAI_MONTHS_FULL = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
    'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
    'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

const THAI_MONTHS_SHORT = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.',
    'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.',
    'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];

const THAI_DAYS_SHORT = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

/**
 * แปลง ค.ศ. (YYYY-MM-DD) เป็น ข้อความ พ.ศ. (DD/MM/YYYY)
 */
function toThaiBEString(isoDate?: string): string {
    if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return '';
    const [y, m, d] = isoDate.split('-').map(Number);
    if (!y || !m || !d) return '';
    const beYear = y + 543;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d)}/${pad(m)}/${beYear}`;
}

/**
 * แปลง ข้อความ พ.ศ. (DD/MM/YYYY) เป็น ค.ศ. (YYYY-MM-DD)
 */
function parseThaiBEToISO(beStr: string): string | null {
    const cleaned = beStr.trim().replace(/\D/g, '');
    let d = 0, m = 0, beYear = 0;

    if (cleaned.length === 8) {
        d = parseInt(cleaned.substring(0, 2), 10);
        m = parseInt(cleaned.substring(2, 4), 10);
        beYear = parseInt(cleaned.substring(4, 8), 10);
    } else {
        const parts = beStr.split(/[\/\-\.]/).map((p) => p.trim());
        if (parts.length === 3) {
            d = parseInt(parts[0], 10);
            m = parseInt(parts[1], 10);
            beYear = parseInt(parts[2], 10);
        }
    }

    if (!d || !m || !beYear || beYear < 2400 || beYear > 2700 || m < 1 || m > 12) {
        return null;
    }

    const ceYear = beYear - 543;
    const daysInMonth = new Date(ceYear, m, 0).getDate();
    if (d < 1 || d > daysInMonth) return null;

    const pad = (n: number) => String(n).padStart(2, '0');
    return `${ceYear}-${pad(m)}-${pad(d)}`;
}

/**
 * ฟังก์ชันแสดงผลวันที่แบบไทยเต็ม เช่น "15 พฤษภาคม 2533"
 */
function formatThaiFull(isoDate?: string): string {
    if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return '';
    const [y, m, d] = isoDate.split('-').map(Number);
    if (!y || !m || !d || m < 1 || m > 12) return '';
    return `${d} ${THAI_MONTHS_FULL[m - 1]} ${y + 543}`;
}

const ThaiDatePicker: React.FC<ThaiDatePickerProps> = ({
    value = '',
    onChange,
    placeholder = 'วว/ดด/ปปปป (พ.ศ.)',
    className = 'form-control',
    disabled = false,
    isInvalid = false,
    id,
    name,
    maxDate,
    minDate,
    showThaiDatePreview = true,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(toThaiBEString(value));

    // วันที่กำลังเลือกดูใน Calendar (ปี ค.ศ., เดือน 0-11)
    const today = new Date();
    const [viewYear, setViewYear] = useState<number>(() => {
        if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return parseInt(value.split('-')[0], 10);
        }
        return today.getFullYear();
    });

    const [viewMonth, setViewMonth] = useState<number>(() => {
        if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return parseInt(value.split('-')[1], 10) - 1;
        }
        return today.getMonth();
    });

    const containerRef = useRef<HTMLDivElement>(null);

    // Sync input string when external value changes
    useEffect(() => {
        setInputValue(toThaiBEString(value));
        if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
            const [y, m] = value.split('-').map(Number);
            setViewYear(y);
            setViewMonth(m - 1);
        }
    }, [value]);

    // Click outside to close calendar
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Handle user typing
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        setInputValue(text);

        // If cleared
        if (!text.trim()) {
            onChange('');
            return;
        }

        // Try parsing
        const iso = parseThaiBEToISO(text);
        if (iso) {
            onChange(iso);
            const [y, m] = iso.split('-').map(Number);
            setViewYear(y);
            setViewMonth(m - 1);
        }
    };

    const handleInputBlur = () => {
        if (!inputValue.trim()) {
            onChange('');
            return;
        }
        const iso = parseThaiBEToISO(inputValue);
        if (iso) {
            setInputValue(toThaiBEString(iso));
            onChange(iso);
        } else {
            // Revert back to valid state if input was invalid
            setInputValue(toThaiBEString(value));
        }
    };

    // Calendar Navigation
    const handlePrevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear((prev) => prev - 1);
        } else {
            setViewMonth((prev) => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear((prev) => prev + 1);
        } else {
            setViewMonth((prev) => prev + 1);
        }
    };

    const handleSelectDay = (day: number) => {
        const pad = (n: number) => String(n).padStart(2, '0');
        const iso = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
        onChange(iso);
        setInputValue(toThaiBEString(iso));
        setIsOpen(false);
    };

    const handleSetToday = () => {
        const pad = (n: number) => String(n).padStart(2, '0');
        const now = new Date();
        const iso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
        onChange(iso);
        setInputValue(toThaiBEString(iso));
        setViewYear(now.getFullYear());
        setViewMonth(now.getMonth());
        setIsOpen(false);
    };

    const handleClear = () => {
        onChange('');
        setInputValue('');
        setIsOpen(false);
    };

    // Calculate calendar grid days
    const calendarDays = useMemo(() => {
        const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

        const cells: Array<{
            day: number;
            monthOffset: number; // -1 = prev, 0 = current, 1 = next
            dateStr: string;
            isToday: boolean;
            isSelected: boolean;
            isDisabled: boolean;
        }> = [];

        const pad = (n: number) => String(n).padStart(2, '0');
        const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

        // Previous month days to fill starting row
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const d = daysInPrevMonth - i;
            const prevMonthYear = viewMonth === 0 ? viewYear - 1 : viewYear;
            const prevMonthNum = viewMonth === 0 ? 12 : viewMonth;
            const dateStr = `${prevMonthYear}-${pad(prevMonthNum)}-${pad(d)}`;
            cells.push({
                day: d,
                monthOffset: -1,
                dateStr,
                isToday: dateStr === todayStr,
                isSelected: dateStr === value,
                isDisabled: (maxDate && dateStr > maxDate) || (minDate && dateStr < minDate) || false,
            });
        }

        // Current month days
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(d)}`;
            cells.push({
                day: d,
                monthOffset: 0,
                dateStr,
                isToday: dateStr === todayStr,
                isSelected: dateStr === value,
                isDisabled: (maxDate && dateStr > maxDate) || (minDate && dateStr < minDate) || false,
            });
        }

        // Next month days to complete remaining cells (total rows = 5 or 6, 35 or 42 cells)
        const totalFilled = cells.length;
        const totalNeeded = totalFilled <= 35 ? 35 : 42;
        for (let d = 1; d <= totalNeeded - totalFilled; d++) {
            const nextMonthYear = viewMonth === 11 ? viewYear + 1 : viewYear;
            const nextMonthNum = viewMonth === 11 ? 1 : viewMonth + 2;
            const dateStr = `${nextMonthYear}-${pad(nextMonthNum)}-${pad(d)}`;
            cells.push({
                day: d,
                monthOffset: 1,
                dateStr,
                isToday: dateStr === todayStr,
                isSelected: dateStr === value,
                isDisabled: (maxDate && dateStr > maxDate) || (minDate && dateStr < minDate) || false,
            });
        }

        return cells;
    }, [viewYear, viewMonth, value, maxDate, minDate]);

    // Buddhist year options: from current year + 543 + 5 down to 2470 (for birthdates)
    const currentBEYear = today.getFullYear() + 543;
    const yearOptions = useMemo(() => {
        const years: number[] = [];
        const start = currentBEYear + 5;
        const end = 2470;
        for (let y = start; y >= end; y--) {
            years.push(y);
        }
        return years;
    }, [currentBEYear]);

    const thaiFullText = useMemo(() => formatThaiFull(value), [value]);

    return (
        <div ref={containerRef} className="position-relative thai-date-picker-container">
            <div className="input-group">
                <input
                    type="text"
                    id={id}
                    name={name}
                    className={`${className} ${isInvalid ? 'is-invalid' : ''}`}
                    placeholder={placeholder}
                    value={inputValue}
                    disabled={disabled}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onFocus={() => !disabled && setIsOpen(true)}
                    autoComplete="off"
                />
                {value && !disabled && (
                    <button
                        type="button"
                        className="btn btn-outline-secondary px-2 border-start-0"
                        title="ล้างวันที่"
                        onClick={handleClear}
                    >
                        <IconifyIcon icon="tabler:x" className="fs-15" />
                    </button>
                )}
                <button
                    type="button"
                    className="btn btn-outline-primary"
                    disabled={disabled}
                    title="เปิดปฏิทิน พ.ศ."
                    onClick={() => !disabled && setIsOpen((prev) => !prev)}
                >
                    <IconifyIcon icon="solar:calendar-bold-duotone" className="fs-18 text-primary" />
                </button>
            </div>

            {/* Thai Date Preview badge */}
            {showThaiDatePreview && thaiFullText && (
                <div className="mt-1 d-flex align-items-center">
                    <span className="badge bg-primary-subtle text-primary fw-medium px-2 py-1 fs-11">
                        <IconifyIcon icon="solar:calendar-date-bold-duotone" className="me-1 fs-12 align-middle" />
                        {thaiFullText} (พ.ศ.)
                    </span>
                </div>
            )}

            {/* Calendar Popover */}
            {isOpen && (
                <div
                    className="card shadow-lg border position-absolute bg-white rounded-3 p-2 thai-calendar-popover"
                    style={{
                        zIndex: 1060,
                        top: '100%',
                        left: 0,
                        minWidth: '320px',
                        maxWidth: '360px',
                        marginTop: '4px',
                    }}
                >
                    {/* Header: Month & Year (พ.ศ.) Selectors */}
                    <div className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom">
                        <button
                            type="button"
                            className="btn btn-sm btn-light p-1 rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: '28px', height: '28px' }}
                            onClick={handlePrevMonth}
                            title="เดือนก่อนหน้า"
                        >
                            <IconifyIcon icon="tabler:chevron-left" className="fs-16" />
                        </button>

                        <div className="d-flex gap-1 align-items-center">
                            {/* Month Select */}
                            <select
                                className="form-select form-select-sm py-1 px-2 fw-semibold border-0 bg-light text-primary"
                                style={{ width: 'auto', cursor: 'pointer' }}
                                value={viewMonth}
                                onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                            >
                                {THAI_MONTHS_FULL.map((mName, idx) => (
                                    <option key={idx} value={idx}>
                                        {mName}
                                    </option>
                                ))}
                            </select>

                            {/* Year (พ.ศ.) Select */}
                            <select
                                className="form-select form-select-sm py-1 px-2 fw-semibold border-0 bg-light text-primary"
                                style={{ width: 'auto', cursor: 'pointer' }}
                                value={viewYear + 543}
                                onChange={(e) => setViewYear(parseInt(e.target.value, 10) - 543)}
                            >
                                {yearOptions.map((beYear) => (
                                    <option key={beYear} value={beYear}>
                                        พ.ศ. {beYear}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="button"
                            className="btn btn-sm btn-light p-1 rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: '28px', height: '28px' }}
                            onClick={handleNextMonth}
                            title="เดือนถัดไป"
                        >
                            <IconifyIcon icon="tabler:chevron-right" className="fs-16" />
                        </button>
                    </div>

                    {/* Weekday Labels (อา - ส) */}
                    <div
                        className="d-grid mb-1 text-center"
                        style={{ gridTemplateColumns: 'repeat(7, 1fr)', fontSize: '12px' }}
                    >
                        {THAI_DAYS_SHORT.map((dayName, idx) => (
                            <div
                                key={idx}
                                className={`py-1 fw-bold ${idx === 0 || idx === 6 ? 'text-danger' : 'text-muted'}`}
                            >
                                {dayName}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div
                        className="d-grid text-center gap-1"
                        style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}
                    >
                        {calendarDays.map((cell, idx) => {
                            const isOtherMonth = cell.monthOffset !== 0;

                            let btnClass = 'btn btn-sm p-0 d-flex align-items-center justify-content-center rounded-2';
                            let style: React.CSSProperties = {
                                height: '32px',
                                fontSize: '13px',
                                fontWeight: cell.isSelected ? 600 : 400,
                            };

                            if (cell.isSelected) {
                                btnClass += ' btn-primary text-white shadow-sm';
                            } else if (cell.isToday) {
                                btnClass += ' btn-outline-primary fw-bold';
                            } else if (isOtherMonth) {
                                btnClass += ' text-black-50 btn-light';
                                style.opacity = 0.45;
                            } else {
                                btnClass += ' btn-light text-dark';
                            }

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    className={btnClass}
                                    style={style}
                                    disabled={cell.isDisabled}
                                    onClick={() => {
                                        if (cell.monthOffset === -1) {
                                            handlePrevMonth();
                                        } else if (cell.monthOffset === 1) {
                                            handleNextMonth();
                                        }
                                        handleSelectDay(cell.day);
                                    }}
                                >
                                    {cell.day}
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer Controls */}
                    <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                        <button
                            type="button"
                            className="btn btn-sm btn-link text-decoration-none text-muted p-0 fs-12"
                            onClick={handleClear}
                        >
                            ล้างค่า
                        </button>
                        <div className="d-flex gap-1">
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-primary py-0 px-2 fs-12"
                                onClick={handleSetToday}
                            >
                                วันนี้
                            </button>
                            <button
                                type="button"
                                className="btn btn-sm btn-light py-0 px-2 fs-12"
                                onClick={() => setIsOpen(false)}
                            >
                                ปิด
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThaiDatePicker;
