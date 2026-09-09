import { MenuItemType } from '@/types/menu';

export const MENU_ITEMS: MenuItemType[] = [
    {
        key: 'dash',
        label: 'Dash',
        isTitle: true,
    },
    {
        key: 'clinic',
        label: 'หน้าหลัก',
        icon: 'tabler:building-hospital',
        url: '/',
    },
    {
        key: 'documents',
        label: 'เอกสาร',
        icon: 'tabler:file-text',
        url: '/documents',
    },
    {
        key: 'student_profile',
        label: 'ทะเบียนประวัติ',
        icon: 'tabler:school',
        url: '/student-profile',
    },
    {
        key: 'personal_documents',
        label: 'เอกสารประจำตัว',
        icon: 'tabler:id-badge-2',
        url: '/personal-documents',
    },

    {
        key: 'management',
        label: 'การจัดการ',
        isTitle: true,
        roles: ['admin'],
    },
    {
        key: 'students',
        label: 'รายชื่อนักศึกษา',
        icon: 'tabler:school',
        url: '/admin/students',
        roles: ['admin'],
    },
    {
        key: 'users',
        label: 'จัดการผู้ใช้งาน',
        icon: 'tabler:users',
        url: '/users',
        roles: ['admin'],
    },

];

export const HORIZONTAL_MENU_ITEM: MenuItemType[] = [
    {
        key: 'dashboards',
        label: 'Dashboards',
        icon: 'tabler:dashboard',
        children: [
            {
                key: 'clinic',
                label: 'หน้าหลัก',
                icon: 'tabler:building-hospital',
                url: '/',
            },
            {
                key: 'documents',
                label: 'เอกสาร',
                icon: 'tabler:file-text',
                url: '/documents',
            },
            {
                key: 'personal_documents',
                label: 'เอกสารประจำตัว',
                icon: 'tabler:id-badge-2',
                url: '/personal-documents',
            },
            {
                key: 'student_profile',
                label: 'ทะเบียนประวัติ',
                icon: 'tabler:school',
                url: '/student-profile',
            },
        ],
    },
];
