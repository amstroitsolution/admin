import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddService = () => {
  const [form, setForm] = useState({
    title: "",
    shortDesc: "",
    longDesc: "",
    type: "design",
  });
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(form).forEach((key) => data.append(key, form[key]));
    if (image) data.append("image", image);

    const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    
    try {
      await axios.post(`${API_BASE}/api/services/admin`, data);
      alert("✅ Service added successfully!");
      navigate("/services-admin");
    } catch (err) {
      console.error(err);
      alert("Error adding service");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-xl rounded-2xl mt-8">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">
        Add New Service
      </h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-gray-600">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-lg mt-1 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-600">Short Description</label>
          <textarea
            name="shortDesc"
            value={form.shortDesc}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-lg mt-1"
            rows="2"
          />
        </div>

        <div>
          <label className="block text-gray-600">Long Description</label>
          <textarea
            name="longDesc"
            value={form.longDesc}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-lg mt-1"
            rows="4"
          />
        </div>

        <div>
          <label className="block text-gray-600">Service Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-lg mt-1"
          >
            <option value="design">Design</option>
            <option value="stitching">Stitching</option>
            <option value="sale">Sale</option>
            <option value="rent">Rent</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-600">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full mt-2"
          />
          {image && (
            <img
              src={URL.createObjectURL(image)}
              alt="Preview"
              className="mt-4 w-40 h-32 object-cover rounded-lg shadow"
            />
          )}
        </div>

        <button
          type="submit"
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
        >
          Add Service
        </button>
      </form>
    </div>
  );
};

export default AddService;
