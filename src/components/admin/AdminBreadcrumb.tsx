import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminBreadcrumbProps {
  items: BreadcrumbItem[];
}

export function AdminBreadcrumb({ items }: AdminBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm mb-6">
      <Link
        href="/admin"
        className="flex items-center gap-1 text-slate-600 dark:text-gray-400 hover:text-blue-700 transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Admin</span>
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-slate-400" />
          {item.href && index < items.length - 1 ? (
            <Link
              href={item.href}
              className="text-slate-600 dark:text-gray-400 hover:text-blue-700 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 dark:text-white font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
