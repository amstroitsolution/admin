// client/admin/src/components/AddGallery.jsx
import React, { useRef, useState } from "react";

/**
 * AddGallery
 * - Upload multiple images (input name: images)
 * - Sends multipart/form-data to POST /api/gallery (auth required)
 * - After success dispatches "gallery:added" event so dashboard can refresh
 */
export default function AddGallery() {
  const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visible, setVisible] = useState(true);
  const [order, setOrder] = useState(0);
  const [files, setFiles] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const handleFiles = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      if (!token) {
        setMsg("Please login as admin.");
        setLoading(false);
        return;
      }

      if (!title.trim()) {
        setMsg("Title is required.");
        setLoading(false);
        return;
      }

      const form = new FormData();
      form.append("title", title);
      form.append("description", description);
      form.append("visible", visible ? "true" : "false");
      form.append("order", String(order || 0));

      // append multiple files under field name 'images'
      files.forEach((f) => form.append("images", f));

      const res = await fetch(`${API}/api/gallery`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg(data.message || "Upload failed");
        setLoading(false);
        return;
      }

      setMsg("Gallery item added ✅");
      // reset
      setTitle("");
      setDescription("");
      setVisible(true);
      setOrder(0);
      setFiles([]);
      if (fileRef.current) fileRef.current.value = "";

      // inform dashboard/admin list to refresh
      try {
        window.dispatchEvent(new Event("gallery:added"));
      } catch (e) {}

    } catch (err) {
      console.error("AddGallery error:", err);
      setMsg(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3">Add Gallery Item</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border-gray-300 px-3 py-2"
            required
            placeholder="Enter title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-md border-gray-300 px-3 py-2"
            placeholder="Short description (optional)"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Order</label>
            <input
              value={order}
              onChange={(e) => setOrder(Number(e.target.value || 0))}
              type="number"
              className="w-full rounded-md border-gray-300 px-3 py-2"
            />
          </div>

          <div className="w-36">
            <label className="block text-sm font-medium text-gray-700">Visible</label>
            <select
              value={visible ? "true" : "false"}
              onChange={(e) => setVisible(e.target.value === "true")}
              className="w-full rounded-md border-gray-300 px-3 py-2"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Images (multiple)</label>
          <input
            ref={fileRef}
            onChange={handleFiles}
            type="file"
            accept="image/*"
            multiple
            className="mt-1"
          />
          <div className="text-sm text-gray-600 mt-2">
            {files.length > 0 ? (
              <ul className="list-disc pl-5">
                {files.map((f, idx) => (
                  <li key={idx} className="truncate max-w-xl">{f.name}</li>
                ))}
              </ul>
            ) : (
              <span className="text-gray-400">No files selected</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-60"
          >
            {loading ? "Uploading..." : "Add Gallery"}
          </button>
          <div className="text-sm text-gray-600">{msg}</div>
        </div>
      </form>
    </div>
  );
}
