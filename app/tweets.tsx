"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Likes from "./likes";
import { useEffect, useOptimistic } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Import Link component from Next.js
import styles from "./style.module.css"; // Import the styles for the profile button

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

  const handleProfileClick = (username: string) => {
    router.push(`/profile/${username}`);
  };

  return reversedOptimisticTweets.map((tweet) => (
    <div key={tweet.id} className="px-4 py-8 flex">
      <span className="cursor-pointer" onClick={() => handleProfileClick(tweet.author.username)}>  
        <div className="h-12 w-12 rounded-full bg-white mr-5"></div>
      </span>
      <div>
        <p>
          <span
            className="font-bold mr-2 cursor-pointer"
            onClick={() => handleProfileClick(tweet.author.username)}
          >
            {tweet.author.name}
          </span>
          <span
            className="text-xs cursor-pointer"
            onClick={() => handleProfileClick(tweet.author.username)}
          >
            {tweet.author.username}
          </span>
        </p>
        <p>{tweet.title}</p>
        <span className="text-xs">
          <Likes tweet={tweet} addOptimisticTweet={addOptimisticTweet} />
        </span>
      </div>
    </div>
  ));
}
