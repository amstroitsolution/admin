// client/admin/src/components/AddHomeService.jsx
import React, { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API = `${API_BASE}/api/home-services`;

const AddHomeService = ({ onClose = () => {}, onAdded = () => {} }) => {
  const [form, setForm] = useState({
    title: "",
    shortDesc: "",
    longDesc: "",
    mediaType: "video", // default
    buttonText: "",
    buttonLink: "",
    order: 0,
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleFile = (e) => {
    const f = e.target.files && e.target.files[0];
    setFile(f);
    if (!f) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) return alert("Title required");
    try {
      setLoading(true);
      const fd = new FormData();
      Object.keys(form).forEach((k) => fd.append(k, form[k]));
      if (file) fd.append("media", file);

      const res = await axios.post(`${API}/admin`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onAdded(res.data.item || res.data);
    } catch (err) {
      console.error("Add home service error:", err);
      alert("Failed to add. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4 overflow-y-auto" style={{ left: 0, right: 0, top: 0, bottom: 0 }}>
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl my-8 overflow-hidden" style={{ maxHeight: '95vh' }}>
        <div className="overflow-y-auto" style={{ maxHeight: '95vh' }}>
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Add Home Service</h3>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-3 py-1 rounded bg-gray-100">Close</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-600">Title *</label>
            <input name="title" value={form.title} onChange={handleChange} className="w-full border rounded px-3 py-2 mt-1" required />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Short Description</label>
            <textarea name="shortDesc" value={form.shortDesc} onChange={handleChange} className="w-full border rounded px-3 py-2 mt-1" rows="2" />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Long Description</label>
            <textarea name="longDesc" value={form.longDesc} onChange={handleChange} className="w-full border rounded px-3 py-2 mt-1" rows="4" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600">Media Type</label>
              <select name="mediaType" value={form.mediaType} onChange={handleChange} className="w-full border rounded px-3 py-2 mt-1">
                <option value="video">Video</option>
                <option value="image">Image</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600">Order</label>
              <input type="number" name="order" value={form.order} onChange={handleChange} className="w-full border rounded px-3 py-2 mt-1" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600">Upload Media (image/video)</label>
            <input type="file" accept="video/*,image/*" onChange={handleFile} className="w-full mt-2" />
            {preview && form.mediaType === "image" && <img src={preview} alt="preview" className="mt-3 w-60 h-36 object-cover rounded" />}
            {preview && form.mediaType === "video" && (
              <video src={preview} className="mt-3 w-full h-40 object-cover rounded" controls />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600">Button Text</label>
              <input name="buttonText" value={form.buttonText} onChange={handleChange} className="w-full border rounded px-3 py-2 mt-1" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Button Link (public path)</label>
              <input name="buttonLink" value={form.buttonLink} onChange={handleChange} className="w-full border rounded px-3 py-2 mt-1" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
              {loading ? "Saving..." : "Save & Add"}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default AddHomeService;
