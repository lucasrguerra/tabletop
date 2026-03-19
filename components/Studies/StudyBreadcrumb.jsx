"use client";

import Link from 'next/link';
import { FaChevronRight } from 'react-icons/fa';

const CONTENT_TYPE_LABELS = {
    CONCEITO: 'Conceito',
    PROCEDIMENTO: 'Procedimento',
    FERRAMENTA: 'Ferramenta',
    GLOSSARIO: 'Glossário'
};

const CATEGORY_LABELS = {
    GOV_LEGAL: 'Governança e Legal',
    NET_ROUT:  'Roteamento',
    NET_VOL:   'Ataques Volumétricos',
    PHY_L2:    'Física e Camada 2',
    SCI_DATA:  'Dados Científicos',
    SEC_SYS:   'Segurança de Sistemas'
};

/**
 * StudyBreadcrumb — navigation trail for article viewer page
 * Estudos › {Category} › {Content Type} › {Title}
 */
export default function StudyBreadcrumb({ article }) {
    const categoryId = article?.category?.id;
    const contentType = article?.content_type;

    return (
        <nav className="flex items-center gap-1.5 text-sm text-slate-500 flex-wrap">
            <Link href="/dashboard/studies" className="hover:text-blue-600 transition-colors font-medium">
                Estudos
            </Link>

            {categoryId && (
                <>
                    <FaChevronRight className="text-xs text-slate-300 shrink-0" />
                    <Link
                        href={`/dashboard/studies?category=${categoryId}`}
                        className="hover:text-blue-600 transition-colors"
                    >
                        {CATEGORY_LABELS[categoryId] || categoryId}
                    </Link>
                </>
            )}

            {contentType && (
                <>
                    <FaChevronRight className="text-xs text-slate-300 shrink-0" />
                    <Link
                        href={`/dashboard/studies?content_type=${contentType}`}
                        className="hover:text-blue-600 transition-colors"
                    >
                        {CONTENT_TYPE_LABELS[contentType] || contentType}
                    </Link>
                </>
            )}

            {article?.title && (
                <>
                    <FaChevronRight className="text-xs text-slate-300 shrink-0" />
                    <span className="text-slate-700 font-medium line-clamp-1">{article.title}</span>
                </>
            )}
        </nav>
    );
}
