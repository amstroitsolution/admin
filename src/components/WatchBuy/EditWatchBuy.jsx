// src/components/WatchBuy/EditWatchBuy.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function EditWatchBuy() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "video",
  });

  useEffect(() => {
    axios.get(`http://localhost:5000/api/watchbuy/${id}`).then((res) => {
      setFormData(res.data);
    });
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/watchbuy/${id}`, formData);
      alert("Updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Edit Watch & Buy Item</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full border p-2 rounded"
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

        <Button type="submit">Save Changes</Button>
      </form>
    </div>
  );
}
