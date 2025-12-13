import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiSave, FiX, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function NavbarAdmin() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAddSubmenu, setShowAddSubmenu] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [editingSubmenu, setEditingSubmenu] = useState(null);
  const [selectedParent, setSelectedParent] = useState(null);
  const [expandedMenus, setExpandedMenus] = useState({});

  const [menuForm, setMenuForm] = useState({
    label: '',
    link: '',
    hasDropdown: false,
    order: 0,
    isActive: true
  });

  const [submenuForm, setSubmenuForm] = useState({
    parentMenuId: '',
    name: '',
    slug: '',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/api/menu`);
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      alert('Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMenu = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        alert('Please log in first');
        return;
      }

      if (editingMenu) {
        await axios.put(`${API}/api/menu/${editingMenu._id}`, menuForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Menu item updated successfully!');
      } else {
        await axios.post(`${API}/api/menu`, menuForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Menu item created successfully!');
      }

      fetchMenuItems();
      resetMenuForm();
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Failed to save menu item');
    }
  };

  const handleSubmitSubmenu = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        alert('Please log in first');
        return;
      }

      if (editingSubmenu) {
        await axios.put(`${API}/api/menu/submenus/${editingSubmenu._id}`, submenuForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Submenu updated successfully!');
      } else {
        await axios.post(`${API}/api/menu/submenus`, submenuForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Submenu created successfully!');
      }

      fetchMenuItems();
      resetSubmenuForm();
    } catch (error) {
      console.error('Error saving submenu:', error);
      alert('Failed to save submenu');
    }
  };

  const handleDeleteMenu = async (id) => {
    if (!window.confirm('Are you sure? This will delete all submenus too!')) return;

    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${API}/api/menu/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMenuItems();
      alert('Menu item deleted successfully!');
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Failed to delete menu item');
    }
  };

  const handleDeleteSubmenu = async (id) => {
    if (!window.confirm('Are you sure you want to delete this submenu?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${API}/api/menu/submenus/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMenuItems();
      alert('Submenu deleted successfully!');
    } catch (error) {
      console.error('Error deleting submenu:', error);
      alert('Failed to delete submenu');
    }
  };

  const resetMenuForm = () => {
    setMenuForm({
      label: '',
      link: '',
      hasDropdown: false,
      order: 0,
      isActive: true
    });
    setEditingMenu(null);
    setShowAddMenu(false);
  };

  const resetSubmenuForm = () => {
    setSubmenuForm({
      parentMenuId: '',
      name: '',
      slug: '',
      order: 0,
      isActive: true
    });
    setEditingSubmenu(null);
    setShowAddSubmenu(false);
    setSelectedParent(null);
  };

  const startEditMenu = (menu) => {
    setMenuForm({
      label: menu.label,
      link: menu.to || menu.link,
      hasDropdown: menu.hasDropdown,
      order: menu.order || 0,
      isActive: menu.isActive
    });
    setEditingMenu(menu);
    setShowAddMenu(true);
  };

  const startEditSubmenu = (submenu, parentId) => {
    setSubmenuForm({
      parentMenuId: parentId,
      name: submenu.name,
      slug: submenu.slug,
      order: submenu.order || 0,
      isActive: submenu.isActive
    });
    setEditingSubmenu(submenu);
    setShowAddSubmenu(true);
  };

  const startAddSubmenu = (parentId) => {
    setSubmenuForm({
      ...submenuForm,
      parentMenuId: parentId
    });
    setSelectedParent(parentId);
    setShowAddSubmenu(true);
  };

  const toggleExpand = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="admin-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <FiMenu className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold gradient-text">Navigation Menu Manager</h2>
              <p className="text-gray-600">Manage navbar menu items and dropdowns</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddMenu(true)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            <FiPlus /> Add Menu Item
          </motion.button>
        </div>
      </div>

      {/* Add/Edit Menu Form */}
      <AnimatePresence>
        {showAddMenu && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="admin-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {editingMenu ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button onClick={resetMenuForm} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitMenu} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Menu Label</label>
                  <input
                    type="text"
                    value={menuForm.label}
                    onChange={(e) => setMenuForm({ ...menuForm, label: e.target.value })}
                    className="form-input"
                    placeholder="e.g., Dresses"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Link</label>
                  <input
                    type="text"
                    value={menuForm.link}
                    onChange={(e) => setMenuForm({ ...menuForm, link: e.target.value })}
                    className="form-input"
                    placeholder="e.g., /dresses"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Order</label>
                  <input
                    type="number"
                    value={menuForm.order}
                    onChange={(e) => setMenuForm({ ...menuForm, order: parseInt(e.target.value) })}
                    className="form-input"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={menuForm.hasDropdown}
                      onChange={(e) => setMenuForm({ ...menuForm, hasDropdown: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Has Dropdown</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={menuForm.isActive}
                      onChange={(e) => setMenuForm({ ...menuForm, isActive: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={resetMenuForm} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                >
                  <FiSave /> {editingMenu ? 'Update' : 'Create'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Submenu Form */}
      <AnimatePresence>
        {showAddSubmenu && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="admin-card p-6 bg-indigo-50"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {editingSubmenu ? 'Edit Submenu Item' : 'Add New Submenu Item'}
              </h3>
              <button onClick={resetSubmenuForm} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSubmenu} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Parent Menu</label>
                  <select
                    value={submenuForm.parentMenuId}
                    onChange={(e) => setSubmenuForm({ ...submenuForm, parentMenuId: e.target.value })}
                    className="form-input"
                    required
                  >
                    <option value="">Select Parent Menu</option>
                    {menuItems.filter(m => m.hasDropdown).map(menu => (
                      <option key={menu._id} value={menu._id}>{menu.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Submenu Name</label>
                  <input
                    type="text"
                    value={submenuForm.name}
                    onChange={(e) => setSubmenuForm({ ...submenuForm, name: e.target.value })}
                    className="form-input"
                    placeholder="e.g., Gown and Dresses"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Slug</label>
                  <input
                    type="text"
                    value={submenuForm.slug}
                    onChange={(e) => setSubmenuForm({ ...submenuForm, slug: e.target.value })}
                    className="form-input"
                    placeholder="e.g., gown-and-dresses"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Order</label>
                  <input
                    type="number"
                    value={submenuForm.order}
                    onChange={(e) => setSubmenuForm({ ...submenuForm, order: parseInt(e.target.value) })}
                    className="form-input"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={submenuForm.isActive}
                      onChange={(e) => setSubmenuForm({ ...submenuForm, isActive: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={resetSubmenuForm} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                >
                  <FiSave /> {editingSubmenu ? 'Update' : 'Create'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu Items List */}
      <div className="admin-card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          All Menu Items ({menuItems.length})
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="loading-spinner"></div>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FiMenu className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No menu items found. Add your first menu item!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {menuItems.map((menu, index) => (
              <motion.div
                key={menu._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                {/* Main Menu Item */}
                <div className="p-4 bg-white hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {menu.hasDropdown && (
                        <button
                          onClick={() => toggleExpand(menu._id)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          {expandedMenus[menu._id] ? (
                            <FiChevronDown className="w-5 h-5" />
                          ) : (
                            <FiChevronRight className="w-5 h-5" />
                          )}
                        </button>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-800">{menu.label}</h4>
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                            Order: {menu.order}
                          </span>
                          {menu.hasDropdown && (
                            <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                              Has Dropdown ({menu.dropdown?.length || 0})
                            </span>
                          )}
                          {menu.isActive ? (
                            <FiEye className="w-4 h-4 text-green-500" />
                          ) : (
                            <FiEyeOff className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{menu.to || menu.link}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {menu.hasDropdown && (
                        <button
                          onClick={() => startAddSubmenu(menu._id)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors text-sm"
                        >
                          <FiPlus className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => startEditMenu(menu)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMenu(menu._id)}
                        className="p-2 text-[#de3cad] hover:bg-pink-50 rounded-lg transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submenus */}
                <AnimatePresence>
                  {expandedMenus[menu._id] && menu.dropdown && menu.dropdown.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-indigo-50 border-t border-indigo-100"
                    >
                      <div className="p-4 space-y-2">
                        {menu.dropdown.map((submenu) => (
                          <div
                            key={submenu._id}
                            className="flex items-center justify-between p-3 bg-white rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-800">{submenu.name}</span>
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                                  {submenu.slug}
                                </span>
                                {submenu.isActive ? (
                                  <FiEye className="w-3 h-3 text-green-500" />
                                ) : (
                                  <FiEyeOff className="w-3 h-3 text-gray-400" />
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => startEditSubmenu(submenu, menu._id)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              >
                                <FiEdit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteSubmenu(submenu._id)}
                                className="p-1 text-[#de3cad] hover:bg-pink-50 rounded transition-colors"
                              >
                                <FiTrash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
