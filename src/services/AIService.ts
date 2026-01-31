import { GoogleGenerativeAI } from '@google/generative-ai';

export class AIService {
    private static API_KEY_STORAGE_KEY = 'gemini_api_key';
    private static genAI: GoogleGenerativeAI | null = null;
    private static model: any = null;

    /**
     * Initialize the AI service with an API key
     */
    static initialize(apiKey: string) {
        if (!apiKey) return;

        // Save to local storage for persistence
        try {
            localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
        } catch (e) {
            console.warn('Failed to save API key to localStorage', e);
        }

        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }

    /**
     * Get the stored API key if available
     */
    static getStoredApiKey(): string | null {
        try {
            // First check environment variable (for dev/prod if set)
            if (import.meta.env.VITE_GEMINI_API_KEY) {
                return import.meta.env.VITE_GEMINI_API_KEY;
            }
            return localStorage.getItem(this.API_KEY_STORAGE_KEY);
        } catch (e) {
            return null;
        }
    }

    /**
     * Clear the stored API key
     */
    static clearApiKey() {
        try {
            localStorage.removeItem(this.API_KEY_STORAGE_KEY);
            this.genAI = null;
            this.model = null;
        } catch (e) {
            console.warn('Failed to clear API key from localStorage', e);
        }
    }

    /**
     * Check if the service is ready to use
     */
    static isReady(): boolean {
        // Try to initialize if we have a key but no instance
        if (!this.genAI) {
            const key = this.getStoredApiKey();
            if (key) {
                this.initialize(key);
            }
        }
        return !!this.genAI;
    }

    /**
     * Send a message to the AI with document context
     */
    static async chat(message: string, documentContext: string, history: { role: 'user' | 'model', parts: string }[] = []): Promise<string> {
        if (!this.isReady()) {
            throw new Error('AI Service not initialized. Please provide an API key.');
        }

        try {
            // Convert history format if needed, implementation depends on SDK
            // The SDK uses { role: string, parts: { text: string }[] } format
            const chatHistory = history.map(h => ({
                role: h.role,
                parts: [{ text: h.parts }]
            }));

            const chat = this.model.startChat({
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
${documentContext}
                        ` }]
                    },
                    {
                        role: 'model',
                        parts: [{ text: 'Anlaşıldı. Bu belgeyle ilgili sorularınızı yanıtlamaya ve size yardımcı olmaya hazırım. Size nasıl destek olabilirim?' }]
                    },
                    ...chatHistory
                ],
                generationConfig: {
                    maxOutputTokens: 500,
                },
            });

            const result = await chat.sendMessage(message);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('AI Chat Error:', error);
            throw error;
        }
    }
}
