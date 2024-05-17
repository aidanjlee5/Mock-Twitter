import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import AuthButtonServer from "./authButtonServer";
import { redirect } from "next/navigation";
import NewTweet from "./newTweet";
import Tweets from "./tweets";
import Link from "next/link"; // Import Link component from Next.js
import styles from "./style.module.css";

export default async function Home() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: tweetData } = await supabase
    .from("tweets")
    .select("*, author: profiles(*), likes(*)");

  const tweets =
    tweetData?.map((tweet) => ({
      ...tweet,
      author: Array.isArray(tweet.author) ? tweet.author[0] : tweet.author,
      user_has_liked_tweet: !!tweet.likes.find(
        (like) => like.user_id === session.user.id
      ),
      likes: tweet.likes.length,
    })) ?? [];

  const ProfileButton = ({ authorId }: { authorId: string }) => (
    <Link href={`/profile/${authorId}`}>
      <a className={styles.profileButton}>View Profile</a>
    </Link>
  );

  return (
    <div className="w-full max-w-xl mx-auto content-stretch">
      <div className="flex justify-between px-4 py-6">
        <h1 className="text-5xl">Twitter</h1>
        <AuthButtonServer />
      </div>

      <div className="p-10">
        <NewTweet/>
      </div>

      <div className="p-10">
        <Tweets tweets={tweets} />
      </div>
      
      
    </div>
  );
}
