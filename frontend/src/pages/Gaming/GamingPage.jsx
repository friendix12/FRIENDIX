import { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import {
  FiZap, FiTv, FiCompass, FiGrid, FiPlayCircle,
  FiAward, FiVolume2, FiMessageSquare, FiHeart, FiShare2
} from 'react-icons/fi';
import './GamingPage.css';

const MOCK_STREAMS = [
  {
    id: 's1',
    title: 'PUBG Mobile — Rank Push to Conqueror! 🏆🔥',
    streamer: 'Gaming Boss BD',
    avatar: 'https://i.pravatar.cc/150?img=12',
    game: 'PUBG Mobile',
    viewers: '2.4K',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-nightclub-43019-large.mp4', // sample loop
  },
  {
    id: 's2',
    title: 'GTA V RP — New Jobs & Missions! 🚗🚓',
    streamer: 'Zian RP Gaming',
    avatar: 'https://i.pravatar.cc/150?img=33',
    game: 'Grand Theft Auto V',
    viewers: '1.8K',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-hot-coffee-into-a-cup-42289-large.mp4', // sample loop
  }
];

const INITIAL_CARDS = [
  { id: 1, symbol: '🎮', matched: false },
  { id: 2, symbol: '🕹️', matched: false },
  { id: 3, symbol: '👾', matched: false },
  { id: 4, symbol: '🚀', matched: false },
  { id: 5, symbol: '🎮', matched: false },
  { id: 6, symbol: '🕹️', matched: false },
  { id: 7, symbol: '👾', matched: false },
  { id: 8, symbol: '🚀', matched: false }
];

const GamingPage = () => {
  const [activeMenu, setActiveMenu] = useState('play');
  
  // Memory Game State
  const [cards, setCards] = useState(() => shuffle(INITIAL_CARDS));
  const [selectedCards, setSelectedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);

  function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
  }

  const handleCardClick = (index) => {
    if (selectedCards.length === 2 || cards[index].matched || selectedCards.includes(index)) return;

    const newSelected = [...selectedCards, index];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setMoves(prev => prev + 1);
      const [firstIdx, secondIdx] = newSelected;
      
      if (cards[firstIdx].symbol === cards[secondIdx].symbol) {
        // Match!
        setTimeout(() => {
          setCards(prev => {
            const updated = [...prev];
            updated[firstIdx].matched = true;
            updated[secondIdx].matched = true;
            return updated;
          });
          setScore(prev => prev + 10);
          setSelectedCards([]);
        }, 600);
      } else {
        // No match
        setTimeout(() => {
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  const handleResetGame = () => {
    setCards(shuffle(INITIAL_CARDS.map(c => ({ ...c, matched: false }))));
    setSelectedCards([]);
    setMoves(0);
    setScore(0);
  };

  return (
    <div className="app-layout">
      <Navbar activePage="gaming" />

      <div className="gaming-layout">
        {/* Left Sidebar */}
        <aside className="gaming-sidebar">
          <h2 className="gaming-title"><FiZap /> Gaming</h2>
          <nav className="gaming-nav">
            <button
              className={`gaming-nav-item ${activeMenu === 'play' ? 'active' : ''}`}
              onClick={() => setActiveMenu('play')}
              id="gaming-tab-play"
            >
              <span className="gaming-nav-icon"><FiGrid size={18} /></span>
              <span>Play Games</span>
            </button>
            <button
              className={`gaming-nav-item ${activeMenu === 'watch' ? 'active' : ''}`}
              onClick={() => setActiveMenu('watch')}
              id="gaming-tab-watch"
            >
              <span className="gaming-nav-icon"><FiTv size={18} /></span>
              <span>Watch Streams</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="gaming-main">
          {activeMenu === 'play' ? (
            <div className="gaming-card-game animate-fadeIn">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Play Memory Match Game</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>Match all pairs to win points!</p>
                </div>
                <button className="btn btn-primary" onClick={handleResetGame} id="restart-game-btn">Restart Game</button>
              </div>

              <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
                <div style={{ background: 'var(--bg-card)', padding: '12px 24px', borderRadius: '8px', border: '1px solid var(--border-light)', fontWeight: 600 }}>
                  Moves: <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{moves}</span>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '12px 24px', borderRadius: '8px', border: '1px solid var(--border-light)', fontWeight: 600 }}>
                  Score: <span style={{ color: 'var(--success)', fontWeight: 700 }}>{score}</span>
                </div>
              </div>

              <div className="memory-grid">
                {cards.map((card, idx) => {
                  const isFlipped = selectedCards.includes(idx) || card.matched;
                  return (
                    <div
                      key={idx}
                      className={`memory-card ${isFlipped ? 'flipped' : ''}`}
                      onClick={() => handleCardClick(idx)}
                      id={`memory-card-${idx}`}
                    >
                      <div className="memory-card-inner">
                        <div className="memory-card-front">?</div>
                        <div className="memory-card-back">{card.symbol}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {score === 40 && (
                <div className="game-success-overlay animate-scaleIn">
                  <FiAward size={48} style={{ color: 'gold', marginBottom: '12px' }} />
                  <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Congratulations! You Won!</h4>
                  <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>You completed the game in {moves} moves.</p>
                  <button className="btn btn-primary" onClick={handleResetGame} style={{ marginTop: '8px' }}>Play Again</button>
                </div>
              )}
            </div>
          ) : (
            <div className="gaming-streams animate-fadeIn">
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px' }}>Live Gaming Streams</h3>
              <div className="streams-grid">
                {MOCK_STREAMS.map(stream => (
                  <div key={stream.id} className="card stream-card">
                    <div className="stream-video-wrap">
                      <video src={stream.videoUrl} autoPlay loop muted playsInline className="stream-video" />
                      <span className="live-badge">LIVE</span>
                      <span className="viewer-count">{stream.viewers} watching</span>
                    </div>
                    <div style={{ padding: '12px', display: 'flex', gap: '10px' }}>
                      <img src={stream.avatar} alt="" className="avatar avatar-md" />
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '0.95rem', margin: '0 0 4px 0', lineHeight: 1.3 }} className="stream-title">{stream.title}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>{stream.streamer}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, margin: '2px 0 0 0' }}>{stream.game}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default GamingPage;
