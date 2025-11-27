// src/components/WatchBuy/AddWatchBuy.jsx
import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";

export default function AddWatchBuy() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "video",
    file: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFile = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("type", formData.type);
    data.append("file", formData.file);

    try {
      await axios.post("http://localhost:5000/api/watchbuy", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Uploaded successfully!");
      setFormData({ title: "", description: "", type: "video", file: null });
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add Watch & Buy Item</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full border p-2 rounded"
          required
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full border p-2 rounded"
        ></textarea>

        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="video">Video</option>
          <option value="image">Image</option>
        </select>

        <input
          type="file"
          onChange={handleFile}
          accept={formData.type === "video" ? "video/*" : "image/*"}
          className="w-full border p-2 rounded"
          required
        />

        <Button type="submit">Upload</Button>
      </form>
    </div>
  );
}
