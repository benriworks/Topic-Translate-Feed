import { NextRequest, NextResponse } from 'next/server';
import { createGenericServerSupabaseClient } from '@/lib/supabase/server';
import { fetchTweetsForTopic } from '@/lib/twitter';
import { translateToEnglish } from '@/lib/translate';
import { Topic, Post, PostInsert, PostUpdate, TopicPostInsert, TopicUpdate } from '@/types';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * POST /api/admin/topics/[slug]/sync
 * Sync tweets for a specific topic from X API
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

  // Authentication check - if ADMIN_API_KEY is set, require it
  const adminApiKey = process.env.ADMIN_API_KEY;
  if (adminApiKey) {
    const requestApiKey = request.headers.get('X-API-Key');
    if (!requestApiKey || requestApiKey !== adminApiKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    // Note: Using createGenericServerSupabaseClient() because manual Database types
    // don't fully integrate with supabase-js type inference. The double type assertions
    // (as unknown as Type) are necessary but the data is properly validated at runtime.
    const supabase = createGenericServerSupabaseClient();

    // 1. Get topic by slug
    const { data: topicData, error: topicError } = await supabase
      .from('topics')
      .select('*')
      .eq('slug', slug)
      .single();

    if (topicError || !topicData) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    const topic = topicData as unknown as Topic;

    // 2. Fetch tweets from X API
    const rawTweets = await fetchTweetsForTopic(topic);

    if (rawTweets.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new tweets found',
        syncedCount: 0,
      });
    }

    // 3. Process each tweet
    let syncedCount = 0;
    let latestTweetId = topic.latest_twitter_post_id;

    for (const tweet of rawTweets) {
      // Check if this is a newer tweet
      if (!latestTweetId || tweet.id > latestTweetId) {
        latestTweetId = tweet.id;
      }

      // 3a. Upsert post into posts table
      const { data: existingPostData } = await supabase
        .from('posts')
        .select('id, translated_text_en')
        .eq('twitter_post_id', tweet.id)
        .single();

      const existingPost = existingPostData as unknown as Pick<Post, 'id' | 'translated_text_en'> | null;

      let postId: string;
      let needsTranslation = false;

      if (existingPost) {
        // Update existing post
        postId = existingPost.id;
        needsTranslation = !existingPost.translated_text_en;

        const updateData: PostUpdate = {
          original_text: tweet.text,
          author_name: tweet.author.name,
          author_username: tweet.author.username,
          author_profile_image_url: tweet.author.profile_image_url,
          like_count: tweet.public_metrics.like_count,
          retweet_count: tweet.public_metrics.retweet_count,
          reply_count: tweet.public_metrics.reply_count,
          updated_at: new Date().toISOString(),
        };

        await supabase
          .from('posts')
          .update(updateData)
          .eq('id', postId);
      } else {
        // Insert new post
        needsTranslation = true;

        const insertData: PostInsert = {
          twitter_post_id: tweet.id,
          author_id: tweet.author.id,
          author_name: tweet.author.name,
          author_username: tweet.author.username,
          author_profile_image_url: tweet.author.profile_image_url,
          original_text: tweet.text,
          tweeted_at: tweet.created_at,
          like_count: tweet.public_metrics.like_count,
          retweet_count: tweet.public_metrics.retweet_count,
          reply_count: tweet.public_metrics.reply_count,
        };

        const { data: newPostData, error: insertError } = await supabase
          .from('posts')
          .insert(insertData)
          .select('id')
          .single();

        if (insertError || !newPostData) {
          console.error('Error inserting post:', insertError);
          continue;
        }

        const newPost = newPostData as unknown as Pick<Post, 'id'>;
        postId = newPost.id;
        syncedCount++;
      }

      // 3b. Translate if needed
      if (needsTranslation) {
        try {
          const translatedText = await translateToEnglish(tweet.text);
          const translationUpdate: PostUpdate = { translated_text_en: translatedText };
          await supabase
            .from('posts')
            .update(translationUpdate)
            .eq('id', postId);
        } catch (translateError) {
          console.error('Error translating tweet:', translateError);
          // Continue without translation - don't fail the whole sync
        }
      }

      // 3c. Create topic_post relationship if not exists
      const { data: existingRelationData } = await supabase
        .from('topic_posts')
        .select('id')
        .eq('topic_id', topic.id)
        .eq('post_id', postId)
        .single();

      if (!existingRelationData) {
        const relationData: TopicPostInsert = {
          topic_id: topic.id,
          post_id: postId,
        };
        await supabase
          .from('topic_posts')
          .insert(relationData);
      }
    }

    // 4. Update topic's latest_twitter_post_id
    if (latestTweetId && latestTweetId !== topic.latest_twitter_post_id) {
      const topicUpdate: TopicUpdate = { latest_twitter_post_id: latestTweetId };
      await supabase
        .from('topics')
        .update(topicUpdate)
        .eq('id', topic.id);
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${syncedCount} new tweets`,
      syncedCount,
      totalProcessed: rawTweets.length,
      latestTweetId,
    });
  } catch (error) {
    console.error('Error syncing topic:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
