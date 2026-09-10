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
        key: 'my_credits',
        label: 'ความก้าวหน้าหน่วยกิต',
        icon: 'tabler:certificate',
        url: '/credits/student',
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
        key: 'credits_overview',
        label: 'ภาพรวมหน่วยกิต ป.โท',
        icon: 'tabler:chart-bar',
        url: '/credits',
        roles: ['admin'],
    },
    {
        key: 'grade_entry',
        label: 'กรอกผลการเรียน/เกรด',
        icon: 'tabler:edit',
        url: '/credits/entry',
        roles: ['admin'],
    },
    {
        key: 'curriculum',
        label: 'สาขาวิชา / หลักสูตร',
        icon: 'tabler:books',
        url: '/credits/curriculum',
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
