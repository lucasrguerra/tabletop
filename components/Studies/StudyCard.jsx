"use client";

import Link from 'next/link';
import { FaBookOpen, FaListOl, FaTools, FaBook, FaClock, FaUser, FaCheckCircle, FaEye } from 'react-icons/fa';
import StudyDifficultyBadge from './StudyDifficultyBadge';

const CONTENT_TYPE_CONFIG = {
    CONCEITO: {
        icon: FaBookOpen,
        label: 'Conceito',
        gradient: 'from-blue-500 to-indigo-600',
        bgLight: 'bg-blue-50 dark:bg-blue-950/30',
        textColor: 'text-blue-600 dark:text-blue-400',
        badgeBg: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
    },
    PROCEDIMENTO: {
        icon: FaListOl,
        label: 'Procedimento',
        gradient: 'from-violet-500 to-purple-600',
        bgLight: 'bg-violet-50 dark:bg-violet-950/30',
        textColor: 'text-violet-600 dark:text-violet-400',
        badgeBg: 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300'
    },
    FERRAMENTA: {
        icon: FaTools,
        label: 'Ferramenta',
        gradient: 'from-slate-600 to-gray-700',
        bgLight: 'bg-slate-50 dark:bg-slate-800/50',
        textColor: 'text-slate-600 dark:text-slate-400',
        badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
    },
    GLOSSARIO: {
        icon: FaBook,
        label: 'Glossário',
        gradient: 'from-teal-500 to-emerald-600',
        bgLight: 'bg-teal-50 dark:bg-teal-950/30',
        textColor: 'text-teal-600 dark:text-teal-400',
        badgeBg: 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300'
    }
};

const CATEGORY_COLORS = {
    GOV_LEGAL: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300',
    NET_ROUT:  'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
    NET_VOL:   'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300',
    PHY_L2:    'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
    SCI_DATA:  'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300',
    SEC_SYS:   'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300'
};

/**
 * StudyCard component — article preview card for the studies index.
 * @param {Object} article - Article metadata (no content field)
 * @param {Object} [progressEntry] - User's progress entry for this article ({ completed, read_count })
 */
export default function StudyCard({ article, progressEntry }) {
    const typeConfig = CONTENT_TYPE_CONFIG[article.content_type] || CONTENT_TYPE_CONFIG.CONCEITO;
    const Icon = typeConfig.icon;
    const categoryColor = CATEGORY_COLORS[article.category?.id] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';

    const isCompleted = progressEntry?.completed;
    const isRead = progressEntry && !isCompleted;

    return (
        <Link
            href={`/dashboard/studies/${article.id}`}
            className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm
                       hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 overflow-hidden"
        >
            {/* Top accent bar in content type color */}
            <div className={`h-1 w-full bg-linear-to-r ${typeConfig.gradient}`} />

            <div className="flex flex-col flex-1 p-5">
                {/* Header: icon + progress chip */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${typeConfig.bgLight} dark:bg-slate-800 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`text-lg ${typeConfig.textColor} dark:text-slate-300`} />
                    </div>

                    {isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full">
                            <FaCheckCircle className="text-xs" />
                            Concluído
                        </span>
                    ) : isRead ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full">
                            <FaEye className="text-xs" />
                            Lido
                        </span>
                    ) : null}
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 mb-2 line-clamp-2 leading-snug">
                    {article.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 flex-1 mb-3">
                    {article.description}
                </p>

                {/* Footer: badges + metadata */}
                <div className="flex flex-wrap items-center gap-1.5 mt-auto">
                    {/* Content type badge */}
                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${typeConfig.badgeBg} dark:bg-slate-800 dark:text-slate-300`}>
                        {typeConfig.label}
                    </span>

                    {/* Category badge */}
                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${categoryColor} dark:bg-slate-800 dark:text-slate-300`}>
                        {article.category?.id}
                    </span>

                    {/* Difficulty */}
                    {article.metadata?.difficulty && (
                        <StudyDifficultyBadge difficulty={article.metadata.difficulty} size="xs" />
                    )}
                </div>

                {/* Read time */}
                {article.metadata?.estimatedReadTime && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-slate-400 dark:text-slate-500">
                        <FaClock className="text-xs" />
                        <span>{article.metadata.estimatedReadTime}</span>
                        {article.metadata?.targetAudience && (
                            <>
                                <span className="mx-1">·</span>
                                <FaUser className="text-xs" />
                                <span className="line-clamp-1">{article.metadata.targetAudience.split(',')[0].trim()}</span>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Hover overlay */}
            <div className={`absolute inset-0 bg-linear-to-br ${typeConfig.gradient} opacity-0 group-hover:opacity-[0.02] transition-opacity duration-300 pointer-events-none rounded-2xl`} />
        </Link>
    );
}
