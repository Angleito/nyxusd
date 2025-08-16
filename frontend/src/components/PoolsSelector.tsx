import React from 'react';
import { SparklesIcon, ShieldCheckIcon, FireIcon } from '@heroicons/react/24/outline';

interface Pool {
  id: string;
  name: string;
  subName: string;
  description: string;
  risk: 'safe' | 'medium' | 'high';
  perfectFor: string[];
  targetChains: string[];
}

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'glow';
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, variant = 'default', className = '' }) => (
  <div className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 ${className}`}>
    {children}
  </div>
);

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, variant = 'primary', className = '' }) => {
  const baseClasses = 'px-4 py-2 rounded-lg transition-colors font-medium';
  const variantClasses = {
    primary: 'bg-purple-600 hover:bg-purple-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    ghost: 'bg-transparent border border-gray-600 hover:border-gray-500 text-gray-300'
  };
  
  return (
    <button 
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

type Props = {
  onSelect?: (pool: Pool) => void;
};

const RiskBadge: React.FC<{ risk: Pool['risk'] }> = ({ risk }) => {
  const map = {
    safe: { label: 'Safe', color: 'var(--nyx-success)' },
    medium: { label: 'Medium', color: 'var(--nyx-gold-circuit)' },
    high: { label: 'High Risk', color: 'var(--nyx-plasma-pink)' },
  } as const;
  const cfg = map[risk];
  return (
    <span
      className="text-xs px-2 py-1 rounded-full"
      style={{ background: cfg.color, color: 'var(--nyx-cosmic-black)' }}
    >
      {cfg.label}
    </span>
  );
};

const PoolIcon: React.FC<{ risk: Pool['risk'] }> = ({ risk }) => {
  if (risk === 'safe') return <ShieldCheckIcon className="w-6 h-6" style={{ color: 'var(--nyx-neon-cyan)' }} />;
  if (risk === 'medium') return <SparklesIcon className="w-6 h-6" style={{ color: 'var(--nyx-gold-circuit)' }} />;
  return <FireIcon className="w-6 h-6" style={{ color: 'var(--nyx-plasma-pink)' }} />;
};

export const PoolsSelector: React.FC<Props> = ({ onSelect }) => {
  // Mock data for Cardano CDP yield pools
  const pools: Pool[] = [
    {
      id: 'safe',
      name: 'Safe Pool',
      subName: 'Conservative Growth',
      description: 'Stable yields from established DeFi protocols. Focus on liquidity provision and staking rewards with minimal impermanent loss risk.',
      risk: 'safe',
      perfectFor: ['First-time users', 'Capital preservation', 'Steady income'],
      targetChains: ['Cardano', 'Base', 'Arbitrum']
    },
    {
      id: 'medium',
      name: 'Medium Pool',
      subName: 'Balanced Strategy',
      description: 'Balanced approach mixing yield farming and lending protocols. Moderate risk for enhanced returns through diversified strategies.',
      risk: 'medium',
      perfectFor: ['Experienced users', 'Growth focused', 'Risk tolerant'],
      targetChains: ['Base', 'Optimism', 'Polygon']
    },
    {
      id: 'high',
      name: 'High Pool',
      subName: 'Maximum Yield',
      description: 'Aggressive strategies targeting highest yields. Includes leveraged positions, new protocols, and advanced DeFi mechanics.',
      risk: 'high',
      perfectFor: ['DeFi veterans', 'Maximum returns', 'High risk tolerance'],
      targetChains: ['Ethereum', 'Avalanche', 'Fantom']
    }
  ];

  return (
    <div className="space-y-6">
      <Card variant="glow">
        <h2 className="text-2xl font-bold text-white mb-2">Choose Your Pool</h2>
        <p className="text-gray-300">
          Three calibrated strategies for cross-chain yield optimization. Coming soon after CDP launch.
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pools.map((p) => (
          <Card key={p.id} variant="elevated" className="flex flex-col">
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <PoolIcon risk={p.risk} />
                  <h3 className="text-xl font-semibold text-white">{p.name}</h3>
                </div>
                <RiskBadge risk={p.risk} />
              </div>

              <p className="text-sm mb-3 text-gray-400">
                {p.subName}
              </p>

              <p className="text-gray-300 flex-1">
                {p.description}
              </p>

              <div className="mt-4 space-y-2">
                <div className="text-xs text-gray-400">
                  <strong>Perfect for:</strong> {p.perfectFor.join(', ')}
                </div>
                <div className="text-xs text-gray-400">
                  <strong>Chains:</strong> {p.targetChains.join(', ')}
                </div>
              </div>

              <div className="mt-6">
                <Button
                  variant={p.risk === 'high' ? 'primary' : p.risk === 'medium' ? 'secondary' : 'ghost'}
                  onClick={() => onSelect?.(p)}
                >
                  Select {p.name}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PoolsSelector;