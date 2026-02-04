import mongoose from 'mongoose';

const TrainingSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		maxlength: 200,
		index: true,
	},
	description: {
		type: String,
		maxlength: 1000,
	},
	created_by: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		index: true,
	},
	scenario: {
		id: {
			type: String,
			required: true,
		},
		category: {
			type: String,
			required: true,
			index: true,
		},
		type: {
			type: String,
			required: true,
			index: true,
		},
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		}
	},
	access_type: {
		type: String,
		enum: ['open', 'code'],
		default: 'open',
		required: true,
	},
	access_code: {
		type: String,
		maxlength: 20,
		required: function() {
			return this.access_type === 'code';
		},
	},
	max_participants: {
		type: Number,
		default: 15,
		min: 1,
		max: 500,
	},
	
	// Timer management
	timer: {
		started_at: {
			type: Date,
			default: null,
		},
		
		// Total time accumulated before pauses (in milliseconds)
		// When paused, this value is updated with the total time up to the pause moment
		elapsed_time: {
			type: Number,
			default: 0,
			min: 0,
		},
		
		// Current state of the timer
		is_paused: {
			type: Boolean,
			default: true, // Starts paused
		},
	},
	
	// Training status
	status: {
		type: String,
		enum: ['not_started', 'active', 'paused', 'completed'],
		default: 'not_started',
		index: true,
	},
	
	// Participants
	participants: [{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		joined_at: {
			type: Date,
			default: null,
		},
		role: {
			type: String,
			enum: ['facilitator', 'participant', 'observer'],
			default: 'participant',
		},
		status: {
			type: String,
			enum: ['pending', 'accepted', 'declined'],
			default: 'pending',
		}
	}],
	
	// Timestamps
	created_at: {
		type: Date,
		default: Date.now,
		index: true,
	},
	started_at: {
		type: Date,
		default: null,
	},
	completed_at: {
		type: Date,
		default: null,
	},
});

// Composite indices for frequent queries
TrainingSchema.index({ created_by: 1, status: 1 });
TrainingSchema.index({ 'scenario.category': 1, 'scenario.type': 1 });

const Training = mongoose.models.Training || mongoose.model('Training', TrainingSchema);

export default Training;
