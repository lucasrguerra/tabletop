import mongoose from 'mongoose';

let URI;
if (process.env.MONGODB_URI) {
    URI = process.env.MONGODB_URI;
} else {
    URI = `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_URI}/${process.env.DATABASE_NAME}?retryWrites=true&w=majority`;
}

mongoose.set('strictQuery', false);

// Schema simplificado apenas com os campos necessários pra essa operação
const UserSchema = new mongoose.Schema({
    nickname: { type: String, required: true },
    facilitator: { type: Boolean, default: false }
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function removeFacilitator() {
    const args = process.argv.slice(2);
    if (args.length !== 1) {
        console.error('Uso: node remove-facilitator.mjs <nickname>');
        process.exit(1);
    }
    const nickname = args[0].toLowerCase().trim();

    try {
        await mongoose.connect(URI);
        const user = await User.findOne({ nickname });
        
        if (!user) {
            console.error(`Erro: Usuário com nickname '${nickname}' não encontrado.`);
            process.exit(1);
        }

        if (!user.facilitator) {
            console.log(`O usuário '${nickname}' já não é um facilitador.`);
            process.exit(0);
        }

        user.facilitator = false;
        await user.save();
        
        console.log(`Sucesso: '${nickname}' não é mais um facilitador!`);
        process.exit(0);
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        process.exit(1);
    }
}

removeFacilitator();
