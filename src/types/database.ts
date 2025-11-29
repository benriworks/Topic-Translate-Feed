// Supabase Database Type Definitions

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      topics: {
        Row: {
          id: string;
          slug: string;
          name: string;
          query: string;
          latest_twitter_post_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          query: string;
          latest_twitter_post_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          query?: string;
          latest_twitter_post_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          twitter_post_id: string;
          author_id: string;
          author_name: string;
          author_username: string;
          author_profile_image_url: string | null;
          original_text: string;
          translated_text_en: string | null;
          tweeted_at: string;
          like_count: number;
          retweet_count: number;
          reply_count: number;
          is_deleted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          twitter_post_id: string;
          author_id: string;
          author_name: string;
          author_username: string;
          author_profile_image_url?: string | null;
          original_text: string;
          translated_text_en?: string | null;
          tweeted_at: string;
          like_count?: number;
          retweet_count?: number;
          reply_count?: number;
          is_deleted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          twitter_post_id?: string;
          author_id?: string;
          author_name?: string;
          author_username?: string;
          author_profile_image_url?: string | null;
          original_text?: string;
          translated_text_en?: string | null;
          tweeted_at?: string;
          like_count?: number;
          retweet_count?: number;
          reply_count?: number;
          is_deleted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      topic_posts: {
        Row: {
          id: string;
          topic_id: string;
          post_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          topic_id: string;
          post_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          topic_id?: string;
          post_id?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Helper types for easier use
export type Topic = Database['public']['Tables']['topics']['Row'];
export type TopicInsert = Database['public']['Tables']['topics']['Insert'];
export type TopicUpdate = Database['public']['Tables']['topics']['Update'];

export type Post = Database['public']['Tables']['posts']['Row'];
export type PostInsert = Database['public']['Tables']['posts']['Insert'];
export type PostUpdate = Database['public']['Tables']['posts']['Update'];

export type TopicPost = Database['public']['Tables']['topic_posts']['Row'];
export type TopicPostInsert = Database['public']['Tables']['topic_posts']['Insert'];
export type TopicPostUpdate = Database['public']['Tables']['topic_posts']['Update'];

// Post with topic information for timeline display
export type PostWithTopic = Post & {
  topic_posts?: TopicPost[];
};
