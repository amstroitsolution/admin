import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FiEdit2, FiTrash2, FiEye, FiEyeOff, FiUpload, FiX } from 'react-icons/fi';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function WomenProductsAdmin({ filterGroup = null }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [menuCategories, setMenuCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    categorySlug: '',
    price: '',
    sizes: [],
    colors: [],
    material: '',
    featured: false,
    isActive: true,
    order: 0
  });
  const [editingId, setEditingId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    fetchMenuCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchMenuCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await axios.get(`${API}/api/menu/active`);
      
      // Get menu items with dropdowns (Dresses, Sets, Bottoms, Kurtas, etc.)
      const categories = [];
      
      res.data.forEach(menu => {
        // Check if menu has dropdown
        if (menu.hasDropdown && menu.dropdown && menu.dropdown.length > 0) {
          const menuSlug = (menu.to || menu.link || '').replace(/^\//, ''); // Remove leading slash
          
          // If filterGroup is set, only show categories for that group
          if (!filterGroup || menu.label === filterGroup) {
            categories.push({
              _id: menu._id,
              name: menu.label,
              slug: menuSlug,
              isMainCategory: true
            });
            
            // Add subcategories
            menu.dropdown.forEach(sub => {
              categories.push({
                _id: sub._id,
                name: `${menu.label} → ${sub.name}`,
                slug: sub.slug,
                parentSlug: menuSlug,
                fullSlug: `${menuSlug}/${sub.slug}`,
                isMainCategory: false
              });
            });
          }
        }
      });
      
      setMenuCategories(categories);
    } catch (error) {
      console.error('Error fetching menu categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/women-products`);
      
      // If filterGroup is set, only show products from that group
      if (filterGroup) {
        const filtered = res.data.filter(product => {
          if (!product.category) return false;
          
          const categoryStr = String(product.category).toLowerCase();
          const filterStr = filterGroup.toLowerCase();
          
          // Match based on filterGroup:
          // "Dresses" → matches "Gown & Dresses", "Jumpsuits", etc.
          // "Sets" → matches "Coord Sets", "2 Pcs Kurta Sets", "Anarkali Sets", etc.
          // "Bottoms" → matches "Trouser & Pants", "Salwar & Leggings", "Palazzos", etc.
          // "Kurtas" → matches "Straight Kurtas", "Flared Kurtas", etc.
          
          if (filterStr === 'dresses') {
            return categoryStr.includes('dress') || categoryStr.includes('gown') || categoryStr.includes('jumpsuit');
          } else if (filterStr === 'sets') {
            return categoryStr.includes('set') && !categoryStr.includes('kurta');
          } else if (filterStr === 'bottoms') {
            return categoryStr.includes('pant') || categoryStr.includes('trouser') || 
                   categoryStr.includes('legging') || categoryStr.includes('palazzo') || 
                   categoryStr.includes('culotte') || categoryStr.includes('skirt') || 
                   categoryStr.includes('jegging');
          } else if (filterStr === 'kurtas') {
            return categoryStr.includes('kurta') && !categoryStr.includes('set');
          } else if (filterStr === 'wedding') {
            return categoryStr.includes('wedding') || categoryStr.includes('bridal') || 
                   categoryStr.includes('lehenga') || categoryStr.includes('saree');
          } else {
            // Default: check if category contains the filter word
            return categoryStr.includes(filterStr);
          }
        });
        setProducts(filtered);
      } else {
        // Show all products if no filter
        setProducts(res.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
    
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
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
      
      Object.keys(formData).forEach(key => {
        if (key === 'sizes' || key === 'colors') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      selectedImages.forEach(image => {
        formDataToSend.append('images', image);
      });

      if (editingId) {
        await axios.put(`${API}/api/women-products/${editingId}`, formDataToSend, {
          headers: { 
            Authorization: `Bearer ${token}`
          }
        });
        alert('Product updated successfully!');
      } else {
        await axios.post(`${API}/api/women-products`, formDataToSend, {
          headers: { 
            Authorization: `Bearer ${token}`
          }
        });
        alert('Product created successfully!');
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (product) => {
    setFormData({
      title: product.title,
      description: product.description || '',
      category: product.category,
      categorySlug: product.categorySlug || product.category,
      price: product.price || '',
      sizes: product.sizes || [],
      colors: product.colors || [],
      material: product.material || '',
      featured: product.featured || false,
      isActive: product.isActive,
      order: product.order || 0
    });
    setEditingId(product._id);
    if (product.images && product.images.length > 0) {
      setImagePreviews(product.images.map(img => `${API}${img}`));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${API}/api/women-products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      categorySlug: '',
      price: '',
      sizes: [],
      colors: [],
      material: '',
      featured: false,
      isActive: true,
      order: 0
    });
    setEditingId(null);
    setSelectedImages([]);
    setImagePreviews([]);
  };

  const handleArrayInput = (field, value) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData({ ...formData, [field]: array });
  };

  return (
    <div className="space-y-6">
      {/* Helper Message */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Old products have old category names. Click <strong>Edit</strong> on each product and select the correct category from the dropdown to update them.
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800">
          {editingId ? 'Edit Women Product' : 'Add New Women Product'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category * {loadingCategories && <span className="text-xs text-gray-500">(Loading...)</span>}
              </label>
              <select
                value={formData.categorySlug}
                onChange={(e) => {
                  const selectedCategory = menuCategories.find(cat => cat.slug === e.target.value);
                  setFormData({ 
                    ...formData, 
                    categorySlug: e.target.value,
                    category: selectedCategory ? selectedCategory.name : e.target.value
                  });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
                disabled={loadingCategories}
              >
                <option value="">Select Category</option>
                {menuCategories.map(cat => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name} ({cat.slug})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Categories are synced from Menu Manager
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Images (Max 5)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
                max="5"
              />
              <label htmlFor="image-upload" className="flex flex-col items-center justify-center cursor-pointer">
                <FiUpload className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Click to upload images</span>
                <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</span>
              </label>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mt-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-pink-500 text-white rounded-full p-1 hover:bg-[#e854c1]"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
              <input
                type="text"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Cotton, Silk, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sizes (comma separated)</label>
              <input
                type="text"
                value={formData.sizes.join(', ')}
                onChange={(e) => handleArrayInput('sizes', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="S, M, L, XL, XXL"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Colors (comma separated)</label>
              <input
                type="text"
                value={formData.colors.join(', ')}
                onChange={(e) => handleArrayInput('colors', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Red, Blue, Green"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 text-[#de3cad] border-gray-300 rounded focus:ring-pink-500"
              />
              <span className="text-sm font-medium text-gray-700">Featured</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-[#de3cad] border-gray-300 rounded focus:ring-pink-500"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-[#de3cad] to-[#e854c1] text-white rounded-lg hover:shadow-lg transition-all"
            >
              {editingId ? 'Update' : 'Create'} Product
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

      {/* Filter and List Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Women Products {filterGroup && `- ${filterGroup}`}
          </h3>
          <div className="text-sm text-gray-600">
            Total: {products.filter(p => !filterCategory || p.category === filterCategory).length} products
          </div>
        </div>

        {/* Category Filter Dropdown */}
        {products.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {[...new Set(products.map(p => p.category))].sort().map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No products yet</div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {products
              .filter(product => !filterCategory || product.category === filterCategory)
              .map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all"
              >
                {product.images && product.images.length > 0 && (
                  <img
                    src={`${API}${product.images[0]}`}
                    alt={product.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">{product.title}</h4>
                      <p className="text-sm text-gray-600">{product.category}</p>
                      {product.price && (
                        <p className="text-lg font-bold text-[#de3cad] mt-1">₹{product.price}</p>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      {product.featured && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Featured</span>
                      )}
                      {product.isActive ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex items-center gap-1">
                          <FiEye className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded flex items-center gap-1">
                          <FiEyeOff className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                    >
                      <FiEdit2 /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1 text-sm bg-pink-50 text-[#de3cad] rounded hover:bg-pink-100"
                    >
                      <FiTrash2 /> Delete
                    </button>
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
