
import { DocumentService } from './src/services/DocumentService';
import { AuthService } from './src/services/AuthService';

async function test() {
    console.log('Testing Document Fetching...');

    // 1. Check Auth Mode
    const mode = AuthService.getAuthMode();
    console.log('Auth Mode:', mode);

    // 2. Fetch All Documents
    try {
        const docs = await DocumentService.getAll();
        console.log(`Fetched ${docs.length} documents.`);
        docs.forEach(d => {
            console.log(`- [${d.id}] ${d.title} (Diff: ${d.difficulty})`);
        });
    } catch (e) {
        console.error('Error fetching documents:', e);
    }
}

test();
