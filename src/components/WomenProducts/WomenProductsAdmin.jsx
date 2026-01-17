import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FiEdit2, FiTrash2, FiEye, FiEyeOff, FiUpload, FiX } from 'react-icons/fi';

const API = (import.meta.env.VITE_API_BASE_URL || 'https://api.yashper.com').replace(/\/$/, "");

export default function WomenProductsAdmin({ filterGroup = null }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]); // New files to upload
  const selectedImagesRef = useRef([]); // Backup ref to prevent loss
  const [existingImages, setExistingImages] = useState([]); // URLs of images already on server
  const [menuCategories, setMenuCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    categorySlug: '',
    price: '',
    sizes: '',
    colors: '',
    material: '',
    featured: false,
    isActive: true,
    order: 0
  });
  // Persist editingId across hot reloads
  const [editingId, setEditingId] = useState(() => {
    const saved = sessionStorage.getItem('editingProductId');
    return saved || null;
  });
  const [filterCategory, setFilterCategory] = useState('');

  // Save editingId AND selectedImages to sessionStorage when they change
  useEffect(() => {
    if (editingId) {
      sessionStorage.setItem('editingProductId', editingId);
      console.log('💾 Saved editingId to session:', editingId);
    } else {
      sessionStorage.removeItem('editingProductId');
    }
    console.log('🆔 editingId changed to:', editingId);
  }, [editingId]);

  // Persist selectedImages count to prevent loss
  useEffect(() => {
    if (selectedImages.length > 0) {
      sessionStorage.setItem('hasSelectedImages', 'true');
      console.log('💾 Saved hasSelectedImages flag');
    } else {
      sessionStorage.removeItem('hasSelectedImages');
    }
  }, [selectedImages]);

  useEffect(() => {
    fetchMenuCategories();
  }, []);

  useEffect(() => {
    // Always fetch products on mount
    fetchProducts();
  }, []); // Empty dependency - only runs once on mount

  // Restore selectedImages from ref if it gets cleared unexpectedly
  useEffect(() => {
    if (selectedImages.length === 0 && selectedImagesRef.current.length > 0 && editingId) {
      console.log('🔄 Restoring selectedImages from ref:', selectedImagesRef.current.length);
      setSelectedImages(selectedImagesRef.current);
    }
  }, [selectedImages, editingId]);

  const fetchMenuCategories = async () => {
    try {
      setLoadingCategories(true);

      // Try to get categories from menu first
      const menuRes = await axios.get(`${API}/api/menu/active`);
      const categories = [];

      menuRes.data.forEach(menu => {
        const hasValidDropdown = menu.dropdown && Array.isArray(menu.dropdown) && menu.dropdown.length > 0;

        if (hasValidDropdown) {
          const menuSlug = (menu.to || menu.link || '').replace(/^\//, '');

          if (!filterGroup || menu.label === filterGroup) {
            categories.push({
              _id: menu._id,
              name: menu.label,
              slug: menuSlug,
              isMainCategory: true
            });

            menu.dropdown.forEach(sub => {
              const subSlug = sub.slug || sub.to || sub.link || '';
              categories.push({
                _id: sub._id || `${menu._id}-${sub.name}`,
                name: sub.name,
                displayName: `${menu.label} → ${sub.name}`,
                slug: subSlug.replace(/^\//, ''),
                parentSlug: menuSlug,
                fullSlug: `${menuSlug}/${subSlug.replace(/^\//, '')}`,
                isMainCategory: false
              });
            });
          }
        }
      });

      // If no categories from menu, get unique categories from existing products
      if (categories.length === 0) {
        console.log('⚠️ No menu categories found, fetching from products...');
        const productsRes = await axios.get(`${API}/api/women-products`);
        const allCategories = productsRes.data.map(p => p.category).filter(Boolean);
        const uniqueCategories = [...new Set(allCategories)];

        console.log('📦 All unique categories in database:', uniqueCategories);

        // Filter categories based on filterGroup
        uniqueCategories
          .filter(cat => {
            // If filterGroup is set, only show categories that start with that group
            if (filterGroup) {
              // Check if category starts with "Dresses →", "Sets →", etc.
              return cat.startsWith(`${filterGroup} →`);
            }
            // If no filterGroup, show all categories that have the arrow format
            return cat.includes(' → ');
          })
          .forEach(cat => {
            categories.push({
              _id: cat,
              name: cat,
              displayName: cat,
              slug: cat.toLowerCase().replace(/\s+/g, '-').replace(/→/g, ''),
              isMainCategory: false
            });
          });

        console.log(`✅ Loaded categories for ${filterGroup || 'All'}:`, categories.map(c => c.name));
      }

      console.log('✅ Final Categories:', categories);
      console.log('📊 Total Categories:', categories.length);

      setMenuCategories(categories);
    } catch (error) {
      console.error('❌ Error fetching menu categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchProducts = async () => {
    console.log('🔄 fetchProducts called');
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
          // "Sets" → matches "Coord Sets", "2 Pcs Kurta Sets", "Anarkali Sets", "Anarkali", etc.
          // "Bottoms" → matches "Trouser & Pants", "Salwar & Leggings", "Palazzos", "Sharara", etc.
          // "Kurtas" → matches "Straight Kurtas", "Flared Kurtas", etc.

          if (filterStr === 'dresses') {
            return categoryStr.includes('dress') || categoryStr.includes('gown') || categoryStr.includes('jumpsuit');
          } else if (filterStr === 'sets') {
            return categoryStr.includes('set') || categoryStr.includes('anarkali');
          } else if (filterStr === 'bottoms') {
            return categoryStr.includes('pant') || categoryStr.includes('trouser') ||
              categoryStr.includes('legging') || categoryStr.includes('palazzo') ||
              categoryStr.includes('culotte') || categoryStr.includes('skirt') ||
              categoryStr.includes('jegging') || categoryStr.includes('sharara') ||
              categoryStr.includes('bottom');
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
    console.log('📸 Selected files:', files.length);

    if (existingImages.length + selectedImages.length + files.length > 5) {
      alert('You can only upload up to 5 images per product.');
      e.target.value = ''; // Reset input
      return;
    }

    const newImages = [...selectedImages, ...files];
    setSelectedImages(newImages);
    selectedImagesRef.current = newImages; // Store in ref
    console.log('✅ Images added to state:', files.length, 'Total now:', newImages.length);

    // Don't reset the input value
    // e.target.value = '';
  };

  const removeExistingImage = (index) => {
    console.log('🗑️ Removing existing image at index:', index);
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    console.log('🗑️ Removing new image at index:', index);
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    selectedImagesRef.current = newImages; // Update ref
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('🚀 Starting form submission...');
    console.log('📦 Selected images count:', selectedImages.length);
    console.log('🖼️ Existing images count:', existingImages.length);

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        alert('Please login first');
        return;
      }

      const formDataToSend = new FormData();

      // Append basic fields
      Object.keys(formData).forEach(key => {
        if (key === 'sizes' || key === 'colors') {
          // Split string to array then stringify to send as JSON array (so backend receives ["S","M"])
          const val = formData[key] ? String(formData[key]) : '';
          const array = val.split(',').map(item => item.trim()).filter(Boolean);
          formDataToSend.append(key, JSON.stringify(array));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append existing images (as JSON string)
      formDataToSend.append('existingImages', JSON.stringify(existingImages));
      console.log('📋 Existing images being sent:', existingImages);

      // Append new image files
      console.log('📤 Appending new images to FormData...');
      selectedImages.forEach((image, index) => {
        console.log(`  - Image ${index + 1}:`, image.name, image.type, image.size);
        formDataToSend.append('images', image);
      });

      // Log FormData contents
      console.log('📦 FormData contents:');
      for (let pair of formDataToSend.entries()) {
        if (pair[0] === 'images') {
          console.log(`  ${pair[0]}:`, pair[1].name || pair[1]);
        } else {
          console.log(`  ${pair[0]}:`, pair[1]);
        }
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      console.log('🌐 Sending request to backend...');

      if (editingId) {
        const response = await axios.put(`${API.replace(/\/$/, '')}/api/women-products/${editingId}`, formDataToSend, config);
        console.log('✅ Backend response:', response.data);
        alert('Product updated successfully!');
      } else {
        const response = await axios.post(`${API.replace(/\/$/, '')}/api/women-products`, formDataToSend, config);
        console.log('✅ Backend response:', response.data);
        alert('Product created successfully!');
      }

      resetForm();
      // Force fetch products after successful save, bypassing the check
      console.log('✅ Product saved, fetching updated list...');
      sessionStorage.removeItem('hasSelectedImages');
      sessionStorage.removeItem('editingProductId');
      try {
        setLoading(true);
        const res = await axios.get(`${API}/api/women-products`);
        if (filterGroup) {
          const filtered = res.data.filter(product => {
            if (!product.category) return false;
            // Re-apply filter logic
            const categoryStr = String(product.category).toLowerCase();
            const filterStr = filterGroup.toLowerCase();

            if (filterStr === 'dresses') {
              return categoryStr.includes('dress') || categoryStr.includes('gown') || categoryStr.includes('jumpsuit');
            } else if (filterStr === 'sets') {
              return categoryStr.includes('set') || categoryStr.includes('anarkali');
            } else if (filterStr === 'bottoms') {
              return categoryStr.includes('pant') || categoryStr.includes('trouser') ||
                categoryStr.includes('legging') || categoryStr.includes('palazzo') ||
                categoryStr.includes('culotte') || categoryStr.includes('skirt') ||
                categoryStr.includes('jegging') || categoryStr.includes('sharara') ||
                categoryStr.includes('bottom');
            } else if (filterStr === 'kurtas') {
              return categoryStr.includes('kurta') && !categoryStr.includes('set');
            } else if (filterStr === 'wedding') {
              return categoryStr.includes('wedding') || categoryStr.includes('bridal') ||
                categoryStr.includes('lehenga') || categoryStr.includes('saree');
            } else {
              return categoryStr.includes(filterStr);
            }
          });
          setProducts(filtered);
        } else {
          setProducts(res.data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (product) => {
    console.log('✏️ handleEdit called for product:', product._id, 'Currently editing:', editingId);

    // If we're already editing this SAME product, don't overwrite the form
    // This prevents losing selectedImages when fetchProducts updates the product list
    if (editingId === product._id) {
      console.log('⚠️ Already editing this product - skipping handleEdit to preserve state');
      return;
    }

    // Check if user has unsaved images
    if (selectedImages.length > 0) {
      const confirmSwitch = window.confirm('You have unsaved images. Do you want to discard them and edit a different product?');
      if (!confirmSwitch) {
        return;
      }
    }

    // Clear selectedImages when editing a DIFFERENT product
    setSelectedImages([]);
    selectedImagesRef.current = [];
    sessionStorage.removeItem('hasSelectedImages');

    setFormData({
      title: product.title,
      description: product.description || '',
      category: product.category,
      categorySlug: product.categorySlug || product.category,
      price: product.price || '',
      sizes: (product.sizes || []).join(', '),
      colors: (product.colors || []).join(', '),
      material: product.material || '',
      featured: product.featured || false,
      isActive: product.isActive,
      order: product.order || 0
    });
    setEditingId(product._id);
    setExistingImages(product.images || []);
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
      sizes: '',
      colors: '',
      material: '',
      featured: false,
      isActive: true,
      order: 0
    });
    setEditingId(null);
    setSelectedImages([]);
    selectedImagesRef.current = []; // Clear ref
    setExistingImages([]);
    // Clear session storage
    sessionStorage.removeItem('editingProductId');
    sessionStorage.removeItem('hasSelectedImages');
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
                    category: selectedCategory ? (selectedCategory.displayName || selectedCategory.name) : e.target.value
                  });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
                disabled={loadingCategories}
              >
                <option value="">Select Category</option>
                {menuCategories
                  .filter(cat => !cat.isMainCategory) // Only show subcategories
                  .map(cat => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.displayName || cat.name}
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
                key={selectedImages.length} // Force re-render when images change
              />
              <label htmlFor="image-upload" className="flex flex-col items-center justify-center cursor-pointer">
                <FiUpload className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Click to upload images</span>
                <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</span>
              </label>
            </div>

            {/* Image Previews */}
            {(existingImages.length > 0 || selectedImages.length > 0) && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                {console.log('🖼️ Rendering previews - Existing:', existingImages.length, 'New:', selectedImages.length)}
                {/* Existing Images */}
                {existingImages.map((img, index) => (
                  <div key={`existing-${index}`} className="relative group">
                    <img
                      src={img.startsWith('http') ? img : `${API.replace(/\/$/, '')}/${img.replace(/^\//, '')}`}
                      alt={`Existing ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-100"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] py-1 px-2 rounded-b-lg">
                      Existing Image
                    </div>
                  </div>
                ))}

                {/* New Image Previews */}
                {selectedImages.map((file, index) => {
                  console.log('🆕 Rendering new image:', index, file.name);
                  return (
                    <div key={`new-${index}`} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-pink-100"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full p-1.5 shadow-lg hover:bg-pink-600 transition-colors"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-pink-500/80 text-white text-[10px] py-1 px-2 rounded-b-lg font-medium">
                        New Upload
                      </div>
                    </div>
                  );
                })}
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
                value={formData.sizes}
                onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="S, M, L, XL, XXL"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Colors (comma separated)</label>
              <input
                type="text"
                value={formData.colors}
                onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
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
            Total: {products.filter(product => {
              if (!filterCategory) return true;
              const pCat = (product.category || '').toLowerCase();
              const fCat = filterCategory.toLowerCase();
              return pCat.includes(fCat) || fCat.includes(pCat);
            }).length} products
          </div>
        </div>

        {/* Category Filter Dropdown */}
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
            {menuCategories
              .filter(cat => !cat.isMainCategory) // Only show subcategories
              .map(cat => (
                <option key={cat.slug} value={cat.name}>
                  {cat.name}
                </option>
              ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No products yet</div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {products
              .filter(product => {
                if (!filterCategory) return true;
                const pCat = (product.category || '').toLowerCase();
                const fCat = filterCategory.toLowerCase();
                // Match if either contains the other (handles singular/plural better)
                return pCat.includes(fCat) || fCat.includes(pCat);
              })
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
                      src={product.images[0].startsWith('http') ? product.images[0] : `${API.replace(/\/$/, '')}/${product.images[0].replace(/^\//, '')}`}
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

