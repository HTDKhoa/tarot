import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_KEY, SUPABASE_URL, supabaseMode } from "@/lib/config";

/** null = chế độ demo có chủ đích. Production thiếu cấu hình thì ném MissingConfigError. */
export async function createClient() {
  if (supabaseMode() === "demo") return null;
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Gọi từ Server Component thì không ghi được cookie; route handler sẽ làm mới phiên.
        }
      },
    },
  });
}

export async function getUser() {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, user: null };
  const { data } = await supabase.auth.getUser();
  return { supabase, user: data.user };
}
