import React, { useEffect, useState } from 'react';
import './Home.css';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const baseUrl = "https://hospitalbackend-eight.vercel.app";
  const [counts, setCounts] = useState({
    contacts: { count: 0, loading: true, error: null },
    jobs: { count: 0, loading: true, error: null },
    departments: { count: 0, loading: true, error: null },
    doctors: { count: 0, loading: true, error: null },
    reviews: { count: 0, loading: true, error: null },
    newsEvents: { count: 0, loading: true, error: null },
    users: { count: 0, loading: true, error: null },
    appointments: { count: 0, loading: true, error: null },
    messages: { count: 0, loading: true, error: null },
    insurance: { count: 0, loading: true, error: null },
    healthPackage: { count: 0, loading: true, error: null },
    emergency: { count: 0, loading: true, error: null },
    ambulance: { count: 0, loading: true, error: null }
  });
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminError, setAdminError] = useState(null);

  useEffect(() => {
    const checkAdminAuth = async () => {
      const adminData = localStorage.getItem('admin');

      if (!adminData) {
        navigate('/admin');
        return;
      }

      const { username, password } = JSON.parse(adminData);

      try {
        const res = await fetch(`${baseUrl}/api/admin`);
        const admins = await res.json();
        const adminExists = admins.some(item => item.username === username && item.password === password);

        if (!adminExists) {
          localStorage.removeItem('admin');
          navigate('/admin');
        } else {
          fetchAllCounts();
        }
      } catch (error) {
        console.error(error);
        setAdminError('Failed to verify admin credentials');
        navigate('/admin');
      } finally {
        setAdminLoading(false);
      }
    };

    const fetchCount = async (endpoint, key) => {
      try {
        const res = await fetch(`${baseUrl}${endpoint}`);
        const data = await res.json();
        
        let count = 0;
        if (endpoint === '/api/ambulance' || endpoint === '/api/emergency' || endpoint === '/api/insurance' || endpoint === '/api/healthpackage') {
          count = data.count || (Array.isArray(data.data) ? data.data.length : 0);
        } else {
          count = Array.isArray(data) ? data.length : 0;
        }

        setCounts(prev => ({
          ...prev,
          [key]: { ...prev[key], count, loading: false, error: null }
        }));
      } catch (err) {
        console.error(`Failed to fetch ${key}:`, err);
        setCounts(prev => ({
          ...prev,
          [key]: { ...prev[key], loading: false, error: 'Failed to load data' }
        }));
      }
    };

    const fetchAllCounts = () => {
      fetchCount('/api/contact', 'contacts');
      fetchCount('/api/jobs', 'jobs');
      fetchCount('/api/department', 'departments');
      fetchCount('/api/doctor', 'doctors');
      fetchCount('/api/reviews', 'reviews');
      fetchCount('/api/news-events', 'newsEvents');
      fetchCount('/api/users', 'users');
      fetchCount('/api/appoinment', 'appointments');
      fetchCount('/api/message', 'messages');
      fetchCount('/api/insurance', 'insurance');
      fetchCount('/api/healthpackage', 'healthPackage');
      fetchCount('/api/emergency', 'emergency');
      fetchCount('/api/ambulance', 'ambulance');
    };

    checkAdminAuth();
  }, [navigate]);

  const DashboardCard = ({ title, countData, color, path }) => {
    return (
      <div className="dashboard-card" style={{ borderTop: `5px solid ${color}` }}>
        <h3>{title}</h3>
        {countData.loading ? (
          <div className="loading-spinner"></div>
        ) : countData.error ? (
          <p className="error-message">{countData.error}</p>
        ) : (
          <p>{countData.count}</p>
        )}
        <button className="view-btn" onClick={() => navigate(path)}>View Details</button>
      </div>
    );
  };

  if (adminLoading) {
    return (
      <div className="home-container">
        <h2 className="dashboard-title">Admin Dashboard</h2>
        <div className="loading-message">Verifying admin credentials...</div>
      </div>
    );
  }

  if (adminError) {
    return (
      <div className="home-container">
        <h2 className="dashboard-title">Admin Dashboard</h2>
        <div className="error-message">{adminError}</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <h2 className="dashboard-title">Admin Dashboard</h2>
      <div className="card-grid">
        <DashboardCard 
          title="Contacts" 
          countData={counts.contacts} 
          color="#1e90ff" 
          path="/admin/contacts" 
        />
        
        <DashboardCard 
          title="Jobs" 
          countData={counts.jobs} 
          color="#28a745" 
          path="/admin/jobs" 
        />
        
        <DashboardCard 
          title="Departments" 
          countData={counts.departments} 
          color="#6f42c1" 
          path="/admin/departments" 
        />
        
        <DashboardCard 
          title="Doctors" 
          countData={counts.doctors} 
          color="#fd7e14" 
          path="/admin/doctors" 
        />
        
        <DashboardCard 
          title="Reviews" 
          countData={counts.reviews} 
          color="#20c997" 
          path="/admin/reviews" 
        />
        
        <DashboardCard 
          title="News & Events" 
          countData={counts.newsEvents} 
          color="#dc3545" 
          path="/admin/news-events" 
        />
        
        <DashboardCard 
          title="Users" 
          countData={counts.users} 
          color="#17a2b8" 
          path="/admin/users" 
        />
        
        <DashboardCard 
          title="Appointments" 
          countData={counts.appointments} 
          color="#ff69b4" 
          path="/admin/appoinment" 
        />
        
        <DashboardCard 
          title="Messages" 
          countData={counts.messages} 
          color="#ffc107" 
          path="/admin/message" 
        />
        
        <DashboardCard 
          title="Insurance" 
          countData={counts.insurance} 
          color="#6d4c41" 
          path="/admin/insurance" 
        />
        
        <DashboardCard 
          title="Health Package" 
          countData={counts.healthPackage} 
          color="#5cb85c" 
          path="/admin/healthpackage" 
        />
        
        <DashboardCard 
          title="Emergency Bed" 
          countData={counts.emergency} 
          color="#d81b60" 
          path="/admin/emergencybed" 
        />
        
        <DashboardCard 
          title="Ambulance Service" 
          countData={counts.ambulance} 
          color="#7b1fa2" 
          path="/admin/ambulance" 
        />
      </div>
    </div>
  );
};

export default Home;