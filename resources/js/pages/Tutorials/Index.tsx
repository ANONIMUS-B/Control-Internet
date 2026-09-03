// Tutorials/Index.tsx - Versión mejorada
import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
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
    Info
} from 'lucide-react';

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
            description: 'Aprende paso a paso cómo crear y enviar un reporte mensual de conformidad del servicio de internet.',
            url: 'https://drive.google.com/file/d/103S8Iku00yQ4xmu8Mhxh5YF9yDm8uwUA/view?usp=sharing',
            duration: '1:39',
            category: 'reportes',
            views: 150,
            likes: 45,
            date: '2024-01-15',
            featured: true
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
            /\/d\/([^\/]+)\//,
            /\/file\/d\/([^\/]+)\//,
            /id=([^&]+)/,
            /\/uc\?id=([^&]+)/
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
    const filteredVideos = videos.filter(video => {
        const matchesSearch = video.title.toLowerCase().includes(search.toLowerCase()) ||
                             video.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // ✅ Videos destacados
    const featuredVideos = videos.filter(v => v.featured);

    // ✅ Formatear fecha
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
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
        const cat = categories.find(c => c.id === categoryId);
        return cat?.icon || BookOpen;
    };

    // ✅ Obtener color de categoría
    const getCategoryColor = (categoryId: string) => {
        const colors: Record<string, string> = {
            reportes: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
            firma: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
            admin: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
            soporte: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
        };
        return colors[categoryId] || 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-neutral-400 border-gray-200 dark:border-white/10';
    };

    // ✅ Obtener nombre de categoría
    const getCategoryLabel = (categoryId: string) => {
        const cat = categories.find(c => c.id === categoryId);
        return cat?.label || categoryId;
    };

    return (
        <>
            <Head title="Tutoriales" />

            <div className="p-4 md:p-6" style={{ fontSize: '11px' }}>
                <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
                    
                    {/* ===== HEADER ===== */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 shadow-sm dark:shadow-2xl">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-xl border border-red-200 dark:border-red-500/20">
                                    <Youtube className="w-5 h-5 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <h1 className="text-[11px] font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        Tutoriales
                                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded-full text-[10px] border border-red-200 dark:border-red-500/20">
                                            {videos.length} videos
                                        </span>
                                    </h1>
                                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                                        Aprende a usar el sistema con nuestros tutoriales en video
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/20 text-[10px] text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                                    <Info className="w-3.5 h-3.5" />
                                    Videos de Google Drive
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== DESTACADOS ===== */}
                    {featuredVideos.length > 0 && (
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-2xl p-4 md:p-6 border border-red-200 dark:border-red-800/30">
                            <div className="flex items-center gap-2 mb-4">
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                <h2 className="text-[11px] font-semibold text-gray-700 dark:text-neutral-300">Tutoriales destacados</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {featuredVideos.map((video) => (
                                    <div 
                                        key={video.id}
                                        onClick={() => openVideo(video)}
                                        className="group bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden cursor-pointer hover:shadow-lg dark:hover:shadow-2xl transition-all hover:scale-[1.02]"
                                    >
                                        <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                                    <Play className="w-7 h-7 text-white ml-1" />
                                                </div>
                                            </div>
                                            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded-lg text-white text-[10px] font-medium">
                                                {video.duration}
                                            </div>
                                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500/90 rounded-lg text-white text-[10px] font-medium">
                                                ⭐ Destacado
                                            </div>
                                            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-blue-600/90 rounded-lg text-white text-[9px] flex items-center gap-1">
                                                <ExternalLink className="w-3 h-3" />
                                                Drive
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <h3 className="text-[11px] font-medium text-gray-900 dark:text-white line-clamp-1">
                                                {video.title}
                                            </h3>
                                            <p className="text-[10px] text-gray-500 dark:text-neutral-400 mt-1 line-clamp-2">
                                                {video.description}
                                            </p>
                                            <div className="flex items-center justify-between mt-2 text-[10px] text-gray-400 dark:text-neutral-500">
                                                <span className="flex items-center gap-1">
                                                    <Eye className="w-3 h-3" />
                                                    {video.views}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <ThumbsUp className="w-3 h-3" />
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
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-4 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-2xl">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                            <div className="relative flex-1 w-full md:w-auto">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Buscar tutoriales..."
                                    className="w-full rounded-xl border-2 border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all py-2 pl-9 pr-3 text-[11px] bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-neutral-500"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {categories.map((category) => {
                                    const Icon = category.icon;
                                    const isActive = selectedCategory === category.id;
                                    return (
                                        <button
                                            key={category.id}
                                            onClick={() => setSelectedCategory(category.id)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all border-2 ${
                                                isActive
                                                    ? 'bg-blue-100 dark:bg-blue-500/20 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400'
                                                    : 'bg-white dark:bg-slate-800/50 border-gray-200 dark:border-white/10 text-gray-600 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-white/5'
                                            }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {category.label}
                                        </button>
                                    );
                                })}
                                {search && (
                                    <button
                                        onClick={() => setSearch('')}
                                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4 text-gray-400" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ===== GRID DE VIDEOS ===== */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredVideos.length > 0 ? (
                            filteredVideos.map((video) => {
                                const Icon = getCategoryIcon(video.category);
                                const categoryColor = getCategoryColor(video.category);
                                const categoryLabel = getCategoryLabel(video.category);
                                
                                return (
                                    <div 
                                        key={video.id}
                                        onClick={() => openVideo(video)}
                                        className="group bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden cursor-pointer hover:shadow-lg dark:hover:shadow-2xl transition-all hover:-translate-y-0.5"
                                    >
                                        <div className="relative aspect-video bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 flex items-center justify-center">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                                    <Play className="w-7 h-7 text-white ml-1" />
                                                </div>
                                            </div>
                                            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded-lg text-white text-[10px] font-medium">
                                                {video.duration}
                                            </div>
                                            <div className="absolute top-2 left-2">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${categoryColor}`}>
                                                    <Icon className="w-3 h-3 inline mr-1" />
                                                    {categoryLabel}
                                                </span>
                                            </div>
                                            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-blue-600/90 rounded-lg text-white text-[9px] flex items-center gap-1">
                                                <ExternalLink className="w-3 h-3" />
                                                Drive
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <h3 className="text-[11px] font-medium text-gray-900 dark:text-white line-clamp-1">
                                                {video.title}
                                            </h3>
                                            <p className="text-[10px] text-gray-500 dark:text-neutral-400 mt-1 line-clamp-2">
                                                {video.description}
                                            </p>
                                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-white/5">
                                                <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-neutral-500">
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="w-3 h-3" />
                                                        {video.views}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <ThumbsUp className="w-3 h-3" />
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
                                    <div className="p-6 bg-gray-100 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/10">
                                        <Video className="w-16 h-16 text-gray-400 dark:text-neutral-600" />
                                    </div>
                                    <p className="text-[11px] font-medium text-gray-900 dark:text-white">No se encontraron tutoriales</p>
                                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">Intenta con otros filtros de búsqueda</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ===== FOOTER ===== */}
                    <div className="text-center text-[11px] text-gray-400 dark:text-neutral-500 border-t border-gray-200 dark:border-white/10 pt-4">
                        {filteredVideos.length} tutorial{filteredVideos.length !== 1 ? 'es' : ''} disponibles
                    </div>
                </div>
            </div>

            {/* ===== MODAL DE VIDEO ===== */}
            {selectedVideo && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-white/10 shadow-2xl">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10">
                            <div className="flex items-center gap-3">
                                <h3 className="text-[11px] font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Youtube className="w-5 h-5 text-red-600" />
                                    {selectedVideo.title}
                                </h3>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getCategoryColor(selectedVideo.category)}`}>
                                    {getCategoryLabel(selectedVideo.category)}
                                </span>
                            </div>
                            <button
                                onClick={closeVideo}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500 dark:text-neutral-400" />
                            </button>
                        </div>
                        <div className="p-4">
                            <div className="aspect-video rounded-xl overflow-hidden bg-black">
                                <iframe
                                    src={getDriveEmbedUrl(selectedVideo.url)}
                                    className="w-full h-full"
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
                                        <Clock className="w-4 h-4" />
                                        Duración: {selectedVideo.duration}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Eye className="w-4 h-4" />
                                        {selectedVideo.views} vistas
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <ThumbsUp className="w-4 h-4" />
                                        {selectedVideo.likes} likes
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        {formatDate(selectedVideo.date)}
                                    </span>
                                    <a 
                                        href={selectedVideo.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        <ExternalLink className="w-4 h-4" />
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
        { title: 'Tutoriales', href: '#' }
    ],
};