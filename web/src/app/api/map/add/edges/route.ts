import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const Data = await req.json();

    const { data, error } = await supabase.from("edges").insert([Data]);

    if (error) throw error;

    return NextResponse.json({ message: "edges added successfully!", project: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
