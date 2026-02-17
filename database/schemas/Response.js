import mongoose from 'mongoose';

const ResponseSchema = new mongoose.Schema({
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
	round_id: {
		type: Number,
		required: true,
		min: 0,
	},
	question_id: {
		type: String,
		required: true,
	},
	// The user's submitted answer (type varies by question type)
	// multiple-choice: Number (option index)
	// true-false: Boolean
	// numeric: Number
	// matching: [{ left: String, right: String }]
	// ordering: [String] (array of item IDs in submitted order)
	answer: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
	},
	question_type: {
		type: String,
		enum: ['multiple-choice', 'true-false', 'numeric', 'matching', 'ordering'],
		required: true,
	},
	is_correct: {
		type: Boolean,
		required: true,
	},
	points_earned: {
		type: Number,
		required: true,
		min: 0,
	},
	points_possible: {
		type: Number,
		required: true,
		min: 0,
	},
	submitted_at: {
		type: Date,
		default: Date.now,
	},
});

// Ensure a user can only answer each question once per training
ResponseSchema.index(
	{ training_id: 1, user_id: 1, round_id: 1, question_id: 1 },
	{ unique: true }
);

// For querying all responses in a training
ResponseSchema.index({ training_id: 1, round_id: 1 });

// For querying a user's responses across trainings
ResponseSchema.index({ user_id: 1, training_id: 1 });

const Response = mongoose.models.Response || mongoose.model('Response', ResponseSchema);

export default Response;
