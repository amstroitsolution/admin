// client/admin/src/components/AddWork.jsx
import React, { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const FALLBACK_ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || "";

export default function AddWork({ onAdded }) {
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [category, setCategory] = useState("");
  const [featured, setFeatured] = useState(false);
  const [order, setOrder] = useState(0);
  const [images, setImages] = useState([]); // File objects
  const [loading, setLoading] = useState(false);

  function handleFiles(e) {
    setImages(Array.from(e.target.files || []));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return alert("Title is required");

    const token = localStorage.getItem("admin_token") || FALLBACK_ADMIN_TOKEN;
    const form = new FormData();
    form.append("title", title);
    form.append("shortDescription", shortDescription);
    form.append("category", category);
    form.append("featured", featured ? "true" : "false");
    form.append("order", order);

    images.forEach((f) => form.append("images", f)); // backend expects images[] or images field array

    try {
      setLoading(true);
      const res = await axios.post(`${API}/api/works`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      alert("Work added");
      // reset form
      setTitle("");
      setShortDescription("");
      setCategory("");
      setFeatured(false);
      setOrder(0);
      setImages([]);

      // notify parent / global listeners
      if (onAdded) onAdded(res.data);
      window.dispatchEvent(new Event("work:added"));
    } catch (err) {
      console.error("AddWork error:", err);
      alert(err?.response?.data?.message || "Failed to add work");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold">Add New Work</h3>

      <input
        className="w-full p-2 border rounded"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <input
        className="w-full p-2 border rounded"
        placeholder="Category (e.g., Branding)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <textarea
        className="w-full p-2 border rounded"
        placeholder="Short description"
        value={shortDescription}
        onChange={(e) => setShortDescription(e.target.value)}
      />

      <div className="flex items-center space-x-3">
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          <span>Featured</span>
        </label>
        <input
          className="w-24 p-2 border rounded"
          type="number"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          placeholder="Order"
        />
      </div>

      <div>
        <label className="block mb-1">Images (multiple allowed)</label>
        <input type="file" accept="image/*" multiple onChange={handleFiles} />
        {images.length > 0 && (
          <div className="flex gap-2 mt-2">
            {images.map((f, i) => (
              <div key={i} className="text-xs">
                {f.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
        >
          {loading ? "Adding..." : "Add Work"}
        </button>
      </div>
    </form>
  );
}
