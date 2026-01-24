export interface WordCoords {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface WordToken {
    id: string;
    original: string;
    modern: string;
    note?: string;
    coords?: WordCoords;
}

export interface ArchivalDocument {
    id: string;
    title: string;
    date?: string; // Optional for backward compat
    category: string; // Required for admin stats
    description?: string;
    imageUrl: string;
    tokens: WordToken[]; // Required - default to [] if from Supabase
    transcription?: any; // JSONB field from Supabase
    difficulty: 'kolay' | 'orta' | 'zor' | 'Kolay' | 'Orta' | 'Zor'; // Required for admin stats
    year?: number;
}

export const initialDocuments: ArchivalDocument[] = [
    {
        id: '1',
        title: 'Tazminat Talebi Hakkında Arzuhal',
        date: '15 Mayıs 1895',
        category: 'Hukuki',
        description: 'Hasar gören emlak için tazminat talebini içeren resmi dilekçe.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Ottoman_Turkish_petition_1895.jpg/800px-Ottoman_Turkish_petition_1895.jpg',
        tokens: [],
        difficulty: 'Orta',
        year: 1895
    },
    {
        id: '2',
        title: 'Maarif Nezareti Yazışması',
        date: '22 Haziran 1908',
        category: 'Siyasi',
        description: 'Eğitim reformları üzerine nezaret içi yazışma.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Ottoman_official_document.jpg',
        tokens: [],
        difficulty: 'Zor',
        year: 1908
    },
    {
        id: '3',
        title: 'Ömer Seyfettin Mektubu',
        date: '10 Ocak 1915',
        category: 'Edebi',
        description: 'Ömer Seyfettin tarafından yazılmış özel bir mektup.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Omer_Seyfettin_letter.jpg/640px-Omer_Seyfettin_letter.jpg',
        tokens: [],
        difficulty: 'Kolay',
        year: 1915
    }
];
