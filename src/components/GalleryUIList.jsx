import React, { useEffect, useState } from "react";

const GalleryUIList = () => {
  const [gallery, setGallery] = useState([]);

  const fetchGallery = async () => {
    const res = await fetch("http://localhost:5000/api/gallery-ui");
    const data = await res.json();
    setGallery(data);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    await fetch(`http://localhost:5000/api/gallery-ui/${id}`, {
      method: "DELETE",
    });
    fetchGallery();
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow mt-6">
      <h2 className="text-lg font-semibold mb-4">Gallery UI List</h2>

      {gallery.length === 0 ? (
        <p>No items yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.map((item) => (
            <div key={item._id} className="border rounded-lg shadow p-2">
              <img
                src={`http://localhost:5000${item.image}`}
                alt={item.title}
                className="w-full h-32 object-cover rounded"
              />
              <p className="mt-2 font-medium text-sm">{item.title}</p>
              <button
                onClick={() => handleDelete(item._id)}
                className="text-red-500 text-xs mt-1 hover:underline"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryUIList;
