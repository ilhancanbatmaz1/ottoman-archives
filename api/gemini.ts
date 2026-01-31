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
        // Use a model that supports JSON mode well if available, otherwise flash is fine with good prompting
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                responseMimeType: req.body.mode === 'quiz' ? 'application/json' : 'text/plain'
            }
        });

        const isQuizMode = req.body.mode === 'quiz';

        let systemInstruction = `
Sen bir Osmanlıca belgesi uzmanı ve yardımcı asistanısın (Adın: Mr. Osmanlıca).
Aşağıda inceliyor olduğum belgenin tam metni (transkripsiyonu) ve latinizasyonu bulunmaktadır.
Kullanıcının bu belgeyle ilgili sorularını yanıtla, kelime anlamlarını açıkla veya modern Türkçeye çevir.
Kısa, net ve eğitici cevaplar ver. Kullanıcı ile Türkçe konuş.

BELGE BAĞLAMI:
${documentContext || 'Bağlam sağlanamadı.'}
        `;

        if (isQuizMode) {
            systemInstruction += `
            
ÖNEMLİ GÖREV: Kullanıcı bu belgeyle ilgili bir test (quiz) istiyor.
Bana bu belgeyle ilgili 3 adet çoktan seçmeli soru hazırla.
Sorular belgenin içeriği, kelime anlamları veya dilbilgisi hakkında olabilir.
Çıktın SADECE ve SADECE aşağıdaki formatta geçerli bir JSON dizisi olmalıdır:

[
  {
    "question": "Soru metni buraya",
    "options": ["A şıkkı", "B şıkkı", "C şıkkı", "D şıkkı"],
    "correctAnswer": 0 (Doğru şıkkın indeksi: 0, 1, 2 veya 3),
    "explanation": "Neden doğru olduğuna dair kısa açıklama"
  },
  ...
]
            `;
        }

        // Prepare prompt with context
        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: systemInstruction }]
                },
                {
                    role: 'model',
                    parts: [{ text: isQuizMode ? '[]' : 'Anlaşıldı. Bu belgeyle ilgili sorularınızı yanıtlamaya ve size yardımcı olmaya hazırım. Size nasıl destek olabilirim?' }]
                },
                ...(history || []).map(h => ({
                    role: h.role,
                    parts: [{ text: h.text }]
                }))
            ],
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
