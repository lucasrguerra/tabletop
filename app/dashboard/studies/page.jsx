"use client";

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    FaGraduationCap, FaCheckCircle, FaEye, FaFolderOpen, FaSpinner, FaExclamationTriangle
} from 'react-icons/fa';
import StudyCard from '@/components/Studies/StudyCard';
import StudyCategoryPanel from '@/components/Studies/StudyCategoryPanel';
import StudyTypeFilter from '@/components/Studies/StudyTypeFilter';
import StudyProgressBar from '@/components/Studies/StudyProgressBar';

const CATEGORY_CONFIG = {
    GOV_LEGAL: { label: 'Governança e Legal',      color: 'bg-purple-500' },
    NET_ROUT:  { label: 'Roteamento',               color: 'bg-blue-500' },
    NET_VOL:   { label: 'Ataques Volumétricos',     color: 'bg-red-500' },
    PHY_L2:    { label: 'Física e Camada 2',        color: 'bg-green-500' },
    SCI_DATA:  { label: 'Dados Científicos',        color: 'bg-indigo-500' },
    SEC_SYS:   { label: 'Segurança de Sistemas',    color: 'bg-rose-500' }
};

function StudiesPageContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [articles, setArticles] = useState([]);
    const [progress, setProgress] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters from URL or state
    const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || null);
    const [activeType, setActiveType] = useState(searchParams.get('content_type') || null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (status !== 'authenticated') return;
        fetchData();
    }, [status]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [articlesRes, progressRes] = await Promise.all([
                fetch('/api/studies'),
                fetch('/api/studies/progress')
            ]);

            const articlesData = await articlesRes.json();
            const progressData = await progressRes.json();

            if (!articlesData.success) throw new Error(articlesData.message);

            setArticles(articlesData.articles || []);
            setProgress(progressData.articles || []);
        } catch (err) {
            setError(err.message || 'Erro ao carregar estudos');
        } finally {
            setLoading(false);
        }
    };

    // Build progress lookup map: article_id -> entry
    const progressMap = useMemo(() => {
        const map = {};
        for (const entry of progress) {
            map[entry.article_id] = entry;
        }
        return map;
    }, [progress]);

    // Category article counts
    const categoryCounts = useMemo(() => {
        const counts = {};
        for (const a of articles) {
            if (a.category?.id) {
                counts[a.category.id] = (counts[a.category.id] || 0) + 1;
            }
        }
        return counts;
    }, [articles]);

    // Category progress
    const categoryProgress = useMemo(() => {
        return Object.keys(CATEGORY_CONFIG).map(catId => {
            const catArticles = articles.filter(a => a.category?.id === catId);
            const completed = catArticles.filter(a => progressMap[a.id]?.completed).length;
            return { id: catId, total: catArticles.length, completed };
        });
    }, [articles, progressMap]);

    // Overall stats
    const totalRead = progress.filter(p => p.read_count > 0).length;
    const totalCompleted = progress.filter(p => p.completed).length;

    // Filtered articles (client-side)
    const filtered = useMemo(() => {
        return articles.filter(a => {
            if (activeCategory && a.category?.id !== activeCategory) return false;
            if (activeType && a.content_type !== activeType) return false;
            return true;
        });
    }, [articles, activeCategory, activeType]);

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
                    <p className="text-slate-500">Carregando biblioteca de estudos...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto p-8 text-center">
                <FaExclamationTriangle className="text-4xl text-amber-400 mx-auto mb-4" />
                <p className="text-slate-700 font-semibold mb-2">Erro ao carregar</p>
                <p className="text-slate-500 text-sm mb-4">{error}</p>
                <button onClick={fetchData} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                    Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto">
            {/* Hero banner */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 lg:p-8 mb-6 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="relative shrink-0">
                            <div className="absolute inset-0 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl blur opacity-30" />
                            <div className="relative p-3.5 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                                <FaGraduationCap className="text-2xl text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Biblioteca de Estudos</h1>
                            <p className="text-slate-500 text-sm mt-1">
                                Conteúdo técnico organizado por categoria e tipo para preparação e referência em exercícios
                            </p>
                        </div>
                    </div>

                    {/* Progress summary */}
                    <div className="flex items-center gap-4 lg:gap-6 shrink-0">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{totalRead}</p>
                            <p className="text-xs text-slate-500">Lidos</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200" />
                        <div className="text-center">
                            <p className="text-2xl font-bold text-emerald-600">{totalCompleted}</p>
                            <p className="text-xs text-slate-500">Concluídos</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200" />
                        <div className="text-center">
                            <p className="text-2xl font-bold text-slate-700">{articles.length}</p>
                            <p className="text-xs text-slate-500">Total</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-6">
                {/* Main content */}
                <div className="flex-1 min-w-0">
                    {/* Filters */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5 shadow-sm space-y-3">
                        <StudyCategoryPanel
                            activeCategory={activeCategory}
                            onChange={setActiveCategory}
                            counts={categoryCounts}
                        />
                        <div className="border-t border-slate-100 pt-3">
                            <StudyTypeFilter activeType={activeType} onChange={setActiveType} />
                        </div>
                    </div>

                    {/* Results count */}
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-slate-500">
                            {filtered.length === articles.length
                                ? `${articles.length} artigos`
                                : `${filtered.length} de ${articles.length} artigos`}
                        </p>
                        {(activeCategory || activeType) && (
                            <button
                                onClick={() => { setActiveCategory(null); setActiveType(null); }}
                                className="text-xs text-blue-600 hover:underline font-medium"
                            >
                                Limpar filtros
                            </button>
                        )}
                    </div>

                    {/* Article grid */}
                    {filtered.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                            <FaFolderOpen className="text-4xl text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">Nenhum artigo encontrado</p>
                            <p className="text-slate-400 text-sm mt-1">Tente ajustar os filtros</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
                            {filtered.map(article => (
                                <StudyCard
                                    key={article.id}
                                    article={article}
                                    progressEntry={progressMap[article.id]}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar: progress per category */}
                <div className="xl:w-72 shrink-0 space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <h2 className="text-sm font-bold text-slate-700 mb-4">Progresso por categoria</h2>
                        <div className="space-y-3">
                            {categoryProgress.map(cp => {
                                const config = CATEGORY_CONFIG[cp.id];
                                if (cp.total === 0) return null;
                                return (
                                    <StudyProgressBar
                                        key={cp.id}
                                        label={config?.label || cp.id}
                                        completed={cp.completed}
                                        total={cp.total}
                                        colorClass={config?.color || 'bg-blue-500'}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Overall progress ring summary */}
                    {articles.length > 0 && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                            <h2 className="text-sm font-bold text-slate-700 mb-3">Visão geral</h2>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-1.5 text-slate-600"><FaEye className="text-blue-400 text-xs" /> Lidos</span>
                                    <span className="font-bold text-slate-800">{Math.round((totalRead / articles.length) * 100)}%</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.round((totalRead / articles.length) * 100)}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-sm mt-3">
                                    <span className="flex items-center gap-1.5 text-slate-600"><FaCheckCircle className="text-emerald-400 text-xs" /> Concluídos</span>
                                    <span className="font-bold text-slate-800">{Math.round((totalCompleted / articles.length) * 100)}%</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.round((totalCompleted / articles.length) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function StudiesPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
                    <p className="text-slate-500">Carregando biblioteca de estudos...</p>
                </div>
            </div>
        }>
            <StudiesPageContent />
        </Suspense>
    );
}
