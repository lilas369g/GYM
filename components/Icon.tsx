type IconName =
  | "dumbbell" | "whatsapp" | "menu" | "close" | "chevron" | "check"
  | "calendar" | "clock" | "users" | "phone" | "location" | "facebook"
  | "external" | "save" | "upload" | "logout" | "eye" | "image" | "edit";

const paths: Record<IconName, React.ReactNode> = {
  dumbbell: <><path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12" /></>,
  whatsapp: <><path d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.4-4.1A8 8 0 1 1 20 11.6Z" /><path d="M9 8.5c.2 3 2.1 4.8 5 5.2l1.1-1.1c.3-.3.6-.2.9-.1l1.4.7" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  chevron: <path d="m7 10 5 5 5-5" />,
  check: <path d="m5 12 4 4L19 6" />,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-4 2.5-6 6-6s6 2 6 6M16 5c2.5.2 3.5 3.3 1.5 4.8M17 14c2.6.4 4 2.3 4 5" /></>,
  phone: <path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-4-1-1.2 2c-4.2-1.8-7.8-5.4-9.6-9.6L8 7 7 3Z" />,
  location: <><path d="M12 22s7-6.1 7-13a7 7 0 1 0-14 0c0 6.9 7 13 7 13Z" /><circle cx="12" cy="9" r="2.5" /></>,
  facebook: <path d="M14 21v-8h3l.5-4H14V7c0-1.1.4-2 2-2h2V1.5c-.7-.1-1.8-.2-3-.2-3 0-5 1.8-5 5.2V9H7v4h3v8" />,
  external: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" /></>,
  save: <><path d="M5 3h12l2 2v16H5Z" /><path d="M8 3v6h8V3M8 21v-7h8v7" /></>,
  upload: <><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 15v5h16v-5" /></>,
  logout: <><path d="M10 4H4v16h6M14 8l4 4-4 4M8 12h10" /></>,
  eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m3 17 5-5 4 4 3-3 6 6" /></>,
  edit: <><path d="m4 16-1 5 5-1L20 8l-4-4Z" /><path d="m14 6 4 4" /></>,
};

export function Icon({ name, size = 20, className }: { name: IconName; size?: number; className?: string }) {
  return <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
