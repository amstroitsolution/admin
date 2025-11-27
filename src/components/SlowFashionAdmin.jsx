import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiEye, FiEyeOff, FiSave, FiX, FiTag, FiExternalLink } from 'react-icons/fi';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function SlowFashionAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    category: 'Fashion',
    buttonText: 'Explore More',
    buttonLink: '#',
    tags: [],
    order: 0,
    isActive: true
  });
  const [tagInput, setTagInput] = useState('');

  // Fetch all items
  const fetchItems = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching Slow Fashion from:', `${API}/api/slow-fashion`);
      const response = await axios.get(`${API}/api/slow-fashion`);
      console.log('✅ Slow Fashion fetched:', response.data);
      setItems(response.data);
    } catch (error) {
      console.error('❌ Error fetching items:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch items';
      alert(`Failed to fetch items: ${errorMessage}\n\nPlease check:\n1. Backend server is running\n2. API endpoint is accessible\n3. Database is connected`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (editingItem) {
        await axios.put(`${API}/api/slow-fashion/${editingItem._id}`, formData, config);
      } else {
        await axios.post(`${API}/api/slow-fashion`, formData, config);
      }

      fetchItems();
      resetForm();
      alert(editingItem ? 'Item updated successfully!' : 'Item created successfully!');
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save item');
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        alert('You need to be logged in to delete items. Please log in again.');
        window.location.href = '/admin/login';
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      console.log('🗑️ Deleting fashion item with token:', token ? 'Token exists' : 'No token');
      await axios.delete(`${API}/api/slow-fashion/${id}`, config);
      fetchItems();
      alert('Item deleted successfully!');
    } catch (error) {
      console.error('❌ Error deleting item:', error);
      
      if (error.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_info');
        window.location.href = '/admin/login';
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete item';
        alert(`Failed to delete item: ${errorMessage}`);
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image: '',
      category: 'Fashion',
      buttonText: 'Explore More',
      buttonLink: '#',
      tags: [],
      order: 0,
      isActive: true
    });
    setTagInput('');
    setEditingItem(null);
    setShowAddForm(false);
  };

  // Start editing
  const startEdit = (item) => {
    setFormData({
      title: item.title,
      description: item.description,
      image: item.image,
      category: item.category || 'Fashion',
      buttonText: item.buttonText || 'Explore More',
      buttonLink: item.buttonLink || '#',
      tags: item.tags || [],
      order: item.order || 0,
      isActive: item.isActive
    });
    setEditingItem(item);
    setShowAddForm(true);
  };

  // Add tag
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="admin-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white shadow-lg">
              <FiImage className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold gradient-text">Slow Fashion Finds & Trendsetters</h2>
              <p className="text-gray-600">Manage fashion content and trends</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            <FiPlus /> Add Item
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
                {editingItem ? 'Edit Fashion Item' : 'Add New Fashion Item'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="form-label">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="md:col-span-2">
                <label className="form-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-input"
                  rows="3"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="form-label">Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="form-input"
                  required
                />
                {formData.image && (
                  <div className="mt-2">
                    <img 
                      src={formData.image} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded-lg border"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="form-label">Button Text</label>
                <input
                  type="text"
                  value={formData.buttonText}
                  onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Button Link</label>
                <input
                  type="url"
                  value={formData.buttonLink}
                  onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                  className="form-input"
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

              <div>
                <label className="form-label">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="form-input flex-1"
                    placeholder="Add a tag..."
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      <FiTag className="w-3 h-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-green-600 rounded"
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
                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                  >
                    <FiSave /> {editingItem ? 'Update' : 'Create'}
                  </motion.button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Items List */}
      <div className="admin-card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          All Fashion Items ({items.length})
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="loading-spinner"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FiImage className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No fashion items found. Add your first item!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {items.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-24 h-24 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/96x96?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-800">{item.title}</h4>
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                            {item.category}
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                            Order: {item.order}
                          </span>
                          {item.isActive ? (
                            <FiEye className="w-4 h-4 text-green-500" />
                          ) : (
                            <FiEyeOff className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                        
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {item.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                              >
                                <FiTag className="w-3 h-3" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Button: {item.buttonText}</span>
                          {item.buttonLink !== '#' && (
                            <a
                              href={item.buttonLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                            >
                              <FiExternalLink className="w-3 h-3" />
                              Link
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => startEdit(item)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(item._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}