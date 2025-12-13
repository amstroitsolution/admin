import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiUpload, FiX, FiArrowLeft } from 'react-icons/fi';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function SectionDataManager() {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [sectionData, setSectionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedImages, setSelectedImages] = useState({});
  const [imagePreviews, setImagePreviews] = useState({});

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
      const res = await axios.get(`${API}/api/sections`);
      setSections(res.data.filter(s => s.isActive));
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSectionData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/sections/${selectedSection._id}/data`);
      setSectionData(res.data);
    } catch (error) {
      console.error('Error fetching section data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (fieldName, e) => {
    const files = Array.from(e.target.files);
    setSelectedImages({
      ...selectedImages,
      [fieldName]: files
    });

    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews({
      ...imagePreviews,
      [fieldName]: previews
    });
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
          `${API}/api/sections/${selectedSection._id}/data/${editingData._id}`,
          dataToSend,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Data updated successfully!');
      } else {
        await axios.post(
          `${API}/api/sections/${selectedSection._id}/data`,
          dataToSend,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Data added successfully!');
      }

      resetForm();
      fetchSectionData();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Failed to save data: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (data) => {
    setEditingData(data);
    setFormData(data.data);
    setShowModal(true);
  };

  const handleDelete = async (dataId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(
        `${API}/api/sections/${selectedSection._id}/data/${dataId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Data deleted successfully!');
      fetchSectionData();
    } catch (error) {
      console.error('Error deleting data:', error);
      alert('Failed to delete data');
    }
  };

  const resetForm = () => {
    setFormData({});
    setEditingData(null);
    setSelectedImages({});
    setImagePreviews({});
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
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            placeholder={`Enter ${field.label.toLowerCase()}...`}
            required={field.required}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder={`Enter ${field.label.toLowerCase()}...`}
            required={field.required}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
            <input
              type="checkbox"
              checked={value === true || value === 'true'}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked })}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              id={`checkbox-${field.name}`}
            />
            <label htmlFor={`checkbox-${field.name}`} className="text-sm font-medium text-gray-700 cursor-pointer">
              Enable {field.label}
            </label>
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            required={field.required}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
            required={field.required}
          >
            <option value="">-- Select {field.label} --</option>
            {field.options?.map((option, idx) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'image':
      case 'images':
        return (
          <div className="space-y-3">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors bg-gray-50">
              <input
                type="file"
                accept="image/*"
                multiple={field.type === 'images'}
                onChange={(e) => handleImageSelect(field.name, e)}
                className="hidden"
                id={`image-${field.name}`}
              />
              <label htmlFor={`image-${field.name}`} className="flex flex-col items-center justify-center cursor-pointer">
                <FiUpload className="w-10 h-10 text-gray-400 mb-3" />
                <span className="text-sm font-medium text-gray-700 mb-1">
                  Click to upload {field.type === 'images' ? 'images' : 'image'}
                </span>
                <span className="text-xs text-gray-500">
                  {field.type === 'images' ? 'Multiple files supported' : 'Single file only'}
                </span>
              </label>
            </div>

            {imagePreviews[field.name] && imagePreviews[field.name].length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {imagePreviews[field.name].map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs opacity-0 group-hover:opacity-100">Preview {index + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {value && typeof value === 'string' && (
              <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                Current: {value}
              </div>
            )}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder={`Enter ${field.label.toLowerCase()}...`}
            required={field.required}
          />
        );
    }
  };

  if (!selectedSection) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Section Data Manager</h2>
          <p className="text-gray-600">Select a section to manage its data</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Available Sections</h3>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : sections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No sections available. Create a section first in Sections Manager.
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {sections.map((section) => (
                <motion.div
                  key={section._id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedSection(section)}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">{section.icon}</span>
                    <div>
                      <h4 className="font-bold text-gray-800">{section.displayName}</h4>
                      <p className="text-xs text-gray-500">{section.type}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {section.description || 'No description'}
                  </p>
                  <div className="mt-3 text-xs text-gray-500">
                    {section.fields?.length || 0} fields defined
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedSection(null)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xl">{selectedSection.icon}</span>
                <h2 className="text-2xl font-bold text-gray-800">{selectedSection.displayName}</h2>
              </div>
              <p className="text-gray-600 mt-1">{selectedSection.description}</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <FiPlus /> Add Data
          </button>
        </div>
      </div>

      {/* Data List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Section Data</h3>

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
                <div className="space-y-2 mb-4">
                  {selectedSection.fields?.slice(0, 3).map(field => (
                    <div key={field.name} className="text-sm">
                      <span className="font-medium text-gray-700">{field.label}:</span>{' '}
                      <span className="text-gray-600">
                        {field.type === 'boolean'
                          ? (item.data[field.name] ? 'Yes' : 'No')
                          : item.data[field.name] || '-'}
                      </span>
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
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-pink-50 text-[#de3cad] rounded hover:bg-pink-100"
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal - Fixed Overlay */}
      {showModal && (
        <div
          className="fixed bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
          style={{
            position: 'fixed',
            inset: 0,
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            zIndex: 99999,
            margin: 0,
            padding: '1rem'
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
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8 relative"
            style={{
              maxHeight: '90vh',
              zIndex: 100000
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col" style={{ maxHeight: '90vh' }}>
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10 rounded-t-xl">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingData ? 'Edit Data' : 'Add New Data'}
                </h3>
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  type="button"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 80px)' }}>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {!selectedSection.fields || selectedSection.fields.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="mb-2">No fields defined for this section.</p>
                      <p className="text-sm">Please add fields in the Sections Manager first.</p>
                    </div>
                  ) : (
                    <>
                      {selectedSection.fields.map((field, index) => (
                        <div key={field.name || index} className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-800">
                            {field.label || field.name}
                            {field.required && <span className="text-[#de3cad] ml-1">*</span>}
                            <span className="ml-2 text-xs font-normal text-gray-500">({field.type})</span>
                          </label>
                          {renderField(field)}
                          {field.type === 'select' && field.options && field.options.length > 0 && (
                            <p className="text-xs text-gray-500">
                              Options: {field.options.join(', ')}
                            </p>
                          )}
                        </div>
                      ))}

                      <div className="flex gap-3 pt-6 border-t sticky bottom-0 bg-white">
                        <button
                          type="submit"
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                        >
                          {editingData ? '✓ Update Data' : '+ Add Data'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowModal(false); resetForm(); }}
                          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
