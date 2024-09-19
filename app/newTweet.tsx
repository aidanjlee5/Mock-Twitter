import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import styles from "./style.module.css";

export default function NewTweet() {
  const addTweet = async (formData: FormData) => {
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

  return (
    <form action={addTweet}>
      <input name="title" className="bg-inherit px-5 py-2 rounded-lg" placeholder="What's on your mind?"/>
      <button type="submit" className="p-2 bg-sky-400 ml-10 border hover:bg-sky-500 rounded-lg">Tweet</button>
    </form>
  );
}