import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Tweets from "../../tweets";
import AuthButtonServer from "./../../authButtonServer";

interface UserProfile {
  id: string;
  name: string;
  username: string;
  bio: string;
  avatar_url: string;
}

interface UserProfilePageProps {
  params: {
    username: string;
  };
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { username } = params;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, name, username, bio')
    .eq('username', username)
    .single();

    if (profile !=null){
        console.log(profile.id)
        console.log(profile.name)
        console.log(profile.username)
        console.log(profile.bio)
    }
    

    console.log(profileError, profile);

  if (profileError || !profile) {
    return redirect('/'); // Redirect to the homepage if there's an error or no profile found
  }

  const { data: tweetData, error: tweetError } = await supabase
    .from('tweets')
    .select('*, author: profiles(*), likes(*)')
    .eq('id', profile.id); // Filter tweets by the user's ID

    if (tweetData !=null){
        console.log(tweetData)
    }

  if (tweetError) {
    console.error('Error fetching tweets:', tweetError);
  }

  // Provide a default bio if none is available
  profile.bio = profile.bio || 'No bio provided';

  const tweets =
    tweetData?.map((tweet) => ({
      ...tweet,
      author: Array.isArray(tweet.author) ? tweet.author[0] : tweet.author,
      user_has_liked_tweet: !!tweet.likes.find((like) => like.user_id === session?.user.id),
      likes: tweet.likes.length,
    })) ?? [];

  return (
    <div className="container mx-auto p-4 justify-center">
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 rounded-full bg-white mr-5"></div>
        <div>
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          <p className="text-gray-600">@{profile.username}</p>
          <p className="mt-2">{profile.bio}</p>
        </div>
      </div>
      {/* Render the user's tweets */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Tweets</h2>
        {tweets.length > 0 ? (
          <Tweets tweets={tweets} />
        ) : (
          <p>No tweets found</p>
        )}
      </div>
    </div>
  );
}
