import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers';
import Tweets from "../../tweets";
import { MouseEventHandler } from 'react';
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

    const editBio = async (formData: FormData) => {
      "use server";
      const title = String(formData.get("title"));
      const supabase = createServerActionClient<Database>({ cookies });
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("tweets").insert({ title, user_id: user.id });
      }
    };


      if (profile?.id && profile.id == session?.user.id) {
        <form action={editBio}>
          <input name="title" className="bg-inherit px-5 py-2 rounded-lg" placeholder="What's on your mind?" />
          <button type="submit" className="p-2 bg-sky-400 ml-10 border hover:bg-sky-500 rounded-lg">Tweet</button>
        </form>
      }

    console.log(profileError, profile);

  if (profileError || !profile) {
    return redirect('/'); // Redirect to the homepage if there's an error or no profile found
  }

  const { data: tweetData, error: tweetError } = await supabase
    .from('tweets')
    .select('*, id: profiles(*), likes(*)')
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
      author: Array.isArray(tweet.id) ? tweet.id[0] : tweet.id,
      user_has_liked_tweet: !!tweet.likes.find((like) => like.user_id === session?.user.id),
      likes: tweet.likes.length,
    })) ?? [];

  return (

    <div className="mx-auto flex justify-center min-h-screen">
    <div className="container p-4">
        <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-white mr-5"></div>
            <div>
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <p className="text-gray-600">@{profile.username}</p>
                {/* {profile?.id && profile.id == session?.user.id && (
                //   <button onClick={editBio as MouseEventHandler<HTMLButtonElement> | undefined} className="p-2 bg-sky-400 ml-10 border hover:bg-sky-500 rounded-lg">Edit Bio</button>
                )} */}
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
</div>

  );
}
