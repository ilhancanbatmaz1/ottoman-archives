// Client-side service that communicates with our backend API
// This avoids exposing API keys in the client

export class AIService {
    /**
     * Send a message to the AI via our backend proxy
     */
    static async chat(message: string, documentContext: string, history: { role: 'user' | 'model', text: string }[] = []): Promise<string> {
        try {
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    documentContext,
                    history
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Server error');
            }

            const data = await response.json();
            return data.text;
        } catch (error) {
            console.error('AI Service Error:', error);
            throw error;
        }
    }
}
