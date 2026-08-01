"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
    FaBookOpen, FaListOl, FaTools, FaBook,
    FaClock, FaUser, FaCalendar, FaCheckCircle,
    FaExternalLinkAlt, FaSpinner, FaExclamationTriangle,
    FaArrowLeft
} from 'react-icons/fa';
import StudyBreadcrumb from '@/components/Studies/StudyBreadcrumb';
import StudyDifficultyBadge from '@/components/Studies/StudyDifficultyBadge';
import StudyArticleViewer from '@/components/Studies/StudyArticleViewer';

const CONTENT_TYPE_CONFIG = {
    CONCEITO:     { icon: FaBookOpen, label: 'Conceito',     gradient: 'from-blue-500 to-indigo-600',   bgLight: 'bg-blue-50 dark:bg-blue-950/30',    textColor: 'text-blue-600 dark:text-blue-400' },
    PROCEDIMENTO: { icon: FaListOl,   label: 'Procedimento', gradient: 'from-violet-500 to-purple-600', bgLight: 'bg-violet-50 dark:bg-violet-950/30',  textColor: 'text-violet-600 dark:text-violet-400' },
    FERRAMENTA:   { icon: FaTools,    label: 'Ferramenta',   gradient: 'from-slate-600 to-gray-700',    bgLight: 'bg-slate-50 dark:bg-slate-800/50',   textColor: 'text-slate-600 dark:text-slate-400' },
    GLOSSARIO:    { icon: FaBook,     label: 'Glossário',    gradient: 'from-teal-500 to-emerald-600',  bgLight: 'bg-teal-50 dark:bg-teal-950/30',    textColor: 'text-teal-600 dark:text-teal-400' }
};

const CATEGORY_BORDER = {
    GOV_LEGAL: 'border-l-purple-500',
    NET_ROUT:  'border-l-blue-500',
    NET_VOL:   'border-l-red-500',
    PHY_L2:    'border-l-green-500',
    SCI_DATA:  'border-l-indigo-500',
    SEC_SYS:   'border-l-rose-500'
};

export default function StudyArticlePage() {
    const { id: articleId } = useParams();
    const { data: session, status } = useSession();
    const router = useRouter();

    const [article, setArticle] = useState(null);
    const [progressEntry, setProgressEntry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [completing, setCompleting] = useState(false);

    const sentinelRef = useRef(null);
    const readTracked = useRef(false);
    const csrfToken = useRef(null);

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/login');
    }, [status, router]);

    useEffect(() => {
        if (status !== 'authenticated' || !articleId) return;
        fetchArticle();
        fetchProgress();
        fetchCsrf();
    }, [status, articleId]);

    const fetchArticle = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/studies/${articleId}`);
            const data = await res.json();
            if (!data.success) throw new Error(data.message || 'Artigo não encontrado');
            setArticle(data.article);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchProgress = async () => {
        try {
            const res = await fetch('/api/studies/progress');
            const data = await res.json();
            if (data.success) {
                const entry = (data.articles || []).find(a => a.article_id === articleId);
                setProgressEntry(entry || null);
            }
        } catch {}
    };

    const fetchCsrf = async () => {
        try {
            const res = await fetch('/api/csrf');
            const data = await res.json();
            csrfToken.current = data.csrf_token;
        } catch {}
    };

    const trackRead = useCallback(async () => {
        if (!article || readTracked.current || progressEntry) return;
        readTracked.current = true;
        try {
            await fetch('/api/studies/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken.current || '' },
                body: JSON.stringify({
                    article_id: article.id,
                    category: article.category?.id,
                    content_type: article.content_type,
                    action: 'read'
                })
            });
            await fetchProgress();
        } catch {}
    }, [article, progressEntry]);

    // IntersectionObserver at 75% sentinel
    useEffect(() => {
        if (!sentinelRef.current || !article) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    trackRead();
                    observer.disconnect();
                }
            },
            { threshold: 0 }
        );

        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [article, trackRead]);

    const handleComplete = async () => {
        if (!article || completing) return;
        setCompleting(true);
        try {
            const res = await fetch('/api/studies/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken.current || '' },
                body: JSON.stringify({
                    article_id: article.id,
                    category: article.category?.id,
                    content_type: article.content_type,
                    action: 'complete'
                })
            });
            const data = await res.json();
            if (data.success) {
                setProgressEntry(prev => ({ ...(prev || {}), completed: true, completed_at: new Date().toISOString() }));
            }
        } catch {
        } finally {
            setCompleting(false);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <FaSpinner className="animate-spin text-4xl text-blue-500 dark:text-blue-400" />
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="max-w-2xl mx-auto p-8 text-center">
                <FaExclamationTriangle className="text-4xl text-amber-400 mx-auto mb-4" />
                <p className="text-slate-700 dark:text-slate-300 font-semibold mb-2">{error || 'Artigo não encontrado'}</p>
                <Link href="/dashboard/studies" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">← Voltar para Estudos</Link>
            </div>
        );
    }

    const typeConfig = CONTENT_TYPE_CONFIG[article.content_type] || CONTENT_TYPE_CONFIG.CONCEITO;
    const Icon = typeConfig.icon;
    const borderColor = CATEGORY_BORDER[article.category?.id] || 'border-l-blue-500';
    const isCompleted = progressEntry?.completed;

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-[1200px] mx-auto">
            {/* Breadcrumb */}
            <div className="mb-5">
                <StudyBreadcrumb article={article} />
            </div>

            <div className="flex flex-col xl:flex-row gap-6">
                {/* Main article column */}
                <div className="flex-1 min-w-0">
                    {/* Article header card */}
                    <div className={`bg-white dark:bg-slate-900 rounded-2xl border-l-4 border border-slate-200 dark:border-slate-800 ${borderColor} shadow-sm dark:shadow-slate-950/50 p-6 mb-5`}>
                        <div className="flex items-start gap-4 mb-4">
                            <div className={`shrink-0 w-12 h-12 rounded-2xl ${typeConfig.bgLight} dark:bg-slate-800 flex items-center justify-center`}>
                                <Icon className={`text-xl ${typeConfig.textColor} dark:text-blue-400`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${typeConfig.bgLight} dark:bg-slate-800 ${typeConfig.textColor} dark:text-blue-300`}>
                                        {typeConfig.label}
                                    </span>
                                    {article.metadata?.difficulty && (
                                        <StudyDifficultyBadge difficulty={article.metadata.difficulty} />
                                    )}
                                    {isCompleted && (
                                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                                            <FaCheckCircle className="text-xs" /> Concluído
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">{article.title}</h1>
                            </div>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">{article.description}</p>

                        {/* Metadata pills */}
                        <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                            {article.metadata?.estimatedReadTime && (
                                <span className="flex items-center gap-1.5">
                                    <FaClock className="text-slate-400 dark:text-slate-500" />
                                    {article.metadata.estimatedReadTime}
                                </span>
                            )}
                            {article.metadata?.targetAudience && (
                                <span className="flex items-center gap-1.5">
                                    <FaUser className="text-slate-400 dark:text-slate-500" />
                                    {article.metadata.targetAudience}
                                </span>
                            )}
                            {article.metadata?.lastUpdate && (
                                <span className="flex items-center gap-1.5">
                                    <FaCalendar className="text-slate-400 dark:text-slate-500" />
                                    {new Date(article.metadata.lastUpdate).toLocaleDateString('pt-BR')}
                                </span>
                            )}
                            {article.metadata?.author && (
                                <span className="flex items-center gap-1.5">
                                    <span className="text-slate-400 dark:text-slate-500">Por</span>
                                    {article.metadata.author}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Article content */}
                    <StudyArticleViewer article={article} />

                    {/* 75% sentinel for auto-read tracking */}
                    <div ref={sentinelRef} className="h-px" />
                </div>

                {/* Sidebar */}
                <div className="xl:w-72 shrink-0 space-y-4">
                    {/* Complete button */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm dark:shadow-slate-950/50">
                        {isCompleted ? (
                            <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
                                <FaCheckCircle className="text-emerald-500 dark:text-emerald-400 text-xl shrink-0" />
                                <div>
                                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Concluído!</p>
                                    {progressEntry?.completed_at && (
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                            {new Date(progressEntry.completed_at).toLocaleDateString('pt-BR')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={handleComplete}
                                disabled={completing}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-linear-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm shadow-sm hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-70"
                            >
                                {completing ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                                Marcar como Concluído
                            </button>
                        )}
                    </div>

                    {/* Related studies */}
                    {article.relatedStudies?.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm dark:shadow-slate-950/50">
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Artigos relacionados</h3>
                            <ul className="space-y-2">
                                {article.relatedStudies.map(id => (
                                    <li key={id}>
                                        <Link
                                            href={`/dashboard/studies/${id}`}
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors"
                                        >
                                            → {id.replace(/-/g, ' ')}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Related scenarios */}
                    {article.relatedScenarios?.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm dark:shadow-slate-950/50">
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Cenários que usam este conteúdo</h3>
                            <ul className="space-y-2">
                                {article.relatedScenarios.map(id => (
                                    <li key={id}>
                                        <Link
                                            href="/dashboard/trainings/new"
                                            className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 hover:underline transition-colors"
                                        >
                                            → {id.replace(/-/g, ' ')}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Technical references */}
                    {article.technicalReferences?.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm dark:shadow-slate-950/50">
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Referências técnicas</h3>
                            <ul className="space-y-2">
                                {article.technicalReferences.map((ref, i) => (
                                    <li key={i}>
                                        <a
                                            href={ref.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                                        >
                                            <FaExternalLinkAlt className="shrink-0 mt-0.5 text-slate-400 dark:text-slate-500 group-hover:text-blue-400 text-xs" />
                                            <span className="leading-relaxed">{ref.title}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Back link */}
                    <Link
                        href="/dashboard/studies"
                        className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    >
                        <FaArrowLeft className="text-xs" />
                        Voltar para Estudos
                    </Link>
                </div>
            </div>
        </div>
    );
}

