import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error.message, error.stack, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center',
          fontFamily: 'var(--font)',
          background: 'var(--bg-primary, #f0f2f5)',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: '#1877F2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 900,
            fontSize: '1.5rem',
            marginBottom: '20px',
          }}>fx</div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px', color: '#1c1e21' }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#65676b', marginBottom: '20px', maxWidth: '500px' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <p style={{ fontSize: '0.8rem', color: '#999', marginBottom: '20px', maxWidth: '500px', wordBreak: 'break-all' }}>
            {this.state.error?.stack?.split('\n')?.slice(0, 3)?.join(' | ')}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/';
            }}
            style={{
              padding: '10px 24px',
              background: '#1877F2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
            }}
          >
            Go to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
