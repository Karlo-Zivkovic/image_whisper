import { NextResponse } from "next/server";
import { dbAdminSupabase } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const body = await request.json();
    const now = new Date().toISOString();

    // Update chat
    const { data, error } = await dbAdminSupabase
      .from("chats")
      .update({
        ...body,
        updated_at: now,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to update chat" },
      { status: 500 }
    );
  }
}
