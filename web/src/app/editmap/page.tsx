"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

interface FloorData {
  id: number;
  name: string;
  short_name: string;
  description: string;
  svg_path: string;
}

export default function Page() {
  const [floors, setFloors] = useState<FloorData[]>([]);
  const [name, setName] = useState<string>("");
  const [short_name, setShortName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [selectedFloor, setSelectedFloor] = useState<FloorData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  useEffect(() => {
    fetchFloors();
  }, []);

  const fetchFloors = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/map/get/floors");
      const data = await response.json();
      setFloors(data.data);
    } catch (error) {
      console.error("Error fetching floors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File, floorId?: number): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    if (floorId) formData.append("floorId", floorId.toString());

    const response = await fetch("/api/map/add/image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data.imageUrl;
  };

  const deleteImage = async (filePath: string) => {
    try {
      // Extract just the path part if it's a full URL
      const pathToDelete = filePath.includes('/maps/') 
        ? filePath.split('/maps/')[1] 
        : filePath;
  
      const response = await fetch("/api/map/delete/image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: pathToDelete }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete image');
      }
  
      return await response.json();
    } catch (error) {
      console.error("Error in deleteImage:", error);
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this floor and its image?")) {
      return;
    }
  
    try {
      // Find the floor to get its image path
      const floorToDelete = floors.find((floor) => floor.id === id);
      if (!floorToDelete) {
        throw new Error("Floor not found");
      }
  
      // Delete associated image if it exists
      if (floorToDelete.svg_path) {
        await deleteImage(floorToDelete.svg_path);
      }
  
      // Delete floor record
      const deleteResponse = await fetch(`/api/map/delete/floors?id=${id}`, {
        method: "DELETE",
      });
  
      if (!deleteResponse.ok) {
        throw new Error("Failed to delete floor record");
      }
  
      // Refresh the floor list
      fetchFloors();
    } catch (error) {
      console.error("Error in handleDelete:", error);
      alert(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleAddFloor = async () => {
    if (!name || !short_name || !description || !imageFile) {
      alert("Please fill all the fields and select an image");
      return;
    }

    try {
      setUploadProgress(0);

      // Upload image first
      const imageUrl = await uploadImage(imageFile);

      // Then create floor record
      const response = await fetch("/api/map/add/floors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          short_name,
          description,
          svg_path: imageUrl,
        }),
      });

      if (response.ok) {
        setName("");
        setShortName("");
        setDescription("");
        setImageFile(null);
        setPreviewUrl(null);
        fetchFloors();
      }
    } catch (error) {
      console.error("Error adding floor:", error);
    }
  };

  const handleUpdateFloor = async () => {
    if (!selectedFloor) return;

    try {
      setUploadProgress(0);
      let imageUrl = selectedFloor.svg_path;

      // If new image was selected, upload it
      if (imageFile) {
        // First delete old image if it exists
        if (selectedFloor.svg_path) {
          try {
            const oldImagePath = selectedFloor.svg_path.split("/maps/")[1];
            await deleteImage(oldImagePath);
          } catch (error) {
            console.error("Error deleting old image:", error);
          }
        }

        // Upload new image
        imageUrl = await uploadImage(imageFile, selectedFloor.id);
      }

      // Update floor record
      const response = await fetch(
        `/api/map/update/floors?id=${selectedFloor.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            short_name,
            description,
            svg_path: imageUrl,
          }),
        }
      );

      if (response.ok) {
        setEditModalOpen(false);
        setSelectedFloor(null);
        setImageFile(null);
        setPreviewUrl(null);
        fetchFloors();
      }
    } catch (error) {
      console.error("Error updating floor:", error);
    }
  };

 

  const openEditModal = (floor: FloorData) => {
    setSelectedFloor(floor);
    setName(floor.name);
    setShortName(floor.short_name);
    setDescription(floor.description);
    setImageFile(null);
    setPreviewUrl(floor.svg_path);
    setEditModalOpen(true);
  };

  return (
    <div className="flex flex-wrap items-start justify-start min-h-screen w-full p-10 gap-10 pt-20">
      {loading ? (
        <div className="w-full flex justify-center items-center min-h-[calc(100vh-10rem)]">
          <div className="w-12 h-12 border-4 border-[#001b30] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {floors.map((floor) => (
            <div
              className="w-96 h-96 rounded-xl bg-[#001b30]/80 text-white flex flex-col items-start justify-center gap-2 p-4"
              key={floor.id}
            >
              <h1>name: {floor.name}</h1>
              <h2>short name: {floor.short_name}</h2>
              <h3>description: {floor.description}</h3>
              <h4 className="w-11/12 overflow-hidden text-ellipsis whitespace-nowrap">
                svg path: {floor.svg_path}
              </h4>
              <img src={floor.svg_path} alt="Floor" className="w-36 h-36" />
              <div className="flex items-center justify-between pt-4 w-full">
                <Link
                  href={`/editmap/${floor.id}`}
                  className="text-white bg-[#001b30] px-2 py-1 rounded-md hover:bg-[#001b30]/80"
                >
                  Edit points
                </Link>
                <button
                  className="text-white bg-[#001b30] px-2 py-1 rounded-md hover:bg-[#001b30]/80"
                  onClick={() => openEditModal(floor)}
                >
                  Edit floor
                </button>
                <button
                  className="text-white bg-red-500 px-2 py-1 rounded-md hover:bg-red-600"
                  onClick={() => handleDelete(floor.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}{" "}
          {/* Add New Floor */}
          <div className="w-96 min-h-96 rounded-xl bg-[#001b30]/80 text-white flex flex-col items-start justify-center gap-2 p-4">
            <h1 className="text-2xl font-bold w-full text-center">Add Floor</h1>
            <input
              type="text"
              placeholder="Name"
              className="input text-black"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Short Name"
              className="input text-black"
              value={short_name}
              onChange={(e) => setShortName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Description"
              className="input text-black"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="w-full">
              
              <input
                type="file"
                accept="image/*"
                 className="file-input "
                onChange={handleFileChange}
              />
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="mt-2 w-40 h-40 object-contain"
                />
              )}
            </div>
            <div className="flex justify-center gap-2 w-full"><button
              className="text-white bg-[#001b30] py-1 rounded-md hover:bg-[#001b30]/80 px-6"
              onClick={handleAddFloor}
            >
              Add
            </button></div>
            
          </div>
        </>
      )}

      {/* Edit Floor Modal */}
      {editModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center backdrop-blur-sm bg-black/50 z-50">
          <div className="bg-white text-black rounded-xl p-6 w-[400px]">
            <h2 className="text-xl mb-4 font-bold">Edit Floor</h2>
            <input
              type="text"
              placeholder="Name"
              className="input text-black w-full mb-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Short Name"
              className="input text-black w-full mb-2"
              value={short_name}
              onChange={(e) => setShortName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Description"
              className="input text-black w-full mb-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Floor Image
              </label>
              <input
                type="file"
                accept="image/*"
                className="file-input"
                onChange={handleFileChange}
              />
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="mt-2 w-40 h-40 object-contain"
                />
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => {
                  setEditModalOpen(false);
                  setName("");
                  setShortName("");
                  setDescription("");
                  setImageFile(null);
                  setPreviewUrl(null);
                }}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={() => {
                  handleUpdateFloor();
                  setEditModalOpen(false);
                  setName("");
                  setShortName("");
                  setDescription("");
                  setImageFile(null);
                  setPreviewUrl(null);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
