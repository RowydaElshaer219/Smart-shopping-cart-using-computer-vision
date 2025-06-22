import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const Data = await req.json();

    const { data, error } = await supabase.from("floors").insert([Data]);

    if (error) throw error;

    return NextResponse.json({ message: "floors added successfully!", data: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
