// client/admin/src/components/AddSaree.jsx
import React, { useRef, useState } from "react";

export default function AddSaree() {
  const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [details, setDetails] = useState(""); // 🆕 new field for long details/specs
  const [price, setPrice] = useState("");
  const [type, setType] = useState("saree");
  const [imageFile, setImageFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    
    // Validation
    if (!title.trim()) {
      setMsg("Title is required");
      return;
    }
    if (!price || isNaN(Number(price))) {
      setMsg("Valid price is required");
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      console.log("🔐 Admin token exists:", !!token);
      
      if (!token) {
        setMsg("No admin token found. Please login again.");
        setLoading(false);
        return;
      }

      const form = new FormData();
      form.append("title", title.trim());
      form.append("description", description.trim());
      form.append("details", details.trim());
      form.append("price", price);
      form.append("type", type);
      
      if (imageFile) {
        console.log("📎 Image file:", {
          name: imageFile.name,
          size: imageFile.size,
          type: imageFile.type
        });
        form.append("image", imageFile);
      }

      console.log("📤 Submitting form to:", `${API}/api/equipment`);
      console.log("📋 Form data:", { 
        title: title.trim(), 
        description: description.trim(), 
        details: details.trim(), 
        price, 
        type, 
        hasImage: !!imageFile 
      });
      
      const res = await fetch(`${API}/api/equipment`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      console.log("📥 Response status:", res.status, res.statusText);
      
      let data;
      try {
        data = await res.json();
        console.log("📄 Response data:", data);
      } catch (parseError) {
        console.error("❌ Failed to parse response as JSON:", parseError);
        setMsg(`Server error: ${res.status} ${res.statusText}`);
        setLoading(false);
        return;
      }
      
      if (!res.ok) {
        const errorMsg = data.message || data.error || `Upload failed (${res.status})`;
        console.error("❌ Server error:", errorMsg);
        setMsg(errorMsg);
        setLoading(false);
        return;
      }

      console.log("✅ Success! Item added:", data.item);
      setMsg("✅ Added: " + (data.item?.title || "success"));
      
      // reset form
      setTitle("");
      setDescription("");
      setDetails("");
      setPrice("");
      setType("saree");
      setImageFile(null);
      if (fileRef.current) fileRef.current.value = "";

      // broadcast event so dashboard can refresh automatically if it listens
      try {
        window.dispatchEvent(new Event("equipment:added"));
        console.log("📡 Broadcast event sent");
      } catch (e) {
        console.warn("⚠️ Failed to broadcast event:", e);
      }
    } catch (err) {
      console.error("❌ Network/Fetch error:", err);
      setMsg(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-3 py-2"
          placeholder="Enter saree title"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-3 py-2"
          placeholder="Short description (optional)"
        />
      </div>

      {/* 🆕 Details */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={4}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-3 py-2"
          placeholder="Enter long details or specifications (optional)"
        />
      </div>

      {/* Price + Type */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-3 py-2"
            placeholder="0 (numeric)"
            inputMode="numeric"
          />
        </div>

        <div className="w-40">
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="saree">Saree</option>
            <option value="lehenga">Lehenga</option>
          </select>
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>

        <div className="flex items-center gap-3">
          <label
            htmlFor="image-upload"
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm cursor-pointer hover:bg-gray-50"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            id="image-upload"
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="sr-only"
          />

          <div className="text-sm text-gray-600">
            {imageFile ? (
              <span className="inline-block max-w-xs truncate">{imageFile.name}</span>
            ) : (
              <span className="text-gray-400">No file chosen</span>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          📸 Supported formats: JPG, JPEG, PNG, WebP (Max 5MB)
        </p>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-md text-sm shadow-sm disabled:opacity-60"
        >
          {loading ? "Adding..." : "Add Saree"}
        </button>

        <div className="text-sm text-gray-600">{msg}</div>
      </div>
    </form>
  );
}