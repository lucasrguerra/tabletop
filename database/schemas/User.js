import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true,
        maxlength: 100,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
        maxlength: 100,
    },
    nickname: {
        type: String,
        required: true,
        unique: true,
        index: true,
        maxlength: 30,
    },
    password_hash: {
        type: String,
        required: true,
        maxlength: 255,
        select: false,
    },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;