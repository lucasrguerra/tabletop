import mongoose from 'mongoose';

let errors = [];
if (!process.env.DATABASE_USER) { errors.push('DATABASE_USER'); }
if (!process.env.DATABASE_PASSWORD) { errors.push('DATABASE_PASSWORD'); }
if (!process.env.DATABASE_URI) { errors.push('DATABASE_URI'); }
if (!process.env.DATABASE_NAME) { errors.push('DATABASE_NAME'); }

if (errors.length > 0) {
    throw new Error(`The following environment variables are missing to connect to the MongoDB database: ${errors.join(', ')}`);
}

const URI = `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_URI}/${process.env.DATABASE_NAME}?retryWrites=true&w=majority`;
mongoose.set('strictQuery', false);
let is_connected = false;

async function connectDatabase() {
    if (is_connected && mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    try {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        await mongoose.connect(URI, opts);
        
        is_connected = true;
        mongoose.connection.on('connected', () => { is_connected = true; });
        mongoose.connection.on('error', (err) => { is_connected = false; });
        mongoose.connection.on('disconnected', () => { is_connected = false; });

        return mongoose.connection;

    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        is_connected = false;
        throw error;
    }
}

export default connectDatabase;
