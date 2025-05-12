import { NextResponse } from "next/server";
import { dbAdminSupabase } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chatIdParam = searchParams.get("chatId");

    if (!chatIdParam) {
      return NextResponse.json(
        { error: "Chat ID is required" },
        { status: 400 }
      );
    }

    const chatId = parseInt(chatIdParam, 10);

    const { data, error } = await dbAdminSupabase
      .from("responses")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch responses" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.chat_id) {
      return NextResponse.json(
        { error: "Chat ID is required" },
        { status: 400 }
      );
    }

    if (!body.image_url || !Array.isArray(body.image_url)) {
      return NextResponse.json(
        { error: "Image URL array is required" },
        { status: 400 }
      );
    }

    // Insert the response
    const { data, error } = await dbAdminSupabase
      .from("responses")
      .insert(body)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update the associated chat
    await dbAdminSupabase
      .from("chats")
      .update({
        updated_at: new Date().toISOString(),
        status: "completed",
      })
      .eq("id", body.chat_id);

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to create response" },
      { status: 500 }
    );
  }
}
