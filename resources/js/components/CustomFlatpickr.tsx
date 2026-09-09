import Flatpickr from 'react-flatpickr';

type FlatpickrProps = {
    className?: string;
    value?: any;
    options?: any;
    placeholder?: string;
    onChange?: (selectedDates: any, dateStr: string, instance: any) => void;
};

const CustomFlatpickr = ({ className, value, options, placeholder, onChange }: FlatpickrProps) => {
    return (
        <>
            <Flatpickr className={className} data-enable-time value={value} options={options} placeholder={placeholder} onChange={onChange} />
        </>
    );
};

export default CustomFlatpickr;
