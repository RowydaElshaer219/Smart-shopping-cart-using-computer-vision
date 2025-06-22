import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";

export async function PUT(req: NextRequest) {
  try {
    const updatedData = await req.json(); 
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Project ID is required" });
    }

    // Delete the project from the "projects" table
    const { data, error } = await supabase
      .from("floors")
      .update(updatedData)
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ message: "point Updated successfully!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
