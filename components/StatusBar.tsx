'use client';

import { GameState, LANDMARKS } from '@/lib/gameState';

const HEALTH_COLORS: Record<string, string> = {
  good: '#4a7c59',
  fair: '#d4a017',
  poor: '#c17f24',
  critical: '#8b1a1a',
  dead: '#2c1810',
};

const HEALTH_LABELS: Record<string, string> = {
  good: '●',
  fair: '◕',
  poor: '◑',
  critical: '◔',
  dead: '✝',
};

interface StatusBarProps {
  state: GameState;
}

export default function StatusBar({ state }: StatusBarProps) {
  const progressPct = Math.min(100, (state.milesFromStart / 2000) * 100);
  const aliveCount = state.party.filter(m => m.health !== 'dead').length;
  const wagonParts = state.wagonParts ?? { wheels: 0, axles: 0, tongues: 0 };

  // Find next landmark
  const nextLandmark = LANDMARKS.find(l => l.miles > state.milesFromStart);
  const milesUntilNext = nextLandmark ? nextLandmark.miles - state.milesFromStart : 0;

  return (
    <aside className="status-bar">
      {/* Date & Location */}
      <div className="status-section">
        <h3 className="status-heading">The Trail</h3>
        <p className="status-date">{state.month} {state.year} · Day {state.dayNumber}</p>
        <p className="status-location">{state.landmark}</p>
        {nextLandmark && (
          <p className="status-next">{milesUntilNext} mi to {nextLandmark.name}</p>
        )}

        {/* Progress bar */}
        <div className="trail-progress-wrap">
          <div className="trail-progress-track">
            <div
              className="trail-progress-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="trail-miles">{state.milesFromStart} / 2000 mi</span>
        </div>
      </div>

      {/* Party */}
      <div className="status-section">
        <h3 className="status-heading">Party ({aliveCount} alive)</h3>
        <ul className="party-list">
          {state.party.map((member) => (
            <li key={member.name} className={`party-member ${member.health === 'dead' ? 'dead' : ''}`}>
              <span
                className="health-dot"
                style={{ color: HEALTH_COLORS[member.health] }}
                title={member.health}
              >
                {HEALTH_LABELS[member.health]}
              </span>
              <span className="member-name">{member.name}</span>
              <span className="member-role">{member.role}</span>
              {member.ailments.length > 0 && (
                <span className="member-ailments">{member.ailments.join(', ')}</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Supplies */}
      <div className="status-section">
        <h3 className="status-heading">Supplies</h3>
        <ul className="supply-list">
          <SupplyRow
            label="Food"
            value={`${state.food} lbs`}
            warn={state.food < 40}
            danger={state.food < 15}
          />
          <SupplyRow label="Ammo" value={`${state.ammo} boxes`} />
          <SupplyRow
            label="Medicine"
            value={`${state.medicine} units`}
            warn={state.medicine < 3}
            danger={state.medicine === 0}
          />
          <SupplyRow
            label="Wheels"
            value={`${wagonParts.wheels}`}
            warn={wagonParts.wheels < 2}
          />
          <SupplyRow label="Axles" value={`${wagonParts.axles}`} warn={wagonParts.axles < 1} />
          <SupplyRow label="Money" value={`$${state.money}`} />
        </ul>
      </div>

      {/* Pace & Rations */}
      <div className="status-section">
        <h3 className="status-heading">Travel</h3>
        <div className="travel-settings">
          <span className="travel-label">Pace:</span>
          <span className="travel-value">{state.pace}</span>
        </div>
        <div className="travel-settings">
          <span className="travel-label">Rations:</span>
          <span className="travel-value">{state.rations}</span>
        </div>
        <div className="travel-settings">
          <span className="travel-label">Weather:</span>
          <span className="travel-value">{state.weather}</span>
        </div>
      </div>
    </aside>
  );
}

function SupplyRow({
  label,
  value,
  warn = false,
  danger = false,
}: {
  label: string;
  value: string;
  warn?: boolean;
  danger?: boolean;
}) {
  return (
    <li className={`supply-row ${danger ? 'danger' : warn ? 'warn' : ''}`}>
      <span className="supply-label">{label}</span>
      <span className="supply-value">{value}</span>
    </li>
  );
}
