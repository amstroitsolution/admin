import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function MenuManager() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [editingSubmenu, setEditingSubmenu] = useState(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAddSubmenu, setShowAddSubmenu] = useState(null);
  const [expandedMenus, setExpandedMenus] = useState({});

  const [newMenuItem, setNewMenuItem] = useState({
    label: '',
    link: '',
    hasDropdown: false,
    order: 0,
    isActive: true
  });

  const [newSubmenu, setNewSubmenu] = useState({
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
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/menu`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMenuItems(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setLoading(false);
    }
  };

  const handleCreateMenuItem = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/menu`, newMenuItem, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewMenuItem({ label: '', link: '', hasDropdown: false, order: 0, isActive: true });
      setShowAddMenu(false);
      fetchMenuItems();
    } catch (error) {
      console.error('Error creating menu item:', error);
      alert('Failed to create menu item');
    }
  };

  const handleUpdateMenuItem = async (id, data) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/menu/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingItem(null);
      fetchMenuItems();
    } catch (error) {
      console.error('Error updating menu item:', error);
      alert('Failed to update menu item');
    }
  };

  const handleDeleteMenuItem = async (id) => {
    if (!confirm('Are you sure? This will delete all submenus too.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/menu/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMenuItems();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Failed to delete menu item');
    }
  };

  const handleCreateSubmenu = async (parentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/menu/submenus`, 
        { ...newSubmenu, parentMenuId: parentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewSubmenu({ name: '', slug: '', order: 0, isActive: true });
      setShowAddSubmenu(null);
      fetchMenuItems();
    } catch (error) {
      console.error('Error creating submenu:', error);
      alert('Failed to create submenu');
    }
  };

  const handleUpdateSubmenu = async (id, data) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/menu/submenus/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingSubmenu(null);
      fetchMenuItems();
    } catch (error) {
      console.error('Error updating submenu:', error);
      alert('Failed to update submenu');
    }
  };

  const handleDeleteSubmenu = async (id) => {
    if (!confirm('Are you sure you want to delete this submenu?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/menu/submenus/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMenuItems();
    } catch (error) {
      console.error('Error deleting submenu:', error);
      alert('Failed to delete submenu');
    }
  };

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  if (loading) {
    return <div className="p-8 text-center">Loading menu items...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Menu Manager</h1>
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-pink-700"
        >
          <FaPlus /> Add Menu Item
        </button>
      </div>

      {/* Add New Menu Item Form */}
      {showAddMenu && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border-2 border-pink-200">
          <h3 className="text-xl font-semibold mb-4">Add New Menu Item</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Label (e.g., Home)"
              value={newMenuItem.label}
              onChange={(e) => setNewMenuItem({ ...newMenuItem, label: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Link (e.g., /)"
              value={newMenuItem.link}
              onChange={(e) => setNewMenuItem({ ...newMenuItem, link: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Order"
              value={newMenuItem.order}
              onChange={(e) => setNewMenuItem({ ...newMenuItem, order: parseInt(e.target.value) })}
              className="border p-2 rounded"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newMenuItem.hasDropdown}
                onChange={(e) => setNewMenuItem({ ...newMenuItem, hasDropdown: e.target.checked })}
              />
              Has Dropdown
            </label>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleCreateMenuItem} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              <FaSave className="inline mr-2" /> Save
            </button>
            <button onClick={() => setShowAddMenu(false)} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
              <FaTimes className="inline mr-2" /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Menu Items List */}
      <div className="space-y-4">
        {menuItems.map((menu) => (
          <div key={menu._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Menu Item Header */}
            <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 border-b">
              {editingItem === menu._id ? (
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={menu.label}
                    onChange={(e) => {
                      const updated = menuItems.map(m => 
                        m._id === menu._id ? { ...m, label: e.target.value } : m
                      );
                      setMenuItems(updated);
                    }}
                    className="border p-2 rounded"
                  />
                  <input
                    type="text"
                    value={menu.link}
                    onChange={(e) => {
                      const updated = menuItems.map(m => 
                        m._id === menu._id ? { ...m, link: e.target.value } : m
                      );
                      setMenuItems(updated);
                    }}
                    className="border p-2 rounded"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateMenuItem(menu._id, menu)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      <FaSave />
                    </button>
                    <button
                      onClick={() => setEditingItem(null)}
                      className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleMenu(menu._id)}
                      className="text-pink-600 hover:text-pink-800"
                    >
                      {expandedMenus[menu._id] ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{menu.label}</h3>
                      <p className="text-sm text-gray-600">{menu.link}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${menu.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {menu.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {menu.hasDropdown && (
                      <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                        Has Dropdown ({menu.dropdown?.length || 0})
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingItem(menu._id)}
                      className="text-blue-600 hover:text-blue-800 p-2"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteMenuItem(menu._id)}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Submenus */}
            {expandedMenus[menu._id] && menu.hasDropdown && (
              <div className="p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-gray-700">Submenus</h4>
                  <button
                    onClick={() => setShowAddSubmenu(menu._id)}
                    className="bg-pink-500 text-white px-3 py-1 rounded text-sm hover:bg-pink-600"
                  >
                    <FaPlus className="inline mr-1" /> Add Submenu
                  </button>
                </div>

                {/* Add Submenu Form */}
                {showAddSubmenu === menu._id && (
                  <div className="bg-white p-4 rounded mb-4 border-2 border-pink-200">
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Name"
                        value={newSubmenu.name}
                        onChange={(e) => setNewSubmenu({ ...newSubmenu, name: e.target.value })}
                        className="border p-2 rounded text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Slug"
                        value={newSubmenu.slug}
                        onChange={(e) => setNewSubmenu({ ...newSubmenu, slug: e.target.value })}
                        className="border p-2 rounded text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Order"
                        value={newSubmenu.order}
                        onChange={(e) => setNewSubmenu({ ...newSubmenu, order: parseInt(e.target.value) })}
                        className="border p-2 rounded text-sm"
                      />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleCreateSubmenu(menu._id)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setShowAddSubmenu(null)}
                        className="bg-gray-400 text-white px-3 py-1 rounded text-sm hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Submenu List */}
                <div className="space-y-2">
                  {menu.dropdown?.map((submenu) => (
                    <div key={submenu._id} className="bg-white p-3 rounded border flex justify-between items-center">
                      {editingSubmenu === submenu._id ? (
                        <div className="grid grid-cols-3 gap-2 flex-1">
                          <input
                            type="text"
                            value={submenu.name}
                            onChange={(e) => {
                              const updated = menuItems.map(m => {
                                if (m._id === menu._id) {
                                  return {
                                    ...m,
                                    dropdown: m.dropdown.map(s =>
                                      s._id === submenu._id ? { ...s, name: e.target.value } : s
                                    )
                                  };
                                }
                                return m;
                              });
                              setMenuItems(updated);
                            }}
                            className="border p-1 rounded text-sm"
                          />
                          <input
                            type="text"
                            value={submenu.slug}
                            onChange={(e) => {
                              const updated = menuItems.map(m => {
                                if (m._id === menu._id) {
                                  return {
                                    ...m,
                                    dropdown: m.dropdown.map(s =>
                                      s._id === submenu._id ? { ...s, slug: e.target.value } : s
                                    )
                                  };
                                }
                                return m;
                              });
                              setMenuItems(updated);
                            }}
                            className="border p-1 rounded text-sm"
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleUpdateSubmenu(submenu._id, submenu)}
                              className="bg-green-600 text-white px-2 py-1 rounded text-sm"
                            >
                              <FaSave />
                            </button>
                            <button
                              onClick={() => setEditingSubmenu(null)}
                              className="bg-gray-400 text-white px-2 py-1 rounded text-sm"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <p className="font-medium text-gray-800">{submenu.name}</p>
                            <p className="text-xs text-gray-500">/{submenu.slug}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingSubmenu(submenu._id)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteSubmenu(submenu._id)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
