export type NewsArticle = {
    date: string;
    title: string;
    thumbnail_url?: string;
    thumbnail_alt?: string;
    thumbnail_caption?: string;
    tags?: string[];
    short_description?: string;
    content: string;
};
