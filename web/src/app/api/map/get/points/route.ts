import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";
import { EdgeData, GraphData, VertexData } from "@/app/components/map/indoor/ground/graphData";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }


    // Fetch vertices
    const { data: vertices, error: verticesError } = await supabase
      .from("vertices")
      .select("*")
      .eq("floor_id", id);

    if (verticesError) {
      throw verticesError;
    }

    // Fetch floor info
    const { data: floorData, error: floorError } = await supabase
      .from("floors")
      .select("*")
      .eq("id", id);

    if (floorError) {
      throw floorError;
    }

    // Fetch edges
    const { data: edges, error: edgesError } = await supabase 
      .from("edges")
      .select("*")
      .eq("floor_id", id);

    if (edgesError) {
      throw edgesError;
    }

    // Ensure floor data exists
    if (!floorData || floorData.length === 0) {
      return NextResponse.json({ error: "Floor not found" }, { status: 404 });
    }

    const floor = floorData[0];

    const graphData: GraphData = {
      vertices: vertices || [],
      edges: edges || [],
    };

    return NextResponse.json([
      {
        id: floor.id,
        name: floor.name,
        shortName: floor.short_name,
        description: floor.description,
        graphData: graphData,
        svgPath: floor.svg_path,
      }
    ]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
