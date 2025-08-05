import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPools } from '../../services/poolsService';
import type { Pool } from '../../types/pools';
import { Card, CardContent, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { SparklesIcon, ShieldCheckIcon, FireIcon } from '@heroicons/react/24/outline';

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
  const { data, isLoading, error } = useQuery({
    queryKey: ['pools'],
    queryFn: fetchPools,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="nyx-loading-dots">
          <span /><span /><span />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="elevated" className="max-w-xl mx-auto">
        <CardContent>
          <p className="nyx-body-large" style={{ color: 'var(--nyx-error)' }}>Failed to load pools</p>
        </CardContent>
      </Card>
    );
  }

  const pools = data ?? [];

  return (
    <div className="space-y-6">
      <Card variant="glow">
        <div className="p-6">
          <CardTitle className="mb-2">Choose Your Pool</NyxCardTitle>
          <p className="nyx-body" style={{ color: 'var(--nyx-gleam-70)' }}>
            Three calibrated strategies from the whitepaper. Sub-names in full degen glory.
          </p>
        </div>
      </NyxCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pools.map((p) => (
          <Card key={p.id} variant="elevated" className="flex flex-col">
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <PoolIcon risk={p.risk} />
                  <h3 className="nyx-heading-4">{p.name}</h3>
                </div>
                <RiskBadge risk={p.risk} />
              </div>

              <p className="text-sm mb-3" style={{ color: 'var(--nyx-gleam-60)' }}>
                {p.subName}
              </p>

              <p className="nyx-body flex-1" style={{ color: 'var(--nyx-gleam-70)' }}>
                {p.description}
              </p>

              <div className="mt-4 space-y-2">
                <div className="text-xs" style={{ color: 'var(--nyx-gleam-60)' }}>
                  <strong>Perfect for:</strong> {p.perfectFor.join(', ')}
                </div>
                <div className="text-xs" style={{ color: 'var(--nyx-gleam-60)' }}>
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