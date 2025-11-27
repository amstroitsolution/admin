import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiUpload, FiX, FiImage, FiVideo } from 'react-icons/fi';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function HeroAdmin() {
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [videoPreview, setVideoPreview] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    ctaText: 'Learn More',
    ctaLink: '#',
    isActive: true,
    order: 0
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchHeroes();
  }, []);

  const fetchHeroes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/hero`);
      setHeroes(res.data);
    } catch (error) {
      console.error('Error fetching heroes:', error);
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

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedVideo(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        alert('Please login first');
        return;
      }

      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Append files
      if (selectedImage) {
        formDataToSend.append('backgroundImage', selectedImage);
      }
      if (selectedVideo) {
        formDataToSend.append('backgroundVideo', selectedVideo);
      }

      if (editingId) {
        await axios.put(`${API}/api/hero/${editingId}`, formDataToSend, {
          headers: { 
            Authorization: `Bearer ${token}`
          }
        });
        alert('Hero slide updated successfully!');
      } else {
        await axios.post(`${API}/api/hero`, formDataToSend, {
          headers: { 
            Authorization: `Bearer ${token}`
          }
        });
        alert('Hero slide created successfully!');
      }

      resetForm();
      fetchHeroes();
    } catch (error) {
      console.error('Error saving hero:', error);
      alert('Failed to save hero slide: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (hero) => {
    setFormData({
      title: hero.title,
      subtitle: hero.subtitle || '',
      description: hero.description || '',
      ctaText: hero.ctaText || 'Learn More',
      ctaLink: hero.ctaLink || '#',
      isActive: hero.isActive,
      order: hero.order || 0
    });
    setEditingId(hero._id);
    
    // Show existing media as previews
    if (hero.backgroundImage) {
      setImagePreview(`${API}${hero.backgroundImage}`);
    }
    if (hero.backgroundVideo) {
      setVideoPreview(`${API}${hero.backgroundVideo}`);
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hero slide?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${API}/api/hero/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Hero slide deleted successfully!');
      fetchHeroes();
    } catch (error) {
      console.error('Error deleting hero:', error);
      alert('Failed to delete hero slide');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      ctaText: 'Learn More',
      ctaLink: '#',
      isActive: true,
      order: 0
    });
    setEditingId(null);
    setSelectedImage(null);
    setSelectedVideo(null);
    setImagePreview('');
    setVideoPreview('');
  };

  return (
    <div className="space-y-6">
      {/* Form Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800">
          {editingId ? 'Edit Hero Slide' : 'Add New Hero Slide'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Background Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <FiImage className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Click to upload background image</span>
                <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</span>
              </label>
            </div>

            {imagePreview && (
              <div className="mt-4 relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview('');
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Background Video Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Video (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <FiVideo className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Click to upload background video</span>
                <span className="text-xs text-gray-500 mt-1">MP4, WEBM up to 50MB</span>
              </label>
            </div>

            {videoPreview && (
              <div className="mt-4 relative">
                <video
                  src={videoPreview}
                  className="w-full h-48 object-cover rounded"
                  controls
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVideo(null);
                    setVideoPreview('');
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CTA Button Text
              </label>
              <input
                type="text"
                value={formData.ctaText}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CTA Link
              </label>
              <input
                type="text"
                value={formData.ctaLink}
                onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Active (Show on website)
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              {editingId ? 'Update' : 'Create'} Hero Slide
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Hero Slides</h3>
        
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : heroes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No hero slides yet</div>
        ) : (
          <div className="grid gap-4">
            {heroes.map((hero, index) => (
              <motion.div
                key={hero._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
              >
                <div className="flex gap-4">
                  <div className="w-32 h-20 flex-shrink-0">
                    {hero.backgroundImage ? (
                      <img
                        src={`${API}${hero.backgroundImage}`}
                        alt={hero.title}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                        <FiImage className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-gray-800">{hero.title}</h4>
                        {hero.subtitle && (
                          <p className="text-sm text-gray-600">{hero.subtitle}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Order: {hero.order}</p>
                        {hero.backgroundVideo && (
                          <span className="inline-flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded mt-1">
                            <FiVideo /> Has Video
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {hero.isActive ? (
                          <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                            <FiEye /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                            <FiEyeOff /> Inactive
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleEdit(hero)}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                      >
                        <FiEdit2 /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(hero._id)}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
                      >
                        <FiTrash2 /> Delete
                      </button>
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
