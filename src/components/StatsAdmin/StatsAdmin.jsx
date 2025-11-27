import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiBarChart, FiTrendingUp } from 'react-icons/fi';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function StatsAdmin() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    label: '',
    value: 0,
    suffix: '+',
    order: 0,
    isActive: true
  });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/stats`);
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        alert('Please login as admin first');
        return;
      }

      if (editing) {
        await axios.put(`${API}/api/stats/${editing._id}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API}/api/stats`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setForm({ label: '', value: 0, suffix: '+', order: 0, isActive: true });
      setEditing(null);
      fetchStats();
      alert(editing ? 'Stat updated successfully!' : 'Stat added successfully!');
    } catch (err) {
      console.error('Error saving stat:', err);
      alert('Error saving stat: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (stat) => {
    setEditing(stat);
    setForm({
      label: stat.label,
      value: stat.value,
      suffix: stat.suffix || '+',
      order: stat.order || 0,
      isActive: stat.isActive
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this stat?')) return;
    
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        alert('Please login as admin first');
        return;
      }

      await axios.delete(`${API}/api/stats/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStats();
      alert('Stat deleted successfully!');
    } catch (err) {
      console.error('Error deleting stat:', err);
      alert('Error deleting stat: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setForm({ label: '', value: 0, suffix: '+', order: 0, isActive: true });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="admin-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
              <FiBarChart className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold gradient-text">Stats Counter Management</h2>
              <p className="text-gray-600 mt-1">Manage the statistics displayed on the homepage</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold gradient-text">{stats.length}</div>
            <div className="text-sm text-gray-600">Total Stats</div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="admin-card p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FiTrendingUp className="text-red-600" />
          {editing ? 'Edit Stat' : 'Add New Stat'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Label <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., Active Clients"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., 820"
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suffix
              </label>
              <input
                type="text"
                value={form.suffix}
                onChange={(e) => setForm({ ...form, suffix: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., +, k+, %, M+"
              />
              <p className="text-xs text-gray-500 mt-1">
                Appears after the number (e.g., "820+" or "90k+")
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Order
              </label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="0"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower numbers appear first
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
              Active (visible on website)
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-lg font-medium hover:shadow-lg transition-all hover:scale-105"
            >
              {editing ? 'Update Stat' : 'Add Stat'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={fetchStats}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
            >
              Refresh
            </button>
          </div>
        </form>
      </div>

      {/* Stats List */}
      <div className="admin-card p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Existing Stats</h3>
        
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <p className="text-gray-500 mt-4">Loading stats...</p>
          </div>
        )}

        {!loading && stats.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <FiBarChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No stats yet</p>
            <p className="text-gray-400 text-sm mt-2">Add your first stat using the form above</p>
          </div>
        )}

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-3xl text-gray-800 mb-1">
                    {stat.value.toLocaleString()}{stat.suffix}
                  </h4>
                  <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {stat.isActive ? (
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                      Inactive
                    </span>
                  )}
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    Order: {stat.order}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(stat)}
                  className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(stat._id)}
                  className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all font-medium"
                >
                  Delete
                </button>
              </div>

              {stat.createdAt && (
                <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                  Created: {new Date(stat.createdAt).toLocaleDateString()}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="admin-card p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-blue-600">💡</span>
          Quick Tips
        </h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Use suffixes like "+", "k+", or "%" to format your numbers</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Set display order to control the sequence of stats on the homepage</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Toggle "Active" to show/hide stats without deleting them</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Stats appear in the counter section on the homepage</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
