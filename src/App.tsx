import { useState, useEffect } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import Onboarding from './components/Onboarding';
import Match3Game from './components/Match3Game';
import Navbar from './components/Navbar';
import { Trophy, Calendar, User as UserIcon, LogOut } from 'lucide-react';

function App() {
  const { isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const [username, setUsername] = useState<string>(() => localStorage.getItem('base_username') || '');
  const [isStarted, setIsStarted] = useState(false);

  // Check network enforcement
  const isCorrectNetwork = chain?.id === base.id || chain?.id === baseSepolia.id;

  useEffect(() => {
    if (username) {
      localStorage.setItem('base_username', username);
    }
  }, [username]);

  const handleStart = (name: string) => {
    setUsername(name);
    setIsStarted(true);
  };

  if (!isConnected || !isStarted || !username) {
    return (
      <div className="app-container">
        <Onboarding onStart={handleStart} initialUsername={username} />
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="network-warning animate-fade" style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        textAlign: 'center',
        background: 'var(--bg-color)'
      }}>
        <div style={{
          background: 'var(--card-bg)',
          padding: '40px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          maxWidth: '500px'
        }}>
          <h2 style={{ marginBottom: '15px' }}>Wrong Network</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
            You are currently on {chain?.name || 'an unsupported network'}. 
            Please switch to <strong>Base</strong> network to continue.
          </p>
          <button 
            onClick={() => switchChain({ chainId: base.id })}
            style={{
              background: 'var(--primary)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: 'var(--radius-md)',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            Switch to Base
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar username={username} />
      <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <Match3Game />
      </main>
    </div>
  );
}

export default App;
