import { GoogleGenerativeAI } from '@google/generative-ai';

// Vercel Serverless Function
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

    if (!API_KEY) {
        console.error('GOOGLE_GEMINI_API_KEY is not set in environment variables');
        res.status(500).json({ error: 'Server configuration error' });
        return;
    }

    try {
        const { message, documentContext, history } = req.body;

        if (!message) {
            res.status(400).json({ error: 'Message is required' });
            return;
        }

        // Initialize Gemini API
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Prepare prompt with context
        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{
                        text: `
Sen bir Osmanlıca belgesi uzmanı ve yardımcı asistansın.
Aşağıda inceliyor olduğum belgenin tam metni (transkripsiyonu) ve latinizasyonu bulunmaktadır.
Kullanıcının bu belgeyle ilgili sorularını yanıtla, kelime anlamlarını açıkla veya modern Türkçeye çevir.
Kısa, net ve eğitici cevaplar ver. Kullanıcı ile Türkçe konuş.

BELGE BAĞLAMI:
${documentContext || 'Bağlam sağlanamadı.'}
                    ` }]
                },
                {
                    role: 'model',
                    parts: [{ text: 'Anlaşıldı. Bu belgeyle ilgili sorularınızı yanıtlamaya ve size yardımcı olmaya hazırım. Size nasıl destek olabilirim?' }]
                },
                ...(history || []).map(h => ({
                    role: h.role,
                    parts: [{ text: h.text }]
                }))
            ],
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ text });
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ error: 'Error processing your request', details: error.message });
    }
}
