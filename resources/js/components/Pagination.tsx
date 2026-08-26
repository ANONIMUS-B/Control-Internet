// resources/js/components/Pagination.tsx

import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
    className?: string;
}

export function Pagination({ links, className = '' }: PaginationProps) {
    // Si no hay links o solo hay 1 página, no mostramos nada
    if (!links || links.length <= 3) {
        return null;
    }

    // Filtrar solo los números de página (sin "Anterior" y "Siguiente")
    const pageLinks = links.filter((link, index) => {
        return index > 0 && index < links.length - 1;
    });

    // Obtener el total de páginas
    const totalPages = pageLinks.length;

    // Obtener página actual
    const currentPage = pageLinks.findIndex(link => link.active) + 1;

    return (
        <nav className={`flex items-center justify-between border-t border-neutral-200 px-4 py-3 sm:px-6 ${className}`}>
            {/* Versión móvil */}
            <div className="flex flex-1 justify-between sm:hidden">
                <Link
                    href={links[0]?.url || '#'}
                    className={`relative inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium ${
                        !links[0]?.url ? 'text-neutral-300 cursor-not-allowed' : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                    preserveScroll
                >
                    Anterior
                </Link>
                <Link
                    href={links[links.length - 1]?.url || '#'}
                    className={`relative inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium ${
                        !links[links.length - 1]?.url ? 'text-neutral-300 cursor-not-allowed' : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                    preserveScroll
                >
                    Siguiente
                </Link>
            </div>

            {/* Versión desktop */}
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">
                        Mostrando página <span className="font-medium">{currentPage}</span> de{' '}
                        <span className="font-medium">{totalPages}</span>
                    </p>
                </div>

                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        {/* Botón Anterior */}
                        <Link
                            href={links[0]?.url || '#'}
                            className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-neutral-400 ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 focus:z-20 focus:outline-offset-0 ${
                                !links[0]?.url ? 'cursor-not-allowed opacity-50' : ''
                            }`}
                            preserveScroll
                        >
                            <span className="sr-only">Anterior</span>
                            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </Link>

                        {/* Números de página */}
                        {links.map((link, index) => {
                            // Saltar "Anterior" y "Siguiente" (primero y último)
                            if (index === 0 || index === links.length - 1) {
                                return null;
                            }

                            // Si es "..." (puntos suspensivos)
                            if (link.label.includes('...')) {
                                return (
                                    <span
                                        key={index}
                                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-neutral-700 ring-1 ring-inset ring-neutral-300 focus:outline-offset-0"
                                    >
                                        {link.label}
                                    </span>
                                );
                            }

                            return (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${
                                        link.active
                                            ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                            : 'text-neutral-900 ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 focus:outline-offset-0 dark:text-white dark:ring-neutral-700 dark:hover:bg-neutral-800'
                                    }`}
                                    preserveScroll
                                >
                                    {link.label}
                                </Link>
                            );
                        })}

                        {/* Botón Siguiente */}
                        <Link
                            href={links[links.length - 1]?.url || '#'}
                            className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-neutral-400 ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 focus:z-20 focus:outline-offset-0 ${
                                !links[links.length - 1]?.url ? 'cursor-not-allowed opacity-50' : ''
                            }`}
                            preserveScroll
                        >
                            <span className="sr-only">Siguiente</span>
                            <ChevronRight className="h-5 w-5" aria-hidden="true" />
                        </Link>
                    </nav>
                </div>
            </div>
        </nav>
    );
}