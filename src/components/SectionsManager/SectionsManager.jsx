import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiX } from 'react-icons/fi';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'number', label: 'Number' },
  { value: 'image', label: 'Single Image' },
  { value: 'images', label: 'Multiple Images' },
  { value: 'boolean', label: 'Yes/No' },
  { value: 'select', label: 'Dropdown' },
  { value: 'date', label: 'Date' }
];

const SECTION_TYPES = [
  { value: 'product', label: 'Product Section' },
  { value: 'content', label: 'Content Section' },
  { value: 'gallery', label: 'Gallery Section' },
  { value: 'custom', label: 'Custom Section' }
];

export default function SectionsManager() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    icon: '📦',
    type: 'custom',
    fields: [],
    isActive: true,
    showOnFrontend: true,
    order: 0
  });

  const [newField, setNewField] = useState({
    name: '',
    label: '',
    type: 'text',
    required: false,
    options: []
  });

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/sections`);
      setSections(res.data);
    } catch (error) {
      console.error('Error fetching sections:', error);
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

      if (editingSection) {
        await axios.put(`${API}/api/sections/${editingSection._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Section updated successfully!');
      } else {
        await axios.post(`${API}/api/sections`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Section created successfully!');
      }

      resetForm();
      fetchSections();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving section:', error);
      alert('Failed to save section: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (section) => {
    setEditingSection(section);
    setFormData({
      name: section.name,
      displayName: section.displayName,
      description: section.description || '',
      icon: section.icon || '📦',
      type: section.type,
      fields: section.fields || [],
      isActive: section.isActive,
      showOnFrontend: section.showOnFrontend,
      order: section.order || 0
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This will delete the section and all its data!')) return;

    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${API}/api/sections/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Section deleted successfully!');
      fetchSections();
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('Failed to delete section');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      displayName: '',
      description: '',
      icon: '📦',
      type: 'custom',
      fields: [],
      isActive: true,
      showOnFrontend: true,
      order: 0
    });
    setEditingSection(null);
    setNewField({
      name: '',
      label: '',
      type: 'text',
      required: false,
      options: []
    });
  };

  const addField = () => {
    if (!newField.name || !newField.label) {
      alert('Please fill field name and label');
      return;
    }

    setFormData({
      ...formData,
      fields: [...formData.fields, { ...newField }]
    });

    setNewField({
      name: '',
      label: '',
      type: 'text',
      required: false,
      options: []
    });
  };

  const removeField = (index) => {
    setFormData({
      ...formData,
      fields: formData.fields.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Sections Manager</h2>
            <p className="text-gray-600 mt-1">Create and manage custom sections for your website</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <FiPlus /> Create Section
          </button>
        </div>
      </div>

      {/* Sections List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">All Sections</h3>
        
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : sections.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No sections yet. Create your first section!</div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {sections.map((section, index) => (
              <motion.div
                key={section._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{section.icon}</span>
                    <div>
                      <h4 className="font-bold text-gray-800">{section.displayName}</h4>
                      <p className="text-xs text-gray-500">{section.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    {section.isActive ? (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex items-center gap-1">
                        <FiEye className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded flex items-center gap-1">
                        <FiEyeOff className="w-3 h-3" /> Inactive
                      </span>
                    )}
                    {section.showOnFrontend && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Frontend</span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {section.description || 'No description'}
                </p>

                <div className="text-xs text-gray-500 mb-3">
                  <div>Type: <span className="font-medium">{section.type}</span></div>
                  <div>Fields: <span className="font-medium">{section.fields?.length || 0}</span></div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(section)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                  >
                    <FiEdit2 /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(section._id)}
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
            className="bg-white rounded-xl shadow-2xl w-full max-w-5xl my-8 relative"
            style={{ 
              maxHeight: '90vh',
              zIndex: 100000
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col" style={{ maxHeight: '90vh' }}>
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10 rounded-t-xl">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingSection ? '✏️ Edit Section' : '➕ Create New Section'}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Section Name (ID) <span className="text-[#de3cad]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="e.g., new-arrivals"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Lowercase with hyphens only</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Display Name <span className="text-[#de3cad]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="e.g., New Arrivals"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">User-friendly name</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                      placeholder="Brief description of this section..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Icon (Emoji)</label>
                      <input
                        type="text"
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center text-2xl"
                        placeholder="📦"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Section Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                      >
                        {SECTION_TYPES.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Display Order</label>
                      <input
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-sm font-medium text-gray-700">✓ Active</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.showOnFrontend}
                        onChange={(e) => setFormData({ ...formData, showOnFrontend: e.target.checked })}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-sm font-medium text-gray-700">🌐 Show on Frontend</span>
                    </label>
                  </div>

                  {/* Fields Section */}
                  <div className="border-t-2 border-gray-200 pt-6">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="text-lg">📋</span> Section Fields
                    </h4>
                    
                    {/* Existing Fields */}
                    {formData.fields.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {formData.fields.map((field, index) => (
                          <div key={index} className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all">
                            <div className="flex-1">
                              <div className="font-semibold text-sm text-gray-800">{field.label}</div>
                              <div className="text-xs text-gray-600 mt-1">
                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{field.name}</span>
                                <span className="mx-1">•</span>
                                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">{field.type}</span>
                                {field.required && (
                                  <>
                                    <span className="mx-1">•</span>
                                    <span className="bg-pink-100 text-[#de3cad] px-2 py-0.5 rounded">Required</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeField(index)}
                              className="text-[#de3cad] hover:text-[#de3cad] hover:bg-pink-50 p-2 rounded-lg transition-all"
                            >
                              <FiX className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add New Field */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border-2 border-blue-200 space-y-4">
                      <div className="font-medium text-sm text-gray-700 mb-3">➕ Add New Field</div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <input
                            type="text"
                            value={newField.name}
                            onChange={(e) => setNewField({ ...newField, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Field name (e.g., product_name)"
                          />
                          <p className="text-xs text-gray-500 mt-1">Lowercase with underscores</p>
                        </div>
                        <div>
                          <input
                            type="text"
                            value={newField.label}
                            onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Field label (e.g., Product Name)"
                          />
                          <p className="text-xs text-gray-500 mt-1">Display name</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <select
                          value={newField.type}
                          onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                          className="flex-1 min-w-[200px] px-4 py-2 border-2 border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {FIELD_TYPES.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>

                        <label className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border-2 border-gray-300 cursor-pointer hover:border-blue-400 transition-all">
                          <input
                            type="checkbox"
                            checked={newField.required}
                            onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                            className="w-4 h-4 text-blue-600 cursor-pointer"
                          />
                          <span className="text-sm font-medium">Required</span>
                        </label>

                        <button
                          type="button"
                          onClick={addField}
                          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                        >
                          ➕ Add Field
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6 border-t-2 border-gray-200 sticky bottom-0 bg-white">
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                    >
                      {editingSection ? '✓ Update Section' : '➕ Create Section'}
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
