import React, { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API_URL = `${API}/api/watchbuy`;

export default function WatchBuyAdmin() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
  });
  const [media, setMedia] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all Watch & Buy items
  const fetchItems = async () => {
    try {
      const res = await axios.get(API_URL);
      setItems(res.data);
    } catch (err) {
      console.error("❌ Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // ✅ Handle submit with auth token
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!media) {
      alert("Please select a media file!");
      return;
    }

    const token = localStorage.getItem("admin_token"); // ✅ Fixed: use admin_token
    if (!token) {
      alert("You are not logged in! Please login again.");
      return;
    }

    const form = new FormData();
    form.append("title", formData.title);
    form.append("description", formData.description);
    form.append("price", formData.price);
    form.append("media", media);
    if (thumbnail) form.append("thumbnail", thumbnail);

    try {
      setLoading(true);
      await axios.post(API_URL, form, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ fixed header
        },
      });
      alert("✅ Uploaded successfully!");
      setFormData({ title: "", description: "", price: "" });
      setMedia(null);
      setThumbnail(null);
      setMediaPreview(null);
      setThumbnailPreview(null);
      // Reset file inputs
      document.getElementById('media-input').value = '';
      document.getElementById('thumbnail-input').value = '';
      fetchItems();
    } catch (err) {
      console.error("❌ Upload failed:", err);
      alert("Upload failed! Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // Handle media file selection with preview
  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMedia(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle thumbnail file selection with preview
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ Delete item with auth token
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;

    const token = localStorage.getItem("admin_token"); // ✅ Fixed: use admin_token
    if (!token) {
      alert("You are not logged in! Please login again.");
      return;
    }

    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ fixed
        },
      });
      fetchItems();
    } catch (err) {
      console.error("❌ Delete error:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="admin-card p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
            <span className="text-3xl">🎥</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold gradient-text">Watch & Buy Admin</h2>
            <p className="text-gray-600">Upload videos and images for your collection showcase</p>
          </div>
        </div>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="admin-card p-6 space-y-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Upload New Item</h3>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Latest Collection Showcase"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (₹)
            </label>
            <input
              type="number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., 2999"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows="3"
              placeholder="Describe your collection..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Media (Video/Image) <span className="text-red-500">*</span>
            </label>
            <input
              id="media-input"
              type="file"
              required
              accept="video/*,image/*"
              onChange={handleMediaChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported: MP4, MOV, JPG, PNG (Max 50MB)
            </p>
            {mediaPreview && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                {media?.type.startsWith('video') ? (
                  <video
                    src={mediaPreview}
                    controls
                    className="w-full max-h-64 rounded-lg border border-gray-200"
                  />
                ) : (
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    className="w-full max-h-64 object-cover rounded-lg border border-gray-200"
                  />
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail (Optional)
            </label>
            <input
              id="thumbnail-input"
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Used as video poster/preview image
            </p>
            {thumbnailPreview && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Thumbnail Preview:</p>
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail Preview"
                  className="w-full max-h-32 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Uploading..." : "Upload Item"}
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({ title: "", description: "", price: "" });
              setMedia(null);
              setThumbnail(null);
              setMediaPreview(null);
              setThumbnailPreview(null);
              document.getElementById('media-input').value = '';
              document.getElementById('thumbnail-input').value = '';
            }}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
          >
            Clear Form
          </button>
        </div>
      </form>

      {/* Uploaded Items List */}
      <div className="admin-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            Uploaded Items ({items.length})
          </h3>
          <button
            onClick={fetchItems}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium"
          >
            Refresh
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <span className="text-6xl mb-4 block">🎥</span>
            <p className="text-gray-500 text-lg">No items uploaded yet</p>
            <p className="text-gray-400 text-sm mt-2">Upload your first video or image above</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, index) => (
              <div
                key={item._id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
              >
                {/* Media */}
                <div className="relative overflow-hidden bg-gray-100">
                  {item.mediaType === "video" ? (
                    <video
                      controls
                      className="w-full h-56 object-cover"
                      src={item.mediaUrl?.startsWith('http') ? item.mediaUrl : `${API}${item.mediaUrl}`}
                      poster={item.thumbnailUrl ? (item.thumbnailUrl.startsWith('http') ? item.thumbnailUrl : `${API}${item.thumbnailUrl}`) : undefined}
                    />
                  ) : (
                    <img
                      src={item.mediaUrl?.startsWith('http') ? item.mediaUrl : `${API}${item.mediaUrl}`}
                      alt={item.title}
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  )}
                  
                  {/* Media Type Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-black/70 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                      {item.mediaType === "video" ? "🎥 Video" : "🖼️ Image"}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h4 className="font-bold text-gray-800 text-lg mb-2 line-clamp-1">
                    {item.title}
                  </h4>
                  
                  {item.price && (
                    <p className="text-purple-600 font-bold text-xl mb-2">
                      ₹{item.price}
                    </p>
                  )}
                  
                  {item.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {item.description}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <span>Item #{index + 1}</span>
                    {item.createdAt && (
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
