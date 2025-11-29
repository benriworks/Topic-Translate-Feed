import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/topics
 * List all topics for admin management
 */
export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    const { data: topics, error } = await supabase
      .from('topics')
      .select('id, slug, name, query, latest_twitter_post_id')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ topics: topics || [] });
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topics', details: String(error) },
      { status: 500 }
    );
  }
}
