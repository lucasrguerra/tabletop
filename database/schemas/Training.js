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
		category_id: {
			type: String,
			required: true,
		},
		type_id: {
			type: String,
			required: true,
		},
		scenario_id: {
			type: String,
			required: true,
		},
		scenario_title: {
			type: String,
			required: true,
		},
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
		max: 100,
	},
	
	// Timer management
	timer: {
		// Timestamp of when the timer started the current count
		// Used as "instant 0" for synchronization between clients
		start_time: {
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
		
		// Timestamp of when the current pause started
		// Used to track how long it has been paused (for statistics)
		pause_start: {
			type: Date,
			default: null,
		},
	},
	
	// Training status
	status: {
		type: String,
		enum: ['scheduled', 'active', 'paused', 'completed', 'cancelled'],
		default: 'scheduled',
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
			default: Date.now,
		},
		role: {
			type: String,
			enum: ['facilitator', 'participant', 'observer'],
			default: 'participant',
		},
	}],
	
	// Timestamps
	created_at: {
		type: Date,
		default: Date.now,
		index: true,
	},
	scheduled_for: {
		type: Date,
		default: null,
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
TrainingSchema.index({ 'scenario.category_id': 1, 'scenario.type_id': 1 });

/**
 * Method to start the timer
 */
TrainingSchema.methods.startTimer = function() {
	this.timer.start_time = new Date();
	this.timer.is_paused = false;
	this.timer.pause_start = null;
	
	if (this.status === 'scheduled') {
		this.status = 'active';
		this.started_at = new Date();
	}
	
	return this.save();
};

/**
 * Method to pause the timer
 */
TrainingSchema.methods.pauseTimer = function() {
	if (!this.timer.is_paused && this.timer.start_time) {
		// Acumula o tempo decorrido desde o último start_time
		const now = new Date();
		const elapsed = now.getTime() - this.timer.start_time.getTime();
		this.timer.elapsed_time += elapsed;
		
		// Marca como pausado
		this.timer.is_paused = true;
		this.timer.pause_start = now;
		
		this.status = 'paused';
	}
	
	return this.save();
};

/**
 * Method to resume the timer
 */
TrainingSchema.methods.resumeTimer = function() {
	if (this.timer.is_paused) {
		const now = new Date();
		
		// Restart the timer
		this.timer.start_time = now;
		this.timer.is_paused = false;
		this.timer.pause_start = null;
		this.status = 'active';
	}
	
	return this.save();
};

/**
 * Method to reset the timer
 */
TrainingSchema.methods.resetTimer = function() {
	this.timer.start_time = null;
	this.timer.elapsed_time = 0;
	this.timer.is_paused = true;
	this.timer.pause_start = null;
	
	return this.save();
};

/**
 * Method to get the current timer time (in milliseconds)
 * This method can be used by all clients to synchronize
 */
TrainingSchema.methods.getCurrentTime = function() {
	if (this.timer.is_paused) {
		return this.timer.elapsed_time;
	} else if (this.timer.start_time) {
		const now = Date.now();
		const current_elapsed = now - this.timer.start_time.getTime();
		return this.timer.elapsed_time + current_elapsed;
	}
	return 0;
};

/**
 * Method to get complete timer information for synchronization
 */
TrainingSchema.methods.getTimerSync = function() {
	return {
		start_time: this.timer.start_time ? this.timer.start_time.getTime() : null,
		elapsed_time: this.timer.elapsed_time,
		is_paused: this.timer.is_paused,
		current_time: this.getCurrentTime(),
		server_time: Date.now(), // For clock difference adjustment
	};
};

const Training = mongoose.models.Training || mongoose.model('Training', TrainingSchema);

export default Training;
