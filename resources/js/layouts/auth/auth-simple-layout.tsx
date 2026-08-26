import { Link } from '@inertiajs/react';
import { Wifi } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/30 p-6 md:p-10 dark:from-neutral-950 dark:via-indigo-950/20 dark:to-purple-950/20">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            {/* ✅ LOGO CON GRADIENTE */}
                            <div className="mb-1 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 shadow-lg shadow-purple-500/25">
                                <Wifi className="h-8 w-8 text-white" />
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        {/* ✅ TÍTULO Y DESCRIPCIÓN MANTENIDOS */}
                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                {title}
                            </h1>
                            <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}