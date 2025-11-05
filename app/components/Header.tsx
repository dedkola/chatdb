'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Upload to MongoDB' },
    { href: '/chat', label: 'Ollama Chat' },
    { href: '/lmstudio', label: 'LM Studio Chat' },
    { href: '/search', label: 'Search' },
    { href: '/conversations', label: 'All Messages' },
  ];

  return (
    <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative w-8 h-8">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                  <path d="M20 7V17C20 18.1046 19.1046 19 18 19H6C4.89543 19 4 18.1046 4 17V7C4 5.89543 4.89543 5 6 5H18C19.1046 5 20 5.89543 20 7Z" className="fill-zinc-900 dark:fill-white" />
                  <path d="M8 9H16M8 12H14M8 15H12" className="stroke-white dark:stroke-zinc-900" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="18" cy="18" r="5" className="fill-blue-500" />
                  <path d="M16 18H20M18 16V20" className="stroke-white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-xl font-bold text-zinc-900 dark:text-white">
                ChatDB
              </span>
            </Link>
          </div>

          <div className="flex space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-zinc-900 dark:bg-zinc-700 text-white'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
}
