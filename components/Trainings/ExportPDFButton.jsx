'use client';

import { useState } from 'react';
import { FaFilePdf, FaSpinner } from 'react-icons/fa';

function formatDuration(ms) {
	if (!ms || ms <= 0) return '—';
	const totalSec = Math.floor(ms / 1000);
	const h = Math.floor(totalSec / 3600);
	const m = Math.floor((totalSec % 3600) / 60);
	const s = totalSec % 60;
	if (h > 0) return `${h}h ${m}m ${s}s`;
	if (m > 0) return `${m}m ${s}s`;
	return `${s}s`;
}

const STATUS_LABELS = {
	not_started: 'Não Iniciado',
	active: 'Em Andamento',
	paused: 'Pausado',
	completed: 'Finalizado',
};

const TYPE_LABELS = {
	'multiple-choice': 'Múltipla Escolha',
	'true-false': 'Verdadeiro/Falso',
	'numeric': 'Numérica',
	'matching': 'Correspondência',
	'ordering': 'Ordenação',
};

// ===== CHART RENDERING HELPERS (Canvas 2D → PNG for PDF embedding) =====

function roundRectPath(ctx, x, y, w, h, r) {
	r = Math.min(r, w / 2, h / 2);
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.lineTo(x + w - r, y);
	ctx.quadraticCurveTo(x + w, y, x + w, y + r);
	ctx.lineTo(x + w, y + h - r);
	ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
	ctx.lineTo(x + r, y + h);
	ctx.quadraticCurveTo(x, y + h, x, y + h - r);
	ctx.lineTo(x, y + r);
	ctx.quadraticCurveTo(x, y, x + r, y);
	ctx.closePath();
}

function createHiDPICanvas(w, h) {
	const dpr = 3;
	const canvas = document.createElement('canvas');
	canvas.width = w * dpr;
	canvas.height = h * dpr;
	const ctx = canvas.getContext('2d');
	ctx.scale(dpr, dpr);
	return { canvas, ctx };
}

function renderDonutChart({ correct, incorrect }) {
	const w = 300, h = 260;
	const { canvas, ctx } = createHiDPICanvas(w, h);
	const total = correct + incorrect;
	if (total === 0) return null;

	// Background
	ctx.fillStyle = '#f8fafc';
	roundRectPath(ctx, 0, 0, w, h, 10);
	ctx.fill();

	// Title
	ctx.fillStyle = '#334155';
	ctx.font = 'bold 13px sans-serif';
	ctx.textAlign = 'center';
	ctx.fillText('Distribuição de Acertos', w / 2, 20);

	const cx = w / 2, cy = h * 0.43;
	const outerR = 70, innerR = 44;
	const correctPct = Math.round((correct / total) * 100);
	const segments = [
		{ value: correct, color: '#10b981', label: `Corretas (${correct})`, pct: correctPct },
		{ value: incorrect, color: '#ef4444', label: `Incorretas (${incorrect})`, pct: 100 - correctPct },
	];

	let startAngle = -Math.PI / 2;
	for (const seg of segments) {
		if (seg.value === 0) continue;
		const sliceAngle = (seg.value / total) * Math.PI * 2;
		ctx.beginPath();
		ctx.moveTo(cx, cy);
		ctx.arc(cx, cy, outerR, startAngle, startAngle + sliceAngle);
		ctx.closePath();
		ctx.fillStyle = seg.color;
		ctx.fill();
		if (seg.pct >= 8) {
			const midAngle = startAngle + sliceAngle / 2;
			const lr = (outerR + innerR) / 2;
			ctx.fillStyle = '#ffffff';
			ctx.font = 'bold 12px sans-serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(`${seg.pct}%`, cx + Math.cos(midAngle) * lr, cy + Math.sin(midAngle) * lr);
		}
		startAngle += sliceAngle;
	}

	// Inner donut hole
	ctx.beginPath();
	ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
	ctx.fillStyle = '#f8fafc';
	ctx.fill();

	// Center label
	ctx.fillStyle = '#0f172a';
	ctx.font = 'bold 22px sans-serif';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText(`${correctPct}%`, cx, cy);

	// Legend
	let ly = h - 42;
	ctx.textBaseline = 'middle';
	for (const seg of segments) {
		ctx.fillStyle = seg.color;
		roundRectPath(ctx, w / 2 - 56, ly - 5, 10, 10, 2);
		ctx.fill();
		ctx.fillStyle = '#475569';
		ctx.font = '10px sans-serif';
		ctx.textAlign = 'left';
		ctx.fillText(seg.label, w / 2 - 40, ly + 1);
		ly += 18;
	}

	return canvas.toDataURL('image/png');
}

function renderRoundBarChart(roundData) {
	if (!roundData || roundData.length === 0) return null;
	const w = 420, h = 260;
	const { canvas, ctx } = createHiDPICanvas(w, h);

	ctx.fillStyle = '#f8fafc';
	roundRectPath(ctx, 0, 0, w, h, 10);
	ctx.fill();

	// Title
	ctx.fillStyle = '#334155';
	ctx.font = 'bold 13px sans-serif';
	ctx.textAlign = 'center';
	ctx.fillText('Aproveitamento por Rodada', w / 2, 20);

	const plotL = 42, plotR = w - 16, plotT = 36, plotB = h - 48;
	const plotW = plotR - plotL, plotH = plotB - plotT;

	// Grid & Y axis
	ctx.textBaseline = 'middle';
	for (let v = 0; v <= 100; v += 25) {
		const yy = plotB - (v / 100) * plotH;
		ctx.strokeStyle = '#e2e8f0';
		ctx.lineWidth = 0.5;
		ctx.beginPath();
		ctx.moveTo(plotL, yy);
		ctx.lineTo(plotR, yy);
		ctx.stroke();
		ctx.fillStyle = '#94a3b8';
		ctx.font = '9px sans-serif';
		ctx.textAlign = 'right';
		ctx.fillText(`${v}%`, plotL - 5, yy);
	}

	// Bars
	const groupW = plotW / roundData.length;
	const barW = Math.min(groupW * 0.32, 28);
	const barGap = 3;

	for (let i = 0; i < roundData.length; i++) {
		const d = roundData[i];
		const gc = plotL + groupW * i + groupW / 2;

		// Accuracy bar
		const accH = Math.max(0, (d.accuracy / 100) * plotH);
		const accX = gc - barW - barGap / 2;
		if (accH > 0) {
			ctx.fillStyle = '#3b82f6';
			roundRectPath(ctx, accX, plotB - accH, barW, accH, 3);
			ctx.fill();
			ctx.fillStyle = '#3b82f6';
			ctx.font = 'bold 8px sans-serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'bottom';
			ctx.fillText(`${d.accuracy}%`, accX + barW / 2, plotB - accH - 2);
		}

		// Completion bar
		const compH = Math.max(0, (d.completion / 100) * plotH);
		const compX = gc + barGap / 2;
		if (compH > 0) {
			ctx.fillStyle = '#10b981';
			roundRectPath(ctx, compX, plotB - compH, barW, compH, 3);
			ctx.fill();
			ctx.fillStyle = '#10b981';
			ctx.font = 'bold 8px sans-serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'bottom';
			ctx.fillText(`${d.completion}%`, compX + barW / 2, plotB - compH - 2);
		}

		// X label
		ctx.fillStyle = '#475569';
		ctx.font = '10px sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'top';
		ctx.fillText(d.name, gc, plotB + 5);
	}

	// Legend
	const legendY = h - 14;
	ctx.textBaseline = 'middle';
	ctx.fillStyle = '#3b82f6';
	roundRectPath(ctx, w / 2 - 90, legendY - 4, 8, 8, 2);
	ctx.fill();
	ctx.fillStyle = '#475569';
	ctx.font = '9px sans-serif';
	ctx.textAlign = 'left';
	ctx.fillText('Aproveitamento', w / 2 - 78, legendY);
	ctx.fillStyle = '#10b981';
	roundRectPath(ctx, w / 2 + 10, legendY - 4, 8, 8, 2);
	ctx.fill();
	ctx.fillStyle = '#475569';
	ctx.fillText('Conclusão', w / 2 + 22, legendY);

	return canvas.toDataURL('image/png');
}

function renderParticipantBarChart(participants) {
	if (!participants || participants.length === 0) return null;
	const barH = 22, gap = 6;
	const w = 520;
	const h = Math.max(100, participants.length * (barH + gap) + 50);
	const { canvas, ctx } = createHiDPICanvas(w, h);

	ctx.fillStyle = '#f8fafc';
	roundRectPath(ctx, 0, 0, w, h, 10);
	ctx.fill();

	// Title
	ctx.fillStyle = '#334155';
	ctx.font = 'bold 13px sans-serif';
	ctx.textAlign = 'center';
	ctx.fillText('Comparativo de Aproveitamento', w / 2, 18);

	const nameW = 120;
	const plotL = nameW + 10, plotR = w - 45;
	const plotW = plotR - plotL;
	const startY = 36;

	// Grid + axis
	for (let v = 0; v <= 100; v += 25) {
		const xx = plotL + (v / 100) * plotW;
		ctx.strokeStyle = '#e2e8f0';
		ctx.lineWidth = 0.5;
		ctx.beginPath();
		ctx.moveTo(xx, startY - 5);
		ctx.lineTo(xx, startY + participants.length * (barH + gap) - gap);
		ctx.stroke();
		ctx.fillStyle = '#94a3b8';
		ctx.font = '8px sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'top';
		ctx.fillText(`${v}%`, xx, startY - 18);
	}

	for (let i = 0; i < participants.length; i++) {
		const p = participants[i];
		const by = startY + i * (barH + gap);
		const bw = Math.max(0, (p.accuracy / 100) * plotW);

		// Name
		ctx.fillStyle = '#1e293b';
		ctx.font = '10px sans-serif';
		ctx.textAlign = 'right';
		ctx.textBaseline = 'middle';
		const name = p.name.length > 18 ? p.name.substring(0, 17) + '\u2026' : p.name;
		ctx.fillText(name, plotL - 8, by + barH / 2);

		// Bar
		if (bw > 4) {
			ctx.fillStyle = '#8b5cf6';
			roundRectPath(ctx, plotL, by, bw, barH, 4);
			ctx.fill();
		} else if (bw > 0) {
			ctx.fillStyle = '#8b5cf6';
			ctx.fillRect(plotL, by, bw, barH);
		}

		// Value label
		ctx.font = 'bold 10px sans-serif';
		ctx.textBaseline = 'middle';
		if (bw > 50) {
			ctx.fillStyle = '#ffffff';
			ctx.textAlign = 'right';
			ctx.fillText(`${p.accuracy}%`, plotL + bw - 6, by + barH / 2);
		} else {
			ctx.fillStyle = '#8b5cf6';
			ctx.textAlign = 'left';
			ctx.fillText(`${p.accuracy}%`, plotL + bw + 5, by + barH / 2);
		}
	}

	return canvas.toDataURL('image/png');
}

/**
 * Generates and downloads a comprehensive PDF report of the training statistics.
 */
async function generatePDF({ training, responses, summary, scenarioData, totalParticipants }) {
	const { jsPDF } = await import('jspdf');
	const { default: autoTable } = await import('jspdf-autotable');

	const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
	const pageWidth = doc.internal.pageSize.getWidth();
	const pageHeight = doc.internal.pageSize.getHeight();
	const margin = 14;
	const contentWidth = pageWidth - margin * 2;
	let y = margin;

	const footerHeight = 12;

	// Colors
	const successColor = [16, 185, 129];
	const dangerColor = [239, 68, 68];
	const warningColor = [245, 158, 11];
	const textMuted = [100, 116, 139];

	function checkPageBreak(needed = 15) {
		if (y + needed > pageHeight - margin - footerHeight) {
			doc.addPage();
			y = margin;
			return true;
		}
		return false;
	}

	function drawSectionTitle(title, color = [59, 130, 246]) {
		checkPageBreak(18);
		y += 2;
		doc.setFillColor(...color);
		doc.roundedRect(margin, y, contentWidth, 10, 2, 2, 'F');
		doc.setFontSize(11);
		doc.setFont('helvetica', 'bold');
		doc.setTextColor(255, 255, 255);
		doc.text(title, margin + 5, y + 7);
		y += 14;
	}

	function drawSubTitle(title) {
		checkPageBreak(12);
		y += 2;
		doc.setFontSize(10);
		doc.setFont('helvetica', 'bold');
		doc.setTextColor(15, 23, 42);
		doc.text(title, margin + 1, y + 4);
		doc.setDrawColor(200, 210, 220);
		doc.setLineWidth(0.3);
		doc.line(margin, y + 6, margin + contentWidth, y + 6);
		y += 10;
	}

	// Helper: draw an info table (key-value pairs) using autoTable for clean alignment
	function drawInfoTable(rows, color = [71, 85, 105]) {
		checkPageBreak(rows.length * 7 + 5);
		autoTable(doc, {
			startY: y,
			margin: { left: margin, right: margin },
			theme: 'plain',
			styles: { fontSize: 8.5, cellPadding: { top: 1.8, bottom: 1.8, left: 3, right: 3 } },
			columnStyles: {
				0: { fontStyle: 'bold', textColor: color, cellWidth: 55 },
				1: { textColor: [15, 23, 42] },
			},
			body: rows,
			showHead: false,
			tableLineColor: [230, 230, 230],
			tableLineWidth: 0,
		});
		y = doc.lastAutoTable.finalY + 2;
	}

	// ============================
	// COVER / HEADER
	// ============================
	doc.setFillColor(30, 58, 138); // dark blue
	doc.rect(0, 0, pageWidth, 44, 'F');
	// Accent bar
	doc.setFillColor(59, 130, 246);
	doc.rect(0, 44, pageWidth, 3, 'F');

	doc.setFontSize(20);
	doc.setFont('helvetica', 'bold');
	doc.setTextColor(255, 255, 255);
	doc.text('Relatório de Treinamento', pageWidth / 2, 18, { align: 'center' });

	doc.setFontSize(12);
	doc.setFont('helvetica', 'normal');
	doc.setTextColor(190, 210, 255);
	const titleText = training.name || 'Treinamento';
	const titleLines = doc.splitTextToSize(titleText, pageWidth - 40);
	doc.text(titleLines, pageWidth / 2, 28, { align: 'center' });

	doc.setFontSize(8);
	doc.setTextColor(160, 180, 220);
	const dateStr = new Date().toLocaleDateString('pt-BR', {
		day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
	});
	doc.text(`Gerado em ${dateStr}`, pageWidth / 2, 40, { align: 'center' });

	y = 53;

	// ============================
	// TRAINING INFO
	// ============================
	drawSectionTitle('Informações do Treinamento', [71, 85, 105]);

	const trainingTimer = training.training_timer || {};
	let trainingElapsed = trainingTimer.elapsed_time || 0;
	if (!trainingTimer.is_paused && trainingTimer.started_at) {
		trainingElapsed += Date.now() - new Date(trainingTimer.started_at).getTime();
	}

	const infoRows = [
		['Nome', training.name || '—'],
		['Cenário', training.scenario?.title || '—'],
		['Categoria', `${training.scenario?.category || '—'} / ${training.scenario?.type || '—'}`],
		['Status', STATUS_LABELS[training.status] || training.status],
		['Participantes Aceitos', String(totalParticipants)],
		['Tempo Total', formatDuration(trainingElapsed)],
	];
	if (training.started_at) {
		infoRows.push(['Iniciado em', new Date(training.started_at).toLocaleString('pt-BR')]);
	}
	if (training.completed_at) {
		infoRows.push(['Finalizado em', new Date(training.completed_at).toLocaleString('pt-BR')]);
	}
	drawInfoTable(infoRows);

	y += 2;

	// ============================
	// GLOBAL STATISTICS
	// ============================
	const rounds = scenarioData?.rounds || [];
	const allResponses = responses || [];
	const totalQuestions = rounds.reduce((sum, r) => sum + (r.questions?.length || 0), 0);
	const totalResponses = summary?.total_responses || 0;
	const totalCorrect = summary?.correct_count || 0;
	const totalIncorrect = summary?.incorrect_count || 0;
	const totalPointsEarned = summary?.total_points_earned || 0;
	const totalPointsPossible = summary?.total_points_possible || 0;
	const globalAccuracy = summary?.percentage || 0;
	const maxPossibleResponses = totalQuestions * totalParticipants;
	const completionRate = maxPossibleResponses > 0
		? Math.round((totalResponses / maxPossibleResponses) * 10000) / 100 : 0;

	drawSectionTitle('Estatísticas Gerais', [79, 70, 229]);

	autoTable(doc, {
		startY: y,
		margin: { left: margin, right: margin },
		theme: 'grid',
		styles: { fontSize: 8, cellPadding: 3 },
		headStyles: { fillColor: [79, 70, 229], fontSize: 7.5, fontStyle: 'bold', halign: 'center', textColor: 255 },
		bodyStyles: { fontSize: 10, halign: 'center', fontStyle: 'bold', textColor: [15, 23, 42] },
		head: [['Aproveitamento', 'Corretas', 'Incorretas', 'Pontos']],
		body: [[
			`${globalAccuracy}%`,
			`${totalCorrect}/${totalResponses}`,
			String(totalIncorrect),
			`${totalPointsEarned}/${totalPointsPossible}`,
		]],
	});
	y = doc.lastAutoTable.finalY + 2;

	autoTable(doc, {
		startY: y,
		margin: { left: margin, right: margin },
		theme: 'grid',
		styles: { fontSize: 8, cellPadding: 3 },
		headStyles: { fillColor: [79, 70, 229], fontSize: 7.5, fontStyle: 'bold', halign: 'center', textColor: 255 },
		bodyStyles: { fontSize: 10, halign: 'center', fontStyle: 'bold', textColor: [15, 23, 42] },
		head: [['Questões', 'Respostas Enviadas', 'Taxa de Conclusão', 'Tempo Total']],
		body: [[
			String(totalQuestions),
			`${totalResponses}/${maxPossibleResponses}`,
			`${completionRate}%`,
			formatDuration(trainingElapsed),
		]],
	});
	y = doc.lastAutoTable.finalY + 4;

	// ============================
	// CHARTS: Accuracy Distribution + Round Performance
	// ============================
	if (totalResponses > 0) {
		const roundChartData = rounds.map((round, ri) => {
			const rResp = allResponses.filter(r => r.round_id === ri);
			const rCorrect = rResp.filter(r => r.is_correct).length;
			const rTotal = rResp.length;
			const rQuestions = round.questions?.length || 0;
			const acc = rTotal > 0 ? Math.round((rCorrect / rTotal) * 10000) / 100 : 0;
			const comp = (rQuestions * totalParticipants) > 0
				? Math.round((rTotal / (rQuestions * totalParticipants)) * 10000) / 100 : 0;
			return { name: `R${ri + 1}`, accuracy: acc, completion: comp };
		});

		const donutImg = renderDonutChart({ correct: totalCorrect, incorrect: totalIncorrect });
		const barImg = rounds.length > 0 ? renderRoundBarChart(roundChartData) : null;

		if (donutImg && barImg) {
			const chartH = 62;
			checkPageBreak(chartH + 4);
			const donutW = contentWidth * 0.42;
			const barW = contentWidth - donutW - 4;
			doc.addImage(donutImg, 'PNG', margin, y, donutW, chartH);
			doc.addImage(barImg, 'PNG', margin + donutW + 4, y, barW, chartH);
			y += chartH + 4;
		} else if (donutImg) {
			checkPageBreak(66);
			doc.addImage(donutImg, 'PNG', margin + contentWidth / 4, y, contentWidth / 2, 62);
			y += 66;
		}
	}

	// ============================
	// PARTICIPANT RANKING
	// ============================
	const participantsSummary = (summary?.participants || [])
		.sort((a, b) => b.percentage - a.percentage);

	if (participantsSummary.length > 0) {
		drawSectionTitle('Ranking de Participantes', [139, 92, 246]);

		autoTable(doc, {
			startY: y,
			margin: { left: margin, right: margin },
			theme: 'striped',
			styles: { fontSize: 8, cellPadding: 2.5 },
			headStyles: { fillColor: [139, 92, 246], fontSize: 8, fontStyle: 'bold', textColor: 255 },
			alternateRowStyles: { fillColor: [245, 243, 255] },
			head: [['Pos.', 'Participante', 'Aproveitamento', 'Pontos', 'Acertos/Total']],
			body: participantsSummary.map((p, idx) => [
				`${idx + 1}°`,
				p.user.nickname || p.user.name,
				`${p.percentage}%`,
				`${p.points_earned}/${p.points_possible}`,
				`${p.correct_count}/${p.total_responses}`,
			]),
			columnStyles: {
				0: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
				1: { cellWidth: 55 },
				2: { cellWidth: 30, halign: 'center' },
				3: { cellWidth: 30, halign: 'center' },
				4: { cellWidth: 28, halign: 'center' },
			},
		});
		y = doc.lastAutoTable.finalY + 4;

		// Participant comparison chart
		if (participantsSummary.length > 1) {
			const pChartData = participantsSummary.map(p => ({
				name: p.user.nickname || p.user.name,
				accuracy: p.percentage,
			}));
			const pChartImg = renderParticipantBarChart(pChartData);
			if (pChartImg) {
				const pChartH = Math.max(28, participantsSummary.length * 7 + 14);
				checkPageBreak(pChartH + 4);
				doc.addImage(pChartImg, 'PNG', margin, y, contentWidth, pChartH);
				y += pChartH + 4;
			}
		}
	}

	// ============================
	// PER-ROUND DETAILED BREAKDOWN
	// ============================
	for (let ri = 0; ri < rounds.length; ri++) {
		const round = rounds[ri];
		const roundQuestions = round.questions || [];
		if (roundQuestions.length === 0) continue;

		const roundResponses = allResponses.filter(r => r.round_id === ri);
		const roundCorrect = roundResponses.filter(r => r.is_correct).length;
		const roundTotal = roundResponses.length;
		const roundAccuracy = roundTotal > 0
			? Math.round((roundCorrect / roundTotal) * 10000) / 100 : 0;

		checkPageBreak(25);
		drawSectionTitle(`Rodada ${ri + 1}: ${round.title}`, [37, 99, 235]);

		const roundInfoRows = [];
		if (round.phase) roundInfoRows.push(['Fase', round.phase]);
		roundInfoRows.push(['Aproveitamento', `${roundAccuracy}%`]);
		roundInfoRows.push(['Respostas', `${roundTotal} (${roundCorrect} corretas, ${roundTotal - roundCorrect} incorretas)`]);
		drawInfoTable(roundInfoRows, [37, 99, 235]);

		y += 2;

		// Per-question in this round
		for (let qi = 0; qi < roundQuestions.length; qi++) {
			const question = roundQuestions[qi];
			const qResponses = roundResponses.filter(r => r.question_id === question.id);
			const qCorrect = qResponses.filter(r => r.is_correct);
			const qIncorrect = qResponses.filter(r => !r.is_correct);
			const qAccuracy = qResponses.length > 0
				? Math.round((qCorrect.length / qResponses.length) * 10000) / 100 : null;

			checkPageBreak(30);

			// Question header bar
			const accLabel = qAccuracy !== null ? `  |  Acerto: ${qAccuracy}%` : '';
			const headerText = `Questão ${qi + 1}  —  ${TYPE_LABELS[question.type] || question.type || 'Múltipla Escolha'}  (${question.points || 1} pts)${accLabel}`;

			autoTable(doc, {
				startY: y,
				margin: { left: margin, right: margin },
				theme: 'plain',
				styles: { fontSize: 8.5, cellPadding: { top: 2.5, bottom: 2.5, left: 4, right: 4 } },
				body: [[{ content: headerText, styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [30, 41, 59] } }]],
				showHead: false,
			});
			y = doc.lastAutoTable.finalY + 1;

			// Question text
			autoTable(doc, {
				startY: y,
				margin: { left: margin + 2, right: margin + 2 },
				theme: 'plain',
				styles: { fontSize: 8, cellPadding: { top: 1.5, bottom: 1.5, left: 3, right: 3 }, textColor: [30, 41, 59] },
				body: [[question.text]],
				showHead: false,
			});
			y = doc.lastAutoTable.finalY + 1;

			// Options / correct answer
			const optionRows = [];
			if (question.options && question.options.length > 0) {
				for (let oi = 0; oi < question.options.length; oi++) {
					const isCorrectOpt = oi === question.correctAnswer;
					const prefix = `${String.fromCharCode(65 + oi)})`;
					optionRows.push([{
						content: `${isCorrectOpt ? '✓ ' : '   '}${prefix} ${question.options[oi]}`,
						styles: {
							fontStyle: isCorrectOpt ? 'bold' : 'normal',
							textColor: isCorrectOpt ? successColor : textMuted,
							fillColor: isCorrectOpt ? [236, 253, 245] : false,
						},
					}]);
				}
			} else if (question.type === 'true-false') {
				optionRows.push([{
					content: `✓ Resposta correta: ${question.correctAnswer === true ? 'Verdadeiro' : 'Falso'}`,
					styles: { fontStyle: 'bold', textColor: successColor, fillColor: [236, 253, 245] },
				}]);
			} else if (question.type === 'numeric') {
				const tol = question.tolerance ? ` (tolerância: ±${question.tolerance})` : '';
				optionRows.push([{
					content: `✓ Resposta correta: ${question.correctAnswer}${question.unit ? ' ' + question.unit : ''}${tol}`,
					styles: { fontStyle: 'bold', textColor: successColor, fillColor: [236, 253, 245] },
				}]);
			}

			if (optionRows.length > 0) {
				autoTable(doc, {
					startY: y,
					margin: { left: margin + 4, right: margin + 4 },
					theme: 'plain',
					styles: { fontSize: 7.5, cellPadding: { top: 1.2, bottom: 1.2, left: 3, right: 3 } },
					body: optionRows,
					showHead: false,
				});
				y = doc.lastAutoTable.finalY + 1;
			}

			// Justification
			if (question.justification) {
				checkPageBreak(10);
				autoTable(doc, {
					startY: y,
					margin: { left: margin + 4, right: margin + 4 },
					theme: 'plain',
					styles: {
						fontSize: 7,
						fontStyle: 'italic',
						textColor: [100, 116, 139],
						cellPadding: { top: 2, bottom: 2, left: 4, right: 4 },
						fillColor: [248, 250, 252],
					},
					body: [[`Justificativa: ${question.justification}`]],
					showHead: false,
				});
				y = doc.lastAutoTable.finalY + 1;
			}

			// Participant responses table
			if (qResponses.length > 0 || participantsSummary.length > 0) {
				checkPageBreak(12);

				const tableBody = [];

				for (const r of qCorrect) {
					tableBody.push([
						r.user?.nickname || r.user?.name || 'Participante',
						formatAnswer(r.answer, question),
						{ content: '✓ Correto', styles: { textColor: successColor, fontStyle: 'bold' } },
						`${r.points_earned}/${r.points_possible}`,
					]);
				}

				for (const r of qIncorrect) {
					tableBody.push([
						r.user?.nickname || r.user?.name || 'Participante',
						formatAnswer(r.answer, question),
						{ content: '✗ Incorreto', styles: { textColor: dangerColor, fontStyle: 'bold' } },
						`${r.points_earned}/${r.points_possible}`,
					]);
				}

				if (participantsSummary.length > 0) {
					const answeredUserIds = new Set(qResponses.map(r => r.user?.id));
					const unanswered = participantsSummary.filter(p => !answeredUserIds.has(p.user.id));
					for (const p of unanswered) {
						tableBody.push([
							p.user.nickname || p.user.name,
							'—',
							{ content: 'Sem resposta', styles: { textColor: textMuted, fontStyle: 'italic' } },
							`0/${question.points || 1}`,
						]);
					}
				}

				if (tableBody.length > 0) {
					autoTable(doc, {
						startY: y,
						margin: { left: margin + 4, right: margin + 4 },
						theme: 'striped',
						styles: { fontSize: 7, cellPadding: 2 },
						headStyles: { fillColor: [100, 116, 139], fontSize: 7, fontStyle: 'bold', textColor: 255 },
						alternateRowStyles: { fillColor: [248, 250, 252] },
						head: [['Participante', 'Resposta', 'Resultado', 'Pontos']],
						body: tableBody,
						columnStyles: {
							0: { cellWidth: 35 },
							2: { cellWidth: 22, halign: 'center' },
							3: { cellWidth: 16, halign: 'center' },
						},
					});
					y = doc.lastAutoTable.finalY + 2;
				}
			}

			y += 3;
		}
	}

	// ============================
	// INDIVIDUAL PARTICIPANT DETAILS
	// ============================
	if (participantsSummary.length > 0) {
		checkPageBreak(25);
		drawSectionTitle('Desempenho Individual Detalhado', [139, 92, 246]);

		for (const participant of participantsSummary) {
			checkPageBreak(18);
			drawSubTitle(`${participant.user.nickname || participant.user.name}  —  ${participant.percentage}%  (${participant.points_earned}/${participant.points_possible} pts)`);

			const userResponses = allResponses.filter(r => r.user?.id === participant.user.id);

			const perRoundData = rounds.map((round, ri) => {
				const rqs = round.questions || [];
				if (rqs.length === 0) return null;
				const pResp = userResponses.filter(r => r.round_id === ri);
				const pCorrect = pResp.filter(r => r.is_correct).length;
				const pPts = pResp.reduce((sum, r) => sum + r.points_earned, 0);
				const pPoss = pResp.reduce((sum, r) => sum + r.points_possible, 0);
				const acc = pResp.length > 0
					? Math.round((pCorrect / pResp.length) * 10000) / 100 : '—';
				return [
					`R${ri + 1}`,
					`${pResp.length}/${rqs.length}`,
					String(pCorrect),
					`${pPts}/${pPoss}`,
					typeof acc === 'number' ? `${acc}%` : acc,
				];
			}).filter(Boolean);

			if (perRoundData.length > 0) {
				autoTable(doc, {
					startY: y,
					margin: { left: margin, right: margin },
					theme: 'striped',
					styles: { fontSize: 7.5, cellPadding: 2 },
					headStyles: { fillColor: [139, 92, 246], fontSize: 7.5, fontStyle: 'bold', textColor: 255 },
					alternateRowStyles: { fillColor: [245, 243, 255] },
					head: [['Rodada', 'Respostas', 'Acertos', 'Pontos', 'Aproveitamento']],
					body: perRoundData,
					columnStyles: {
						0: { halign: 'center', fontStyle: 'bold' },
						1: { halign: 'center' },
						2: { halign: 'center' },
						3: { halign: 'center' },
						4: { halign: 'center' },
					},
				});
				y = doc.lastAutoTable.finalY + 4;
			}
		}
	}

	// ============================
	// DIFFICULTY ANALYSIS
	// ============================
	const allQuestionStats = [];
	for (let ri = 0; ri < rounds.length; ri++) {
		const rqs = rounds[ri].questions || [];
		const rResp = allResponses.filter(r => r.round_id === ri);
		for (const q of rqs) {
			const qResp = rResp.filter(r => r.question_id === q.id);
			const qC = qResp.filter(r => r.is_correct).length;
			const acc = qResp.length > 0
				? Math.round((qC / qResp.length) * 10000) / 100 : null;
			if (acc !== null) {
				allQuestionStats.push({ roundIndex: ri, text: q.text, accuracy: acc });
			}
		}
	}

	if (allQuestionStats.length > 0) {
		const sorted = [...allQuestionStats].sort((a, b) => a.accuracy - b.accuracy);
		const hardest = sorted.slice(0, 5);
		const easiest = [...sorted].reverse().slice(0, 5);

		checkPageBreak(25);
		drawSectionTitle('Análise de Dificuldade', [245, 158, 11]);

		drawSubTitle('Questões Mais Difíceis');
		autoTable(doc, {
			startY: y,
			margin: { left: margin, right: margin },
			theme: 'striped',
			styles: { fontSize: 7.5, cellPadding: 2.2 },
			headStyles: { fillColor: [239, 68, 68], fontSize: 7.5, fontStyle: 'bold', textColor: 255 },
			head: [['#', 'Questão', 'Rodada', 'Acerto']],
			body: hardest.map((q, i) => [i + 1, q.text, `R${q.roundIndex + 1}`, `${q.accuracy}%`]),
			columnStyles: {
				0: { cellWidth: 8, halign: 'center' },
				2: { cellWidth: 16, halign: 'center' },
				3: { cellWidth: 16, halign: 'center' },
			},
		});
		y = doc.lastAutoTable.finalY + 4;

		checkPageBreak(18);
		drawSubTitle('Questões Mais Fáceis');
		autoTable(doc, {
			startY: y,
			margin: { left: margin, right: margin },
			theme: 'striped',
			styles: { fontSize: 7.5, cellPadding: 2.2 },
			headStyles: { fillColor: [16, 185, 129], fontSize: 7.5, fontStyle: 'bold', textColor: 255 },
			head: [['#', 'Questão', 'Rodada', 'Acerto']],
			body: easiest.map((q, i) => [i + 1, q.text, `R${q.roundIndex + 1}`, `${q.accuracy}%`]),
			columnStyles: {
				0: { cellWidth: 8, halign: 'center' },
				2: { cellWidth: 16, halign: 'center' },
				3: { cellWidth: 16, halign: 'center' },
			},
		});
		y = doc.lastAutoTable.finalY + 4;
	}

	// ============================
	// FOOTER ON ALL PAGES
	// ============================
	const totalPages = doc.internal.getNumberOfPages();
	for (let i = 1; i <= totalPages; i++) {
		doc.setPage(i);
		// Footer line
		doc.setDrawColor(200, 210, 220);
		doc.setLineWidth(0.3);
		doc.line(margin, pageHeight - footerHeight, pageWidth - margin, pageHeight - footerHeight);
		// Footer text
		doc.setFontSize(7);
		doc.setFont('helvetica', 'normal');
		doc.setTextColor(148, 163, 184);
		doc.text(
			`Tabletop  —  ${training.name || 'Treinamento'}`,
			margin,
			pageHeight - 6,
		);
		doc.text(
			`Página ${i} de ${totalPages}`,
			pageWidth - margin,
			pageHeight - 6,
			{ align: 'right' }
		);
	}

	// Save
	const safeName = (training.name || 'treinamento')
		.replace(/[^a-zA-Z0-9\u00C0-\u017F\s-]/g, '')
		.replace(/\s+/g, '_')
		.substring(0, 50);
	doc.save(`relatorio_${safeName}_${Date.now()}.pdf`);
}

/**
 * Formats a participant's answer for display in the PDF.
 */
function formatAnswer(answer, question) {
	if (answer === undefined || answer === null) return '—';

	if (question.type === 'true-false' || (!question.type && typeof answer === 'boolean')) {
		return answer === true ? 'Verdadeiro' : 'Falso';
	}

	if (question.options && typeof answer === 'number') {
		const letter = String.fromCharCode(65 + answer);
		const optionText = question.options[answer];
		if (optionText) {
			return `${letter}) ${optionText}`;
		}
		return `Opção ${letter}`;
	}

	if (question.type === 'numeric') {
		return `${answer}${question.unit ? ' ' + question.unit : ''}`;
	}

	if (Array.isArray(answer)) {
		return answer.map(item => {
			if (typeof item === 'object' && item.left && item.right) {
				return `${item.left} → ${item.right}`;
			}
			return String(item);
		}).join(', ');
	}

	return String(answer);
}

/**
 * ExportPDFButton
 * Button component that generates and downloads a PDF report with full training statistics,
 * including questions, who answered correctly/incorrectly, participant rankings, etc.
 */
export default function ExportPDFButton({ training, responses, summary, scenarioData, totalParticipants, className = '' }) {
	const [generating, setGenerating] = useState(false);

	const hasData = responses && responses.length > 0 && scenarioData?.rounds;

	const handleExport = async () => {
		if (!hasData || generating) return;
		try {
			setGenerating(true);
			await generatePDF({ training, responses, summary, scenarioData, totalParticipants });
		} catch (err) {
			console.error('Error generating PDF:', err);
			alert('Erro ao gerar o PDF. Tente novamente.');
		} finally {
			setGenerating(false);
		}
	};

	if (!hasData) return null;

	return (
		<button
			onClick={handleExport}
			disabled={generating}
			className={`flex items-center gap-2 px-4 py-2 bg-white text-red-700 font-semibold rounded-xl hover:bg-red-50 border-2 border-red-200 hover:border-red-300 transition-all disabled:opacity-50 text-sm ${className}`}
		>
			{generating ? (
				<FaSpinner className="text-xs animate-spin" />
			) : (
				<FaFilePdf className="text-xs" />
			)}
			{generating ? 'Gerando PDF...' : 'Exportar PDF'}
		</button>
	);
}
