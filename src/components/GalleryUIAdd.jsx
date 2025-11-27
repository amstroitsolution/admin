import React, { useState } from "react";

const GalleryUIAdd = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    details: "",
    rightSection: "",
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setMessage("Please select an image");
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("details", formData.details);
    data.append("rightSection", formData.rightSection);
    data.append("image", image);

    try {
      const res = await fetch("http://localhost:5000/api/gallery-ui/add", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      if (res.ok) {
        setMessage("✅ Gallery item added successfully!");
        setFormData({
          title: "",
          description: "",
          details: "",
          rightSection: "",
        });
        setImage(null);
      } else {
        setMessage(result.message || "Error adding item");
      }
    } catch (err) {
      setMessage("❌ Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4">Add Gallery UI Item</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3">
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="description"
          placeholder="Short Description"
          value={formData.description}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <textarea
          name="details"
          placeholder="Full Details"
          value={formData.details}
          onChange={handleChange}
          className="border p-2 rounded"
          rows="4"
          required
        />
        <textarea
          name="rightSection"
          placeholder="Right Section Content"
          value={formData.rightSection}
          onChange={handleChange}
          className="border p-2 rounded"
          rows="3"
        />
        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
          className="border p-2 rounded"
          accept="image/*"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          {loading ? "Uploading..." : "Add Item"}
        </button>
      </form>

      {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
    </div>
  );
};

export default GalleryUIAdd;
