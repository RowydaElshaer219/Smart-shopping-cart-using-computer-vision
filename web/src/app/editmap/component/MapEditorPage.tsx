"use client";
import React, { useState, useEffect } from "react";
import MapEditor from "./MapEditor";
import { Floor } from "./types";

type MapEditorPageProps = {
  id: number;
};

export default function MapEditorPage({ id }: MapEditorPageProps) {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
  const [exportedData, setExportedData] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<any>(null);
  const [floor_id, setFloorId] = useState<number>(id);
  const [loading, setLoading] = useState<boolean>(true); // Spinner state

  useEffect(() => {
    const fetchFloors = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/map/get/points?id=${floor_id}`);
        const data = await res.json();
        const transformedFloors = data.map((floor: any) => ({
          id: floor.id.toString(),
          name: floor.name,
          svgPath: floor.svgPath,
          graphData: floor.graphData,
        }));
        setFloors(transformedFloors);
        setSelectedFloor(transformedFloors[0]);
      } catch (error) {
        console.error("Error fetching floors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFloors();
  }, []);

  useEffect(() => {
    if (selectedFloor) {
      setInitialData({
        vertices: selectedFloor.graphData.vertices,
        edges: selectedFloor.graphData.edges,
      });
    }
  }, [selectedFloor]);

  return (
    <div className="flex flex-col h-screen w-full">
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <h1 className="text-white text-xl font-bold">Indoor Map Editor</h1>
        <div className="flex gap-4">
          {floors.map((floor) => (
            <button
              key={floor.id}
              onClick={() => setSelectedFloor(floor)}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedFloor?.id === floor.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {floor.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 relative">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-12 h-12 border-4 border-[#001b30] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          initialData &&
          selectedFloor && (
            <MapEditor
              floorSvgPath={selectedFloor.svgPath}
              initialData={initialData}
              floor_id={floor_id}
            />
          )
        )}
      </div>

      {exportedData && (
        <div className="fixed bottom-4 right-4 z-20 bg-gray-800 p-4 rounded-lg shadow-lg max-w-2xl max-h-96 overflow-auto">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-white font-medium">
              Exported TypeScript Code for {selectedFloor?.name}
            </h3>
            <button
              onClick={() => setExportedData(null)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          <pre className="text-gray-300 text-sm whitespace-pre-wrap bg-gray-900 p-3 rounded">
            {exportedData}
          </pre>
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => {
                navigator.clipboard.writeText(exportedData);
                alert("Code copied to clipboard!");
              }}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500"
            >
              Copy to Clipboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
