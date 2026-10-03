// Tutorials/Index.tsx - Versión mejorada
import { Head, Link } from '@inertiajs/react';
import {
    Play,
    Youtube,
    Video,
    BookOpen,
    ChevronRight,
    Clock,
    Eye,
    ThumbsUp,
    Share2,
    CheckCircle,
    AlertCircle,
    Search,
    X,
    Filter,
    Calendar,
    User,
    Star,
    FileText,
    TrendingUp,
    FileSignature,
    Shield,
    ExternalLink,
    Info,
} from 'lucide-react';
import { useState } from 'react';
import { dashboard } from '@/routes';

interface Video {
    id: number;
    title: string;
    description: string;
    url: string;
    thumbnail?: string;
    duration: string;
    category: string;
    views: number;
    likes: number;
    date: string;
    featured?: boolean;
}

export default function TutorialsIndex() {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

    // ✅ Datos de ejemplo - URLs de Google Drive
    const videos: Video[] = [
        {
            id: 1,
            title: 'Cómo crear un reporte mensual',
            description:
                'Aprende paso a paso cómo crear y enviar un reporte mensual de conformidad del servicio de internet.',
            url: 'https://drive.google.com/file/d/1_qu6gp2L9xbofPHIrcpp87EiXZMZjbfb/view?usp=sharing',
            duration: '1:39',
            category: 'reportes',
            views: 150,
            likes: 45,
            date: '2024-01-15',
            featured: true,
        },
        // Puedes agregar más videos aquí
    ];

    // ✅ Categorías disponibles
    const categories = [
        { id: 'all', label: 'Todos los tutoriales', icon: BookOpen },
        { id: 'reportes', label: 'Reportes', icon: FileText },
        // { id: 'firma', label: 'Firma Digital', icon: FileSignature },
        // { id: 'admin', label: 'Administración', icon: Shield },
        // { id: 'soporte', label: 'Soporte', icon: AlertCircle },
    ];

    // ✅ FUNCIÓN PARA CONVERTIR URL DE DRIVE A EMBED
    const getDriveEmbedUrl = (url: string): string => {
        // Si es URL de YouTube, mantener igual
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            return url;
        }

        // Extraer el ID del video de Google Drive
        // Patrones: /d/{ID}/view o /file/d/{ID}/view
        const patterns = [
            /\/d\/([^/]+)\//,
            /\/file\/d\/([^/]+)\//,
            /id=([^&]+)/,
            /\/uc\?id=([^&]+)/,
        ];

        let fileId = null;

        for (const pattern of patterns) {
            const match = url.match(pattern);

            if (match) {
                fileId = match[1];
                break;
            }
        }

        // Si no se encontró ID, devolver la URL original
        if (!fileId) {
            return url;
        }

        // Devolver URL de embed de Google Drive
        return `https://drive.google.com/file/d/${fileId}/preview`;
    };

    // ✅ Filtrar videos
    const filteredVideos = videos.filter((video) => {
        const matchesSearch =
            video.title.toLowerCase().includes(search.toLowerCase()) ||
            video.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory =
            selectedCategory === 'all' || video.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    // ✅ Videos destacados
    const featuredVideos = videos.filter((v) => v.featured);

    // ✅ Formatear fecha
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);

        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    // ✅ Abrir video en modal
    const openVideo = (video: Video) => {
        setSelectedVideo(video);
        document.body.style.overflow = 'hidden';
    };

    // ✅ Cerrar modal
    const closeVideo = () => {
        setSelectedVideo(null);
        document.body.style.overflow = 'auto';
    };

    // ✅ Obtener icono de categoría
    const getCategoryIcon = (categoryId: string) => {
        const cat = categories.find((c) => c.id === categoryId);

        return cat?.icon || BookOpen;
    };

    // ✅ Obtener color de categoría
    const getCategoryColor = (categoryId: string) => {
        const colors: Record<string, string> = {
            reportes:
                'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
            firma: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
            admin: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
            soporte:
                'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
        };

        return (
            colors[categoryId] ||
            'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-neutral-400 border-gray-200 dark:border-white/10'
        );
    };

    // ✅ Obtener nombre de categoría
    const getCategoryLabel = (categoryId: string) => {
        const cat = categories.find((c) => c.id === categoryId);

        return cat?.label || categoryId;
    };

    return (
        <>
            <Head title="Tutoriales" />

            <div className="p-4 md:p-6" style={{ fontSize: '11px' }}>
                <div className="mx-auto max-w-7xl space-y-4 md:space-y-6">
                    {/* ===== HEADER ===== */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6 dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl border border-red-200 bg-red-100 p-2 dark:border-red-500/20 dark:bg-red-500/20">
                                    <Youtube className="h-5 w-5 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <h1 className="flex items-center gap-2 text-[11px] font-bold text-gray-900 dark:text-white">
                                        Tutoriales
                                        <span className="rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-[10px] text-red-700 dark:border-red-500/20 dark:bg-red-500/20 dark:text-red-400">
                                            {videos.length} videos
                                        </span>
                                    </h1>
                                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                        Aprende a usar el sistema con nuestros
                                        tutoriales en video
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-[10px] text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                                    <Info className="h-3.5 w-3.5" />
                                    Videos de Google Drive
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== DESTACADOS ===== */}
                    {featuredVideos.length > 0 && (
                        <div className="rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 p-4 md:p-6 dark:border-red-800/30 dark:from-red-950/20 dark:to-orange-950/20">
                            <div className="mb-4 flex items-center gap-2">
                                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                                <h2 className="text-[11px] font-semibold text-gray-700 dark:text-neutral-300">
                                    Tutoriales destacados
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                {featuredVideos.map((video) => (
                                    <div
                                        key={video.id}
                                        onClick={() => openVideo(video)}
                                        className="group cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:scale-[1.02] hover:shadow-lg dark:border-white/10 dark:bg-slate-800/50 dark:hover:shadow-2xl"
                                    >
                                        <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600/90 shadow-lg transition-transform group-hover:scale-110">
                                                    <Play className="ml-1 h-7 w-7 text-white" />
                                                </div>
                                            </div>
                                            <div className="absolute right-2 bottom-2 rounded-lg bg-black/70 px-2 py-1 text-[10px] font-medium text-white">
                                                {video.duration}
                                            </div>
                                            <div className="absolute top-2 left-2 rounded-lg bg-amber-500/90 px-2 py-0.5 text-[10px] font-medium text-white">
                                                ⭐ Destacado
                                            </div>
                                            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-lg bg-blue-600/90 px-2 py-0.5 text-[9px] text-white">
                                                <ExternalLink className="h-3 w-3" />
                                                Drive
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <h3 className="line-clamp-1 text-[11px] font-medium text-gray-900 dark:text-white">
                                                {video.title}
                                            </h3>
                                            <p className="mt-1 line-clamp-2 text-[10px] text-gray-500 dark:text-neutral-400">
                                                {video.description}
                                            </p>
                                            <div className="mt-2 flex items-center justify-between text-[10px] text-gray-400 dark:text-neutral-500">
                                                <span className="flex items-center gap-1">
                                                    <Eye className="h-3 w-3" />
                                                    {video.views}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <ThumbsUp className="h-3 w-3" />
                                                    {video.likes}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ===== FILTROS ===== */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-800/50 dark:shadow-2xl">
                        <div className="flex flex-col items-start gap-3 md:flex-row md:items-center">
                            <div className="relative w-full flex-1 md:w-auto">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-neutral-500" />
                                <input
                                    type="text"
                                    placeholder="Buscar tutoriales..."
                                    className="w-full rounded-xl border-2 border-gray-200 bg-white py-2 pr-3 pl-9 text-[11px] text-gray-900 transition-all outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:placeholder:text-neutral-500"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {categories.map((category) => {
                                    const Icon = category.icon;
                                    const isActive =
                                        selectedCategory === category.id;

                                    return (
                                        <button
                                            key={category.id}
                                            onClick={() =>
                                                setSelectedCategory(category.id)
                                            }
                                            className={`flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-[11px] font-medium transition-all ${
                                                isActive
                                                    ? 'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400'
                                                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:bg-slate-800/50 dark:text-neutral-400 dark:hover:bg-white/5'
                                            }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {category.label}
                                        </button>
                                    );
                                })}
                                {search && (
                                    <button
                                        onClick={() => setSearch('')}
                                        className="rounded-lg p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
                                    >
                                        <X className="h-4 w-4 text-gray-400" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ===== GRID DE VIDEOS ===== */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredVideos.length > 0 ? (
                            filteredVideos.map((video) => {
                                const Icon = getCategoryIcon(video.category);
                                const categoryColor = getCategoryColor(
                                    video.category,
                                );
                                const categoryLabel = getCategoryLabel(
                                    video.category,
                                );

                                return (
                                    <div
                                        key={video.id}
                                        onClick={() => openVideo(video)}
                                        className="group cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-slate-800/50 dark:hover:shadow-2xl"
                                    >
                                        <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600/90 shadow-lg transition-transform group-hover:scale-110">
                                                    <Play className="ml-1 h-7 w-7 text-white" />
                                                </div>
                                            </div>
                                            <div className="absolute right-2 bottom-2 rounded-lg bg-black/70 px-2 py-1 text-[10px] font-medium text-white">
                                                {video.duration}
                                            </div>
                                            <div className="absolute top-2 left-2">
                                                <span
                                                    className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${categoryColor}`}
                                                >
                                                    <Icon className="mr-1 inline h-3 w-3" />
                                                    {categoryLabel}
                                                </span>
                                            </div>
                                            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-lg bg-blue-600/90 px-2 py-0.5 text-[9px] text-white">
                                                <ExternalLink className="h-3 w-3" />
                                                Drive
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <h3 className="line-clamp-1 text-[11px] font-medium text-gray-900 dark:text-white">
                                                {video.title}
                                            </h3>
                                            <p className="mt-1 line-clamp-2 text-[10px] text-gray-500 dark:text-neutral-400">
                                                {video.description}
                                            </p>
                                            <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2 dark:border-white/5">
                                                <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-neutral-500">
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="h-3 w-3" />
                                                        {video.views}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <ThumbsUp className="h-3 w-3" />
                                                        {video.likes}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-gray-400 dark:text-neutral-500">
                                                    {formatDate(video.date)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full py-16 text-center">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="rounded-full border border-gray-200 bg-gray-100 p-6 dark:border-white/10 dark:bg-white/5">
                                        <Video className="h-16 w-16 text-gray-400 dark:text-neutral-600" />
                                    </div>
                                    <p className="text-[11px] font-medium text-gray-900 dark:text-white">
                                        No se encontraron tutoriales
                                    </p>
                                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                        Intenta con otros filtros de búsqueda
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ===== FOOTER ===== */}
                    <div className="border-t border-gray-200 pt-4 text-center text-[11px] text-gray-400 dark:border-white/10 dark:text-neutral-500">
                        {filteredVideos.length} tutorial
                        {filteredVideos.length !== 1 ? 'es' : ''} disponibles
                    </div>
                </div>
            </div>

            {/* ===== MODAL DE VIDEO ===== */}
            {selectedVideo && (
                <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/80 p-4 backdrop-blur-sm duration-300 fade-in">
                    <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-800">
                        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-white/10">
                            <div className="flex items-center gap-3">
                                <h3 className="flex items-center gap-2 text-[11px] font-bold text-gray-900 dark:text-white">
                                    <Youtube className="h-5 w-5 text-red-600" />
                                    {selectedVideo.title}
                                </h3>
                                <span
                                    className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${getCategoryColor(selectedVideo.category)}`}
                                >
                                    {getCategoryLabel(selectedVideo.category)}
                                </span>
                            </div>
                            <button
                                onClick={closeVideo}
                                className="rounded-xl p-2 transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
                            >
                                <X className="h-5 w-5 text-gray-500 dark:text-neutral-400" />
                            </button>
                        </div>
                        <div className="p-4">
                            <div className="aspect-video overflow-hidden rounded-xl bg-black">
                                <iframe
                                    src={getDriveEmbedUrl(selectedVideo.url)}
                                    className="h-full w-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    title={selectedVideo.title}
                                    loading="lazy"
                                />
                            </div>
                            <div className="mt-4 space-y-2">
                                <p className="text-[11px] text-gray-600 dark:text-neutral-300">
                                    {selectedVideo.description}
                                </p>
                                <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-500 dark:text-neutral-400">
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="h-4 w-4" />
                                        Duración: {selectedVideo.duration}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Eye className="h-4 w-4" />
                                        {selectedVideo.views} vistas
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <ThumbsUp className="h-4 w-4" />
                                        {selectedVideo.likes} likes
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4" />
                                        {formatDate(selectedVideo.date)}
                                    </span>
                                    <a
                                        href={selectedVideo.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-blue-600 hover:underline dark:text-blue-400"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        Abrir en Drive
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

TutorialsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Tutoriales', href: '#' },
    ],
};
