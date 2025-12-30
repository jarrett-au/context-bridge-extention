import OpenAI from 'openai';

export interface AISynthesisOptions {
    apiKey: string;
    baseURL?: string;
    model?: string;
    prompt: string;
    content: string;
}

export async function synthesizeWithAI({ apiKey, baseURL, model = 'gpt-3.5-turbo', prompt, content }: AISynthesisOptions): Promise<string> {
    const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: baseURL,
        dangerouslyAllowBrowser: true 
    });

    try {
        const response = await openai.chat.completions.create({
            model: model,
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that synthesizes information.'
                },
                {
                    role: 'user',
                    content: `${prompt}\n\n---\n\n${content}`
                }
            ]
        });

        return response.choices[0]?.message?.content || '';
    } catch (error) {
        console.error('AI Synthesis failed:', error);
        throw error;
    }
}
