"use client";
import React, { useState, useRef, useEffect } from "react";
import { Point, Connection, MapEditorProps } from "./types";
import Toolbar from "./Toolbar";

const MapEditor: React.FC<MapEditorProps> = ({
  floorSvgPath,
  initialData,
  floor_id,
}) => {
  // State management
  const [points, setPoints] = useState<Point[]>(initialData?.vertices || []);
  const [connections, setConnections] = useState<Connection[]>(
    initialData?.edges || []
  );
  console.log(initialData?.vertices);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(
    null
  );
  const [connectMode, setConnectMode] = useState(false);
  const [connectStart, setConnectStart] = useState<string | null>(null);
  const [editingPoint, setEditingPoint] = useState<string | null>(null);
  const [pointName, setPointName] = useState("");
  const [svgViewBox, setSvgViewBox] = useState({
    x: 0,
    y: 0,
    width: 1000,
    height: 1000,
  });
  const [bidirectionalConnection, setBidirectionalConnection] = useState(true);
  const [svgLoaded, setSvgLoaded] = useState(false);

  // Refs
  const svgRef = useRef<SVGSVGElement>(null);
  const imageRef = useRef<SVGImageElement>(null);

  // Handler for toolbar actions
  const handleConnectModeToggle = () => {
    setConnectMode(!connectMode);
    setConnectStart(null);
  };

  const handleBidirectionalToggle = () => {
    setBidirectionalConnection(!bidirectionalConnection);
  };

  const handleDeleteSelected = () => {
    if (selectedPoint) {
      handleDeletePoint(selectedPoint);
    } else if (selectedConnection) {
      handleDeleteConnection(selectedConnection);
    }
  };

  // Load SVG and get its viewBox
  useEffect(() => {
    const loadSvg = async () => {
      try {
        const response = await fetch(floorSvgPath);
        const svgText = await response.text();
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
        const svgElement = svgDoc.querySelector("svg");

        if (svgElement?.getAttribute("viewBox")) {
          const [x, y, width, height] = svgElement
            .getAttribute("viewBox")
            ?.split(" ")
            .map(Number) || [0, 0, 1000, 1000];
          setSvgViewBox({
            x: 0,
            y: 0,
            width: width || 1000,
            height: height || 1000,
          });
          setSvgLoaded(true);
        }
      } catch (error) {
        console.error("Error loading SVG:", error);
      }
    };

    loadSvg();
  }, [floorSvgPath]);

  const handleSvgClick = async (e: React.MouseEvent<SVGElement>) => {
    if (connectMode || !svgLoaded || !svgRef.current) return;

    const point = svgRef.current.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const svgPoint = point.matrixTransform(
      svgRef.current.getScreenCTM()?.inverse()
    );

    // Calculate the next point ID based on the highest existing number
    const getNextPointId = () => {
      if (points.length === 0) return "v1";

      const maxId = points.reduce((max, p) => {
        const num = parseInt(p.id.replace("v", ""), 10);
        return num > max ? num : max;
      }, 0);

      return `v${maxId + 1}`;
    };

    const newPoint: Point = {
      id: getNextPointId(),
      floor_id: floor_id,
      object_name: null,
      cx: Math.round(svgPoint.x),
      cy: Math.round(svgPoint.y),
    };

    try {
      const response = await fetch("/api/map/add/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPoint),
      });

      if (!response.ok) {
        throw new Error("Failed to save point");
      }

      const savedPoint = await response.json();

      setPoints((prev) => [...prev, newPoint]);
      setEditingPoint(newPoint.id);
      setPointName("");
    } catch (error) {
      console.error("Error saving point:", error);
    }
  };

  const handlePointClick = async (pointId: string) => {
    if (connectMode) {
      if (!connectStart) {
        setConnectStart(pointId);
      } else if (connectStart !== pointId) {
        const connectionId = `${connectStart}_to_${pointId}`;
        const reverseConnectionId = `${pointId}_to_${connectStart}`;

        const connectionExists = connections.some(
          (conn) => conn.id === connectionId || conn.id === reverseConnectionId
        );

        if (!connectionExists) {
          const newConnections = [
            {
              id: connectionId,
              from: connectStart,
              to: pointId,
              floor_id: floor_id,
            },
          ];

          if (bidirectionalConnection) {
            newConnections.push({
              id: reverseConnectionId,
              floor_id: floor_id,
              from: pointId,
              to: connectStart,
            });
          }

          try {
            // Save each connection to the backend
            for (const connection of newConnections) {
              const response = await fetch("/api/map/add/edges", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...connection,
                  floor_id: floor_id, // assuming you also want to send the map name
                }),
              });

              if (!response.ok) {
                throw new Error("Failed to save connection");
              }
            }

            // If all API calls succeed, update the local state
            setConnections((prevConnections) => [
              ...prevConnections,
              ...newConnections,
            ]);
          } catch (error) {
            console.error("Error saving connection:", error);
          }
        }
        setConnectStart(null);
      }
    } else {
      setSelectedPoint(pointId);
      const point = points.find((p) => p.id === pointId);
      if (point) {
        setEditingPoint(pointId);
        setPointName(point.object_name || "");
      }
    }
  };

  const handleNameSave = async () => {
    if (!editingPoint) return;

    const updatedPoint = points.find((p) => p.id === editingPoint);
    if (!updatedPoint) return;

    const updated = {
      ...updatedPoint,
      object_name: pointName || null,
    };

    try {
      const response = await fetch("/api/map/update/points", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      if (!response.ok) {
        throw new Error("Failed to update point");
      }

      setPoints((prev) =>
        prev.map((point) => (point.id === editingPoint ? updated : point))
      );
      setEditingPoint(null);
      setPointName("");
    } catch (error) {
      console.error("Error updating point:", error);
    }
  };
  const handleDeletePoint = async (pointId: string) => {
    try {
      const response = await fetch("/api/map/delete/points", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ floor_id, pointId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete point");
      }

      // Delete related connections
      const relatedConnections = connections.filter(
        (c) => c.from === pointId || c.to === pointId || c.id.includes(pointId) // Also check in connection id like "v16_to_v26"
      );

      for (const conn of relatedConnections) {
        await fetch("/api/map/delete/edges", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ floor_id, id: conn.id }),
        });
      }

      // Update local state after deletion
      setPoints((prev) => prev.filter((p) => p.id !== pointId));
      setConnections((prev) =>
        prev.filter(
          (c) =>
            c.from !== pointId && c.to !== pointId && !c.id.includes(pointId) // Also remove locally
        )
      );
      setSelectedPoint(null);
      setEditingPoint(null);
    } catch (error) {
      console.error("Error deleting point:", error);
    }
  };

  // Delete connection
  const handleDeleteConnection = async (connectionId: string) => {
    try {
      const response = await fetch("/api/map/delete/edges", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: connectionId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete connection");
      }

      setConnections((prev) => prev.filter((c) => c.id !== connectionId));
      setSelectedConnection(null);
    } catch (error) {
      console.error("Error deleting connection:", error);
    }
  };

  // Check if connection is bidirectional
  const isBidirectionalConnection = (conn: Connection) => {
    return connections.some((c) => c.from === conn.to && c.to === conn.from);
  };

  // Get connections for a point
  const getConnectionsForPoint = (pointId: string) => {
    return connections.filter(
      (conn) => conn.from === pointId || conn.to === pointId
    );
  };

  return (
    <div className="relative w-full h-full bg-gray-900">
      <div className="fixed top-12 z-50 w-full">
        <Toolbar
          onConnectModeToggle={handleConnectModeToggle}
          connectMode={connectMode}
          bidirectionalConnection={bidirectionalConnection}
          onBidirectionalToggle={handleBidirectionalToggle}
          onDeleteSelected={handleDeleteSelected}
          hasSelection={!!selectedPoint || !!selectedConnection}
        />
      </div>

      {/* Point Name Editor */}
      {editingPoint && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 bg-gray-800 p-4 rounded-lg shadow-lg">
          <div className="space-y-2">
            <h4 className="text-gray-300">Point Name</h4>
            <input
              type="text"
              value={pointName}
              onChange={(e) => setPointName(e.target.value)}
              className="bg-gray-700 text-white px-3 py-1 rounded"
              placeholder="Location name (optional)"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleNameSave}
                className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-500"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditingPoint(null);
                  setPointName("");
                }}
                className="px-3 py-1 rounded bg-gray-600 text-white hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SVG Map */}
      <div
        className={`absolute transition-all duration-500 ease-in-out left-[60px] right-0 top-0 bottom-0`}
      >
        <svg
          ref={svgRef}
          className="w-full h-full"
          viewBox="0 0 1461.95 1149.136"
          onClick={handleSvgClick}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background Map */}
          <image
            ref={imageRef}
            href={floorSvgPath}
            width="1461.95"
            height="1149.136"
            className="opacity-75"
            preserveAspectRatio="xMidYMid meet"
          />

          {/* Connections */}
          {connections.map((conn) => {
            const from = points.find((p) => p.id === conn.from);
            const to = points.find((p) => p.id === conn.to);
            if (!from || !to) return null;

            const isBidirectional = isBidirectionalConnection(conn);
            const isSelected = selectedConnection === conn.id;
            const isConnectedToSelected =
              selectedPoint &&
              (conn.from === selectedPoint || conn.to === selectedPoint);

            return (
              <g key={conn.id}>
                <line
                  x1={from.cx}
                  y1={from.cy}
                  x2={to.cx}
                  y2={to.cy}
                  stroke={
                    isSelected
                      ? "#3b82f6"
                      : isConnectedToSelected
                      ? "#60a5fa"
                      : "#60a5fa"
                  }
                  strokeWidth={isSelected ? "3" : "2"}
                  strokeDasharray={isBidirectional ? "none" : "4"}
                  className={`opacity-${
                    isSelected ? "100" : isConnectedToSelected ? "75" : "50"
                  }`}
                />
              </g>
            );
          })}

          {/* Active Connection */}
          {connectStart && connectMode && (
            <line
              x1={points.find((p) => p.id === connectStart)?.cx || 0}
              y1={points.find((p) => p.id === connectStart)?.cy || 0}
              x2={points.find((p) => p.id === selectedPoint)?.cx || 0}
              y2={points.find((p) => p.id === selectedPoint)?.cy || 0}
              stroke="#60a5fa"
              strokeWidth="2"
              strokeDasharray="4"
              className="opacity-50"
            />
          )}

          {/* Points */}
          {points.map((point) => {
            const isHovered = selectedPoint === point.id;
            const isConnectStart = connectStart === point.id;
            const connectedPoints = getConnectionsForPoint(point.id);

            return (
              <g key={point.id}>
                <circle
                  cx={point.cx}
                  cy={point.cy}
                  r={isHovered ? "8" : connectedPoints.length ? "6" : "5"}
                  fill={
                    isHovered
                      ? "#3b82f6"
                      : isConnectStart
                      ? "#34d399"
                      : point.object_name
                      ? "#f59e0b"
                      : "#6b7280"
                  }
                  stroke={
                    isHovered
                      ? "#93c5fd"
                      : connectedPoints.length
                      ? "#60a5fa"
                      : "transparent"
                  }
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePointClick(point.id);
                  }}
                />
                {point.object_name && (
                  <text
                    x={point.cx}
                    y={point.cy - 10}
                    textAnchor="middle"
                    fill="#e5e7eb"
                    fontSize="12"
                    className="pointer-events-none"
                  >
                    {point.object_name}
                  </text>
                )}
                {point.id && (
                  <text
                    x={point.cx}
                    y={point.cy + 15}
                    textAnchor="middle"
                    fill="#e5e7eb"
                    fontSize="12"
                    className="pointer-events-none"
                  >
                    {point.id}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default MapEditor;
