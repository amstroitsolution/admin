import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ServicesAdmin = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/services");
      setServices(res.data.services || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/services/admin/${id}`);
      setServices((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting service");
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  if (loading)
    return <div className="text-center mt-10 text-lg font-medium">Loading...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">All Services</h1>
        <Link
          to="/add-service"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          + Add New Service
        </Link>
      </div>

      {services.length === 0 ? (
        <p className="text-gray-600">No services found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {services.map((srv) => (
            <div
              key={srv._id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <img
                src={
                  srv.images && srv.images.length
                    ? srv.images[0]
                    : "https://via.placeholder.com/400x250?text=No+Image"
                }
                alt={srv.title}
                className="w-full h-48 object-cover rounded-t-xl"
              />
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800 truncate">
                  {srv.title}
                </h2>
                <p className="text-gray-500 text-sm line-clamp-2">
                  {srv.shortDesc || "No description"}
                </p>
                <div className="mt-3 flex justify-between">
                  <Link
                    to={`/edit-service/${srv._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(srv._id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServicesAdmin;
