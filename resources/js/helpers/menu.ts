import { HORIZONTAL_MENU_ITEM, MENU_ITEMS } from '@/data/menu-items';
import { MenuItemType } from '@/types/menu';

export const getMenuItems = (): MenuItemType[] => {
    return MENU_ITEMS;
};
export const getHorizontalMenuItems = (): MenuItemType[] => {
    return HORIZONTAL_MENU_ITEM;
};

export const findAllParent = (menuItems: MenuItemType[], menuItem: MenuItemType): string[] => {
    let parents: string[] = [];
    const parent = findMenuItem(menuItems, menuItem.parentKey);
    if (parent) {
        parents.push(parent.key);
        if (parent.parentKey) {
            parents = [...parents, ...findAllParent(menuItems, parent)];
        }
    }
    return parents;
};

export const getMenuItemFromURL = (items: MenuItemType | MenuItemType[], url: string): MenuItemType | undefined => {
    const cleanUrl = url.split(/[?#]/)[0];
    const itemsArray = items instanceof Array ? items : [items];

    // 0. Pass: look for exact matches including query params
    for (const item of itemsArray) {
        if (item.url === url) return item;
        if (item.children) {
            const found = getMenuItemFromURL(item.children, url);
            if (found && found.url === url) return found;
        }
    }

    // 1. First pass: look for exact matches with cleanUrl
    for (const item of itemsArray) {
        if (item.url === cleanUrl) return item;
        if (item.children) {
            const found = getMenuItemFromURL(item.children, cleanUrl);
            if (found && found.url === cleanUrl) return found;
        }
    }

    // 2. Second pass: look for prefix matches (e.g. /kpis/123 matching /kpis)
    for (const item of itemsArray) {
        if (item.url && item.url !== '/' && cleanUrl.startsWith(item.url + '/')) return item;
        if (item.children) {
            const found = getMenuItemFromURL(item.children, cleanUrl);
            if (found) return found;
        }
    }
};

export const findMenuItem = (menuItems: MenuItemType[] | undefined, menuItemKey: MenuItemType['key'] | undefined): MenuItemType | null => {
    if (menuItems && menuItemKey) {
        for (const item of menuItems) {
            if (item.key === menuItemKey) {
                return item;
            }
            const found = findMenuItem(item.children, menuItemKey);
            if (found) return found;
        }
    }
    return null;
};
