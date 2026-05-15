import { useState, useRef } from 'react';
import { useMatch3, TileType, Tile } from '../hooks/useMatch3';
import { useAccount, useSendTransaction } from 'wagmi';
import { BUILDER_CODE_SUFFIX } from '../wagmi';
import { Trophy, RefreshCw, Calendar, Send, Loader2, CheckCircle2 } from 'lucide-react';

export default function Match3Game() {
  const { grid, score, moves, isProcessing, swapTiles, resetGame } = useMatch3();
  const { address } = useAccount();
  const { sendTransaction, isPending: isTxPending } = useSendTransaction();
  
  const [draggingTile, setDraggingTile] = useState<Tile | null>(null);
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

  const handleDragStart = (tile: Tile) => {
    if (isProcessing || moves <= 0) return;
    setDraggingTile(tile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetTile: Tile) => {
    if (!draggingTile || isProcessing || moves <= 0) return;
    
    const rDiff = Math.abs(draggingTile.row - targetTile.row);
    const cDiff = Math.abs(draggingTile.col - targetTile.col);
    
    // Only adjacent swaps
    if ((rDiff === 1 && cDiff === 0) || (rDiff === 0 && cDiff === 1)) {
      swapTiles(draggingTile.row, draggingTile.col, targetTile.row, targetTile.col);
    }
    
    setDraggingTile(null);
  };

  const handleDailyCheckIn = async () => {
    try {
      setTxStatus('pending');
      // Send 0 ETH to self with Builder Code suffix
      sendTransaction({
        to: address!,
        value: 0n,
        // Manual data + suffix is the most robust way across all wallets
        data: BUILDER_CODE_SUFFIX as `0x${string}`,
      }, {
        onSuccess: () => setTxStatus('success'),
        onError: () => setTxStatus('error')
      });
    } catch (e) {
      setTxStatus('error');
    }
  };

  const handleSubmitScore = async () => {
    try {
      setTxStatus('pending');
      // In a real app, this would call a contract. 
      // For this demo, we'll send a transaction with score data + builder code.
      // Score in hex: score.toString(16)
      const scoreHex = score.toString(16).padStart(64, '0');
      // Append suffix to the data field
      const txData = `0x${scoreHex}${BUILDER_CODE_SUFFIX.replace('0x', '')}` as `0x${string}`;
      
      sendTransaction({
        to: address!,
        value: 0n,
        data: txData,
      }, {
        onSuccess: () => setTxStatus('success'),
        onError: () => setTxStatus('error')
      });
    } catch (e) {
      setTxStatus('error');
    }
  };

  const getTileColor = (type: TileType) => {
    switch (type) {
      case 'blue': return '#0052ff';
      case 'purple': return '#7c3aed';
      case 'green': return '#10b981';
      case 'yellow': return '#f59e0b';
      case 'pink': return '#ec4899';
      case 'red': return '#ef4444';
      default: return '#ccc';
    }
  };

  return (
    <div className="game-screen animate-fade">
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 350px',
        gap: '40px',
        alignItems: 'start'
      }}>
        {/* Left: Game Board */}
        <div style={{ 
          background: 'var(--card-bg)', 
          padding: '20px', 
          borderRadius: 'var(--radius-lg)', 
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(8, 1fr)', 
            gap: '8px',
            background: '#f1f5f9',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            width: '100%',
            aspectRatio: '1/1',
            maxWidth: '600px'
          }}>
            {grid.map((row, r) => row.map((tile, c) => (
              <div
                key={tile.id}
                draggable={!isProcessing && moves > 0}
                onDragStart={() => handleDragStart(tile)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(tile)}
                style={{
                  background: tile.type ? getTileColor(tile.type) : 'transparent',
                  borderRadius: '12px',
                  aspectRatio: '1/1',
                  cursor: isProcessing ? 'default' : 'grab',
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  transform: tile.isMatching ? 'scale(0)' : 'scale(1)',
                  opacity: tile.isMatching ? 0 : 1,
                  boxShadow: tile.type ? '0 4px 8px rgba(0,0,0,0.1)' : 'none',
                  border: draggingTile?.id === tile.id ? '3px solid white' : 'none'
                }}
              />
            )))}
          </div>
          
          <div style={{ marginTop: '24px', display: 'flex', gap: '20px' }}>
             <button onClick={resetGame} style={{
               display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
               background: '#f1f5f9', color: 'var(--text-main)', borderRadius: 'var(--radius-md)',
               fontWeight: '600'
             }}>
               <RefreshCw size={18} /> Restart
             </button>
          </div>
        </div>

        {/* Right: Stats & Blockchain */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Score Card */}
          <div style={{ 
            background: 'var(--card-bg)', 
            padding: '24px', 
            borderRadius: 'var(--radius-lg)', 
            boxShadow: 'var(--shadow-md)',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Game Progress</h3>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)' }}>{score}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>SCORE</div>
              </div>
              <div style={{ width: '1px', height: '40px', background: 'var(--border-color)' }}></div>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: moves < 5 ? '#ef4444' : 'var(--text-main)' }}>{moves}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>MOVES</div>
              </div>
            </div>
            
            {moves === 0 && !isProcessing && (
              <div className="animate-fade" style={{ marginTop: '20px', padding: '16px', background: '#fff5f5', borderRadius: 'var(--radius-md)', border: '1px solid #feb2b2' }}>
                <p style={{ fontWeight: '700', color: '#c53030' }}>Game Over!</p>
                <button 
                  onClick={handleSubmitScore}
                  disabled={isTxPending}
                  style={{
                    marginTop: '12px', width: '100%', padding: '12px', background: 'var(--primary)', color: 'white',
                    borderRadius: 'var(--radius-md)', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}
                >
                  {isTxPending ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                  Submit Final Score
                </button>
              </div>
            )}
          </div>

          {/* Blockchain Card */}
          <div style={{ 
            background: 'var(--card-bg)', 
            padding: '24px', 
            borderRadius: 'var(--radius-lg)', 
            boxShadow: 'var(--shadow-md)'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} color="var(--primary)" />
              Daily Check-in
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Record your activity on Base to earn rewards and track your progress.
            </p>
            
            <button
              onClick={handleDailyCheckIn}
              disabled={isTxPending || txStatus === 'success'}
              style={{
                width: '100%', padding: '14px', borderRadius: 'var(--radius-md)',
                background: txStatus === 'success' ? '#10b981' : 'var(--primary)',
                color: 'white', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
              }}
            >
              {isTxPending ? <Loader2 className="animate-spin" /> : (txStatus === 'success' ? <CheckCircle2 size={18} /> : <Calendar size={18} />)}
              {txStatus === 'success' ? 'Checked In' : 'Daily Check-in'}
            </button>
            
            {txStatus === 'error' && (
              <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '10px', textAlign: 'center' }}>
                Transaction failed. Please try again.
              </p>
            )}

            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Builder Code:</span>
                <span style={{ color: 'var(--primary)', fontWeight: '600' }}>bc_z10us01u</span>
              </div>
              <div style={{ wordBreak: 'break-all' }}>
                Suffix: <span style={{ fontFamily: 'monospace' }}>{BUILDER_CODE_SUFFIX.substring(0, 10)}...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
