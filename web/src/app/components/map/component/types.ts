export interface VertexData {
  id: string;
  object_name: string | null;
  cx: number;
  cy: number;
}

export interface EdgeData {
  id: string;
  from: string;
  to: string;
}

export interface GraphData {
  vertices: VertexData[];
  edges: EdgeData[];
}

export interface FloorData {
  id: number;
  name: string;
  shortName: string;
  description: string;
  graphData: GraphData;
  svgPath: string;
}
