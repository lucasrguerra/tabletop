/**
 * Returns the statement of a question.
 *
 * Scenario files are not consistent: most use `text`, but some use `question`
 * for the same field. Reading only one of them leaves the statement blank in
 * the UI, so both are accepted here.
 */
export function questionText(question) {
	if (!question) { return ''; }
	return question.text || question.question || '';
}

export default questionText;
