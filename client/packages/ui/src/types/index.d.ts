declare global {
  interface NavLink {
    id: number;
    title: string;
    href: string;
    type: 'link' | 'dropdown';
    subLinks?: Array<{
      id: number;
      title: string;
      href: string;
      description: string;
    }> | null;
  }
}
export {};
