import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [totalMonthly, setTotalMonthly] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    serviceName: 'Netflix',
    monthlyPrice: '',
    startDate: '',
    renewalDate: '',
    billingCycle: 'monthly',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/subscriptions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscriptions(response.data.subscriptions);
      setTotalMonthly(response.data.totalMonthlySpending);
      setLoading(false);
    } catch (err) {
      setError('Failed to load subscriptions');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (editingId) {
        // Update existing subscription
        await axios.put(`/api/subscriptions/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Subscription updated successfully!');
      } else {
        // Add new subscription
        await axios.post('/api/subscriptions', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Subscription added successfully!');
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        serviceName: 'Netflix',
        monthlyPrice: '',
        startDate: '',
        renewalDate: '',
        billingCycle: 'monthly',
        notes: ''
      });
      fetchSubscriptions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save subscription');
    }
  };

  const handleEdit = (subscription) => {
    setEditingId(subscription._id);
    setFormData({
      serviceName: subscription.serviceName,
      monthlyPrice: subscription.monthlyPrice,
      startDate: subscription.startDate.split('T')[0],
      renewalDate: subscription.renewalDate.split('T')[0],
      billingCycle: subscription.billingCycle,
      notes: subscription.notes || ''
    });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      serviceName: 'Netflix',
      monthlyPrice: '',
      startDate: '',
      renewalDate: '',
      billingCycle: 'monthly',
      notes: ''
    });
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/subscriptions/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Subscription deleted successfully!');
        fetchSubscriptions();
      } catch (err) {
        setError('Failed to delete subscription');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading subscriptions...</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#667eea' }}>My Subscriptions</h2>
          <button 
            onClick={() => editingId ? handleCancelEdit() : setShowForm(!showForm)} 
            className="btn btn-primary"
          >
            {showForm ? 'Cancel' : '+ Add Subscription'}
          </button>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '20px', borderRadius: '10px', marginBottom: '30px' }}>
          <h3>Total Monthly Spending</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: '10px 0' }}>${totalMonthly.toFixed(2)}</p>
          <p>Across {subscriptions.filter(s => s.isActive).length} active subscription(s)</p>
        </div>

        {error && <div className="error" style={{ marginBottom: '20px' }}>{error}</div>}
        {success && <div className="success" style={{ marginBottom: '20px' }}>{success}</div>}

        {showForm && (
          <div className="card" style={{ background: '#f8f9fa', marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '20px' }}>{editingId ? 'Edit Subscription' : 'Add New Subscription'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="serviceName">Service Name</label>
                <select
                  id="serviceName"
                  name="serviceName"
                  value={formData.serviceName}
                  onChange={handleChange}
                  required
                >
                  <option value="Netflix">Netflix</option>
                  <option value="HBO Max">HBO Max</option>
                  <option value="Prime Video">Prime Video</option>
                  <option value="Peacock">Peacock</option>
                  <option value="Disney+">Disney+</option>
                  <option value="Hulu">Hulu</option>
                  <option value="Apple TV+">Apple TV+</option>
                  <option value="Paramount+">Paramount+</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="monthlyPrice">Monthly Price ($)</label>
                <input
                  type="number"
                  id="monthlyPrice"
                  name="monthlyPrice"
                  value={formData.monthlyPrice}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="9.99"
                />
              </div>

              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="renewalDate">Renewal Date</label>
                <input
                  type="date"
                  id="renewalDate"
                  name="renewalDate"
                  value={formData.renewalDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="billingCycle">Billing Cycle</label>
                <select
                  id="billingCycle"
                  name="billingCycle"
                  value={formData.billingCycle}
                  onChange={handleChange}
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes (Optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any additional notes..."
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingId ? 'Update Subscription' : 'Add Subscription'}
                </button>
                {editingId && (
                  <button 
                    type="button" 
                    onClick={handleCancelEdit} 
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {subscriptions.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
            No subscriptions yet. Add your first subscription to get started!
          </p>
        ) : (
          <div className="grid">
            {subscriptions.map((sub) => (
              <div key={sub._id} className="subscription-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                  <h3>{sub.serviceName}</h3>
                  <span className={`badge ${sub.isActive ? 'badge-active' : 'badge-inactive'}`}>
                    {sub.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                    ${sub.monthlyPrice.toFixed(2)}/mo
                  </p>
                  <p style={{ fontSize: '14px', color: '#666', textTransform: 'capitalize' }}>
                    Billed {sub.billingCycle}
                  </p>
                </div>

                <div style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                  <p>Started: {new Date(sub.startDate).toLocaleDateString()}</p>
                  <p>Renews: {new Date(sub.renewalDate).toLocaleDateString()}</p>
                </div>

                {sub.notes && (
                  <p style={{ fontSize: '14px', color: '#666', fontStyle: 'italic', marginBottom: '15px' }}>
                    {sub.notes}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button 
                    onClick={() => handleEdit(sub)}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(sub._id)}
                    className="btn btn-danger"
                    style={{ flex: 1 }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Subscriptions;
