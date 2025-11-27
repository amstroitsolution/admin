// client/admin/src/components/EditWorkModal.jsx
import React, { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const FALLBACK_ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || "";

export default function EditWorkModal({ work, onClose, onUpdated }) {
  const [title, setTitle] = useState(work.title || "");
  const [shortDescription, setShortDescription] = useState(work.shortDescription || "");
  const [category, setCategory] = useState(work.category || "");
  const [featured, setFeatured] = useState(Boolean(work.featured));
  const [order, setOrder] = useState(work.order || 0);
  const [existingImages, setExistingImages] = useState(work.images ? [...work.images] : []);
  const [newImages, setNewImages] = useState([]); // File objects
  const [loading, setLoading] = useState(false);

  function onFiles(e) {
    setNewImages(Array.from(e.target.files || []));
  }

  function toggleRemoveExisting(img) {
    setExistingImages((prev) => prev.filter((i) => i !== img));
  }

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData();
      form.append("title", title);
      form.append("shortDescription", shortDescription);
      form.append("category", category);
      form.append("featured", featured ? "true" : "false");
      form.append("order", order);

      // Append new images
      newImages.forEach((f) => form.append("images", f));

      // Build remove list
      const removed = (work.images || []).filter((img) => !existingImages.includes(img));
      if (removed.length) form.append("removeImages", JSON.stringify(removed));

      const token = localStorage.getItem("admin_token") || FALLBACK_ADMIN_TOKEN;
      await axios.put(`${API}/api/works/${work._id}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      alert("Updated");
      window.dispatchEvent(new Event("work:added")); // reuse event name to signal refresh
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error("EditWork error:", err);
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 overflow-y-auto" style={{ left: 0, right: 0, top: 0, bottom: 0 }}>
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl my-8 overflow-hidden" style={{ maxHeight: '95vh' }}>
        <div className="overflow-y-auto p-6" style={{ maxHeight: '95vh' }}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold">Edit Work</h4>
          <button onClick={onClose} className="text-sm px-2 py-1 border rounded">Close</button>
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          <input className="w-full p-2 border rounded" value={title} onChange={(e) => setTitle(e.target.value)} />

          <input className="w-full p-2 border rounded" value={category} onChange={(e) => setCategory(e.target.value)} />

          <textarea className="w-full p-2 border rounded" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
              Featured
            </label>
            <input className="w-28 p-2 border rounded" type="number" value={order} onChange={(e) => setOrder(e.target.value)} />
          </div>

          <div>
            <div className="mb-2">Existing Images (click remove)</div>
            <div className="flex gap-2 overflow-auto">
              {existingImages.length === 0 && <div className="text-sm text-gray-500">No images</div>}
              {existingImages.map((img) => (
                <div key={img} className="relative">
                  <img src={img} alt="" className="w-28 h-20 object-cover rounded border" />
                  <button
                    type="button"
                    onClick={() => toggleRemoveExisting(img)}
                    className="absolute top-0 right-0 bg-red-600 text-white px-1 text-xs rounded"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-1">Add new images</label>
            <input type="file" accept="image/*" multiple onChange={onFiles} />
            {newImages.length > 0 && <div className="mt-2 text-sm">{newImages.map((f) => f.name).join(", ")}</div>}
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded">
              {loading ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
