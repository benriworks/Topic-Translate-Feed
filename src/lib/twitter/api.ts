import { Topic } from '@/types/database';

// Raw tweet structure from X API
export interface RawTweet {
  id: string;
  text: string;
  created_at: string;
  author: {
    id: string;
    name: string;
    username: string;
    profile_image_url: string | null;
  };
  public_metrics: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
  };
}

/**
 * Fetch tweets for a specific topic from X API (Recent Search)
 * This is an abstraction function that can be replaced with actual X API implementation
 *
 * @param topic - The topic containing search query and latest_twitter_post_id
 * @returns Array of raw tweets from X API
 */
export async function fetchTweetsForTopic(topic: Topic): Promise<RawTweet[]> {
  // Get X API credentials from environment variables
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;

  if (!bearerToken) {
    console.warn('TWITTER_BEARER_TOKEN not set. Using mock data.');
    return getMockTweets(topic);
  }

  try {
    // Build query parameters
    const params = new URLSearchParams({
      query: topic.query,
      'tweet.fields': 'created_at,public_metrics',
      'user.fields': 'name,username,profile_image_url',
      expansions: 'author_id',
      max_results: '100',
    });

    // Add since_id if we have a latest tweet ID for incremental fetching
    if (topic.latest_twitter_post_id) {
      params.append('since_id', topic.latest_twitter_post_id);
    }

    const response = await fetch(
      `https://api.twitter.com/2/tweets/search/recent?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`X API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // If no data, return empty array
    if (!data.data || !data.includes?.users) {
      return [];
    }

    // Map users by ID for easy lookup
    const usersById = new Map<string, { id: string; name: string; username: string; profile_image_url: string | null }>();
    for (const user of data.includes.users) {
      usersById.set(user.id, {
        id: user.id,
        name: user.name,
        username: user.username,
        profile_image_url: user.profile_image_url || null,
      });
    }

    // Transform API response to RawTweet format
    const tweets: RawTweet[] = data.data.map((tweet: { id: string; text: string; created_at: string; author_id: string; public_metrics: { like_count: number; retweet_count: number; reply_count: number } }) => {
      const author = usersById.get(tweet.author_id) || {
        id: tweet.author_id,
        name: 'Unknown',
        username: 'unknown',
        profile_image_url: null,
      };

      return {
        id: tweet.id,
        text: tweet.text,
        created_at: tweet.created_at,
        author,
        public_metrics: tweet.public_metrics || {
          like_count: 0,
          retweet_count: 0,
          reply_count: 0,
        },
      };
    });

    return tweets;
  } catch (error) {
    console.error('Error fetching tweets from X API:', error);
    throw error;
  }
}

/**
 * Mock tweets for development/testing when X API is not available
 */
function getMockTweets(topic: Topic): RawTweet[] {
  const now = new Date();
  return [
    {
      id: `mock_${Date.now()}_1`,
      text: `これは「${topic.name}」に関するモックツイートです。実際のX APIが利用可能になると、本物のツイートが表示されます。`,
      created_at: now.toISOString(),
      author: {
        id: 'mock_user_1',
        name: 'テストユーザー',
        username: 'test_user',
        profile_image_url: null,
      },
      public_metrics: {
        like_count: 10,
        retweet_count: 5,
        reply_count: 2,
      },
    },
    {
      id: `mock_${Date.now()}_2`,
      text: `${topic.name}についての最新情報をお届けします。これはテスト用のサンプルツイートです。`,
      created_at: new Date(now.getTime() - 60000).toISOString(),
      author: {
        id: 'mock_user_2',
        name: 'サンプルアカウント',
        username: 'sample_account',
        profile_image_url: null,
      },
      public_metrics: {
        like_count: 25,
        retweet_count: 10,
        reply_count: 5,
      },
    },
  ];
}
