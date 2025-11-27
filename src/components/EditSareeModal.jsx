// client/admin/src/components/EditSareeModal.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function EditSareeModal({ isOpen, onClose, item, onUpdated }) {
  const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [details, setDetails] = useState(""); // 🆕 details
  const [price, setPrice] = useState("");
  const [type, setType] = useState("saree");
  const [imageFile, setImageFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  // Prefill when item changes
  useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setDescription(item.description || "");
      setDetails(item.details || ""); // 🆕 prefill details
      setPrice(item.price || "");
      setType(item.type || "saree");
      setImageFile(null);
      setMsg("");
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      if (!token) {
        setMsg("Please login again.");
        setLoading(false);
        return;
      }

      const form = new FormData();
      form.append("title", title);
      form.append("description", description);
      form.append("details", details); // 🆕 include details
      form.append("price", price);
      form.append("type", type);
      if (imageFile) form.append("image", imageFile);

      console.log("Updating item with:", { title, description, details, price, type, hasImage: !!imageFile });
      
      const res = await axios.put(`${API}/api/equipment/${item._id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200) {
        setMsg("✅ Updated successfully");
        onUpdated?.(); // tell parent to refresh
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        setMsg("Update failed. Try again.");
      }
    } catch (err) {
      console.error("Edit update error:", err);
      setMsg("Error updating saree.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[99999] overflow-y-auto p-4"
      style={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Edit Saree
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border rounded-md px-3 py-2 focus:ring-indigo-300 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border rounded-md px-3 py-2 focus:ring-indigo-300 focus:border-indigo-500"
            />
          </div>

          {/* 🆕 Details field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Details
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              className="w-full border rounded-md px-3 py-2 focus:ring-indigo-300 focus:border-indigo-500"
              placeholder="Long details/specifications (optional)"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                className="w-full border rounded-md px-3 py-2 focus:ring-indigo-300 focus:border-indigo-500"
              />
            </div>

            <div className="w-40">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:ring-indigo-300 focus:border-indigo-500"
              >
                <option value="saree">Saree</option>
                <option value="lehenga">Lehenga</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>
            <div className="flex items-center gap-3">
              <label
                htmlFor="edit-image-upload"
                className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm cursor-pointer hover:bg-gray-50"
              >
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 7v10a1 1 0 001 1h16a1 1 0 001-1V7M16 3l-4 4-4-4"
                  />
                </svg>
                <span className="text-sm text-gray-700">Choose file</span>
              </label>

              <input
                id="edit-image-upload"
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="sr-only"
              />
              <div className="text-sm text-gray-600">
                {imageFile ? (
                  <span className="inline-block max-w-xs truncate">
                    {imageFile.name}
                  </span>
                ) : (
                  <span className="text-gray-400">No new file</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? "Updating..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300"
            >
              Cancel
            </button>
            <span className="text-sm text-gray-600">{msg}</span>
          </div>
        </form>
      </div>
    </div>
  );
}