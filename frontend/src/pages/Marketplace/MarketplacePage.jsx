import Navbar from '../../components/Navbar/Navbar';
import { FiShoppingBag, FiSearch, FiTag, FiMapPin } from 'react-icons/fi';

const PRODUCTS = [
  { id: 'pr1', title: 'iPhone 16 Pro Max', price: '1,80,000', location: 'Dhaka', img: 'https://picsum.photos/seed/prod1/300/300', condition: 'New' },
  { id: 'pr2', title: 'Samsung 4K TV 55"', price: '65,000', location: 'Chattogram', img: 'https://picsum.photos/seed/prod2/300/300', condition: 'Used' },
  { id: 'pr3', title: 'Honda CB 150R', price: '2,50,000', location: 'Sylhet', img: 'https://picsum.photos/seed/prod3/300/300', condition: 'Used' },
  { id: 'pr4', title: 'Dell XPS 15 Laptop', price: '1,20,000', location: 'Rajshahi', img: 'https://picsum.photos/seed/prod4/300/300', condition: 'New' },
  { id: 'pr5', title: 'Air Conditioner 1.5 Ton', price: '45,000', location: 'Khulna', img: 'https://picsum.photos/seed/prod5/300/300', condition: 'New' },
  { id: 'pr6', title: 'Residential Land 10 Katha', price: '50,00,000', location: 'Gazipur', img: 'https://picsum.photos/seed/prod6/300/300', condition: 'New' },
];

const MarketplacePage = () => (
  <div className="app-layout">
    <Navbar activePage="marketplace" />
    <div className="simple-layout">
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 16px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiShoppingBag /> Marketplace
          </h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <FiSearch style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
              <input type="text" placeholder="Search Marketplace..." style={{ padding: '8px 14px 8px 34px', borderRadius: '20px', border: '1.5px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none', width: '220px' }} />
            </div>
            <button className="btn btn-primary btn-sm">+ Sell Item</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['All', 'Vehicles', 'Electronics', 'Apparel', 'Property Rentals', 'Furniture'].map(cat => (
            <button key={cat} style={{ padding: '6px 14px', borderRadius: '20px', border: '1.5px solid var(--border-color)', background: cat === 'All' ? 'var(--primary)' : 'var(--bg-card)', color: cat === 'All' ? 'white' : 'var(--text-secondary)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {PRODUCTS.map(p => (
            <div key={p.id} className="card" style={{ overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ position: 'relative' }}>
                <img src={p.img} alt={p.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                <span style={{ position: 'absolute', top: '8px', left: '8px', background: p.condition === 'New' ? 'var(--success)' : 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                  {p.condition}
                </span>
              </div>
              <div style={{ padding: '10px' }}>
                <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary)', marginBottom: '4px' }}>৳ {p.price}</p>
                <p style={{ fontWeight: 600, fontSize: '0.87rem', marginBottom: '4px' }}>{p.title}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}><FiMapPin /> {p.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
export default MarketplacePage;
