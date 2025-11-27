import React, { useState, useEffect } from 'react';
import './EmailStatus.css';

const EmailStatus = () => {
  const [savedEmails, setSavedEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedEmails();
  }, []);

  const fetchSavedEmails = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/contact/saved-emails');
      const data = await response.json();
      
      if (data.success) {
        setSavedEmails(data.data);
      }
    } catch (error) {
      console.error('Error fetching saved emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEmailTypeColor = (type) => {
    switch (type) {
      case 'admin_notification': return '#e74c3c';
      case 'customer_confirmation': return '#3498db';
      case 'admin_reply': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="email-status">
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i>
          Loading email status...
        </div>
      </div>
    );
  }

  return (
    <div className="email-status">
      <div className="email-status-header">
        <h2>Email System Status</h2>
        <p>
          {savedEmails.length === 0 
            ? "✅ Email system is working properly" 
            : `⚠️ ${savedEmails.length} emails were saved when SMTP failed`
          }
        </p>
      </div>

      {savedEmails.length > 0 && (
        <div className="saved-emails-container">
          <h3>Saved Emails (SMTP Failed)</h3>
          <div className="saved-emails-list">
            {savedEmails.map((email) => (
              <div key={email._id} className="saved-email-item">
                <div className="email-header">
                  <span 
                    className="email-type-badge"
                    style={{ backgroundColor: getEmailTypeColor(email.type) }}
                  >
                    {email.type.replace('_', ' ')}
                  </span>
                  <span className="email-date">{formatDate(email.createdAt)}</span>
                </div>
                
                <div className="email-details">
                  <p><strong>To:</strong> {email.to}</p>
                  <p><strong>Subject:</strong> {email.subject}</p>
                  <div className="email-preview">
                    <strong>Content Preview:</strong>
                    <div 
                      className="email-html-preview"
                      dangerouslySetInnerHTML={{ 
                        __html: email.html.substring(0, 200) + '...' 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="email-status-note">
            <p>
              <i className="fas fa-info-circle"></i>
              These emails were saved to the database when the SMTP service failed. 
              You can manually send them or fix the email configuration.
            </p>
          </div>
        </div>
      )}

      <div className="email-config-info">
        <h3>Current Email Configuration</h3>
        <div className="config-item">
          <strong>Service:</strong> Gmail SMTP
        </div>
        <div className="config-item">
          <strong>Host:</strong> smtp.gmail.com
        </div>
        <div className="config-item">
          <strong>Port:</strong> 587
        </div>
        <div className="config-item">
          <strong>From Email:</strong> yashper9@gmail.com
        </div>
      </div>
    </div>
  );
};

export default EmailStatus;