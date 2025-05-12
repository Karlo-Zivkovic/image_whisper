import { NextResponse } from "next/server";
import { dbAdminSupabase } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const { data, error } = await dbAdminSupabase
      .from("chats")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}
