import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate('/dashboard');
    }

    setLoading(false);
  };

  return (
    <div style={{
      maxWidth: '450px',
      margin: '60px auto',
      padding: '0 20px'
    }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2>
            Sign In
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span>Loading...</span>
                Signing in...
              </>
            ) : (
              <>
                Sign In
              </>
            )}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          padding: '20px',
          borderTop: '2px solid #f1f3f4'
        }}>
          <p style={{ color: '#6c757d', marginBottom: '8px' }}>
            Don't have an account?

            <Link to="/register">
              Create Account
            </Link>
          </p>
        </div>

        {/* <div style={{ marginTop: '10px' }}>
          <h4 style={{ marginBottom: '12px', color: '#333' }}>Demo Credentials</h4>
          <ul style={{ fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px' }}>
            <li><strong>Admin:</strong> admin@example.com / Admin123!</li>
            <li><strong>Store Owner:</strong> storeowner@example.com / Store123!</li>
            <li><strong>User:</strong> user@example.com / User123!</li>
          </ul>
        </div> */}
      </div>
    </div>
  );
};

export default Login;
