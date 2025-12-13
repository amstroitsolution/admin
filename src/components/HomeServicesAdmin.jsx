// client/admin/src/components/HomeServicesAdmin.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import AddHomeService from "./AddHomeService";
import EditHomeService from "./EditHomeService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API_BASE = `${API_BASE_URL}/api/home-services`;

const HomeServicesAdmin = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_BASE);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch home services:", err);
      alert("Failed to load home services. Check console.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this home service?")) return;
    // optimistic
    const before = items;
    setItems((p) => p.filter((i) => i._id !== id));
    try {
      await axios.delete(`${API_BASE}/admin/${id}`);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed. Reverting.");
      setItems(before);
    }
  };

  const onAdded = (newItem) => {
    // refresh or append
    fetchItems();
    setShowAdd(false);
  };

  const onUpdated = (updated) => {
    fetchItems();
    setEditing(null);
  };

  return (
    <div className="p-12 bg-gray-50 rounded-lg shadow min-h-[200vh]">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-2xl font-semibold text-gray-800">Home Services (Carousel)</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchItems()}
            className="px-3 py-2 bg-white border rounded text-sm"
          >
            Refresh
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
          >
            + Add Home Service
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No items found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {items.map((it) => (
            <div key={it._id} className="bg-white rounded-lg shadow overflow-hidden min-h-[96]">
              <div className="w-full h-96 bg-gray-100">
                {it.mediaType === "video" && it.mediaUrl ? (
                  <video
                    src={it.mediaUrl.startsWith("http") ? it.mediaUrl : `${API_BASE_URL}${it.mediaUrl}`}
                    className="w-full h-full object-cover"
                    controls={false}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  />
                ) : it.mediaUrl ? (
                  <img
                    src={it.mediaUrl.startsWith("http") ? it.mediaUrl : `${API_BASE_URL}${it.mediaUrl}`}
                    alt={it.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No media</div>
                )}
              </div>

              <div className="p-8">
                <h3 className="text-xl font-semibold text-gray-800">{it.title}</h3>
                <p className="text-base text-gray-500 mt-4 line-clamp-3">{it.shortDesc}</p>

                <div className="mt-8 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <div>Button: <span className="font-medium text-gray-800">{it.buttonText || "—"}</span></div>
                    <div>Order: <span className="font-medium">{it.order}</span></div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditing(it)}
                      className="px-3 py-1 border rounded text-sm bg-white hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(it._id)}
                      className="px-3 py-1 bg-rose-500 text-white rounded text-sm hover:bg-rose-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Drawer/Modal */}
      {showAdd && <AddHomeService onClose={() => setShowAdd(false)} onAdded={onAdded} />}

      {/* Edit Modal */}
      {editing && (
        <EditHomeService
          item={editing}
          onClose={() => setEditing(null)}
          onUpdated={onUpdated}
        />
      )}
    </div>
  );
};

export default HomeServicesAdmin;
