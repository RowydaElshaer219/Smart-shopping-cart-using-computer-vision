import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";

export async function DELETE(req: NextRequest) {
  try {
    const { floor_id, id } = await req.json(); // Get the projectId from the request query params

    const Id = id.id;
    if (!Id) {
      return NextResponse.json({ error: "Project ID is required" });
    }

    // Delete the project from the "projects" table
    const { data, error } = await supabase
      .from("edges")
      .delete()
      .eq("id", Id)
      .eq("floor_id", floor_id);

    if (error) throw error;

    return NextResponse.json({ message: "point deleted successfully!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
