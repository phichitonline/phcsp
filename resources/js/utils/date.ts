type AddOrSubtractFromDate = (days: number, add?: boolean, startingDate?: Date) => Date;

export const addOrSubtractDaysFromDate: AddOrSubtractFromDate = (days, add, startingDate = new Date()) => {
    if (add) return new Date(new Date().setDate(startingDate.getDate() + days));
    else return new Date(new Date().setDate(startingDate.getDate() - days));
};

export const addOrSubtractMinutesFromDate: AddOrSubtractFromDate = (minutes, add, startingDate = new Date()) => {
    if (add) return new Date(new Date().setMinutes(startingDate.getMinutes() + minutes));
    else return new Date(new Date().setMinutes(startingDate.getMinutes() - minutes));
};

export const timeSince = (date: Date) => {
    if (typeof date !== 'object') {
        date = new Date(date);
    }

    const seconds = Math.floor((new Date().valueOf() - date.valueOf()) / 1000);
    let interval: number = 0;
    let intervalType: string = '';

    const intervals = {
        year: 31536000,
        month: 2592000,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1,
    };

    for (const [key, value] of Object.entries(intervals)) {
        interval = Math.floor(seconds / value);
        if (interval >= 1) {
            intervalType = key;
            break;
        }
    }

    if (interval > 1 || interval === 0) {
        intervalType += 's';
    }

    return `${interval} ${intervalType} ago`;
};

export const formatThaiDate = (dateStr?: string | null | Date): string => {
    if (!dateStr) return '-';
    if (typeof dateStr === 'string') {
        const cleanDate = dateStr.split('T')[0].split(' ')[0];
        const parts = cleanDate.split('-');
        if (parts.length === 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            const day = parseInt(parts[2], 10);
            if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                const thaiMonths = [
                    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
                    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
                ];
                const thaiYear = year > 2400 ? year : year + 543;
                const monthName = thaiMonths[month - 1] || '';
                return `${day} ${monthName} ${thaiYear}`;
            }
        }
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

export const formatThaiDateTime = (dateStr?: string | null | Date): string => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    const dateFormatted = formatThaiDate(dateStr);
    const timeFormatted = d.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
    });
    return `${dateFormatted} ${timeFormatted} น.`;
};

