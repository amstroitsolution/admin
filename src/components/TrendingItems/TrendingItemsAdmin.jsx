import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function TrendingItemsAdmin() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    title: '', subtitle: '', description: '', category: '', price: '', originalPrice: '', badge: '', tags: '', link: '', order: 0, isActive: true
  });
  const [editId, setEditId] = useState(null);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API}/api/trending-items`);
      setItems(res.data);
    } catch (err) {
      console.error('Error fetching trending items:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach(key => {
      if (key === 'tags') {
        formData.append(key, JSON.stringify(form[key].split(',').map(t => t.trim())));
      } else {
        formData.append(key, form[key]);
      }
    });
    files.forEach(file => formData.append('images', file));

    try {
      if (editId) {
        await axios.put(`${API}/api/trending-items/${editId}`, formData);
      } else {
        await axios.post(`${API}/api/trending-items`, formData);
      }
      fetchItems();
      resetForm();
    } catch (err) {
      console.error('Error saving trending item:', err);
    }
  };

  const handleEdit = (item) => {
    setForm({
      title: item.title,
      subtitle: item.subtitle || '',
      description: item.description || '',
      category: item.category || '',
      price: item.price || '',
      originalPrice: item.originalPrice || '',
      badge: item.badge || '',
      tags: item.tags?.join(', ') || '',
      link: item.link || '',
      order: item.order || 0,
      isActive: item.isActive
    });
    setEditId(item._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this item?')) {
      try {
        await axios.delete(`${API}/api/trending-items/${id}`);
        fetchItems();
      } catch (err) {
        console.error('Error deleting:', err);
      }
    }
  };

  const resetForm = () => {
    setForm({ title: '', subtitle: '', description: '', category: '', price: '', originalPrice: '', badge: '', tags: '', link: '', order: 0, isActive: true });
    setEditId(null);
    setFiles([]);
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-pink-600">Trending Items Manager</h2>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Title*" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required className="border p-2 rounded" />
          <input type="text" placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({...form, subtitle: e.target.value})} className="border p-2 rounded" />
          <input type="text" placeholder="Category" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="border p-2 rounded" />
          <input type="number" placeholder="Price*" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} required className="border p-2 rounded" />
          <input type="number" placeholder="Original Price" value={form.originalPrice} onChange={(e) => setForm({...form, originalPrice: e.target.value})} className="border p-2 rounded" />
          <input type="text" placeholder="Badge" value={form.badge} onChange={(e) => setForm({...form, badge: e.target.value})} className="border p-2 rounded" />
          <input type="text" placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({...form, tags: e.target.value})} className="border p-2 rounded" />
          <input type="text" placeholder="Link" value={form.link} onChange={(e) => setForm({...form, link: e.target.value})} className="border p-2 rounded" />
          <input type="number" placeholder="Order" value={form.order} onChange={(e) => setForm({...form, order: e.target.value})} className="border p-2 rounded" />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({...form, isActive: e.target.checked})} />
            Active
          </label>
        </div>
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="border p-2 rounded w-full mt-4" rows="3" />
        <input type="file" multiple accept="image/*" onChange={(e) => setFiles([...e.target.files])} className="mt-4" />
        <div className="flex gap-2 mt-4">
          <button type="submit" className="bg-pink-600 text-white px-6 py-2 rounded hover:bg-pink-700">{editId ? 'Update' : 'Add'}</button>
          {editId && <button type="button" onClick={resetForm} className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">Cancel</button>}
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item._id} className="bg-white p-4 rounded-lg shadow-md">
            {item.images?.[0] && <img src={item.images[0].startsWith('http') ? item.images[0] : `${API}${item.images[0]}`} alt={item.title} className="w-full h-48 object-cover rounded mb-3" />}
            <h3 className="font-bold text-lg mb-2">{item.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
            <p className="text-pink-600 font-bold mb-3">₹{item.price?.toLocaleString()}</p>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(item)} className="bg-blue-500 text-white px-4 py-1 rounded text-sm hover:bg-blue-600">Edit</button>
              <button onClick={() => handleDelete(item._id)} className="bg-pink-500 text-white px-4 py-1 rounded text-sm hover:bg-[#de3cad]">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
