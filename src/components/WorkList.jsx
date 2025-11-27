// client/admin/src/components/WorkList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import EditWorkModal from "./EditWorkModal";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const FALLBACK_ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || "";

export default function WorkList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);

  async function load() {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/works`);
      const data = Array.isArray(res.data) ? res.data : res.data.items || [];
      setList(data);
    } catch (err) {
      console.error("WorkList load error:", err);
      alert("Failed to load works");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const onAdded = () => load();
    window.addEventListener("work:added", onAdded);
    return () => window.removeEventListener("work:added", onAdded);
  }, []);

  async function removeWork(id) {
    if (!window.confirm("Delete this work?")) return;
    try {
      const token = localStorage.getItem("admin_token") || FALLBACK_ADMIN_TOKEN;
      // optimistic UI
      setList((prev) => prev.filter((w) => w._id !== id));
      await axios.delete(`${API}/api/works/${id}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      alert("Deleted");
      load();
    } catch (err) {
      console.error("Remove work error:", err);
      alert("Failed to delete");
      load();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Works</h3>
        <button onClick={load} className="text-sm px-3 py-1 border rounded">Refresh</button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : list.length === 0 ? (
        <div>No works found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((w) => (
            <div key={w._id} className="border rounded overflow-hidden">
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                {w.images && w.images[0] ? (
                  <img src={w.images[0]} alt={w.title} className="object-cover w-full h-full" />
                ) : (
                  <div className="text-sm text-gray-500">No image</div>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{w.title}</h4>
                  <div className="text-sm text-gray-500">{w.category}</div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{w.shortDescription}</p>

                <div className="mt-3 flex gap-2">
                  <button onClick={() => setEditing(w)} className="px-3 py-1 border rounded text-sm">Edit</button>
                  <button onClick={() => removeWork(w._id)} className="px-3 py-1 border rounded text-sm text-red-600">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <EditWorkModal
          work={editing}
          onClose={() => { setEditing(null); load(); }}
          onUpdated={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}
