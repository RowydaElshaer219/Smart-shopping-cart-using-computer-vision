import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";

export async function GET(req: NextRequest) {
  try {
 

    // Delete the project from the "projects" table
    const { data, error } = await supabase
      .from("floors")
      .select("*")

    if (error) throw error;

    return NextResponse.json({ message: "point fetched successfully!" , data: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
