import { supabase } from '../lib/supabase';

export interface SiteContent {
    key: string;
    value: string;
    category: string;
    description?: string;
}

export const ContentService = {
    // Get all content
    async getAllContent(): Promise<SiteContent[]> {
        const { data, error } = await (supabase.from('site_content' as any)
            .select('*')
            .order('key') as any);

        if (error) {
            console.error('Error fetching content:', error);
            return [];
        }

        return data || [];
    },

    // Get single content by key
    async getContent(key: string): Promise<string | null> {
        const { data, error } = await (supabase.from('site_content' as any)
            .select('value')
            .eq('key', key)
            .single() as any);

        if (error) return null;
        return data?.value;
    },

    // Update content
    async updateContent(key: string, value: string): Promise<{ success: boolean; error?: string }> {
        const { error } = await supabase
            .from('site_content' as any)
            .update({ value, updated_at: new Date().toISOString() })
            .eq('key', key);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    },

    // Create new content key (Admin only)
    async createContent(content: SiteContent): Promise<{ success: boolean; error?: string }> {
        const { error } = await supabase
            .from('site_content' as any)
            .insert([content]);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    }
};
