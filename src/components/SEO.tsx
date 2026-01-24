import { useEffect } from 'react';

interface SEOProps {
    title: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article';
}

export const SEO = ({
    title,
    description = "Osmanlı arşiv belgelerini okumayı öğrenin. Fermanlar, beratlar ve tarihi belgeler üzerinde interaktif pratik yapın.",
    keywords = "osmanlıca, arşiv, belge okuma, tarih, ferman, berat, pratik",
    image = "/og-image.jpg",
    url,
    type = 'website'
}: SEOProps) => {
    const siteTitle = "Osmanlıca Okuma Yardımcısı";
    const fullTitle = `${title} | ${siteTitle}`;

    useEffect(() => {
        // Update Title
        document.title = fullTitle;

        // Update Meta Tags
        const updateMeta = (name: string, content: string) => {
            let element = document.querySelector(`meta[name="${name}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute('name', name);
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        const updateOgMeta = (property: string, content: string) => {
            let element = document.querySelector(`meta[property="${property}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute('property', property);
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        updateMeta('description', description);
        updateMeta('keywords', keywords);

        updateOgMeta('og:title', fullTitle);
        updateOgMeta('og:description', description);
        updateOgMeta('og:type', type);
        if (image) updateOgMeta('og:image', image);
        if (url) updateOgMeta('og:url', url);

        // Cleanup on unmount (optional, usually we want to keep last set title)
    }, [fullTitle, description, keywords, image, url, type]);

    return null;
};
