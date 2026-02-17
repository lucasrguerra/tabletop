import mongoose from 'mongoose';

const EvaluationSchema = new mongoose.Schema({
	training_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Training',
		required: true,
		index: true,
	},
	user_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		index: true,
	},
	// Overall training rating (1-5)
	overall_rating: {
		type: Number,
		required: true,
		min: 1,
		max: 5,
	},
	// Scenario quality rating (1-5)
	scenario_rating: {
		type: Number,
		required: true,
		min: 1,
		max: 5,
	},
	// Difficulty perception (1-5: 1=very easy, 5=very hard)
	difficulty_rating: {
		type: Number,
		required: true,
		min: 1,
		max: 5,
	},
	// Would recommend this training?
	would_recommend: {
		type: Boolean,
		required: true,
	},
	// Optional free-text comment
	comment: {
		type: String,
		maxlength: 1000,
		default: '',
	},
	submitted_at: {
		type: Date,
		default: Date.now,
	},
});

// Each participant can only evaluate a training once
EvaluationSchema.index(
	{ training_id: 1, user_id: 1 },
	{ unique: true }
);

const Evaluation = mongoose.models.Evaluation || mongoose.model('Evaluation', EvaluationSchema);

export default Evaluation;
