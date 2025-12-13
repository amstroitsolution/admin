import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const EditService = () => {
  const { id } = useParams();
  const [form, setForm] = useState({
    title: "",
    shortDesc: "",
    longDesc: "",
    type: "",
  });
  const navigate = useNavigate();

  const fetchService = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const res = await axios.get(`${API_BASE}/api/services`);
      const found = res.data.services.find((s) => s._id === id);
      if (found) setForm(found);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      await axios.patch(`${API_BASE}/api/services/admin/${id}`, form);
      alert("✅ Service updated!");
      navigate("/services-admin");
    } catch (err) {
      console.error(err);
      alert("Error updating service");
    }
  };

  useEffect(() => {
    fetchService();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-xl rounded-2xl mt-8">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">
        Edit Service
      </h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-gray-600">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-lg mt-1"
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

        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          Update Service
        </button>
      </form>
    </div>
  );
};

export default EditService;
