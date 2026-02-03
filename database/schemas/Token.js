import mongoose from 'mongoose';

const TokenSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    token_hash: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    token_id: {
        type: String,
        required: true,
        index: true,
    },
    expires_at: {
        type: Date,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
        index: true,
    },
    user_agent: {
        type: String,
        maxlength: 500,
    },
    ip_address: {
        type: String,
        maxlength: 45,
    },
});

// Index TTL to automatically delete expired tokens
TokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

const Token = mongoose.models.Token || mongoose.model('Token', TokenSchema);

export default Token;
