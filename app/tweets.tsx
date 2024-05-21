"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Likes from "./likes";
import { useEffect, useOptimistic } from "react";
import { useRouter } from "next/navigation";

export default function Tweets({ tweets }: { tweets: TweetWithAuthor[] }) {
  const [optimisticTweets, addOptimisticTweet] = useOptimistic<
    TweetWithAuthor[],
    TweetWithAuthor
  >(tweets, (currentOptimisticTweets, newTweet) => {
    const newOptimisticTweets = [...currentOptimisticTweets];
    const index = newOptimisticTweets.findIndex(
      (tweet) => tweet.id === newTweet.id
    );
    newOptimisticTweets[index] = newTweet;
    return newOptimisticTweets;
  });

  // Reverse the order of tweets so that new tweets appear at the top
  const reversedOptimisticTweets = [...optimisticTweets].reverse();

  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel("realtime tweets")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tweets",
        },
        (payload) => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  return reversedOptimisticTweets.map((tweet) => (
    <div key={tweet.id} className="px-4 py-8 flex">
      <div className="h-12 w-12 rounded-full bg-white mr-5"></div>
      <div>
      <p>
        <span className="font-bold mr-2">
        {tweet.author.name} 
        </span>
        
        <span className="text-xs">{tweet.author.username}</span>
        
      </p>
      <p>{tweet.title}</p>
      <span className="text-xs"><Likes tweet={tweet} addOptimisticTweet={addOptimisticTweet} /></span>
      
    </div>
    </div>
  ));
}