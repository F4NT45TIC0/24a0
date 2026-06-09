import React from 'react';

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

export default function DraftCard({ item, type, isSelected, onClick, hideAttributes = false }) {
  if (!item) return null;

  const tierClass = (!hideAttributes && item.tier) ? `tier-${item.tier.toLowerCase()}` : '';
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
            <span style={{ fontSize: '0.8rem', color: '#a0aab2' }}>
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
              {type === 'driver1' || type === 'driver2' ? 'Piloto' : 
               type === 'chassis' ? 'Chassi' : 
               type === 'engine' ? 'Motor' : 'Chefe de Equipe'}
            </span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '0.1rem', color: '#fff' }}>
              {item.name}
            </h3>
            
            {/* Show Year and Nationality ONLY in Classic Mode */}
            {!hideAttributes && (
              <p style={{ fontSize: '0.75rem', color: '#8a92a6', marginTop: '0.05rem' }}>
                {item.nationality ? `${item.nationality} • ` : ''}
                {item.year ? `Ano: ${item.year}` : item.era || ''}
              </p>
            )}
          </div>
          
          {/* Rating Badge */}
          {!hideAttributes && (
            <div style={{
              background: 'rgba(0,0,0,0.4)',
              border: `1px solid ${isSelected ? 'var(--green-neon)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '8px',
              padding: '0.4rem 0.6rem',
              textAlign: 'center',
            }}>
              <span className="text-numeric" style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--yellow-neon)' }}>
                {item.rating}
              </span>
              <div style={{ fontSize: '0.55rem', textTransform: 'uppercase', color: '#8a92a6', fontWeight: 800 }}>OVR</div>
            </div>
          )}
        </div>

        {/* Description ONLY in Classic Mode */}
        {!hideAttributes && (
          <p style={{ 
            fontSize: '0.8rem', 
            color: '#c2c8d4', 
            marginTop: '0.8rem', 
            lineHeight: '1.3',
            borderLeft: '2px solid rgba(255,255,255,0.15)',
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
            borderTop: '1px solid rgba(255,255,255,0.05)'
          }}>
            <span style={{ 
              fontSize: '0.7rem', 
              fontWeight: 800, 
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: item.tier === 'Lendário' ? 'var(--tier-legendary)' :
                     item.tier === 'Ouro' ? 'var(--tier-gold)' :
                     item.tier === 'Prata' ? 'var(--tier-silver)' : 'var(--tier-bronze)'
            }}>
              {item.tier || 'Comum'}
            </span>
            
            {item.historicalTeams && item.historicalTeams.length > 0 && (
              <span style={{ fontSize: '0.7rem', color: '#8a92a6' }}>
                Histórico: {item.historicalTeams[0]}
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
