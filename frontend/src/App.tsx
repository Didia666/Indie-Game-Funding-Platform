import React, { useState, useEffect } from 'react';
import { Gamepad2, TrendingUp, Users, Shield, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

import { connectFreighter, investInGame } from './lib/stellar';

interface Game {
  id: number;
  title: string;
  description: string;
  goal: number;
  raised: number;
  assetCode: string;
  issuer: string;
  image: string;
}

function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [investing, setInvesting] = useState<number | null>(null);

  const fetchGames = () => {
    fetch('http://localhost:3001/api/games')
      .then(res => res.json())
      .then(data => setGames(data))
      .catch(err => console.error('Failed to fetch games', err));
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const connectWallet = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Connect Wallet clicked');
    try {
      const address = await connectFreighter();
      if (address) {
        setWalletAddress(address);
      } else {
        alert('Please install Freighter wallet');
      }
    } catch (error) {
      console.error('Wallet connection failed', error);
    }
  };

  const handleInvest = async (game: Game) => {
    if (!walletAddress) {
      alert('Please connect your wallet first');
      return;
    }

    const amount = prompt(`How much USDC would you like to invest in ${game.title}?`, "100");
    if (!amount || isNaN(Number(amount))) return;

    setInvesting(game.id);
    try {
      let txHash = "simulated_tx_hash_" + Math.random().toString(36).substring(7);
      
      if (!game.issuer.includes("...")) {
         const result = await investInGame(game.assetCode, game.issuer, amount);
         txHash = result.hash;
      }

      const response = await fetch('http://localhost:3001/api/invest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: game.id,
          amount: Number(amount),
          investorAddress: walletAddress,
          txHash: txHash
        })
      });

      if (response.ok) {
        alert(`Successfully invested ${amount} USDC in ${game.title}!`);
        fetchGames();
      }
    } catch (error: any) {
      console.error('Investment failed', error);
      alert('Investment failed: ' + error.message);
    } finally {
      setInvesting(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative">
      {/* Navbar - Simplified and forced to top */}
      <nav className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center border-b border-gray-800 bg-[#0a0a0a] z-[100]">
        <div className="flex items-center gap-2">
          <Gamepad2 className="text-[#00f2ff]" size={32} />
          <span className="text-2xl font-bold tracking-tighter neon-text-cyan">
            PINOY INDIE FUND
          </span>
        </div>
        <div className="flex gap-8 items-center">
          <button 
            type="button"
            onClick={connectWallet}
            className="neon-button !relative !z-[110]"
          >
            {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Connect Wallet'}
          </button>
        </div>
      </nav>

      <main className="pt-32">
        {/* Hero Section */}
        <header className="py-20 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div 
            className="text-center lg:text-left"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl font-extrabold leading-tight mb-6">
              Empowering <span className="neon-text-magenta">Filipino</span> Game Devs Through <span className="neon-text-cyan">Stellar</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Invest in the next Pinoy hit. Buy game shares as tokens, support local talent, and earn revenue shares directly on the blockchain.
            </p>
            <div className="flex gap-6 justify-center lg:justify-start">
              <button className="neon-button">
                Explore Games
              </button>
            </div>
          </motion.div>
          
          <div className="relative pointer-events-none">
            <div className="w-full h-[400px] bg-gradient-to-br from-[#00f2ff33] to-[#ff00f233] rounded-2xl border border-gray-700 flex items-center justify-center overflow-hidden">
               <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #00f2ff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
               <Gamepad2 size={200} className="text-[#00f2ff] opacity-50 blur-sm absolute" />
               <Gamepad2 size={180} className="text-white relative z-10" />
            </div>
          </div>
        </header>

        {/* Features */}
        <section className="py-20 bg-[#111] px-6 relative z-10 text-center md:text-left">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="card">
              <TrendingUp className="text-[#00f2ff] mb-4" size={40} />
              <h3 className="text-xl font-bold mb-2">Revenue Share</h3>
              <p className="text-gray-400">Tokens represent a percentage of game earnings, distributed automatically via Soroban smart contracts.</p>
            </div>
            <div className="card">
              <Users className="text-[#ff00f2] mb-4" size={40} />
              <h3 className="text-xl font-bold mb-2">Back Pinoy Talent</h3>
              <p className="text-gray-400">Bridging the gap between local developers and global investors who believe in Southeast Asian creativity.</p>
            </div>
            <div className="card">
              <Shield className="text-[#39ff14] mb-4" size={40} />
              <h3 className="text-xl font-bold mb-2">Secure & Transparent</h3>
              <p className="text-gray-400">Powered by the Stellar network for fast, low-cost, and reliable token issuance and transactions.</p>
            </div>
          </div>
        </section>

        {/* Featured Games */}
        <section className="py-20 px-6 max-w-7xl mx-auto relative z-10 text-center">
          <h2 className="text-4xl font-bold mb-12 flex items-center gap-4 justify-center">
            Featured <span className="neon-text-cyan">Games</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {games.map((game) => (
              <div key={game.id} className="card group overflow-hidden p-0">
                <div 
                  className="h-48 bg-gray-800 relative bg-cover bg-center"
                  style={{ backgroundImage: `url(${game.image})` }}
                >
                  <div className="absolute top-4 right-4 bg-[#0a0a0a] px-3 py-1 border border-[#00f2ff] text-[#00f2ff] text-xs font-bold rounded">
                    {Math.round((game.raised / game.goal) * 100)}% FUNDED
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-bold mb-1">{game.title}</h4>
                  <p className="text-gray-400 text-sm mb-4">{game.description}</p>
                  <div className="w-full bg-gray-800 h-2 rounded-full mb-4">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((game.raised / game.goal) * 100, 100)}%` }}
                      className="bg-[#00f2ff] h-full rounded-full" 
                    ></motion.div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="block text-xs text-gray-500">GOAL</span>
                      <span className="font-bold text-[#00f2ff]">{game.goal.toLocaleString()} USDC</span>
                    </div>
                    <button 
                      onClick={() => handleInvest(game)}
                      disabled={investing === game.id}
                      className="neon-button text-xs py-1 px-4 flex items-center gap-2"
                    >
                      {investing === game.id ? <Loader2 size={14} className="animate-spin" /> : 'Invest'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-gray-800 text-center text-gray-500 relative z-10">
        <p>&copy; 2026 Pinoy Indie Fund. Built on Stellar.</p>
      </footer>
    </div>
  );
}

export default App;
