import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaEnvelope, 
  FaEye, 
  FaReply, 
  FaTrash, 
  FaFilter,
  FaSearch,
  FaUser,
  FaPhone,
  FaCalendar,
  FaTag,
  FaCheck,
  FaTimes
} from 'react-icons/fa';

const InquiryManager = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    productType: '',
    search: ''
  });
  const [adminResponse, setAdminResponse] = useState('');
  const [adminName, setAdminName] = useState('');
  const [isResponding, setIsResponding] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);

  useEffect(() => {
    fetchInquiries();
  }, [filters]);

  const fetchInquiries = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.productType) queryParams.append('productType', filters.productType);
      
      const response = await fetch(`http://localhost:5000/api/inquiries?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        let filteredData = data;
        
        if (filters.search) {
          filteredData = data.filter(inquiry => 
            inquiry.customerName.toLowerCase().includes(filters.search.toLowerCase()) ||
            inquiry.customerEmail.toLowerCase().includes(filters.search.toLowerCase()) ||
            inquiry.message.toLowerCase().includes(filters.search.toLowerCase())
          );
        }
        
        setInquiries(filteredData);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInquiry = (inquiry) => {
    setSelectedInquiry(inquiry);
    setAdminResponse(inquiry.adminResponse || '');
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (inquiryId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/inquiries/${inquiryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchInquiries();
        if (selectedInquiry && selectedInquiry._id === inquiryId) {
          setSelectedInquiry({ ...selectedInquiry, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const openReplyModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowReplyModal(true);
    setAdminResponse('');
    setAdminName('');
  };

  const closeReplyModal = () => {
    setShowReplyModal(false);
    setSelectedInquiry(null);
    setAdminResponse('');
    setAdminName('');
  };

  const handleSendEmailReply = async () => {
    if (!adminResponse.trim() || !selectedInquiry) return;
    
    setIsResponding(true);
    try {
      const response = await fetch(`http://localhost:5000/api/inquiries/${selectedInquiry._id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          replyMessage: adminResponse.trim(),
          adminName: adminName.trim() || 'Yashiper Team'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Reply sent successfully!');
        fetchInquiries();
        closeReplyModal();
      } else {
        alert(data.message || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply. Please try again.');
    } finally {
      setIsResponding(false);
    }
  };

  const handleSendResponse = async () => {
    if (!adminResponse.trim() || !selectedInquiry) return;
    
    setIsResponding(true);
    try {
      const response = await fetch(`http://localhost:5000/api/inquiries/${selectedInquiry._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          adminResponse: adminResponse,
          status: 'responded'
        })
      });

      if (response.ok) {
        fetchInquiries();
        setSelectedInquiry({ 
          ...selectedInquiry, 
          adminResponse: adminResponse,
          status: 'responded',
          respondedAt: new Date()
        });
        alert('Response saved successfully!');
      }
    } catch (error) {
      console.error('Error sending response:', error);
      alert('Error sending response');
    } finally {
      setIsResponding(false);
    }
  };

  const handleDeleteInquiry = async (inquiryId) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/inquiries/${inquiryId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchInquiries();
        if (selectedInquiry && selectedInquiry._id === inquiryId) {
          setIsModalOpen(false);
          setSelectedInquiry(null);
        }
      }
    } catch (error) {
      console.error('Error deleting inquiry:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'responded': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProductTypeColor = (type) => {
    switch (type) {
      case 'KidsProduct': return 'bg-pink-100 text-pink-800';
      case 'TrendingItem': return 'bg-red-100 text-red-800';
      case 'NewArrival': return 'bg-purple-100 text-purple-800';
      case 'WomenProduct': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Product Inquiries</h1>
        <p className="text-gray-600">Manage customer product inquiries and responses</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaSearch className="inline mr-1" />
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search by name, email, or message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaFilter className="inline mr-1" />
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="responded">Responded</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaTag className="inline mr-1" />
              Product Type
            </label>
            <select
              value={filters.productType}
              onChange={(e) => setFilters({ ...filters, productType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="KidsProduct">Kids Product</option>
              <option value="TrendingItem">Trending Item</option>
              <option value="NewArrival">New Arrival</option>
              <option value="WomenProduct">Women Product</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', productType: '', search: '' })}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Inquiries List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {inquiries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FaEnvelope className="mx-auto text-4xl mb-4" />
            <p>No inquiries found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inquiries.map((inquiry) => (
                  <tr key={inquiry._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="flex items-center">
                          <FaUser className="text-gray-400 mr-2" />
                          <div className="text-sm font-medium text-gray-900">
                            {inquiry.customerName}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">{inquiry.customerEmail}</div>
                        {inquiry.customerPhone && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <FaPhone className="mr-1" />
                            {inquiry.customerPhone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {inquiry.productId?.title || inquiry.productId?.name || 'Product'}
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProductTypeColor(inquiry.productType)}`}>
                          {inquiry.productType}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inquiry.status)}`}>
                        {inquiry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <FaCalendar className="mr-1" />
                        {new Date(inquiry.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewInquiry(inquiry)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => openReplyModal(inquiry)}
                          className="text-green-600 hover:text-green-900"
                          title="Send Email Reply"
                        >
                          <FaReply />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(inquiry._id, inquiry.status === 'pending' ? 'responded' : 'closed')}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Update Status"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => handleDeleteInquiry(inquiry._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inquiry Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selectedInquiry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Inquiry Details</h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>

                {/* Customer Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Customer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Name</label>
                      <p className="font-medium">{selectedInquiry.customerName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Email</label>
                      <p className="font-medium">{selectedInquiry.customerEmail}</p>
                    </div>
                    {selectedInquiry.customerPhone && (
                      <div>
                        <label className="text-sm text-gray-600">Phone</label>
                        <p className="font-medium">{selectedInquiry.customerPhone}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm text-gray-600">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedInquiry.status)}`}>
                        {selectedInquiry.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Product Information</h3>
                  <div className="flex items-center space-x-4">
                    {selectedInquiry.productId?.images?.[0] && (
                      <img
                        src={`http://localhost:5000${selectedInquiry.productId.images[0]}`}
                        alt={selectedInquiry.productId.title || selectedInquiry.productId.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h4 className="font-medium">{selectedInquiry.productId?.title || selectedInquiry.productId?.name}</h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProductTypeColor(selectedInquiry.productType)}`}>
                        {selectedInquiry.productType}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        <a href={selectedInquiry.productUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          View Product
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer Message */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Customer Message</h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-gray-800">{selectedInquiry.message}</p>
                  </div>
                </div>

                {/* Admin Response */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Admin Response</h3>
                  <textarea
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    placeholder="Type your response to the customer..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  {selectedInquiry.respondedAt && (
                    <p className="text-sm text-gray-500 mt-2">
                      Last responded: {new Date(selectedInquiry.respondedAt).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      openReplyModal(selectedInquiry);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
                  >
                    <FaReply />
                    <span>Send Email Reply</span>
                  </button>
                  <button
                    onClick={handleSendResponse}
                    disabled={!adminResponse.trim() || isResponding}
                    className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isResponding ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <FaCheck />
                        <span>Save Response</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reply Modal */}
      <AnimatePresence>
        {showReplyModal && selectedInquiry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeReplyModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Send Email Reply to {selectedInquiry.customerName}</h2>
                  <button
                    onClick={closeReplyModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>

                {/* Customer Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Customer Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Name</label>
                      <p className="font-medium">{selectedInquiry.customerName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Email</label>
                      <p className="font-medium">{selectedInquiry.customerEmail}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Product</label>
                      <p className="font-medium">{selectedInquiry.productId?.title || selectedInquiry.productId?.name || 'Product'}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="text-sm text-gray-600">Original Message</label>
                    <div className="bg-blue-50 rounded-lg p-3 mt-2">
                      <p className="text-gray-800 text-sm">{selectedInquiry.message}</p>
                    </div>
                  </div>
                </div>

                {/* Reply Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="e.g., John Doe, Customer Service Team"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reply Message *
                    </label>
                    <textarea
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      placeholder="Type your reply message here..."
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center mt-6">
                  <p className="text-sm text-gray-500 flex items-center">
                    <FaEnvelope className="mr-2" />
                    This will send a professional email reply to the customer
                  </p>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={closeReplyModal}
                      disabled={isResponding}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendEmailReply}
                      disabled={!adminResponse.trim() || isResponding}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isResponding ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <FaReply />
                          <span>Send Email Reply</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InquiryManager;