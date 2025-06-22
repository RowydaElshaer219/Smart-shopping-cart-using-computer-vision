import React, { useState, useEffect } from "react";
import { VertexData, GraphData, FloorData } from "./types";
import { usePathname } from "next/navigation";
interface SidebarProps {
  currentFloorIndex: number;
  setCurrentFloorIndex: (index: number) => void;
  selectedStart: string | null;
  setSelectedStart: (id: string | null) => void;
  selectedEnd: string | null;
  setSelectedEnd: (id: string | null) => void;
  path: VertexData[];
  setPath: (path: VertexData[]) => void;
  distance: number;
  findShortestPath: (start: string, end: string) => VertexData[];
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  currentGraphData: GraphData;
  floorsData: FloorData[];
}

const Sidebar: React.FC<SidebarProps> = ({
  currentFloorIndex,
  setCurrentFloorIndex,
  selectedStart,
  setSelectedStart,
  selectedEnd,
  setSelectedEnd,
  path,
  setPath,
  distance,
  findShortestPath,
  isSidebarOpen,
  setIsSidebarOpen,
  currentGraphData,
  floorsData,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSection, setExpandedSection] = useState<"route" | "floor">(
    "route"
  );

  const [floors, setFloors] = useState<FloorData[]>([]);

  const filteredLocations = currentGraphData.vertices
    .filter((vertex) => vertex.object_name)
    .filter((vertex) =>
      vertex.object_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  const pathname = usePathname();
  console.log(pathname);

  const clearRoute = () => {
    setSelectedStart(null);
    setSelectedEnd(null);
    setPath([]);
    setSearchQuery("");
  };

  const handleLocationSelect = (locationId: string, isStart: boolean) => {
    if (isStart) {
      setSelectedStart(locationId);
      if (selectedEnd) {
        setPath(findShortestPath(locationId, selectedEnd));
      }
    } else {
      setSelectedEnd(locationId);
      if (selectedStart) {
        setPath(findShortestPath(selectedStart, locationId));
      }
    }
    setSearchQuery("");
  };

  useEffect(() => {
    async function fetchFloors() {
      const response = await fetch("/api/map/get/floors");
      const data = await response.json();
      setFloors(data.data);
    }

    fetchFloors();
  }, []);

  console.log(floors)

  return (
    <div className={`h-full flex flex-col text-gray-300 ${pathname === "/map" ? "bg-[#01205e]" : "bg-[#001b30]"}`}>
      {/* Sidebar Header */}
      <div className="p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-blue-400">
            Indoor Navigation
          </h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setExpandedSection("route")}
            className={`p-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              expandedSection === "route"
                ? "bg-blue-500/20 text-blue-400"
                : "text-gray-400 hover:bg-blue-500/10"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            <span className="text-sm">Route</span>
          </button>
          <button
            onClick={() => setExpandedSection("floor")}
            className={`p-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              expandedSection === "floor"
                ? "bg-[#01205e]  text-blue-400"
                : "text-gray-400 hover:bg-blue-500/10"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span className="text-sm">Floor</span>
          </button>
        </div>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto">
         {/* Floor Section */}
         {expandedSection === "floor" && (
          <div className="p-4 space-y-4">
            <h3 className="text-sm font-medium text-gray-400">Select Floor</h3>
            <div className="grid grid-cols-1 gap-3">
              {floors.map((floor, index) => (
                <button
                  key={floor.id}
                  onClick={() => setCurrentFloorIndex(floor.id)}
                  className={`p-3 rounded-lg border transition-colors text-left ${
                    currentFloorIndex === floor.id  
                      ? ` ${pathname === "/map" ? "bg-[#01205e] border-[#60a5fa] text-white" : "bg-blue-500/20 border-blue-500/50 text-blue-400"}`
                      : ` ${pathname === "/map" ? "bg-[#01205e] border-white/40 text-white" : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-blue-500/30"}`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${pathname === "/map" ? `${currentFloorIndex === floor.id ? "bg-[#2d72fd]" : "bg-white"} border-white/40 text-white` : "bg-gray-900/50"}`}>
                      <span className="font-bold">{floor.shortName}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium">{floor.name}</div>
                      <div className="text-xs opacity-75">
                        {floor.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Route Section */}
        {expandedSection === "route" && (
          <div className="p-4 space-y-4">
            {/* Start Point */}
            <div className={`p-3 ${pathname === "/map" ? "bg-[#01205e] border-white/40" : "bg-gray-800/50"} rounded-lg border  border-gray-700`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400 font-medium">
                  Starting Point
                </span>
                {selectedStart && (
                  <button
                    onClick={() => {
                      setSelectedStart(null);
                      setPath([]);
                    }}
                    className="text-gray-500 hover:text-red-400"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {selectedStart ? (
                <div className="flex items-center gap-2 text-green-400 p-2">
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
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                  <span className="font-medium">
                    {
                      currentGraphData.vertices.find(
                        (v) => v.id === selectedStart
                      )?.object_name
                    }
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search starting point..."
                      className={`w-full p-2 ${pathname === "/map" ? "bg-[#01205e] border-white/40" : "bg-gray-700/50"} border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <svg
                      className="w-5 h-5 absolute right-2 top-2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>

                  {searchQuery && filteredLocations.length > 0 && (
                    <div className="mt-2 space-y-1 max-h-48 overflow-y-auto rounded-lg border border-gray-700 bg-gray-800/50">
                      {filteredLocations.map((location) => (
                        <div
                          key={location.id}
                          className="p-2 hover:bg-green-500/10 cursor-pointer transition-colors"
                          onClick={() =>
                            handleLocationSelect(location.id, true)
                          }
                        >
                          <span className="text-green-400">
                            {location.object_name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* End Point */}
            <div className={`p-3 ${pathname === "/map" ? "bg-[#01205e] border-white/40" : "bg-gray-800/50"} rounded-lg border border-gray-700`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400 font-medium">
                  Destination
                </span>
                {selectedEnd && (
                  <button
                    onClick={() => {
                      setSelectedEnd(null);
                      setPath([]);
                    }}
                    className="text-gray-500 hover:text-red-400"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {selectedEnd ? (
                <div className="flex items-center gap-2 text-red-400 p-2">
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
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                  <span className="font-medium">
                    {
                      currentGraphData.vertices.find(
                        (v) => v.id === selectedEnd
                      )?.object_name
                    }
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search destination..."
                      className={`w-full p-2 ${pathname === "/map" ? "bg-[#01205e] border-white/40" : "bg-gray-700/50"} border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <svg
                      className="w-5 h-5 absolute right-2 top-2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>

                  {searchQuery && filteredLocations.length > 0 && (
                    <div className="mt-2 space-y-1 max-h-48 overflow-y-auto rounded-lg border border-gray-700 bg-gray-800/50">
                      {filteredLocations.map((location) => (
                        <div
                          key={location.id}
                          className="p-2 hover:bg-red-500/10 cursor-pointer transition-colors"
                          onClick={() =>
                            handleLocationSelect(location.id, false)
                          }
                        >
                          <span className="text-red-400">
                            {location.object_name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {path.length > 1 && (
              <div className="space-y-4">
                <div className={`p-3 ${pathname === "/map" ? "bg-[#01205e] border-white/40" : "bg-gray-800/50"} rounded-lg border border-gray-700/50`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">
                      Total Distance
                    </span>
                    <span className="font-semibold text-blue-400">
                      {distance} units
                    </span>
                  </div>
                  <button
                    onClick={clearRoute}
                    className={`w-full mt-2 ${pathname === "/map" ? "bg-[#01205e] border-white/40" : "bg-gray-800/50"} hover:bg-red-500/20 text-gray-300 hover:text-red-400 p-2 rounded-lg border border-gray-700 transition-colors flex items-center justify-center gap-2`}
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <span>Clear Route</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
