"use client";

import StudyConceptBody from './StudyConceptBody';
import StudyProcedureBody from './StudyProcedureBody';
import StudyToolBody from './StudyToolBody';
import StudyGlossaryBody from './StudyGlossaryBody';

/**
 * StudyArticleViewer — switches rendering based on content_type
 */
export default function StudyArticleViewer({ article }) {
    if (!article?.content) {
        return <p className="text-slate-500 text-sm">Conteúdo não disponível.</p>;
    }

    const categoryId = article.category?.id;

    switch (article.content_type) {
        case 'CONCEITO':
            return <StudyConceptBody content={article.content} />;
        case 'PROCEDIMENTO':
            return <StudyProcedureBody content={article.content} categoryId={categoryId} />;
        case 'FERRAMENTA':
            return <StudyToolBody content={article.content} />;
        case 'GLOSSARIO':
            return <StudyGlossaryBody content={article.content} />;
        default:
            return <p className="text-slate-500 text-sm">Tipo de conteúdo desconhecido: {article.content_type}</p>;
    }
}
