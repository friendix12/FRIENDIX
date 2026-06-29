import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import { useAuth } from '../../context/AuthContext';
import { productsAPI, postsAPI } from '../../services/api';
import { FiShoppingBag, FiSearch, FiTag, FiMapPin, FiX, FiPlus, FiImage, FiGrid } from 'react-icons/fi';
import './MarketplacePage.css';

const CATEGORIES = ['All', 'Vehicles', 'Electronics', 'Apparel', 'Property Rentals', 'Furniture'];

const MarketplacePage = () => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Sell Modal State
  const [showSellModal, setShowSellModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sellForm, setSellForm] = useState({
    title: '',
    price: '',
    location: '',
    category: 'Electronics',
    condition: 'New',
    description: '',
    imageFile: null,
    imagePreview: ''
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productsAPI.getAll();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSellForm(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    const { title, price, location, category, condition, description, imageFile } = sellForm;
    if (!title || !price || !location || !imageFile) {
      alert('Please fill all fields and upload an image.');
      return;
    }

    try {
      setSubmitting(true);
      
      // 1. Upload file using general upload route
      const uploadData = await postsAPI.uploadFile(imageFile);
      const imageUrl = uploadData.url;

      // 2. Submit listing details
      await productsAPI.create({
        title,
        price,
        location,
        category,
        condition,
        description,
        image: imageUrl
      });

      // Reset Form & reload
      setSellForm({
        title: '',
        price: '',
        location: '',
        category: 'Electronics',
        condition: 'New',
        description: '',
        imageFile: null,
        imagePreview: ''
      });
      setShowSellModal(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Failed to post product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter listings locally based on active category and search input
  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="app-layout">
      <Navbar activePage="marketplace" />
      <div className="simple-layout">
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 16px 80px' }}>
          
          {/* Header section */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <FiShoppingBag /> Marketplace
            </h1>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <FiSearch style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Search Marketplace..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    padding: '8px 14px 8px 34px',
                    borderRadius: '20px',
                    border: '1.5px solid var(--border-light)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    fontSize: '0.9rem',
                    outline: 'none',
                    width: '220px'
                  }}
                />
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowSellModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FiPlus /> Sell Item
              </button>
            </div>
          </div>

          {/* Categories Tab Row */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: '1.5px solid var(--border-light)',
                  background: cat === activeCategory ? 'var(--primary)' : 'var(--bg-card)',
                  color: cat === activeCategory ? 'white' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Listings Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-secondary)' }}>
              Loading products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: '3rem' }}>🛍️</span>
              <p style={{ marginTop: '12px', fontWeight: 600 }}>No products found in this category.</p>
              <p style={{ fontSize: '0.82rem' }}>Be the first to list something for sale!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {filteredProducts.map(p => {
                const prodId = p._id || p.id;
                const seller = p.sellerId || {};
                return (
                  <div
                    key={prodId}
                    className="card product-card"
                    style={{ overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
                  >
                    <div style={{ position: 'relative' }}>
                      <img src={p.image} alt={p.title} style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }} />
                      <span
                        style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          background: p.condition === 'New' ? 'var(--success)' : 'var(--primary)',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700
                        }}
                      >
                        {p.condition}
                      </span>
                    </div>
                    <div style={{ padding: '12px' }}>
                      <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)', margin: '0 0 4px 0' }}>৳ {p.price}</p>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', margin: '0 0 6px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', margin: '0 0 10px 0' }}>
                        <FiMapPin /> {p.location}
                      </p>
                      
                      {/* Seller Profile Row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
                        {seller.avatar ? (
                          <img src={seller.avatar} alt="" className="avatar avatar-xs" />
                        ) : (
                          <div className="avatar-placeholder avatar-xs" style={{ fontSize: '0.6rem' }}>
                            {seller.fullName?.[0]}
                          </div>
                        )}
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{seller.fullName || 'Seller'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* facebook-Style Sell Modal */}
          {showSellModal && (
            <div className="modal-overlay" onClick={() => setShowSellModal(false)}>
              <div className="modal-card animate-scaleIn" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px', width: '90%' }}>
                <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontWeight: 800 }}>Create New Listing</h3>
                  <button className="icon-btn" onClick={() => setShowSellModal(false)}><FiX size={18} /></button>
                </div>

                <form onSubmit={handleCreateListing} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Photo dropzone */}
                  <div className="form-group">
                    <label className="form-label">Product Image</label>
                    <label className="story-upload-dropzone" style={{ height: '140px', cursor: 'pointer', border: '2px dashed var(--border-light)' }}>
                      {sellForm.imagePreview ? (
                        <img src={sellForm.imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-secondary)' }}>
                          <FiImage size={32} style={{ color: 'var(--primary)', marginBottom: '8px' }} />
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Click to select photo</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} required />
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="What are you selling?"
                      value={sellForm.title}
                      onChange={e => setSellForm({ ...sellForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Price (BDT ৳)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Price"
                        value={sellForm.price}
                        onChange={e => setSellForm({ ...sellForm, price: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Dhaka"
                        value={sellForm.location}
                        onChange={e => setSellForm({ ...sellForm, location: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Category</label>
                      <select
                        className="form-input"
                        value={sellForm.category}
                        onChange={e => setSellForm({ ...sellForm, category: e.target.value })}
                      >
                        {CATEGORIES.filter(c => c !== 'All').map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Condition</label>
                      <select
                        className="form-input"
                        value={sellForm.condition}
                        onChange={e => setSellForm({ ...sellForm, condition: e.target.value })}
                      >
                        <option value="New">New</option>
                        <option value="Used">Used</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description (Optional)</label>
                    <textarea
                      className="form-input"
                      placeholder="Describe your item..."
                      value={sellForm.description}
                      onChange={e => setSellForm({ ...sellForm, description: e.target.value })}
                      style={{ minHeight: '60px', resize: 'vertical' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                    style={{ width: '100%', marginTop: '8px', padding: '10px' }}
                  >
                    {submitting ? 'Creating Listing...' : 'Publish Product'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
