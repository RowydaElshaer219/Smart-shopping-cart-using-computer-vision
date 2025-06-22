import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Sidebar from "./component/Sidebar";
import { VertexData, GraphData, FloorData } from "./component/types";
import { usePathname } from "next/navigation";

const IndoorMap: React.FC = () => {
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<string | null>(null);
  const [path, setPath] = useState<VertexData[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentFloorIndex, setCurrentFloorIndex] = useState<number>(0); 
  const [floorsData, setFloorsData] = useState<FloorData[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement | null>(null); // Reference for the path element
  const [isLoading, setIsLoading] = useState(true);
  const [distance, setDistance] = useState<number>(0);
  // const [floor_id, setFloorId] = useState<number>(2);
  const pathname = usePathname();

  // Find current floor by ID
  useEffect(() => {
    if (path.length > 1) {
      let totalDistance = 0;
      for (let i = 0; i < path.length - 1; i++) {
        totalDistance += Math.sqrt(
          Math.pow(path[i].cx - path[i + 1].cx, 2) +
            Math.pow(path[i].cy - path[i + 1].cy, 2)
        );
      }
      setDistance(Math.round(totalDistance));
    } else {
      setDistance(0);
    }
  }, [path]);

// Remove this line completely
// const [floor_id, setFloorId] = useState<number>(2);

// Update the fetch useEffect like this:
useEffect(() => {
  async function fetchGraphData() {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/map/get/points?id=${currentFloorIndex}`);
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();

      if (!Array.isArray(data)) throw new Error("Expected array of floors");

      setFloorsData(
        data.map((floor) => ({
          id: floor.id,
          name: floor.name,
          shortName: floor.shortName,
          description: floor.description,
          graphData: floor.graphData,
          svgPath: floor.svgPath,
        }))
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      setFloorsData([]);
    } finally {
      setIsLoading(false);
    }
  }

  fetchGraphData();
}, [currentFloorIndex]);


  const currentFloor =
    floorsData.length > 0 ? floorsData[0] : null;
  const currentGraphData = currentFloor
    ? currentFloor.graphData
    : { vertices: [], edges: [] };

  console.log(currentFloor)
  console.log(currentGraphData)

  // Clear route when changing floors
  useEffect(() => {
    setSelectedStart(null);
    setSelectedEnd(null);
    setPath([]);
  }, [currentFloorIndex]);

  const findShortestPath = (start: string, end: string) => {
    const distances: { [key: string]: number } = {};
    const previous: { [key: string]: string | null } = {};
    const unvisited = new Set<string>();

    // Initialize distances
    currentGraphData.vertices.forEach((vertex) => {
      distances[vertex.id] = Infinity;
      previous[vertex.id] = null;
      unvisited.add(vertex.id);
    });
    distances[start] = 0;

    while (unvisited.size > 0) {
      // Find vertex with minimum distance
      let minDistance = Infinity;
      let current = "";
      unvisited.forEach((vertexId) => {
        if (distances[vertexId] < minDistance) {
          minDistance = distances[vertexId];
          current = vertexId;
        }
      });

      if (current === end || current === "") break;
      unvisited.delete(current);

      // Update distances to neighbors
      currentGraphData.edges
        .filter((edge) => edge.from === current || edge.to === current)
        .forEach((edge) => {
          const neighbor = edge.from === current ? edge.to : edge.from;
          if (!unvisited.has(neighbor)) return;

          const fromVertex = currentGraphData.vertices.find(
            (v) => v.id === edge.from
          );
          const toVertex = currentGraphData.vertices.find(
            (v) => v.id === edge.to
          );
          if (!fromVertex || !toVertex) return;

          const distance = Math.sqrt(
            Math.pow(fromVertex.cx - toVertex.cx, 2) +
              Math.pow(fromVertex.cy - toVertex.cy, 2)
          );

          const newDistance = distances[current] + distance;
          if (newDistance < distances[neighbor]) {
            distances[neighbor] = newDistance;
            previous[neighbor] = current;
          }
        });
    }

    // Reconstruct path
    const path: VertexData[] = [];
    let current = end;
    while (current) {
      const vertex = currentGraphData.vertices.find((v) => v.id === current);
      if (vertex) path.unshift(vertex);
      current = previous[current] || "";
    }

    return path;
  };

  const handleLocationClick = (location: VertexData) => {
    if (!selectedStart) {
      setSelectedStart(location.id);
    } else if (!selectedEnd) {
      setSelectedEnd(location.id);
      const newPath = findShortestPath(selectedStart, location.id);
      setPath(newPath);
    } else {
      // Reset if both are already selected
      setSelectedStart(location.id);
      setSelectedEnd(null);
      setPath([]);
    }
  };

  useEffect(() => {
    if (pathRef.current && path.length > 1) {
      const pathElement = pathRef.current;
      const pathLength = pathElement.getTotalLength();

      // Set initial dasharray to 0
      pathElement.style.strokeDasharray = `${pathLength}`;
      pathElement.style.strokeDashoffset = `${pathLength}`;

      // Animate the stroke-dashoffset to 0 (draw the path)
      setTimeout(() => {
        pathElement.style.transition = "stroke-dashoffset 0.5s ease-out";
        pathElement.style.strokeDashoffset = "0";
      }, 10);
    }
  }, [path]);

  // useEffect(() => {
  //   setFloorId(currentFloorIndex);
  // }, [currentFloorIndex, floorsData]);

  // console.log(floor_id);

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-full">
        <span className="loading loading-spinner loading-xl text-[#001b30]"></span>
      </div>
    );
  if (!floorsData.length)
    return (
      <div className="flex items-center justify-center h-full">
        No floor data available
      </div>
    );

  return (
    <div className="w-full h-full bg-gray-50">
      {/* Sidebar */}
      <div
        className={`absolute left-0 bottom-0 ${pathname === "/map" ? "bg-[#01205e] top-0" : "bg-[#001b30] top-16"} transition-all duration-500 ease-in-out shadow-xl ${
          isSidebarOpen ? "w-[280px]" : "w-[60px]"
        }`}
      >
        {isSidebarOpen ? (
          <Sidebar
            currentFloorIndex={currentFloorIndex}
            setCurrentFloorIndex={setCurrentFloorIndex}
            selectedStart={selectedStart}
            setSelectedStart={setSelectedStart}
            selectedEnd={selectedEnd}
            setSelectedEnd={setSelectedEnd}
            path={path}
            setPath={setPath}
            distance={distance}
            findShortestPath={findShortestPath}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            currentGraphData={currentGraphData}
            floorsData={floorsData}
          />
        ) : (
          <div className={`flex flex-col items-center py-4 space-y-4 ${pathname === "/map" ? "bg-[#01205e]" : "bg-[#001b30]"}`}>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="w-10 h-10 flex items-center justify-center hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 rounded-lg transition-all duration-300 group"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Map View */}
      <div
        className={`absolute transition-all duration-500 ease-in-out ${pathname === "/map" ? "top-0" : "top-16"} ${
          isSidebarOpen ? "left-[280px]" : "left-[60px]"
        } right-0 top-0 bottom-0`}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 1461.95 1149.136"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background Map */}
          <image
            href={currentFloor?.svgPath}
            x="0"
            y="0"
            width="1461.95"
            height="1149.136"
            preserveAspectRatio="xMidYMid meet"
          />

          {/* Draw vertices */}
          {currentGraphData.vertices.map((vertex) => {
            if (!vertex.object_name) return null;

            const isStart = vertex.id === selectedStart;
            const isEnd = vertex.id === selectedEnd;

            return (
              <g
                key={vertex.id}
                onClick={() => handleLocationClick(vertex)}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={vertex.cx}
                  cy={vertex.cy}
                  r={8}
                  fill={isStart ? "#22c55e" : isEnd ? "#ef4444" : "#3b82f6"}
                  stroke="#ffffff"
                  strokeWidth="2"
                />

                <text
                  x={vertex.cx}
                  y={vertex.cy - 15}
                  textAnchor="middle"
                  className="text-2xl font-medium"
                  fill={isStart ? "#22c55e" : isEnd ? "#ef4444" : "#1e293b"}
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: "600",
                    textShadow: "0 1px 2px rgba(255,255,255,0.8)",
                  }}
                >
                  {vertex.object_name}
                </text>
              </g>
            );
          })}

          {/* Draw navigation path with Framer Motion */}
          {path.length > 1 && (
            <path
              ref={pathRef}
              d={`M ${path.map((p) => `${p.cx},${p.cy}`).join(" L ")}`}
              stroke="#3b82f6"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </div>
    </div>
  );
};

export default IndoorMap;
