'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, MessageSquare, Settings, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './AdminLayout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  if (!user || user.role !== 'ADMIN') {
    return <div className="p-8 text-center">Access Denied</div>;
  }

  const navItems = [
    { href: '/admin/users', label: 'کاربران', icon: Users },
    { href: '/admin/chats', label: 'چت ها', icon: MessageSquare },
    { href: '/admin/settings', label: 'تنظیمات', icon: Settings },
  ];

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.header}>
          <LayoutDashboard size={24} />
          <span className={styles.brand}>پنل مدیریت</span>
        </div>
        
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.footer}>
          <button onClick={logout} className={styles.logoutBtn}>
            <LogOut size={20} />
            <span>خروج</span>
          </button>
          <Link href="/" className={styles.backLink}>
            بازگشت به چت
          </Link>
        </div>
      </aside>

      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
