export interface MainLayoutProps {
  children: React.ReactNode;
}

export interface ArticleProps {
  title: string;
  content: string;
}

export interface MenuItem {
  menuId: string;
  title: string;
  path?: string;
  children?: MenuItem[];
}

export interface MenuItemProps {
  item: MenuItem;
  depth: number;
}
