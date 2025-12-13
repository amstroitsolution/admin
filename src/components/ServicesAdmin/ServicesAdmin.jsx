import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiSave, FiX, FiUpload, FiImage } from 'react-icons/fi';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function ServicesAdmin() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/api/services`);
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
      alert('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        alert('Please log in first');
        return;
      }

      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }

      if (editingItem) {
        await axios.put(`${API}/api/services/${editingItem._id}`, formDataToSend, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        alert('Service updated successfully!');
      } else {
        await axios.post(`${API}/api/services`, formDataToSend, {
          headers: { 
            Authorization: `Bearer ${token}`
          }
        });
        alert('Service created successfully!');
      }

      fetchServices();
      resetForm();
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Failed to save service: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${API}/api/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchServices();
      alert('Service deleted successfully!');
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      order: 0,
      isActive: true
    });
    setEditingItem(null);
    setShowAddForm(false);
    setSelectedImage(null);
    setImagePreview('');
  };

  const startEdit = (item) => {
    setFormData({
      title: item.title,
      description: item.description,
      order: item.order || 0,
      isActive: item.isActive
    });
    setEditingItem(item);
    setShowAddForm(true);
    if (item.image) {
      setImagePreview(`${API}${item.image}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="admin-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <FiImage className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold gradient-text">Services Section</h2>
              <p className="text-gray-600">Manage service cards displayed on homepage</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            <FiPlus /> Add Service
          </motion.button>
        </div>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="admin-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {editingItem ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Service Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="form-input"
                    placeholder="e.g., Garments Stitching"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-input"
                  rows="4"
                  placeholder="Describe the service..."
                  required
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="form-label">Service Icon/Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="service-image-upload"
                  />
                  <label
                    htmlFor="service-image-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <FiUpload className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload service icon</span>
                    <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</span>
                  </label>
                </div>

                {imagePreview && (
                  <div className="mt-4 relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview('');
                      }}
                      className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full p-1 hover:bg-[#de3cad]"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>

                <div className="flex gap-3 ml-auto">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                  >
                    <FiSave /> {editingItem ? 'Update' : 'Create'}
                  </motion.button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Services List */}
      <div className="admin-card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          All Services ({services.length})
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="loading-spinner"></div>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FiImage className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No services found. Add your first service!</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service, index) => (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300"
              >
                {service.image && (
                  <img
                    src={`${API}${service.image}`}
                    alt={service.title}
                    className="w-16 h-16 object-contain mx-auto mb-3"
                  />
                )}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-800">{service.title}</h4>
                    {service.isActive ? (
                      <FiEye className="w-4 h-4 text-green-500" />
                    ) : (
                      <FiEyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">{service.description}</p>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                    Order: {service.order}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => startEdit(service)}
                    className="flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                  >
                    <FiEdit2 className="w-4 h-4 mx-auto" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(service._id)}
                    className="flex-1 p-2 text-[#de3cad] hover:bg-pink-50 rounded-lg transition-colors text-sm"
                  >
                    <FiTrash2 className="w-4 h-4 mx-auto" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
