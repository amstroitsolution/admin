import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiStar, FiEye, FiEyeOff, FiSave, FiX } from 'react-icons/fi';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function OurValuesAdmin() {
  const [values, setValues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState('values'); // 'values' or 'settings'
  const [settings, setSettings] = useState(null);
  const [settingsForm, setSettingsForm] = useState({
    sectionHeading: '',
    mainDescription: '',
    subDescription: '',
    sectionImage: '',
    imageAlt: ''
  });
  const [sectionImageFile, setSectionImageFile] = useState(null);
  const [sectionImagePreview, setSectionImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '',
    emoji: '⭐',
    order: 0,
    isActive: true
  });

  // Fetch all values
  const fetchValues = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching Our Values from:', `${API}/api/our-values`);
      const response = await axios.get(`${API}/api/our-values`);
      console.log('✅ Our Values fetched:', response.data);
      setValues(response.data);
    } catch (error) {
      console.error('❌ Error fetching values:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch values';
      alert(`Failed to fetch values: ${errorMessage}\n\nPlease check:\n1. Backend server is running\n2. API endpoint is accessible\n3. Database is connected`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch settings
  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/api/our-values-settings`);
      setSettings(response.data);
      setSettingsForm({
        sectionHeading: response.data.sectionHeading || '',
        mainDescription: response.data.mainDescription || '',
        subDescription: response.data.subDescription || '',
        sectionImage: response.data.sectionImage || '',
        imageAlt: response.data.imageAlt || ''
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  // Handle section image file selection
  const handleSectionImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSectionImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSectionImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save settings
  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        alert('Please login as admin first');
        return;
      }

      console.log('🔄 Submitting Our Values settings with:', {
        sectionHeading: settingsForm.sectionHeading,
        mainDescription: settingsForm.mainDescription,
        subDescription: settingsForm.subDescription,
        imageAlt: settingsForm.imageAlt,
        hasImageFile: !!sectionImageFile,
        imageFileName: sectionImageFile?.name,
        existingImage: settingsForm.sectionImage
      });

      const form = new FormData();
      form.append('sectionHeading', settingsForm.sectionHeading);
      form.append('mainDescription', settingsForm.mainDescription);
      form.append('subDescription', settingsForm.subDescription);
      form.append('imageAlt', settingsForm.imageAlt);
      
      if (sectionImageFile) {
        console.log('📎 Appending image file:', sectionImageFile.name, sectionImageFile.size, 'bytes');
        form.append('sectionImage', sectionImageFile);
      } else if (settingsForm.sectionImage) {
        console.log('🔗 Using existing image URL:', settingsForm.sectionImage);
        form.append('sectionImageUrl', settingsForm.sectionImage);
      }

      console.log('📤 Sending request to:', `${API}/api/our-values-settings`);
      const response = await axios.put(`${API}/api/our-values-settings`, form, {
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      });

      console.log('✅ Settings saved successfully:', response.data);
      fetchSettings();
      setSectionImageFile(null);
      setSectionImagePreview(null);
      alert('Settings updated successfully!');
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      alert('Failed to save settings: ' + (error.response?.data?.message || error.message));
    }
  };

  useEffect(() => {
    fetchValues();
    fetchSettings();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        alert('You need to be logged in to save items. Please log in again.');
        window.location.href = '/admin/login';
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (editingItem) {
        await axios.put(`${API}/api/our-values/${editingItem._id}`, formData, config);
      } else {
        await axios.post(`${API}/api/our-values`, formData, config);
      }

      fetchValues();
      resetForm();
      alert(editingItem ? 'Value updated successfully!' : 'Value created successfully!');
    } catch (error) {
      console.error('❌ Error saving value:', error);
      
      if (error.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_info');
        window.location.href = '/admin/login';
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to save value';
        alert(`Failed to save value: ${errorMessage}`);
      }
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this value?')) return;

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

      console.log('🗑️ Deleting value with token:', token ? 'Token exists' : 'No token');
      await axios.delete(`${API}/api/our-values/${id}`, config);
      fetchValues();
      alert('Value deleted successfully!');
    } catch (error) {
      console.error('❌ Error deleting value:', error);
      
      if (error.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_info');
        window.location.href = '/admin/login';
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete value';
        alert(`Failed to delete value: ${errorMessage}`);
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      icon: '',
      emoji: '⭐',
      order: 0,
      isActive: true
    });
    setEditingItem(null);
    setShowAddForm(false);
  };

  // Start editing
  const startEdit = (item) => {
    setFormData({
      title: item.title,
      description: item.description,
      icon: item.icon || '',
      emoji: item.emoji || '⭐',
      order: item.order || 0,
      isActive: item.isActive
    });
    setEditingItem(item);
    setShowAddForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="admin-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <FiStar className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold gradient-text">Our Values</h2>
              <p className="text-gray-600">Manage company values and principles</p>
            </div>
          </div>
          {activeTab === 'values' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <FiPlus /> Add Value
            </motion.button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('values')}
            className={`px-4 py-2 font-medium transition-all ${
              activeTab === 'values'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Values Cards
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 font-medium transition-all ${
              activeTab === 'settings'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Section Settings (Image & Text)
          </button>
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
                {editingItem ? 'Edit Value' : 'Add New Value'}
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
                <label className="form-label">Emoji</label>
                <input
                  type="text"
                  value={formData.emoji}
                  onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                  className="form-input"
                  placeholder="⭐"
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

              <div>
                <label className="form-label">Icon URL (optional)</label>
                <input
                  type="url"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="form-input"
                  placeholder="https://example.com/icon.png"
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

              <div className="md:col-span-2 flex items-center gap-4">
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

      {/* Settings Form */}
      {activeTab === 'settings' && (
        <div className="admin-card p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Section Settings</h3>
          <form onSubmit={handleSettingsSubmit} className="space-y-6">
            <div>
              <label className="form-label">Section Heading</label>
              <input
                type="text"
                value={settingsForm.sectionHeading}
                onChange={(e) => setSettingsForm({ ...settingsForm, sectionHeading: e.target.value })}
                className="form-input"
                placeholder="Our Values"
              />
            </div>

            <div>
              <label className="form-label">Main Description (Left Side)</label>
              <textarea
                value={settingsForm.mainDescription}
                onChange={(e) => setSettingsForm({ ...settingsForm, mainDescription: e.target.value })}
                className="form-input"
                rows="4"
                placeholder="The Odd Factory is dedicated to..."
              />
            </div>

            <div>
              <label className="form-label">Sub Description (Left Side)</label>
              <textarea
                value={settingsForm.subDescription}
                onChange={(e) => setSettingsForm({ ...settingsForm, subDescription: e.target.value })}
                className="form-input"
                rows="4"
                placeholder="Our goal is to ensure..."
              />
            </div>

            <div>
              <label className="form-label">Section Image (Right Side)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleSectionImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-sm text-gray-500 mt-2">
                📸 Upload image file (JPG, PNG, WebP)
              </p>
              {(sectionImagePreview || settingsForm.sectionImage) && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <img
                    src={
                      sectionImagePreview || 
                      (settingsForm.sectionImage?.startsWith('http') 
                        ? settingsForm.sectionImage 
                        : `${API}${settingsForm.sectionImage}`)
                    }
                    alt="Preview"
                    className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="form-label">Image Alt Text</label>
              <input
                type="text"
                value={settingsForm.imageAlt}
                onChange={(e) => setSettingsForm({ ...settingsForm, imageAlt: e.target.value })}
                className="form-input"
                placeholder="Our Values - Team Working"
              />
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <FiSave /> Save Settings
              </motion.button>
              <button
                type="button"
                onClick={fetchSettings}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Values List */}
      {activeTab === 'values' && (
        <div className="admin-card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          All Values ({values.length})
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="loading-spinner"></div>
          </div>
        ) : values.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FiStar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No values found. Add your first value!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {values.map((value, index) => (
              <motion.div
                key={value._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-2xl">
                      {value.icon ? (
                        <img src={value.icon} alt="" className="w-8 h-8" />
                      ) : (
                        value.emoji
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-800">{value.title}</h4>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                          Order: {value.order}
                        </span>
                        {value.isActive ? (
                          <FiEye className="w-4 h-4 text-green-500" />
                        ) : (
                          <FiEyeOff className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">{value.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => startEdit(value)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(value._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      )}
    </div>
  );
}