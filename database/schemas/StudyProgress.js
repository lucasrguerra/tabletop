import mongoose from 'mongoose';

const ReadEventSchema = new mongoose.Schema({
    article_id: { type: String, required: true },
    category: { type: String, required: true, index: true },
    content_type: {
        type: String,
        enum: ['CONCEITO', 'PROCEDIMENTO', 'FERRAMENTA', 'GLOSSARIO'],
        required: true
    },
    first_read_at: { type: Date, default: Date.now },
    last_read_at: { type: Date, default: Date.now },
    read_count: { type: Number, default: 1, min: 1 },
    completed: { type: Boolean, default: false },
    completed_at: { type: Date, default: null }
}, { _id: false });

const StudyProgressSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    articles: [ReadEventSchema],
    total_read: { type: Number, default: 0 },
    total_completed: { type: Number, default: 0 },
    last_activity_at: { type: Date, default: null }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

StudyProgressSchema.index({ user_id: 1, 'articles.article_id': 1 });
StudyProgressSchema.index({ user_id: 1, 'articles.category': 1 });

export default mongoose.models.StudyProgress || mongoose.model('StudyProgress', StudyProgressSchema);
