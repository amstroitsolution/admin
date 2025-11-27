import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiEye, FiEyeOff } from 'react-icons/fi';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function TopStripAdmin() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    message: 'Free Shipping on Orders Above ₹999 | Easy Returns | 24/7 Customer Support',
    isActive: true
  });

  useEffect(() => {
    fetchTopStrip();
  }, []);

  const fetchTopStrip = async () => {
    try {
      const res = await axios.get(`${API}/api/top-strip`);
      if (res.data) {
        setFormData(res.data);
      }
    } catch (error) {
      console.error('Error fetching top strip:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      await axios.post(`${API}/api/top-strip`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Top strip updated successfully!');
    } catch (error) {
      console.error('Error saving top strip:', error);
      alert('Failed to save top strip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="admin-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold gradient-text">Top Announcement Strip</h2>
            <p className="text-gray-600">Manage the announcement bar at the top of your website</p>
          </div>
          <div className={`px-4 py-2 rounded-full ${formData.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
            {formData.isActive ? <><FiEye className="inline mr-2" />Active</> : <><FiEyeOff className="inline mr-2" />Inactive</>}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="form-label">Announcement Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="form-input"
              rows="3"
              placeholder="Enter announcement message..."
              required
            />
            <p className="text-sm text-gray-500 mt-2">This message will appear at the top of all pages</p>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-pink-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Show announcement strip</span>
            </label>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <FiSave /> {loading ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </div>
        </form>

        {/* Preview */}
        <div className="mt-8 p-4 bg-gray-50 rounded-xl">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Preview:</h3>
          <div className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white text-center py-2 text-sm rounded-lg">
            <p>{formData.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
