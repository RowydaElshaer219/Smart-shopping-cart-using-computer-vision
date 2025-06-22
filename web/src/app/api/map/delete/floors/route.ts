import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Project ID is required" });
    }

    // Delete the project from the "projects" table
    const { data, error } = await supabase.from("floors").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ message: "Floor deleted successfully!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
