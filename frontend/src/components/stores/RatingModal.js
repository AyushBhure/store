import React, { useState } from 'react';
import toast from 'react-hot-toast';

const RatingModal = ({ store, onClose, onSubmit }) => {
  // Initialize with existing rating or default to 5
  const [rating, setRating] = useState(store.userRating?.rating || 5);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      toast.error('Please select a rating');
      return;
    }
    setLoading(true);
    
    try {
      await onSubmit({
        rating: Number(rating)
      });
    } catch (error) {
      toast.error('Failed to save rating'); // Additional feedback
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= rating ? '' : 'empty'}`}
          style={{ cursor: 'pointer', fontSize: '24px' }}
          onClick={() => setRating(i)}
        >
          ★
        </span>
      );
    }
    return <div className="rating-stars">{stars}</div>;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="modal-content" style={{
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          borderBottom: '2px solid #f1f3f4',
          paddingBottom: '16px'
        }}>
          <h3 style={{
            margin: 0,
            color: '#333',
            fontSize: '1.5rem',
            fontWeight: '700'
          }}>
            {store.userRating ? `Update Rating for ${store.name}` : `Rate ${store.name}`}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              color: '#6c757d',
              padding: '8px',
              borderRadius: '50%',
              transition: 'all 0.2s ease',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f8f9fa';
              e.target.style.color = '#dc3545';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#6c757d';
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Your Rating</label>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              {renderStars(rating)}
            </div>
            <div style={{
              textAlign: 'center',
              fontSize: '20px',
              fontWeight: '700',
              color: '#111827',
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '12px',
              border: '2px solid #e9ecef'
            }}>
              {rating} out of 5 stars
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'flex-end',
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '2px solid #f1f3f4'
          }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
            >
              {store.userRating ? 'Update Rating' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
