export interface Point {
  id: string;
  floor_id: number;
  object_name: string | null;
  cx: number;
  cy: number;
}

export interface Connection {
  id: string;
  floor_id: number;
  from: string;
  to: string;
}

export interface MapEditorProps {
  floorSvgPath: string;
  initialData?: { vertices: Point[]; edges: Connection[] };
  floor_id :number
}

export interface VertexData {
  id: string;
  floor_id: number;
  cx: number;
  cy: number;
  object_name: string | null;
}

export interface EdgeData {
  id: string;
  floor_id: number;
  from: string;
  to: string;
}

export interface GraphData {
  vertices: VertexData[];
  edges: EdgeData[];
}

export interface Floor {
  id: string;
  name: string;
  svgPath: string;
  graphData: GraphData;
}
