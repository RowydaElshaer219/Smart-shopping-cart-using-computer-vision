"use client";
import React from "react";

interface ToolbarProps {
  onConnectModeToggle: () => void;
  // onExport: () => void;
  // onImportClick: () => void;
  connectMode: boolean;
  bidirectionalConnection: boolean;
  onBidirectionalToggle: () => void;
  onDeleteSelected: () => void;
  hasSelection: boolean;
}

export default function Toolbar({
  onConnectModeToggle,
  // onExport,
  // onImportClick,
  connectMode,
  bidirectionalConnection,
  onBidirectionalToggle,
  onDeleteSelected,
  hasSelection,
}: ToolbarProps) {
  return (
    <div className="absolute top-4 left-4 z-10 bg-gray-800 rounded-lg shadow-lg p-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onConnectModeToggle}
          className={`px-3 py-1 rounded text-sm ${
            connectMode
              ? "bg-blue-500 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          {connectMode ? "Connecting..." : "Connect"}
        </button>        
        <div className="flex items-center ml-2">
          <input
            type="checkbox"
            id="bidirectional"
            checked={bidirectionalConnection}
            onChange={onBidirectionalToggle}
            className="mr-1"
          />
          <label htmlFor="bidirectional" className="text-gray-400 text-xs">
            Bidirectional
          </label>
        </div>
        
        {hasSelection && (
          <button
            onClick={onDeleteSelected}
            className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-500 text-sm"
          >
            Delete Selected
          </button>
        )}
      </div>
    </div>
  );
}