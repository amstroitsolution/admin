import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function KidsSectionDataManager() {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [sectionData, setSectionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    if (selectedSection) {
      fetchSectionData();
    }
  }, [selectedSection]);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/kids-sections`);
      setSections(res.data.filter(s => s.isActive));
    } catch (error) {
      console.error('Error fetching Kids sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSectionData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/kids-sections/${selectedSection._id}/data`);
      setSectionData(res.data);
    } catch (error) {
      console.error('Error fetching Kids section data:', error);
    } finally {
      setLoading(false);
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

      const dataToSend = {
        data: formData,
        isActive: true,
        order: 0
      };

      if (editingData) {
        await axios.put(
          `${API}/api/kids-sections/${selectedSection._id}/data/${editingData._id}`,
          dataToSend,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Kids data updated successfully!');
      } else {
        await axios.post(
          `${API}/api/kids-sections/${selectedSection._id}/data`,
          dataToSend,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Kids data added successfully!');
      }

      resetForm();
      fetchSectionData();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving Kids data:', error);
      alert('Failed to save Kids data: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (data) => {
    setEditingData(data);
    setFormData(data.data);
    setShowModal(true);
  };

  const handleDelete = async (dataId) => {
    if (!window.confirm('Are you sure you want to delete this Kids item?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(
        `${API}/api/kids-sections/${selectedSection._id}/data/${dataId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Kids data deleted successfully!');
      fetchSectionData();
    } catch (error) {
      console.error('Error deleting Kids data:', error);
      alert('Failed to delete Kids data');
    }
  };

  const resetForm = () => {
    setFormData({});
    setEditingData(null);
  };

  const renderField = (field) => {
    const value = formData[field.name] || '';

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            placeholder={`Enter ${field.label.toLowerCase()}...`}
            required={field.required}
          />
        );
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            rows="4"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none"
            placeholder={`Enter ${field.label.toLowerCase()}...`}
            required={field.required}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            placeholder={`Enter ${field.label.toLowerCase()}...`}
            required={field.required}
          />
        );
      case 'boolean':
        return (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={value === true}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked })}
              className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500 cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-700">Yes</span>
          </label>
        );
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white"
            required={field.required}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case 'image':
      case 'images':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            placeholder="Enter image URL..."
            required={field.required}
          />
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            placeholder={`Enter ${field.label.toLowerCase()}...`}
            required={field.required}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Kids Section Data Manager</h2>
            <p className="text-gray-600 mt-1">Manage data for Kids sections</p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Select Kids Section <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedSection?._id || ''}
            onChange={(e) => {
              const section = sections.find(s => s._id === e.target.value);
              setSelectedSection(section);
            }}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white"
          >
            <option value="">Choose a Kids section...</option>
            {sections.map(section => (
              <option key={section._id} value={section._id}>
                {section.icon} {section.displayName}
              </option>
            ))}
          </select>
        </div>

        {selectedSection && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <FiPlus /> Add Data
          </button>
        )}
      </div>

      {selectedSection && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Data for: {selectedSection.displayName}
          </h3>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : sectionData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No data yet. Add your first item!</div>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {sectionData.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                >
                  <div className="mb-3">
                    {Object.entries(item.data).slice(0, 3).map(([key, val]) => (
                      <div key={key} className="text-sm mb-1">
                        <span className="font-medium text-gray-700">{key}:</span>{' '}
                        <span className="text-gray-600">{String(val).substring(0, 50)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                    >
                      <FiEdit2 /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {showModal && selectedSection && (
        <div 
          className="fixed bg-black/60 flex items-center justify-center p-4 overflow-y-auto" 
          style={{ 
            position: 'fixed',
            inset: 0,
            zIndex: 99999
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
              resetForm();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-3xl my-8"
            style={{ maxHeight: '90vh', zIndex: 100000 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col" style={{ maxHeight: '90vh' }}>
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10 rounded-t-xl">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingData ? '✏️ Edit Kids Data' : '➕ Add Kids Data'}
                </h3>
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-lg"
                  type="button"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 80px)' }}>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {selectedSection.fields.map(field => (
                    <div key={field.name}>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {renderField(field)}
                    </div>
                  ))}

                  <div className="flex gap-3 pt-6 border-t-2 border-gray-200">
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                    >
                      {editingData ? '✓ Update' : '➕ Add'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowModal(false); resetForm(); }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
