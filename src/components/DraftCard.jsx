import React from 'react';
import { getLocalItem } from '../data/itemTranslations';

const attributeLabels = {
  // Drivers
  speed: "Velocidade",
  rain: "Chuva",
  racecraft: "Ritmo de Corrida",
  experience: "Experiência",
  // Chassis
  downforce: "Força Aerodinâmica",
  efficiency: "Arrasto/Eficiência",
  tireWear: "Desgaste de Pneus",
  reliability: "Confiabilidade",
  // Engine
  power: "Potência",
  fuelEfficiency: "Consumo de Combustível",
  // Principal
  strategy: "Estratégia",
  pitstops: "Paradas nos Boxes",
  development: "Desenvolvimento/P&D"
};

export default function DraftCard({ item: rawItem, type, isSelected, onClick, hideAttributes = false, lang = 'pt' }) {
  if (!rawItem) return null;
  
  const item = getLocalItem(rawItem, lang);

  const getTierClass = (tier) => {
    if (!tier) return '';
    const t = tier.toLowerCase();
    if (t === 'lendário' || t === 'legendary') return 'tier-legendary';
    if (t === 'ouro' || t === 'gold') return 'tier-ouro';
    if (t === 'prata' || t === 'silver') return 'tier-prata';
    if (t === 'bronze') return 'tier-bronze';
    return '';
  };
  const tierClass = !hideAttributes ? getTierClass(item.tier) : '';
  const selectedClass = isSelected ? 'selected' : '';

  // Helper to determine color of attribute bar
  const getBarColorClass = (val) => {
    if (val >= 90) return 'good';
    if (val >= 75) return 'average';
    return 'bad';
  };

  // Render specific attributes based on item type
  const renderAttributes = () => {
    if (hideAttributes) {
      return null; // Show absolutely nothing for attributes in Almanac mode
    }

    const attrs = item.attributes || {};
    return (
      <div style={{ marginTop: '1rem' }}>
        {Object.entries(attrs).map(([key, val]) => (
          <div key={key} className="attr-row">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {attributeLabels[key] || key}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '60%', justifyContent: 'flex-end' }}>
              <div className="attr-bar-container">
                <div 
                  className={`attr-bar ${getBarColorClass(val)}`}
                  style={{ width: `${val}%` }}
                />
              </div>
              <span className="text-numeric" style={{ fontSize: '0.8rem', minWidth: '20px', textAlign: 'right', fontWeight: 'bold' }}>
                {val}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div 
      className={`draft-card ${tierClass} ${selectedClass}`}
      onClick={onClick}
      style={{ 
        cursor: onClick ? 'pointer' : 'default',
        minHeight: hideAttributes ? '150px' : '320px', // Shrink card size in Almanac mode for a sleek look
        justifyContent: 'center'
      }}
    >
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ 
              fontSize: '0.7rem', 
              textTransform: 'uppercase', 
              color: 'var(--f1-red)', 
              fontWeight: 800,
              letterSpacing: '1px'
            }}>
              {type === 'driver1' || type === 'driver2' ? (lang === 'pt' ? 'Piloto' : 'Driver') : 
               type === 'chassis' ? (lang === 'pt' ? 'Chassi' : 'Chassis') : 
               type === 'engine' ? (lang === 'pt' ? 'Motor' : 'Engine') : (lang === 'pt' ? 'Chefe de Equipe' : 'Team Principal')}
            </span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '0.1rem', color: 'var(--text-bright)' }}>
              {item.name}
            </h3>
            
            {/* Show Year and Nationality ONLY in Classic Mode */}
            {!hideAttributes && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.05rem' }}>
                {item.nationality ? `${item.nationality} • ` : ''}
                {item.year ? (lang === 'pt' ? `Ano: ${item.year}` : `Year: ${item.year}`) : item.era || ''}
              </p>
            )}
          </div>
          
          {/* Rating Badge */}
          {!hideAttributes && (
            <div style={{
              background: 'var(--bg-qualifying-header)',
              border: `1px solid ${isSelected ? 'var(--green-neon)' : 'var(--border-color-default)'}`,
              borderRadius: '8px',
              padding: '0.4rem 0.6rem',
              textAlign: 'center',
            }}>
              <span className="text-numeric" style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--yellow-neon)' }}>
                {item.rating}
              </span>
              <div style={{ fontSize: '0.55rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800 }}>OVR</div>
            </div>
          )}
        </div>

        {/* Description ONLY in Classic Mode */}
        {!hideAttributes && (
          <p style={{ 
            fontSize: '0.8rem', 
            color: 'var(--text-card-desc)', 
            marginTop: '0.8rem', 
            lineHeight: '1.3',
            borderLeft: '2px solid var(--border-color-default)',
            paddingLeft: '0.5rem',
            minHeight: '42px'
          }}>
            {item.description}
          </p>
        )}
      </div>

      {/* Attributes & Footer ONLY in Classic Mode */}
      {!hideAttributes ? (
        <div>
          {renderAttributes()}
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginTop: '1rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid var(--border-color-default)'
          }}>
            <span style={{ 
              fontSize: '0.7rem', 
              fontWeight: 800, 
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: (item.tier === 'Lendário' || item.tier === 'Legendary') ? 'var(--tier-legendary)' :
                     (item.tier === 'Ouro' || item.tier === 'Gold') ? 'var(--tier-gold)' :
                     (item.tier === 'Prata' || item.tier === 'Silver') ? 'var(--tier-silver)' : 'var(--tier-bronze)'
            }}>
              {item.tier || (lang === 'pt' ? 'Comum' : 'Common')}
            </span>
            
            {item.historicalTeams && item.historicalTeams.length > 0 && (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {lang === 'pt' ? 'Histórico:' : 'History:'} {item.historicalTeams[0]}
              </span>
            )}
          </div>
        </div>
      ) : (
        // Just make sure it renders clean properties
        renderAttributes()
      )}
    </div>
  );
}
