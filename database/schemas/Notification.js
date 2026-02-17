import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
	user_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		index: true,
	},
	type: {
		type: String,
		enum: ['invite_received', 'invite_accepted', 'invite_declined'],
		required: true,
	},
	title: {
		type: String,
		required: true,
		maxlength: 200,
	},
	message: {
		type: String,
		required: true,
		maxlength: 500,
	},
	// Reference to the related training
	training_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Training',
		default: null,
	},
	// Additional metadata (e.g., who sent the invite, role assigned)
	metadata: {
		type: mongoose.Schema.Types.Mixed,
		default: {},
	},
	is_read: {
		type: Boolean,
		default: false,
		index: true,
	},
	created_at: {
		type: Date,
		default: Date.now,
		index: true,
	},
});

// Composite index for fetching user notifications efficiently
NotificationSchema.index({ user_id: 1, is_read: 1, created_at: -1 });

const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

export default Notification;
