import bcrypt from 'bcrypt';

async function generateHashes() {
    const admin123Hash = await bcrypt.hash('admin123', 10);
    const user123Hash = await bcrypt.hash('user123', 10);
    
    console.log('admin123 hash:', admin123Hash);
    console.log('user123 hash:', user123Hash);
}

generateHashes();