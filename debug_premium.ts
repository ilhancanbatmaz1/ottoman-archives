
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDocuments() {
    console.log('Checking documents from Supabase...');

    const { data: documents, error } = await supabase
        .from('documents')
        .select('id, title, is_premium, image_url, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching documents:', error);
        return;
    }

    console.log(`Found ${documents.length} documents.`);

    documents.forEach(doc => {
        console.log('------------------------------------------------');
        console.log(`ID: ${doc.id}`);
        console.log(`Title: ${doc.title}`);
        console.log(`Is Premium (DB): ${doc.is_premium}`);
        console.log(`Image URL: ${doc.image_url}`);

        // Validation check
        if (doc.is_premium && !doc.image_url) {
            console.error('!!! CRITICAL: Premium doc missing image URL');
        }
    });
}

checkDocuments();
