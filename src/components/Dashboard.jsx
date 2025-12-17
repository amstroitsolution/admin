// client/admin/src/components/Dashboard.jsx
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FiMenu,
  FiLogOut,
  FiRefreshCw,
  FiPlus,
  FiGrid,
  FiImage,
  FiHome,
  FiLayers,
} from "react-icons/fi";
import axios from "axios";
import yashperLogo from "../assets/yashper.png";

/* ====== Existing components - ensure paths are correct in your project ====== */
import AddSaree from "./AddSaree";
import EditSareeModal from "./EditSareeModal";
import AddGallery from "./AddGallery";
import HomeServicesAdmin from "./HomeServicesAdmin";
import AddWork from "./AddWork";
import WorkList from "./WorkList";
import OurValuesAdmin from "./OurValuesAdmin";
import SlowFashionAdmin from "./SlowFashionAdmin";
import WatchBuyAdmin from "./WatchBuy/WatchBuyAdmin";
import HeroAdmin from "./HeroAdmin/HeroAdmin"; // <-- Hero section
import KidsProductsAdmin from "./KidsProducts/KidsProductsAdmin"; // <-- Kids Products section
import WomenProductsAdmin from "./WomenProducts/WomenProductsAdmin"; // <-- Women Products section
import SectionsManager from "./SectionsManager/SectionsManager"; // <-- Dynamic Sections Manager
import SectionDataManager from "./SectionDataManager/SectionDataManager"; // <-- Section Data Manager
import KidsSectionsManager from "./KidsSectionsManager/KidsSectionsManager"; // <-- Kids Sections Manager
import KidsSectionDataManager from "./KidsSectionDataManager/KidsSectionDataManager"; // <-- Kids Section Data Manager
import TrendingItemsAdmin from "./TrendingItems/TrendingItemsAdmin"; // <-- Trending Items section
import NewArrivalsAdmin from "./NewArrivals/NewArrivalsAdmin"; // <-- New Arrivals section
import SpecialOffersAdmin from "./SpecialOffers/SpecialOffersAdmin"; // <-- Special Offers section
import FeaturedCollectionsAdmin from "./FeaturedCollections/FeaturedCollectionsAdmin"; // <-- Featured Collections section
import InquiryManager from "./InquiryManager/InquiryManager"; // <-- Inquiry Management section
import ContactManager from "./ContactManager/ContactManager"; // <-- Contact Management section
import EmailStatus from "./EmailStatus/EmailStatus"; // <-- Email Status section
import StatsAdmin from "./StatsAdmin/StatsAdmin"; // <-- Stats Counter section
import MenuManager from "./MenuManager"; // <-- Menu/Navigation Manager

/* ====== Small presentational helpers moved here for clarity ====== */
function NavItem({ label, icon, onClick, active }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`admin-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
        active ? "admin-nav-item active text-white shadow-lg" : "glass text-gray-700 border border-white/20 hover:bg-white/20"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      <motion.svg
        animate={{ rotate: active ? 90 : 0 }}
        transition={{ duration: 0.3 }}
        className={`w-4 h-4 ${active ? "opacity-90" : "opacity-40"}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </motion.svg>
    </motion.button>
  );
}

function OverviewCard({ title, value, icon, color = "gray" }) {
  const colorClasses = {
    red: "from-[#de3cad] to-[#e854c1]",
    amber: "from-[#de3cad] to-[#ffffff]",
    green: "from-green-500 to-green-600",
    blue: "from-blue-500 to-blue-600",
    purple: "from-[#de3cad] to-[#e854c1]",
    gray: "from-gray-500 to-gray-600",
  };
  const bgClasses = {
    red: "bg-pink-50",
    amber: "bg-pink-50",
    green: "bg-green-50",
    blue: "bg-blue-50",
    purple: "bg-pink-50",
    gray: "bg-gray-50",
  };

  return (
    <motion.div whileHover={{ scale: 1.03, y: -4 }} className={`overview-card admin-card p-6 ${bgClasses[color]} hover-lift`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-gray-600">{title}</div>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15 }} className="text-3xl font-bold gradient-text mt-1">
            {value}
          </motion.div>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${colorClasses[color]} animate-pulse`}></div>
          Live data
        </span>
        <span>Updated now</span>
      </div>
    </motion.div>
  );
}

/* ===================== Main Dashboard component ===================== */
const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Dashboard() {
  // UI state
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryMode, setCategoryMode] = useState("women"); // women or kids

  // Data state
  const [sarees, setSarees] = useState([]);
  const [loading, setLoading] = useState(false);

  const [galleries, setGalleries] = useState([]);
  const [gLoading, setGLoading] = useState(false);

  const [wLoading, setWLoading] = useState(false);

  const [counts, setCounts] = useState({
    sarees: 0,
    galleries: 0,
    works: 0,
    ourValues: 0,
    slowFashion: 0,
    hero: 0,
    watchBuy: 0,
  });

  // Modals / viewers
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [galleryViewItem, setGalleryViewItem] = useState(null);
  const [galleryImgIndex, setGalleryImgIndex] = useState(0);

  // Particles (cosmetic)
  const [particles] = useState(
    Array.from({ length: 12 }, (_, i) => ({ id: i, x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 3 + 1, duration: Math.random() * 12 + 6 }))
  );

  // ---------- Helpers ----------
  const resolveUrl = (url) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${API}${url}`;
  };

  const formatNumber = (n) => (typeof n === "number" ? n : n ? n : 0);

  // ---------- Fetch functions ----------
  const fetchSarees = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/equipment`);
      const items = Array.isArray(res.data) ? res.data : res.data.items || [];
      setSarees(items);
      setCounts((c) => ({ ...c, sarees: items.length }));
    } catch (err) {
      console.error("fetchSarees error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchGalleries = useCallback(async () => {
    try {
      setGLoading(true);
      const res = await axios.get(`${API}/api/gallery`);
      const items = Array.isArray(res.data) ? res.data : [];
      setGalleries(items);
      setCounts((c) => ({ ...c, galleries: items.length }));
    } catch (err) {
      console.error("fetchGalleries error:", err);
    } finally {
      setGLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchWorks = useCallback(async () => {
    try {
      setWLoading(true);
      const res = await axios.get(`${API}/api/works`);
      const items = Array.isArray(res.data) ? res.data : res.data.items || [];
      setCounts((c) => ({ ...c, works: items.length }));
    } catch (err) {
      console.error("fetchWorks error:", err);
    } finally {
      setWLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchOurValues = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/our-values`);
      const items = Array.isArray(res.data) ? res.data : [];
      setCounts((c) => ({ ...c, ourValues: items.length }));
    } catch (err) {
      console.error("fetchOurValues error:", err);
    }
  }, []);

  const fetchSlowFashion = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/slow-fashion`);
      const items = Array.isArray(res.data) ? res.data : [];
      setCounts((c) => ({ ...c, slowFashion: items.length }));
    } catch (err) {
      console.error("fetchSlowFashion error:", err);
    }
  }, []);

  const fetchHero = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/hero`);
      const items = Array.isArray(res.data) ? res.data : [];
      setCounts((c) => ({ ...c, hero: items.length }));
    } catch (err) {
      console.error("fetchHero error:", err);
    }
  }, []);

  const fetchWatchBuy = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/watchbuy`);
      const items = Array.isArray(res.data) ? res.data : [];
      setCounts((c) => ({ ...c, watchBuy: items.length }));
    } catch (err) {
      console.error("fetchWatchBuy error:", err);
    }
  }, []);

  // initial load
  useEffect(() => {
    fetchSarees();
    fetchGalleries();
    fetchWorks();
    fetchOurValues();
    fetchSlowFashion();
    fetchHero();
    fetchWatchBuy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Actions ----------
  const handleDeleteSaree = async (id) => {
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        alert("Please login as admin first.");
        return;
      }
      if (!window.confirm("Are you sure you want to delete this saree?")) return;

      // optimistic UI update
      setSarees((prev) => prev.filter((it) => it._id !== id));
      await axios.delete(`${API}/api/equipment/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setCounts((c) => ({ ...c, sarees: Math.max(0, c.sarees - 1) }));
    } catch (err) {
      console.error("Delete saree failed:", err);
      alert("Delete failed. Check console.");
      fetchSarees();
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setEditingItem(null);
    setIsModalOpen(false);
  };

  const handleUpdated = () => {
    fetchSarees();
  };

  const handleDeleteGallery = async (id) => {
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        alert("Please login as admin first.");
        return;
      }
      if (!window.confirm("Delete this gallery item?")) return;

      setGalleries((prev) => prev.filter((it) => it._id !== id));
      await axios.delete(`${API}/api/gallery/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setCounts((c) => ({ ...c, galleries: Math.max(0, c.galleries - 1) }));
    } catch (err) {
      console.error("Delete gallery failed:", err);
      alert("Delete failed. Check console.");
      fetchGalleries();
    }
  };

  const openGalleryViewer = (item, startIndex = 0) => {
    setGalleryViewItem(item);
    setGalleryImgIndex(startIndex);
    window.addEventListener("keydown", galleryKeyHandler);
  };

  const closeGalleryViewer = () => {
    setGalleryViewItem(null);
    setGalleryImgIndex(0);
    window.removeEventListener("keydown", galleryKeyHandler);
  };

  function galleryKeyHandler(e) {
    if (!galleryViewItem) return;
    if (e.key === "ArrowLeft") prevGalleryImage();
    if (e.key === "ArrowRight") nextGalleryImage();
    if (e.key === "Escape") closeGalleryViewer();
  }

  const prevGalleryImage = () => {
    if (!galleryViewItem) return;
    setGalleryImgIndex((i) => (i - 1 + (galleryViewItem.images || []).length) % (galleryViewItem.images || []).length);
  };

  const nextGalleryImage = () => {
    if (!galleryViewItem) return;
    setGalleryImgIndex((i) => (i + 1) % (galleryViewItem.images || []).length);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSarees();
    fetchGalleries();
    fetchWorks();
    fetchOurValues();
    fetchSlowFashion();
    fetchHero();
    fetchWatchBuy();
  };

  // ---------- Render helpers ----------
  const renderMainContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <section className="space-y-6">
            <div className="admin-card p-6">
              <h2 className="text-2xl font-bold gradient-text mb-2">Dashboard Overview</h2>
              <p className="text-gray-600">Manage all sections of your textile website</p>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <OverviewCard title="Hero Slides" value={formatNumber(counts.hero)} icon={<FiImage className="w-6 h-6" />} color="purple" />
              <OverviewCard title="Our Values" value={formatNumber(counts.ourValues)} icon={<FiGrid className="w-6 h-6" />} color="blue" />
              <OverviewCard title="Slow Fashion" value={formatNumber(counts.slowFashion)} icon={<FiLayers className="w-6 h-6" />} color="green" />
              <OverviewCard title="Watch & Buy" value={formatNumber(counts.watchBuy)} icon={<FiImage className="w-6 h-6" />} color="amber" />
              <OverviewCard title="Sarees" value={formatNumber(counts.sarees)} icon={<FiGrid className="w-6 h-6" />} color="red" />
              <OverviewCard title="Galleries" value={formatNumber(counts.galleries)} icon={<FiImage className="w-6 h-6" />} color="amber" />
              <OverviewCard title="Recent Works" value={formatNumber(counts.works)} icon={<FiLayers className="w-6 h-6" />} color="green" />
              <OverviewCard title="Total Sections" value={formatNumber(counts.hero + counts.ourValues + counts.slowFashion + counts.watchBuy)} icon={<FiGrid className="w-6 h-6" />} color="blue" />
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              <div className="admin-card p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button onClick={() => setActiveTab("hero")} className="w-full text-left px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:shadow-md transition-all">
                    <div className="font-medium text-gray-800">Manage Hero Banner</div>
                    <div className="text-sm text-gray-600">Update homepage hero slides</div>
                  </button>
                  <button onClick={() => setActiveTab("ourValues")} className="w-full text-left px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg hover:shadow-md transition-all">
                    <div className="font-medium text-gray-800">Edit Our Values</div>
                    <div className="text-sm text-gray-600">Manage company values section</div>
                  </button>
                  <button onClick={() => setActiveTab("slowFashion")} className="w-full text-left px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg hover:shadow-md transition-all">
                    <div className="font-medium text-gray-800">Slow Fashion Section</div>
                    <div className="text-sm text-gray-600">Update slow fashion content</div>
                  </button>
                  <button onClick={() => setActiveTab("watchbuy")} className="w-full text-left px-4 py-3 bg-gradient-to-r from-pink-50 to-white rounded-lg hover:shadow-md transition-all">
                    <div className="font-medium text-gray-800">Watch & Buy Collection</div>
                    <div className="text-sm text-gray-600">Manage video collection</div>
                  </button>
                </div>
              </div>

              <div className="admin-card p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">System Status</div>
                      <div className="text-gray-600">All systems operational</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">Content Sections</div>
                      <div className="text-gray-600">{counts.hero + counts.ourValues + counts.slowFashion + counts.watchBuy} active sections</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">Media Library</div>
                      <div className="text-gray-600">{counts.galleries + counts.works} items</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case "add":
        return (
          <section className="admin-card p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold gradient-text">Add Saree</h2>
                <p className="text-gray-600 mt-1">Create new saree listings with images and details</p>
              </div>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg animate-float" style={{ background: 'linear-gradient(135deg, #de3cad, #e854c1)' }}>
                <FiPlus className="w-8 h-8" />
              </div>
            </div>
            <AddSaree />
          </section>
        );

      case "gallery":
        return (
          <section className="admin-card p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold gradient-text">Add Gallery</h2>
                <p className="text-gray-600 mt-1">Upload and organize image galleries for showcase</p>
              </div>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg animate-float" style={{ background: 'linear-gradient(135deg, #e854c1, #de3cad)' }}>
                <FiImage className="w-8 h-8" />
              </div>
            </div>
            <AddGallery />
          </section>
        );

      case "ourWork":
        return (
          <section className="space-y-4">
            <div className="flex items-center justify-between bg-white rounded-xl shadow p-4">
              <div>
                <h2 className="text-lg font-medium text-gray-800">Our Work</h2>
                <p className="text-sm text-gray-500">Manage portfolio / work items</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveTab("gallery")} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">Add New Work</button>
                <button onClick={fetchWorks} className="px-3 py-2 border border-gray-200 rounded-md text-sm bg-white">{wLoading ? "Loading..." : "Refresh"}</button>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="bg-white rounded-xl shadow p-6">
                <AddWork onAdded={() => fetchWorks()} />
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <WorkList />
              </div>
            </div>
          </section>
        );

      case "view":
        return (
          <section className="space-y-6">
            <div className="admin-card p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #de3cad, #e854c1)' }}>
                    <FiGrid className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold gradient-text">All Sarees</h2>
                    <p className="text-gray-600">Manage and review saree listings</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => { setActiveTab("add"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="px-4 py-2 text-white rounded-xl text-sm shadow-lg" style={{ background: 'linear-gradient(to right, #de3cad, #e854c1)' }}>Add New</button>
                  <button onClick={handleRefresh} className="px-4 py-2 glass border border-white/20 rounded-xl text-sm">{refreshing ? "Refreshing..." : "Refresh"}</button>
                </div>
              </div>
            </div>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {loading && <div className="col-span-full admin-card p-12 flex items-center justify-center">Loading sarees...</div>}

              {!loading && sarees.length === 0 && <div className="col-span-full admin-card p-12 text-center">No sarees yet. Use the Add button to create your first listing.</div>}

              {sarees.map((item, index) => (
                <motion.div key={item._id} layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="admin-card overflow-hidden flex flex-col hover-lift group">
                  <div className="relative overflow-hidden">
                    {item.images && item.images.length > 0 ? (
                      <img className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" src={resolveUrl(item.images[0])} alt={item.title} />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400"><FiImage className="w-12 h-12" /></div>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-bold text-gray-800 text-lg mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">{item.description || "No description available"}</p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="px-3 py-1 rounded-full font-medium" style={{ background: 'rgba(222, 60, 173, 0.1)', color: '#de3cad' }}>{item.type}</span>
                        <span className="font-bold text-lg gradient-text">${item.price || 0}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(item)} className="flex-1 px-3 py-2 glass border border-white/20 rounded-lg text-sm">Edit</button>
                        <button onClick={() => handleDeleteSaree(item._id)} className="px-4 py-2 text-white rounded-lg text-sm" style={{ background: 'linear-gradient(to right, #de3cad, #e854c1)' }}>Delete</button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        );

      case "homeServices":
        return (
          <section className="admin-card p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold gradient-text">Home Services</h2>
                <p className="text-gray-600 mt-1">Manage home service offerings and content</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-lg animate-float">
                <FiHome className="w-8 h-8" />
              </div>
            </div>
            <HomeServicesAdmin />
          </section>
        );

      case "ourValues":
        return <section className="space-y-4"><OurValuesAdmin /></section>;
      case "slowFashion":
        return <section className="space-y-4"><SlowFashionAdmin /></section>;
      


      case "galleryView":
        return (
          <section className="space-y-4">
            <div className="flex items-center justify-between bg-white rounded-xl shadow p-4">
              <div><h2 className="text-lg font-medium">All Galleries</h2><p className="text-sm text-gray-500">Manage gallery items and their photos</p></div>
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveTab("gallery")} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">Add New Gallery</button>
                <button onClick={fetchGalleries} className="px-3 py-2 border border-gray-200 rounded-md text-sm bg-white">{gLoading ? "Loading..." : "Refresh"}</button>
              </div>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {gLoading && <div className="col-span-full bg-white rounded-xl shadow p-6 flex items-center justify-center">Loading galleries...</div>}
              {!gLoading && galleries.length === 0 && <div className="col-span-full bg-white rounded-xl shadow p-12 text-center">No galleries yet</div>}
              {galleries.map((g) => (
                <motion.div key={g._id} layout className="bg-white rounded-xl shadow overflow-hidden flex flex-col">
                  {g.coverImage ? (
                    <img className="w-full h-44 object-cover" src={resolveUrl(g.coverImage)} alt={g.title} />
                  ) : g.images && g.images.length > 0 ? (
                    <img className="w-full h-44 object-cover" src={resolveUrl(g.images[0])} alt={g.title} />
                  ) : (
                    <div className="w-full h-44 bg-gray-100 flex items-center justify-center text-gray-400">No image</div>
                  )}

                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-gray-800 truncate">{g.title}</h3>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-3">{g.description || "—"}</p>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <div>Images: <span className="font-medium text-gray-800">{(g.images || []).length}</span></div>
                        <div>Visible: <span className="font-medium text-gray-800">{g.visible ? "Yes" : "No"}</span></div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button onClick={() => openGalleryViewer(g, 0)} className="px-2 py-1 text-sm border border-gray-200 rounded-md bg-white">View</button>
                        <button onClick={() => handleDeleteGallery(g._id)} className="px-3 py-1 text-sm rounded-md text-white" style={{ background: '#de3cad' }}>Delete</button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        );

      case "watchbuy":
        // NEW: Watch & Buy admin panel
        return (
          <section className="admin-card p-6">
            <WatchBuyAdmin />
          </section>
        );

      case "trendingItems":
        return (
          <section className="admin-card p-6">
            <TrendingItemsAdmin />
          </section>
        );

      case "newArrivals":
        return (
          <section className="admin-card p-6">
            <NewArrivalsAdmin />
          </section>
        );

      case "specialOffers":
        return (
          <section className="admin-card p-6">
            <SpecialOffersAdmin />
          </section>
        );

      case "featuredCollections":
        return (
          <section className="admin-card p-6">
            <FeaturedCollectionsAdmin />
          </section>
        );

      case "menuManager":
        return (
          <section className="admin-card p-6">
            <MenuManager />
          </section>
        );

      case "inquiries":
        return (
          <section className="admin-card p-6">
            <InquiryManager />
          </section>
        );

      case "contacts":
        return (
          <section className="admin-card p-6">
            <ContactManager />
          </section>
        );

      case "emailStatus":
        return (
          <section className="admin-card p-6">
            <EmailStatus />
          </section>
        );

      case "stats":
        return (
          <section className="admin-card p-6">
            <StatsAdmin />
          </section>
        );

      case "hero":
        // NEW: Hero section admin panel
        return (
          <section className="admin-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold gradient-text">Hero Section</h2>
                <p className="text-gray-600 mt-1">Manage homepage hero banners and slides</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg animate-float">
                <FiImage className="w-8 h-8" />
              </div>
            </div>
            <HeroAdmin />
          </section>
        );

      // Women Sections
      case "womenAllProducts":
        return (
          <section className="admin-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold gradient-text">All Women Products</h2>
                <p className="text-gray-600 mt-1">View and manage all women products</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg animate-float">
                <FiGrid className="w-8 h-8" />
              </div>
            </div>
            <WomenProductsAdmin />
          </section>
        );

      case "womenDresses":
        return (
          <section className="admin-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold gradient-text">Women - Dresses</h2>
                <p className="text-gray-600 mt-1">Gown & Dresses, Insta Sarees, Jumpsuits</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg animate-float">
                <FiGrid className="w-8 h-8" />
              </div>
            </div>
            <WomenProductsAdmin filterGroup="Dresses" />
          </section>
        );

      case "womenSets":
        return (
          <section className="admin-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold gradient-text">Women - Sets</h2>
                <p className="text-gray-600 mt-1">2 Pcs, 3 Pcs, Anarkali, A-Line, Straight Suit, Sharara, Coord, Plus Size</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg animate-float">
                <FiGrid className="w-8 h-8" />
              </div>
            </div>
            <WomenProductsAdmin filterGroup="Sets" />
          </section>
        );

      case "womenBottoms":
        return (
          <section className="admin-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold gradient-text">Women - Bottoms</h2>
                <p className="text-gray-600 mt-1">Trouser, Salwar, Palazzos, Sharara, Skirts, Jeggings, Plus Size</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg animate-float">
                <FiGrid className="w-8 h-8" />
              </div>
            </div>
            <WomenProductsAdmin filterGroup="Bottoms" />
          </section>
        );

      case "womenKurtas":
        return (
          <section className="admin-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold gradient-text">Women - Kurtas</h2>
                <p className="text-gray-600 mt-1">A-Line, Straight, Flared, Asymmetrical, Winter, Plus Size</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg animate-float">
                <FiGrid className="w-8 h-8" />
              </div>
            </div>
            <WomenProductsAdmin filterGroup="Kurtas" />
          </section>
        );

      case "womenSarees":
        return (
          <section className="admin-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold gradient-text">Women - Saree Collections</h2>
                <p className="text-gray-600 mt-1">Silk, Cotton, Designer, Party Wear, Casual, Bridal Sarees</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg animate-float">
                <FiGrid className="w-8 h-8" />
              </div>
            </div>
            <WomenProductsAdmin filterGroup="Saree Collections" />
          </section>
        );

      case "womenLehengas":
        return (
          <section className="admin-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold gradient-text">Women - Lehenga Collections</h2>
                <p className="text-gray-600 mt-1">Bridal, Party Wear, Designer, Casual, Festive Lehengas</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg animate-float">
                <FiGrid className="w-8 h-8" />
              </div>
            </div>
            <WomenProductsAdmin filterGroup="Lehenga Collections" />
          </section>
        );

      case "womenWedding":
        return (
          <section className="admin-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold gradient-text">Women - Wedding Collection</h2>
                <p className="text-gray-600 mt-1">Bridal Lehengas, Silk Sarees, Cotton Sarees</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg animate-float">
                <FiGrid className="w-8 h-8" />
              </div>
            </div>
            <WomenProductsAdmin filterGroup="Wedding" />
          </section>
        );

      // Dynamic Sections Manager
      case "sectionsManager":
        return (
          <section className="admin-card p-6">
            <SectionsManager />
          </section>
        );

      case "sectionData":
        return (
          <section className="admin-card p-6">
            <SectionDataManager />
          </section>
        );

      // Kids Sections
      case "kidsGirlsEthnic":
        return (
          <section className="admin-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold gradient-text">Girls - Ethnic Wear</h2>
                <p className="text-gray-600 mt-1">Sarees, Anarkali, Lehengas, Kurtas, Palazzos, Pants & Salwars</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white shadow-lg animate-float">
                <FiGrid className="w-8 h-8" />
              </div>
            </div>
            <KidsProductsAdmin gender="Girls" filterGroup="Ethnic Wear" />
          </section>
        );

      case "kidsGirlsDresses":
        return (
          <section className="admin-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold gradient-text">Girls - Dresses & Gowns</h2>
                <p className="text-gray-600 mt-1">Dresses, Gowns, Jumpsuits, Sets</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white shadow-lg animate-float">
                <FiGrid className="w-8 h-8" />
              </div>
            </div>
            <KidsProductsAdmin gender="Girls" filterGroup="Dresses & Gowns" />
          </section>
        );

      case "kidsGirlsTrending":
        return (
          <section className="admin-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold gradient-text">Girls - Trending</h2>
                <p className="text-gray-600 mt-1">New Arrivals, Wedding Collection</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white shadow-lg animate-float">
                <FiGrid className="w-8 h-8" />
              </div>
            </div>
            <KidsProductsAdmin gender="Girls" filterGroup="Trending" />
          </section>
        );

      case "kidsBoysEthnic":
        return (
          <section className="admin-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold gradient-text">Boys - Ethnic Wear</h2>
                <p className="text-gray-600 mt-1">Ethnic Jackets, Ethnic Sets, Kurtas, Sherwani Sets</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg animate-float">
                <FiGrid className="w-8 h-8" />
              </div>
            </div>
            <KidsProductsAdmin gender="Boys" filterGroup="Ethnic Wear" />
          </section>
        );

      case "kidsBoysBaby":
        return (
          <section className="admin-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold gradient-text">Boys - Baby Essentials</h2>
                <p className="text-gray-600 mt-1">Bodysuits, Infant Clothing, Jhablas, Swaddles</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg animate-float">
                <FiGrid className="w-8 h-8" />
              </div>
            </div>
            <KidsProductsAdmin gender="Boys" filterGroup="Baby Essentials" />
          </section>
        );

      case "kidsBoysTrending":
        return (
          <section className="admin-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold gradient-text">Boys - Trending</h2>
                <p className="text-gray-600 mt-1">New Arrivals, Wedding Collection</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg animate-float">
                <FiGrid className="w-8 h-8" />
              </div>
            </div>
            <KidsProductsAdmin gender="Boys" filterGroup="Trending" />
          </section>
        );

      // Kids Homepage Sections - Redirect to Sections Manager
      case "kidsHero":
      case "kidsTrending":
      case "kidsNewArrivals":
      case "kidsSpecialOffers":
      case "kidsCollections":
        return (
          <section className="admin-card p-6">
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                <FiLayers className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Use Dynamic Sections Manager</h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Kids homepage sections are managed through the <strong>Sections Manager</strong> and <strong>Section Data Manager</strong> for maximum flexibility.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setActiveTab('kidsSectionsManager')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  Go to Sections Manager
                </button>
                <button
                  onClick={() => setActiveTab('kidsSectionData')}
                  className="px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-medium"
                >
                  Go to Section Data
                </button>
              </div>
            </div>
          </section>
        );

      // Kids Management Sections
      case "kidsSectionsManager":
        return (
          <section className="admin-card p-6">
            <KidsSectionsManager />
          </section>
        );

      case "kidsSectionData":
        return (
          <section className="admin-card p-6">
            <KidsSectionDataManager />
          </section>
        );

      default:
        return <div className="p-6">Select a section</div>;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-pink-50 to-white">
      {/* animated background or particles (cosmetic) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-96 h-96 rounded-full blur-3xl animate-pulse-slow" style={{ background: 'rgba(222, 60, 173, 0.1)' }} />
        <div className="absolute bottom-1/3 right-1/6 w-80 h-80 rounded-full blur-3xl animate-pulse-slow" style={{ background: 'rgba(232, 84, 193, 0.1)', animationDelay: "2s" }} />
        {particles.map((p) => (
          <motion.div key={p.id} className="absolute w-1 h-1 rounded-full" style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.size}px`, height: `${p.size}px`, background: 'rgba(222, 60, 173, 0.3)' }} animate={{ y: [0, -30, 0], opacity: [0, 0.6, 0] }} transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut" }} />
        ))}
      </div>

      {/* top header */}
      <motion.header initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="glass border-b border-white/20 sticky top-0 z-30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 lg:py-4">
          <div className="flex items-center gap-3">
            <motion.button className="lg:hidden p-2 rounded-xl hover:bg-white/20" onClick={() => setSidebarOpen((s) => !s)}><FiMenu className="w-6 h-6 text-gray-700" /></motion.button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg overflow-hidden">
                <img 
                  src={yashperLogo} 
                  alt="Yashper Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              {/* Hide text on mobile, show on desktop */}
              <div className="hidden md:block">
                <h1 className="text-xl font-bold gradient-text">Yashper Admin</h1>
                <p className="text-sm text-gray-600">Fashion Management Portal</p>
              </div>
            </div>
          </div>

          {/* Toggle Switch - Women/Kids - Hide on mobile */}
          <div className="hidden md:flex items-center gap-3 px-4 py-2 glass border border-white/20 rounded-xl">
            <span className={`text-sm font-medium transition-colors ${categoryMode === 'women' ? 'text-gray-500' : 'text-gray-500'}`} style={categoryMode === 'women' ? { color: '#de3cad' } : {}}>Women</span>
            <motion.button
              onClick={() => setCategoryMode(categoryMode === 'women' ? 'kids' : 'women')}
              className="relative w-14 h-7 rounded-full transition-colors"
              style={{ background: categoryMode === 'women' ? 'linear-gradient(to right, #de3cad, #e854c1)' : 'linear-gradient(to right, rgb(59, 130, 246), rgb(6, 182, 212))' }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
                animate={{ left: categoryMode === 'women' ? '4px' : '28px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </motion.button>
            <span className={`text-sm font-medium transition-colors ${categoryMode === 'kids' ? 'text-blue-600' : 'text-gray-500'}`}>Kids</span>
          </div>

          <div className="flex items-center gap-3">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleRefresh} className="hidden sm:inline-flex items-center gap-2 px-4 py-2 glass border border-white/20 rounded-xl text-sm hover:bg-white/20">
              <motion.div animate={refreshing ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: refreshing ? Infinity : 0 }}><FiRefreshCw /></motion.div>
              <span className="hidden lg:inline">{refreshing ? "Refreshing..." : "Refresh All"}</span>
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { localStorage.removeItem("admin_token"); localStorage.removeItem("admin_info"); window.location.href = "/admin/login"; }} className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm shadow-lg" style={{ background: 'linear-gradient(to right, #de3cad, #e854c1)' }}> 
              <FiLogOut /> 
              <span className="hidden sm:inline">Logout</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <motion.aside initial={{ x: -240, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.45 }} className={`lg:col-span-3 ${sidebarOpen ? "block" : "hidden"} lg:block`}>
          <div className="admin-sidebar rounded-2xl shadow-xl p-6 sticky top-6 border border-white/20">
            <nav className="space-y-4">
              <div className="text-xs font-bold text-gray-600 uppercase tracking-wider px-2">Dashboard</div>
              <div className="space-y-2">
                <NavItem label="Overview" icon={<FiGrid />} active={activeTab === "overview"} onClick={() => { setActiveTab("overview"); setSidebarOpen(false); }} />
              </div>

              {/* Women Sections */}
              {categoryMode === 'women' && (
                <>
                  <div className="text-xs font-bold uppercase tracking-wider px-2 mt-6 flex items-center gap-2" style={{ color: '#de3cad' }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: '#de3cad' }}></span>
                    Women Homepage
                  </div>
                  <div className="space-y-2">
                    <NavItem label="Hero Banner" icon={<FiImage />} active={activeTab === "hero"} onClick={() => { setActiveTab("hero"); setSidebarOpen(false); }} />
                    <NavItem label="Trending Items" icon={<FiGrid />} active={activeTab === "trendingItems"} onClick={() => { setActiveTab("trendingItems"); setSidebarOpen(false); }} />
                    <NavItem label="New Arrivals" icon={<FiPlus />} active={activeTab === "newArrivals"} onClick={() => { setActiveTab("newArrivals"); setSidebarOpen(false); }} />
                    <NavItem label="Special Offers" icon={<FiLayers />} active={activeTab === "specialOffers"} onClick={() => { setActiveTab("specialOffers"); setSidebarOpen(false); }} />
                    <NavItem label="Featured Collections" icon={<FiImage />} active={activeTab === "featuredCollections"} onClick={() => { setActiveTab("featuredCollections"); setSidebarOpen(false); }} />
                    <NavItem label="Our Values" icon={<FiGrid />} active={activeTab === "ourValues"} onClick={() => { setActiveTab("ourValues"); setSidebarOpen(false); }} />
                    <NavItem label="Slow Fashion" icon={<FiLayers />} active={activeTab === "slowFashion"} onClick={() => { setActiveTab("slowFashion"); setSidebarOpen(false); }} />

                    <NavItem label="Watch & Buy" icon={<FiImage />} active={activeTab === "watchbuy"} onClick={() => { setActiveTab("watchbuy"); setSidebarOpen(false); }} />
                    <NavItem label="Stats Counter" icon={<FiGrid />} active={activeTab === "stats"} onClick={() => { setActiveTab("stats"); setSidebarOpen(false); }} />
                  </div>

                  <div className="text-xs font-bold uppercase tracking-wider px-2 mt-6 flex items-center gap-2" style={{ color: '#de3cad' }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: '#de3cad' }}></span>
                    Women Products
                  </div>
                  <div className="space-y-2">
                    <NavItem label="All Products" icon={<FiGrid />} active={activeTab === "womenAllProducts"} onClick={() => { setActiveTab("womenAllProducts"); setSidebarOpen(false); }} />
                    <NavItem label="Dresses" icon={<FiGrid />} active={activeTab === "womenDresses"} onClick={() => { setActiveTab("womenDresses"); setSidebarOpen(false); }} />
                    <NavItem label="Sets" icon={<FiGrid />} active={activeTab === "womenSets"} onClick={() => { setActiveTab("womenSets"); setSidebarOpen(false); }} />
                    <NavItem label="Bottoms" icon={<FiGrid />} active={activeTab === "womenBottoms"} onClick={() => { setActiveTab("womenBottoms"); setSidebarOpen(false); }} />
                    <NavItem label="Kurtas" icon={<FiGrid />} active={activeTab === "womenKurtas"} onClick={() => { setActiveTab("womenKurtas"); setSidebarOpen(false); }} />
                    <NavItem label="Wedding" icon={<FiGrid />} active={activeTab === "womenWedding"} onClick={() => { setActiveTab("womenWedding"); setSidebarOpen(false); }} />
                  </div>
                </>
              )}

              {/* Kids Sections */}
              {categoryMode === 'kids' && (
                <>
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-wider px-2 mt-6 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Kids Homepage
                  </div>
                  <div className="space-y-2">
                    <NavItem label="Kids Hero Banner" icon={<FiImage />} active={activeTab === "kidsHero"} onClick={() => { setActiveTab("kidsHero"); setSidebarOpen(false); }} />
                    <NavItem label="Kids Trending" icon={<FiGrid />} active={activeTab === "kidsTrending"} onClick={() => { setActiveTab("kidsTrending"); setSidebarOpen(false); }} />
                    <NavItem label="Kids New Arrivals" icon={<FiPlus />} active={activeTab === "kidsNewArrivals"} onClick={() => { setActiveTab("kidsNewArrivals"); setSidebarOpen(false); }} />
                    <NavItem label="Kids Special Offers" icon={<FiLayers />} active={activeTab === "kidsSpecialOffers"} onClick={() => { setActiveTab("kidsSpecialOffers"); setSidebarOpen(false); }} />
                    <NavItem label="Kids Collections" icon={<FiImage />} active={activeTab === "kidsCollections"} onClick={() => { setActiveTab("kidsCollections"); setSidebarOpen(false); }} />
                  </div>

                  <div className="text-xs font-bold text-blue-600 uppercase tracking-wider px-2 mt-6 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Kids - Girls
                  </div>
                  <div className="space-y-2">
                    <NavItem label="Girls - Ethnic Wear" icon={<FiGrid />} active={activeTab === "kidsGirlsEthnic"} onClick={() => { setActiveTab("kidsGirlsEthnic"); setSidebarOpen(false); }} />
                    <NavItem label="Girls - Dresses & Gowns" icon={<FiGrid />} active={activeTab === "kidsGirlsDresses"} onClick={() => { setActiveTab("kidsGirlsDresses"); setSidebarOpen(false); }} />
                    <NavItem label="Girls - Trending" icon={<FiGrid />} active={activeTab === "kidsGirlsTrending"} onClick={() => { setActiveTab("kidsGirlsTrending"); setSidebarOpen(false); }} />
                  </div>

                  <div className="text-xs font-bold text-blue-600 uppercase tracking-wider px-2 mt-6 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Kids - Boys
                  </div>
                  <div className="space-y-2">
                    <NavItem label="Boys - Ethnic Wear" icon={<FiGrid />} active={activeTab === "kidsBoysEthnic"} onClick={() => { setActiveTab("kidsBoysEthnic"); setSidebarOpen(false); }} />
                    <NavItem label="Boys - Baby Essentials" icon={<FiGrid />} active={activeTab === "kidsBoysBaby"} onClick={() => { setActiveTab("kidsBoysBaby"); setSidebarOpen(false); }} />
                    <NavItem label="Boys - Trending" icon={<FiGrid />} active={activeTab === "kidsBoysTrending"} onClick={() => { setActiveTab("kidsBoysTrending"); setSidebarOpen(false); }} />
                  </div>

                  <div className="text-xs font-bold text-blue-600 uppercase tracking-wider px-2 mt-6 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Kids Management
                  </div>
                  <div className="space-y-2">
                    <NavItem label="Kids Sections Manager" icon={<FiGrid />} active={activeTab === "kidsSectionsManager"} onClick={() => { setActiveTab("kidsSectionsManager"); setSidebarOpen(false); }} />
                    <NavItem label="Kids Section Data" icon={<FiPlus />} active={activeTab === "kidsSectionData"} onClick={() => { setActiveTab("kidsSectionData"); setSidebarOpen(false); }} />
                  </div>
                </>
              )}

              {/* Common Sections - Only in Women Mode */}
              {categoryMode === 'women' && (
                <>
                  <div className="text-xs font-bold text-gray-600 uppercase tracking-wider px-2 mt-6">Site Management</div>
                  <div className="space-y-2">
                    <NavItem label="Menu Manager" icon={<FiMenu />} active={activeTab === "menuManager"} onClick={() => { setActiveTab("menuManager"); setSidebarOpen(false); }} />
                  </div>

                  <div className="text-xs font-bold text-gray-600 uppercase tracking-wider px-2 mt-6">Customer Management</div>
                  <div className="space-y-2">
                    <NavItem label="Product Inquiries" icon={<FiMenu />} active={activeTab === "inquiries"} onClick={() => { setActiveTab("inquiries"); setSidebarOpen(false); }} />
                    <NavItem label="Contact Messages" icon={<FiMenu />} active={activeTab === "contacts"} onClick={() => { setActiveTab("contacts"); setSidebarOpen(false); }} />
                    <NavItem label="Email Status" icon={<FiMenu />} active={activeTab === "emailStatus"} onClick={() => { setActiveTab("emailStatus"); setSidebarOpen(false); }} />
                  </div>

                  <div className="text-xs font-bold text-gray-600 uppercase tracking-wider px-2 mt-6">Sarees & Services</div>
                  <div className="space-y-2">
                    <NavItem label="View Sarees" icon={<FiGrid />} active={activeTab === "view"} onClick={() => { setActiveTab("view"); setSidebarOpen(false); }} />
                    <NavItem label="Add Saree" icon={<FiPlus />} active={activeTab === "add"} onClick={() => { setActiveTab("add"); setSidebarOpen(false); }} />
                    <NavItem label="Home Services" icon={<FiHome />} active={activeTab === "homeServices"} onClick={() => { setActiveTab("homeServices"); setSidebarOpen(false); }} />
                  </div>

                  <div className="text-xs font-bold text-gray-600 uppercase tracking-wider px-2 mt-6">Dynamic Sections</div>
                  <div className="space-y-2">
                    <NavItem label="Sections Manager" icon={<FiGrid />} active={activeTab === "sectionsManager"} onClick={() => { setActiveTab("sectionsManager"); setSidebarOpen(false); }} />
                    <NavItem label="Section Data" icon={<FiPlus />} active={activeTab === "sectionData"} onClick={() => { setActiveTab("sectionData"); setSidebarOpen(false); }} />
                  </div>

                  <div className="text-xs font-bold text-gray-600 uppercase tracking-wider px-2 mt-6">Gallery & Portfolio</div>
                  <div className="space-y-2">
                    <NavItem label="Add Gallery" icon={<FiImage />} active={activeTab === "gallery"} onClick={() => { setActiveTab("gallery"); setSidebarOpen(false); }} />
                    <NavItem label="View Galleries" icon={<FiLayers />} active={activeTab === "galleryView"} onClick={() => { setActiveTab("galleryView"); setSidebarOpen(false); }} />
                    <NavItem label="Our Recent Works" icon={<FiImage />} active={activeTab === "ourWork"} onClick={() => { setActiveTab("ourWork"); setSidebarOpen(false); }} />
                  </div>
                </>
              )}
            </nav>

            <div className="mt-6 p-4 glass rounded-xl border border-white/20">
              <p className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Quick Tips</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2"><span className="mt-1" style={{ color: '#de3cad' }}>•</span> Use Add to upload images with drag & drop</li>
                <li className="flex items-start gap-2"><span className="mt-1" style={{ color: '#e854c1' }}>•</span> Auto-refresh after adding items</li>
                <li className="flex items-start gap-2"><span className="text-green-500 mt-1">•</span> Click cards to view details</li>
              </ul>
            </div>

            <div className="mt-4 pt-4 border-t border-white/20 text-xs text-gray-500 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              Last refreshed: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </motion.aside>

        {/* Main content area */}
        <main className="lg:col-span-9 space-y-6">{renderMainContent()}</main>
      </div>

      {/* Edit Saree modal */}
      <EditSareeModal isOpen={isModalOpen} onClose={handleModalClose} item={editingItem} onUpdated={handleUpdated} />

      {/* Gallery viewer modal */}
      {galleryViewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4" onClick={closeGalleryViewer}>
          <div className="bg-white max-w-5xl w-full rounded-xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">{galleryViewItem.title}</h3>
              <button onClick={closeGalleryViewer} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                {galleryViewItem.images && galleryViewItem.images.length > 0 ? (
                  <img className="w-full h-72 object-cover rounded-md" src={resolveUrl(galleryViewItem.images[galleryImgIndex])} alt={galleryViewItem.title} />
                ) : (
                  <div className="w-full h-72 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">No Image</div>
                )}
              </div>

              <div className="md:col-span-2 flex flex-col gap-3">
                <p className="text-sm text-gray-600">{galleryViewItem.description || "—"}</p>

                <div className="flex items-center gap-2 mt-2">
                  <button onClick={prevGalleryImage} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md">Prev</button>
                  <button onClick={nextGalleryImage} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md">Next</button>
                  <a href={galleryViewItem.images && galleryViewItem.images[galleryImgIndex] ? resolveUrl(galleryViewItem.images[galleryImgIndex]) : "#"} target="_blank" rel="noreferrer" className="px-3 py-2 bg-indigo-600 text-white rounded-md">Open Image</a>
                </div>

                <div className="mt-4 flex gap-2 overflow-x-auto">
                  {galleryViewItem.images && galleryViewItem.images.map((img, idx) => (
                    <button key={idx} onClick={() => setGalleryImgIndex(idx)} className={`w-20 h-14 rounded overflow-hidden border ${galleryImgIndex === idx ? "ring-2 ring-indigo-400" : "border-gray-200"}`}>
                      <img className="w-full h-full object-cover" src={resolveUrl(img)} alt={`thumb-${idx}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t flex justify-end gap-2">
              <button onClick={closeGalleryViewer} className="px-3 py-2 bg-gray-100 rounded-md text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
