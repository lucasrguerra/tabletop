"use client";

import { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
    FaGraduationCap, FaCheckCircle, FaEye, FaFolderOpen, FaSpinner,
    FaExclamationTriangle, FaSearch, FaTimes, FaSortAmountDown,
    FaLayerGroup, FaFilter, FaTrashAlt
} from 'react-icons/fa';
import StudyCard from '@/components/Studies/StudyCard';
import StudyCategoryPanel from '@/components/Studies/StudyCategoryPanel';
import StudyTypeFilter from '@/components/Studies/StudyTypeFilter';
import StudyProgressBar from '@/components/Studies/StudyProgressBar';
import StudyPagination from '@/components/Studies/StudyPagination';

const CATEGORY_CONFIG = {
    GOV_LEGAL: { label: 'Governança e Legal',   color: 'bg-purple-500' },
    NET_ROUT:  { label: 'Roteamento',            color: 'bg-blue-500' },
    NET_VOL:   { label: 'Ataques Volumétricos',  color: 'bg-red-500' },
    PHY_L2:    { label: 'Física e Camada 2',     color: 'bg-green-500' },
    SCI_DATA:  { label: 'Dados Científicos',     color: 'bg-indigo-500' },
    SEC_SYS:   { label: 'Segurança de Sistemas', color: 'bg-rose-500' },
};

const SORT_LABELS = {
    relevance:  'Ordem sugerida',
    title:      'Título (A–Z)',
    difficulty: 'Do básico ao avançado',
    readTime:   'Leitura mais curta',
    recent:     'Atualizados recentemente',
};

const DIFFICULTIES = ['Basico', 'Intermediario', 'Avancado'];
const DIFFICULTY_LABELS = { Basico: 'Básico', Intermediario: 'Intermediário', Avancado: 'Avançado' };

function StudiesPageContent() {
    const { status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Filters live in the URL: a filtered view can be bookmarked and shared,
    // and the back button steps through searches the way readers expect.
    const category = searchParams.get('category') || null;
    const contentType = searchParams.get('content_type') || null;
    const difficulty = searchParams.get('difficulty') || null;
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'relevance';
    const page = parseInt(searchParams.get('page'), 10) || 1;

    const [data, setData] = useState(null);
    const [progress, setProgress] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [searchDraft, setSearchDraft] = useState(search);

    const firstLoad = useRef(true);

    useEffect(() => {
        if (status === 'unauthenticated') { router.push('/login'); }
    }, [status, router]);

    /** Writes filter state to the URL; changing any filter returns to page 1. */
    const updateParams = useCallback((changes, { resetPage = true } = {}) => {
        const params = new URLSearchParams(searchParams.toString());

        for (const [key, value] of Object.entries(changes)) {
            if (value === null || value === undefined || value === '') {
                params.delete(key);
            } else {
                params.set(key, String(value));
            }
        }
        if (resetPage) { params.delete('page'); }

        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }, [router, pathname, searchParams]);

    // Debounce typing so each keystroke does not hit the API.
    useEffect(() => {
        if (searchDraft === search) { return; }
        const id = setTimeout(() => updateParams({ search: searchDraft }), 350);
        return () => clearTimeout(id);
    }, [searchDraft, search, updateParams]);

    // Keep the input in sync when the URL changes from elsewhere (back button).
    useEffect(() => { setSearchDraft(search); }, [search]);

    useEffect(() => {
        if (status !== 'authenticated') { return; }

        let cancelled = false;

        async function load() {
            try {
                if (firstLoad.current) { setLoading(true); } else { setRefreshing(true); }
                setError(null);

                const query = new URLSearchParams();
                if (category) { query.set('category', category); }
                if (contentType) { query.set('content_type', contentType); }
                if (difficulty) { query.set('difficulty', difficulty); }
                if (search) { query.set('search', search); }
                if (sort && sort !== 'relevance') { query.set('sort', sort); }
                if (page > 1) { query.set('page', String(page)); }

                const [articlesRes, progressRes] = await Promise.all([
                    fetch(`/api/studies?${query.toString()}`),
                    firstLoad.current ? fetch('/api/studies/progress') : Promise.resolve(null),
                ]);

                const articlesData = await articlesRes.json();
                if (!articlesData.success) { throw new Error(articlesData.message); }
                if (cancelled) { return; }

                setData(articlesData);

                if (progressRes) {
                    const progressData = await progressRes.json();
                    if (!cancelled) { setProgress(progressData.articles || []); }
                }
            } catch (err) {
                if (!cancelled) { setError(err.message || 'Erro ao carregar estudos'); }
            } finally {
                if (!cancelled) {
                    firstLoad.current = false;
                    setLoading(false);
                    setRefreshing(false);
                }
            }
        }

        load();
        return () => { cancelled = true; };
    }, [status, category, contentType, difficulty, search, sort, page]);

    const progressMap = useMemo(() => {
        const map = {};
        for (const entry of progress) { map[entry.article_id] = entry; }
        return map;
    }, [progress]);

    const articles = data?.articles || [];
    const pagination = data?.pagination;
    const facets = data?.facets || { categories: {}, content_types: {}, difficulties: {} };
    const libraryTotal = data?.library_total || 0;

    const totalRead = progress.filter(p => p.read_count > 0).length;
    const totalCompleted = progress.filter(p => p.completed).length;
    const hasFilters = Boolean(category || contentType || difficulty || search);

    const goToPage = (next) => {
        updateParams({ page: next > 1 ? next : null }, { resetPage: false });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (status === 'loading' || loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4" role="status" aria-live="polite">
                <FaSpinner className="animate-spin text-3xl text-slate-300" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Carregando biblioteca de estudos…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-lg mx-auto py-20 px-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 flex items-center justify-center mx-auto mb-5">
                    <FaExclamationTriangle className="text-xl text-amber-500 dark:text-amber-400" />
                </div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Não foi possível carregar os estudos</h1>
                <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
                <button
                    onClick={() => router.refresh()}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:focus-visible:ring-blue-800 focus-visible:ring-offset-2"
                >
                    Tentar de novo
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto">
            {/* ── Header ── */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 lg:p-8 mb-6 shadow-sm dark:shadow-slate-950/50">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                    <div className="flex items-start gap-4">
                        <div className="relative shrink-0">
                            <div className="absolute inset-0 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl blur opacity-30" />
                            <div className="relative p-3.5 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                                <FaGraduationCap className="text-2xl text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Biblioteca de Estudos</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-xl">
                                Conteúdo técnico para preparar e consultar durante os exercícios.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 lg:gap-6 shrink-0">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">{totalRead}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Lidos</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
                        <div className="text-center">
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{totalCompleted}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Concluídos</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
                        <div className="text-center">
                            <p className="text-2xl font-bold text-slate-700 dark:text-slate-200 tabular-nums">{libraryTotal}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Artigos</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-6">
                <div className="flex-1 min-w-0">
                    {/* ── Search + filters ── */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 mb-5 shadow-xs space-y-4">
                        {/* 1. Main Bar: Search Input + Sorting Dropdown */}
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="relative flex-1">
                                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm pointer-events-none" />
                                <input
                                    type="search"
                                    value={searchDraft}
                                    onChange={(e) => setSearchDraft(e.target.value)}
                                    placeholder="Buscar por título, conteúdo, tag ou termo…"
                                    aria-label="Buscar artigos"
                                    className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 transition-all"
                                />
                                {searchDraft && (
                                    <button
                                        onClick={() => setSearchDraft('')}
                                        aria-label="Limpar busca"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-md transition-colors"
                                    >
                                        <FaTimes className="text-xs" />
                                    </button>
                                )}
                            </div>

                            <div className="relative md:w-64">
                                <FaSortAmountDown className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs pointer-events-none" />
                                <select
                                    value={sort}
                                    onChange={(e) => updateParams({ sort: e.target.value === 'relevance' ? null : e.target.value })}
                                    aria-label="Ordenar artigos"
                                    className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 appearance-none cursor-pointer font-medium transition-all"
                                >
                                    {Object.entries(SORT_LABELS).map(([value, label]) => (
                                        <option key={value} value={value} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">{label}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500 text-[10px]">
                                    ▼
                                </div>
                            </div>
                        </div>

                        {/* 2. Category Filter Section */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                                    <FaLayerGroup className="text-blue-500 dark:text-blue-400 text-xs" />
                                    Categorias de Estudo
                                </span>
                            </div>
                            <StudyCategoryPanel
                                activeCategory={category}
                                onChange={(value) => updateParams({ category: value })}
                                counts={facets.categories}
                            />
                        </div>

                        {/* 3. Secondary Filters: Content Type & Difficulty */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                            <div className="lg:col-span-7">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
                                    Tipo de Conteúdo
                                </span>
                                <StudyTypeFilter
                                    activeType={contentType}
                                    onChange={(value) => updateParams({ content_type: value })}
                                />
                            </div>

                            <div className="lg:col-span-5">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
                                    Nível de Dificuldade
                                </span>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {DIFFICULTIES.map(level => {
                                        const active = difficulty === level;
                                        const activeClass = level === 'Basico'
                                            ? 'border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs'
                                            : level === 'Intermediario'
                                            ? 'border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-bold shadow-xs'
                                            : 'border-2 border-purple-500 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-bold shadow-xs';
                                        return (
                                            <button
                                                key={level}
                                                onClick={() => updateParams({ difficulty: active ? null : level })}
                                                aria-pressed={active}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:focus-visible:ring-blue-800 ${
                                                    active
                                                        ? activeClass
                                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-700'
                                                }`}
                                            >
                                                {DIFFICULTY_LABELS[level]}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* 4. Active Filter Chips & Clear Action */}
                        {hasFilters && (
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-50/70 dark:bg-slate-800/50 p-3 rounded-xl">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <FaFilter className="text-[10px] text-blue-500 dark:text-blue-400" /> Filtros ativos:
                                    </span>
                                    {search && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-2xs">
                                            Busca: <strong className="text-blue-600 dark:text-blue-400">"{search}"</strong>
                                            <button onClick={() => setSearchDraft('')} className="ml-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200">
                                                <FaTimes className="text-[10px]" />
                                            </button>
                                        </span>
                                    )}
                                    {category && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-2xs">
                                            Categoria: <strong className="text-purple-600 dark:text-purple-400">{CATEGORY_CONFIG[category]?.label || category}</strong>
                                            <button onClick={() => updateParams({ category: null })} className="ml-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200">
                                                <FaTimes className="text-[10px]" />
                                            </button>
                                        </span>
                                    )}
                                    {contentType && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-2xs">
                                            Tipo: <strong className="text-indigo-600 dark:text-indigo-400">{contentType}</strong>
                                            <button onClick={() => updateParams({ content_type: null })} className="ml-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200">
                                                <FaTimes className="text-[10px]" />
                                            </button>
                                        </span>
                                    )}
                                    {difficulty && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-2xs">
                                            Dificuldade: <strong className="text-emerald-600 dark:text-emerald-400">{DIFFICULTY_LABELS[difficulty]}</strong>
                                            <button onClick={() => updateParams({ difficulty: null })} className="ml-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200">
                                                <FaTimes className="text-[10px]" />
                                            </button>
                                        </span>
                                    )}
                                </div>

                                <button
                                    onClick={() => updateParams({ category: null, content_type: null, difficulty: null, search: null })}
                                    className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
                                >
                                    <FaTrashAlt className="text-[10px]" />
                                    Limpar todos
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ── Result count ── */}
                    <div className="flex items-center justify-between gap-3 mb-4 min-h-6">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {refreshing ? (
                                <span className="inline-flex items-center gap-2">
                                    <FaSpinner className="animate-spin text-xs text-blue-500 dark:text-blue-400" /> Atualizando…
                                </span>
                            ) : hasFilters ? (
                                <>
                                    Exibindo <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">{pagination?.total ?? 0}</span> de <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">{libraryTotal}</span> artigos
                                </>
                            ) : (
                                <>Total de <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">{libraryTotal}</span> artigos disponíveis</>
                            )}
                        </p>
                    </div>

                    {/* ── Results ── */}
                    {articles.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
                            <FaFolderOpen className="text-4xl text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-700 dark:text-slate-300 font-medium">
                                {search ? `Nada encontrado para "${search}"` : 'Nenhum artigo com esses filtros'}
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-5">
                                Tente outro termo ou remova alguns filtros.
                            </p>
                            <button
                                onClick={() => updateParams({ category: null, content_type: null, difficulty: null, search: null })}
                                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Ver todos os artigos
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className={`grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4 transition-opacity ${refreshing ? 'opacity-60' : ''}`}>
                                {articles.map(article => (
                                    <StudyCard
                                        key={article.id}
                                        article={article}
                                        progressEntry={progressMap[article.id]}
                                    />
                                ))}
                            </div>

                            <StudyPagination pagination={pagination} onPageChange={goToPage} />
                        </>
                    )}
                </div>

                {/* ── Sidebar ── */}
                <aside className="xl:w-72 shrink-0 space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Seu progresso</h2>

                        <div className="space-y-3">
                            <div>
                                <div className="flex items-center justify-between text-sm mb-1.5">
                                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                        <FaEye className="text-blue-400 text-xs" /> Lidos
                                    </span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                                        {libraryTotal ? Math.round((totalRead / libraryTotal) * 100) : 0}%
                                    </span>
                                </div>
                                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                        style={{ width: `${libraryTotal ? Math.round((totalRead / libraryTotal) * 100) : 0}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between text-sm mb-1.5">
                                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                        <FaCheckCircle className="text-emerald-400 text-xs" /> Concluídos
                                    </span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                                        {libraryTotal ? Math.round((totalCompleted / libraryTotal) * 100) : 0}%
                                    </span>
                                </div>
                                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                        style={{ width: `${libraryTotal ? Math.round((totalCompleted / libraryTotal) * 100) : 0}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Por categoria</h2>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Clique para filtrar</p>
                        <div className="space-y-3">
                            {Object.entries(CATEGORY_CONFIG).map(([id, config]) => {
                                const total = facets.categories[id] || 0;
                                if (total === 0) { return null; }
                                const completed = progress.filter(
                                    p => p.completed && p.category === id
                                ).length;

                                return (
                                    <button
                                        key={id}
                                        onClick={() => updateParams({ category: category === id ? null : id })}
                                        aria-pressed={category === id}
                                        className={`w-full text-left rounded-lg px-2 -mx-2 py-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:focus-visible:ring-blue-800 ${
                                            category === id ? 'bg-blue-50 dark:bg-blue-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                                        }`}
                                    >
                                        <StudyProgressBar
                                            label={config.label}
                                            completed={completed}
                                            total={total}
                                            colorClass={config.color}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default function StudiesPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <FaSpinner className="animate-spin text-3xl text-slate-300" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Carregando biblioteca de estudos…</p>
            </div>
        }>
            <StudiesPageContent />
        </Suspense>
    );
}
