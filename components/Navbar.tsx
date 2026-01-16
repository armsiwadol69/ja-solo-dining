import Link from 'next/link';
import { PlusCircle, Home } from 'lucide-react';
import { ModeToggle } from './ModeToggle';

export default function Navbar() {
    return (
        <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 flex-shrink-0 w-full transition-colors">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center gap-2">
                            <span className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                                <span className="hidden sm:inline">Japan Solo Dining</span>
                                <span className="sm:hidden">JPSoloDining</span>
                            </span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-3">
                        <ModeToggle />
                        <Link
                            href="/"
                            className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1 transition-colors"
                        >
                            <Home size={18} />
                            <span className="hidden sm:inline">Home</span>
                        </Link>
                        <Link
                            href="/add"
                            className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 shadow-sm transition-colors"
                        >
                            <PlusCircle size={18} />
                            <span>Add Restaurant</span>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
