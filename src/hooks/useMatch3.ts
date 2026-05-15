import { useState, useCallback, useEffect } from 'react';

export type TileType = 'blue' | 'purple' | 'green' | 'yellow' | 'pink' | 'red';
export const TILE_TYPES: TileType[] = ['blue', 'purple', 'green', 'yellow', 'pink', 'red'];

export interface Tile {
  id: string;
  type: TileType;
  row: number;
  col: number;
  isMatching?: boolean;
}

const GRID_SIZE = 8;

export function useMatch3() {
  const [grid, setGrid] = useState<Tile[][]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(20);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize grid
  const initGrid = useCallback(() => {
    const newGrid: Tile[][] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      const row: Tile[] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        let type: TileType;
        // Ensure no initial matches
        do {
          type = TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)];
        } while (
          (r >= 2 && newGrid[r - 1][c].type === type && newGrid[r - 2][c].type === type) ||
          (c >= 2 && row[c - 1].type === type && row[c - 2].type === type)
        );
        
        row.push({
          id: `${r}-${c}-${Math.random()}`,
          type,
          row: r,
          col: c
        });
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
    setScore(0);
    setMoves(20);
    setIsProcessing(false);
  }, []);

  useEffect(() => {
    initGrid();
  }, [initGrid]);

  // Matching logic
  const checkMatches = (currentGrid: Tile[][]) => {
    const matches: { r: number, c: number }[] = [];
    
    // Horizontal
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE - 2; c++) {
        const type = currentGrid[r][c].type;
        if (type && currentGrid[r][c + 1].type === type && currentGrid[r][c + 2].type === type) {
          matches.push({ r, c }, { r, c + 1 }, { r, c + 2 });
          let nextC = c + 3;
          while (nextC < GRID_SIZE && currentGrid[r][nextC].type === type) {
            matches.push({ r, c: nextC });
            nextC++;
          }
        }
      }
    }
    
    // Vertical
    for (let c = 0; c < GRID_SIZE; c++) {
      for (let r = 0; r < GRID_SIZE - 2; r++) {
        const type = currentGrid[r][c].type;
        if (type && currentGrid[r + 1][c].type === type && currentGrid[r + 2][c].type === type) {
          matches.push({ r, c }, { r + 1, c }, { r + 2, c });
          let nextR = r + 3;
          while (nextR < GRID_SIZE && currentGrid[nextR][c].type === type) {
            matches.push({ r: nextR, c });
            nextR++;
          }
        }
      }
    }
    
    return matches;
  };

  const processGrid = async () => {
    setIsProcessing(true);
    let currentGrid = [...grid.map(row => [...row])];
    let totalMatches = 0;
    
    while (true) {
      const matchCoords = checkMatches(currentGrid);
      if (matchCoords.length === 0) break;
      
      // Mark matches
      const uniqueMatches = Array.from(new Set(matchCoords.map(m => `${m.r}-${m.c}`)));
      totalMatches += uniqueMatches.length;
      
      const newGrid = currentGrid.map(row => [...row]);
      uniqueMatches.forEach(coord => {
        const [r, c] = coord.split('-').map(Number);
        newGrid[r][c].isMatching = true;
      });
      
      setGrid(newGrid);
      await new Promise(r => setTimeout(r, 300));
      
      // Clear matches and drop
      const droppedGrid = newGrid.map(row => row.map(t => t.isMatching ? { ...t, type: '' as any } : t));
      
      // Gravity
      for (let c = 0; c < GRID_SIZE; c++) {
        let emptySpot = GRID_SIZE - 1;
        for (let r = GRID_SIZE - 1; r >= 0; r--) {
          if (droppedGrid[r][c].type !== '') {
            const temp = droppedGrid[r][c];
            droppedGrid[r][c] = droppedGrid[emptySpot][c];
            droppedGrid[emptySpot][c] = { ...temp, row: emptySpot };
            emptySpot--;
          }
        }
        
        // Spawn new
        for (let r = emptySpot; r >= 0; r--) {
          droppedGrid[r][c] = {
            id: `${r}-${c}-${Math.random()}`,
            type: TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)],
            row: r,
            col: c
          };
        }
      }
      
      currentGrid = droppedGrid;
      setGrid(currentGrid);
      setScore(s => s + uniqueMatches.length * 10);
      await new Promise(r => setTimeout(r, 300));
    }
    
    setIsProcessing(false);
  };

  const swapTiles = async (r1: number, c1: number, r2: number, c2: number) => {
    if (isProcessing || moves <= 0) return;
    
    const newGrid = [...grid.map(row => [...row])];
    const temp = newGrid[r1][c1];
    newGrid[r1][c1] = { ...newGrid[r2][c2], row: r1, col: c1 };
    newGrid[r2][c2] = { ...temp, row: r2, col: c2 };
    
    const matches = checkMatches(newGrid);
    if (matches.length > 0) {
      setGrid(newGrid);
      setMoves(m => m - 1);
      await processGrid();
    } else {
      // Invalid swap animation
      setGrid(newGrid);
      await new Promise(r => setTimeout(r, 200));
      // Revert
      const revertGrid = [...grid.map(row => [...row])];
      setGrid(revertGrid);
    }
  };

  return {
    grid,
    score,
    moves,
    isProcessing,
    swapTiles,
    resetGame: initGrid
  };
}
