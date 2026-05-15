# Base Match-3 Puzzle Game

A fully functional match-3 puzzle game built with React, TypeScript, and Vite, featuring deep integration with the **Base blockchain**.

## Key Features
- **Match-3 Engine**: Smooth 8x8 grid gameplay with gravity and matching logic.
- **Wallet Connection**: Integrated with RainbowKit, supporting all EVM wallets.
- **Base Network Enforcement**: Automatically detects and prompts users to switch to Base L2.
- **Daily Check-in**: On-chain transaction on Base to record daily activity.
- **Score Submission**: Final score submission via Base transactions.
- **Builder Attribution**: Fully integrated with **Base Builder Code** (`bc_sjkexp2o`) and encoded suffix for dashboard tracking.

## Technical Stack
- **Frontend**: React 18, Vite, TypeScript
- **Web3**: Wagmi, Viem, RainbowKit, TanStack Query
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (Premium Modern Design)

## Setup and Running

To run this project locally, you need Node.js and npm installed.

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to the provided local URL (usually `http://localhost:5173`).

## Builder Code Integration
The project uses the following Builder Code configuration:
- **Builder Code**: `bc_z10us01u`
- **Encoded Suffix**: `0x62635f7a313075733031750b0080218021802180218021802180218021`

This suffix is automatically appended to the `data` field of all blockchain transactions (Check-in and Score Submission) to ensure your activity is tracked on the Base dashboard.
