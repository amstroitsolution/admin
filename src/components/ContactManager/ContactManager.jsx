import React, { useState, useEffect } from 'react';
import './ContactManager.css';

import { 

  FaEye, 
  FaReply,
  FaTrash, 
  
} from 'react-icons/fa';
const ContactManager = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [adminName, setAdminName] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, [currentPage]);




  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/contact?page=${currentPage}&limit=10`);
      const data = await response.json();
      
      if (data.success) {
        setContacts(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateContactStatus = async (contactId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/contact/${contactId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      
      if (data.success) {
        fetchContacts(); // Refresh the list
        if (selectedContact && selectedContact._id === contactId) {
          setSelectedContact({ ...selectedContact, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Error updating contact status:', error);
    }
  };

  const deleteContact = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/contact/${contactId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        fetchContacts(); // Refresh the list
        setShowModal(false);
        setSelectedContact(null);
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f39c12';
      case 'replied': return '#3498db';
      case 'resolved': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openModal = (contact) => {
    setSelectedContact(contact);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedContact(null);
  };

  const openReplyModal = (contact) => {
    setSelectedContact(contact);
    setShowReplyModal(true);
    setReplyMessage('');
    setAdminName('');
  };

  const closeReplyModal = () => {
    setShowReplyModal(false);
    setSelectedContact(null);
    setReplyMessage('');
    setAdminName('');
  };

  const sendReply = async () => {
    if (!replyMessage.trim()) {
      alert('Please enter a reply message');
      return;
    }

    try {
      setSendingReply(true);
      const response = await fetch(`http://localhost:5000/api/contact/${selectedContact._id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          replyMessage: replyMessage.trim(),
          adminName: adminName.trim() || 'Yashiper Team'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Reply sent successfully!');
        fetchContacts(); // Refresh the list
        closeReplyModal();
      } else {
        alert(data.message || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply. Please try again.');
    } finally {
      setSendingReply(false);
    }
  };

  if (loading) {
    return (
      <div className="contact-manager">
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i>
          Loading contacts...
        </div>
      </div>
    );
  }

return (
  <div className="w-full p-4 md:p-6">

    {/* HEADER */}
    <div className="text-center mb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
        Contact Messages
      </h1>
      <p className="text-gray-500 mt-1">
        Manage customer inquiries and messages
      </p>
    </div>

    {/* TABLE CONTAINER */}
    <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Subject</th>
            <th className="p-3">Status</th>
            <th className="p-3">Date</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {contacts.map((contact) => (
            <tr
              key={contact._id}
              className="border-b hover:bg-gray-50 transition"
            >
              <td className="p-3">{contact.name}</td>
              <td className="p-3 break-all">{contact.email}</td>
              <td className="p-3 max-w-[150px] truncate">
                {contact.subject}
              </td>

              {/* STATUS */}
              <td className="p-3">
                <span
                  className="px-3 py-1 rounded-full text-white text-xs font-semibold"
                  style={{ backgroundColor: getStatusColor(contact.status) }}
                >
                  {contact.status}
                </span>
              </td>

              <td className="p-3">{formatDate(contact.createdAt)}</td>

              {/* ACTION BUTTONS */}
              <td className="p-3">
                <div className="flex items-center justify-center gap-2 flex-wrap md:flex-nowrap">
                  
                  {/* View */}
                  <button
                    onClick={() => openModal(contact)}
                    title="View Details"
                    className="p-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition whitespace-nowrap"
                  >
                   <FaEye />
                  </button>

                  {/* Reply */}
                  <button
                    onClick={() => openReplyModal(contact)}
                    title="Reply"
                    className="p-2 rounded bg-green-500 text-white hover:bg-green-600 transition whitespace-nowrap"
                  >
                    <FaReply />
                  </button>

                  {/* Status Dropdown */}
                  <select
                    value={contact.status}
                    onChange={(e) =>
                      updateContactStatus(contact._id, e.target.value)
                    }
                    className="p-2 border border-gray-300 rounded text-sm min-w-[120px]"
                  >
                    <option value="pending">Pending</option>
                    <option value="replied">Replied</option>
                    <option value="resolved">Resolved</option>
                  </select>

                  {/* Delete */}
                  <button
                    onClick={() => deleteContact(contact._id)}
                    title="Delete"
                    className="p-2 rounded bg-red-500 text-white hover:bg-red-600 transition whitespace-nowrap"
                  >
                    <FaTrash />
                  </button>

                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* NO CONTACTS */}
      {contacts.length === 0 && (
        <div className="text-center p-6">
          <i className="fas fa-inbox text-3xl text-gray-400"></i>
          <p className="text-gray-500 mt-2">No contact messages found</p>
        </div>
      )}
    </div>


      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="page-btn"
          >
            <i className="fas fa-chevron-left"></i>
            Previous
          </button>
          
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            Next
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedContact && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Contact Details</h2>
              <button className="close-btn" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="contact-details">
                <div className="detail-row">
                  <strong>Name:</strong>
                  <span>{selectedContact.name}</span>
                </div>
                <div className="detail-row">
                  <strong>Email:</strong>
                  <span>
                    <a href={`mailto:${selectedContact.email}`} className="email-link">
                      {selectedContact.email}
                    </a>
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Phone:</strong>
                  <span>
                    <a href={`tel:${selectedContact.phone}`} className="phone-link">
                      {selectedContact.phone}
                    </a>
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Subject:</strong>
                  <span>{selectedContact.subject}</span>
                </div>
                <div className="detail-row">
                  <strong>Status:</strong>
                  <span 
                    className="status-badge" 
                    style={{ backgroundColor: getStatusColor(selectedContact.status) }}
                  >
                    {selectedContact.status}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Date:</strong>
                  <span>{formatDate(selectedContact.createdAt)}</span>
                </div>
                <div className="detail-row message-row">
                  <strong>Message:</strong>
                  <div className="message-content">
                    {selectedContact.message}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <div className="modal-footer-left">
                <select
                  value={selectedContact.status}
                  onChange={(e) => updateContactStatus(selectedContact._id, e.target.value)}
                  className="status-select-modal"
                >
                  <option value="pending">Pending</option>
                  <option value="replied">Replied</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              
              <div className="modal-footer-right">
                <button 
                  className="reply-btn-modal"
                  onClick={() => {
                    closeModal();
                    openReplyModal(selectedContact);
                  }}
                >
                  <i className="fas fa-reply"></i>
                  Send Reply
                </button>
                
                <a 
                  href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}&body=Dear ${selectedContact.name},%0D%0A%0D%0AThank you for contacting us regarding "${selectedContact.subject}".%0D%0A%0D%0A`}
                  className="email-btn-modal"
                >
                  <i className="fas fa-envelope"></i>
                  Email Client
                </a>
                
                <button 
                  className="delete-btn-modal"
                  onClick={() => deleteContact(selectedContact._id)}
                >
                  <i className="fas fa-trash"></i>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedContact && (
        <div className="modal-overlay" onClick={closeReplyModal}>
          <div className="modal-content reply-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Send Reply to {selectedContact.name}</h2>
              <button className="close-btn" onClick={closeReplyModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="reply-form">
                <div className="customer-info">
                  <h3>Customer Details:</h3>
                  <p><strong>Name:</strong> {selectedContact.name}</p>
                  <p><strong>Email:</strong> {selectedContact.email}</p>
                  <p><strong>Subject:</strong> {selectedContact.subject}</p>
                  <div className="original-message">
                    <strong>Original Message:</strong>
                    <div className="message-preview">
                      {selectedContact.message}
                    </div>
                  </div>
                </div>
                
                <div className="reply-inputs">
                  <div className="form-group">
                    <label htmlFor="adminName">Your Name (Optional):</label>
                    <input
                      type="text"
                      id="adminName"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="e.g., John Doe, Customer Service Team"
                      className="admin-name-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="replyMessage">Reply Message: *</label>
                    <textarea
                      id="replyMessage"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your reply message here..."
                      rows="8"
                      className="reply-textarea"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <div className="modal-footer-left">
                <p className="reply-note">
                  <i className="fas fa-info-circle"></i>
                  This will send a professional email reply to the customer
                </p>
              </div>
              
              <div className="modal-footer-right">
                <button 
                  className="cancel-btn-modal"
                  onClick={closeReplyModal}
                  disabled={sendingReply}
                >
                  Cancel
                </button>
                
                <button 
                  className="send-reply-btn-modal"
                  onClick={sendReply}
                  disabled={sendingReply || !replyMessage.trim()}
                >
                  {sendingReply ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      Send Reply
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactManager;