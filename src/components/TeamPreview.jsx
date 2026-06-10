import React from 'react';

// Synergy calculation helper
export function calculateSynergies(team, lang = 'pt') {
  const { driver1, driver2, chassis, engine, principal } = team;
  const activeSynergies = [];
  const bonuses = {
    driver1Speed: 0,
    driver2Speed: 0,
    carReliability: 0,
    teamStrategy: 0
  };

  // 1. Driver 1 + Chassis synergy
  if (driver1 && chassis && driver1.historicalTeams?.includes(chassis.constructorName)) {
    activeSynergies.push({
      id: "d1_chassis",
      name: lang === 'pt' ? `Sinergia: ${driver1.name} + ${chassis.constructorName}` : `Synergy: ${driver1.name} + ${chassis.constructorName}`,
      desc: lang === 'pt' 
        ? `Aceleração extra (+5 de velocidade para Piloto 1) devido à afinidade histórica com o chassi.` 
        : `Extra acceleration (+5 speed for Driver 1) due to historical affinity with the chassis.`,
      type: "driver1"
    });
    bonuses.driver1Speed += 5;
  }

  // 2. Driver 2 + Chassis synergy
  if (driver2 && chassis && driver2.historicalTeams?.includes(chassis.constructorName)) {
    activeSynergies.push({
      id: "d2_chassis",
      name: lang === 'pt' ? `Sinergia: ${driver2.name} + ${chassis.constructorName}` : `Synergy: ${driver2.name} + ${chassis.constructorName}`,
      desc: lang === 'pt' 
        ? `Aceleração extra (+5 de velocidade para Piloto 2) devido à afinidade histórica com o chassi.` 
        : `Extra acceleration (+5 speed for Driver 2) due to historical affinity with the chassis.`,
      type: "driver2"
    });
    bonuses.driver2Speed += 5;
  }

  // 3. Chassis + Engine harmony
  if (chassis && engine) {
    const cName = chassis.constructorName;
    const eName = engine.constructorName;
    let isHarmonious = false;

    if (
      (cName === "Ferrari" && eName === "Ferrari") ||
      (cName === "Mercedes" && eName === "Mercedes") ||
      (cName === "Red Bull" && eName === "Honda") ||
      (cName === "McLaren" && (eName === "Honda" || eName === "Mercedes")) ||
      (cName === "Williams" && (eName === "Renault" || eName === "BMW")) ||
      (cName === "Lotus" && eName === "Cosworth") ||
      (cName === "Brawn" && eName === "Mercedes") ||
      (cName === "Benetton" && (eName === "Renault" || eName === "Cosworth"))
    ) {
      isHarmonious = true;
    }

    if (isHarmonious) {
      activeSynergies.push({
        id: "car_engine",
        name: lang === 'pt' ? `Sinergia: Chassi ${cName} + Motor ${eName}` : `Synergy: Chassis ${cName} + Engine ${eName}`,
        desc: lang === 'pt' 
          ? `Harmonia perfeita (+10 de confiabilidade global) reduzindo chances de quebra de motor.` 
          : `Perfect harmony (+10 global reliability) reducing engine failure chance.`,
        type: "car"
      });
      bonuses.carReliability += 10;
    }
  }

  // 4. Driver 1 + Principal leadership
  if (driver1 && principal) {
    const d1Id = driver1.id;
    const pId = principal.id;
    let isLeader = false;

    if (
      (d1Id === "senna" && pId === "ron_dennis") ||
      (d1Id === "prost" && pId === "ron_dennis") ||
      (d1Id === "schumacher" && (pId === "jean_todt" || pId === "ross_brawn")) ||
      (d1Id === "hamilton" && pId === "toto_wolff") ||
      (d1Id === "verstappen" && pId === "christian_horner") ||
      (d1Id === "vettel" && pId === "christian_horner") ||
      (d1Id === "alonso" && pId === "flavio_briatore") ||
      (d1Id === "button" && pId === "ross_brawn") ||
      (d1Id === "barrichello" && (pId === "jean_todt" || pId === "ross_brawn")) ||
      (d1Id === "massa" && pId === "jean_todt")
    ) {
      isLeader = true;
    }

    if (isLeader) {
      activeSynergies.push({
        id: "d1_principal",
        name: lang === 'pt' ? `Liderança: ${driver1.name} + ${principal.name}` : `Leadership: ${driver1.name} + ${principal.name}`,
        desc: lang === 'pt' 
          ? `Comunicação ideal (+10 de estratégia) otimizando pit stops e decisões na chuva.` 
          : `Ideal communication (+10 strategy) optimizing pit stops and decisions in wet conditions.`,
        type: "leadership"
      });
      bonuses.teamStrategy += 10;
    }
  }

  return { activeSynergies, bonuses };
}

export default function TeamPreview({ team, t, lang }) {
  // Safe fallback if t is not passed
  if (!t) {
    t = {
      teamStatusTitle: "STATUS DA EQUIPE",
      synergyActiveTitle: "Sinergias Ativas",
      noSynergyMsg: "Nenhuma sinergia ativa...",
      pending: "Pendente",
      rating: "Rating",
      yearLabel: "Ano"
    };
  }

  const getSlotLabel = (key) => {
    switch(key) {
      case 'driver1': return lang === 'en' ? 'Driver 1' : 'Piloto 1';
      case 'driver2': return lang === 'en' ? 'Driver 2' : 'Piloto 2';
      case 'chassis': return lang === 'en' ? 'Chassis' : 'Chassi';
      case 'engine': return lang === 'en' ? 'Engine' : 'Motor';
      case 'principal': return lang === 'en' ? 'Team Principal' : 'Chefe de Equipe';
      default: return '';
    }
  };
  const { driver1, driver2, chassis, engine, principal } = team;
  const { activeSynergies } = calculateSynergies(team, lang);

  const renderSlot = (slotKey, item) => {
    const title = getSlotLabel(slotKey);
    if (!item) {
      return (
        <div style={{
          border: '1px dashed var(--border-color-default)',
          borderRadius: '8px',
          padding: '1rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
          background: 'rgba(255,255,255,0.01)',
          minHeight: '80px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', opacity: 0.8 }}>{title}</span>
          <span style={{ fontWeight: 600, marginTop: '0.2rem' }}>{t.pending}</span>
        </div>
      );
    }

    return (
      <div style={{
        background: 'var(--bg-dark)',
        border: '1px solid var(--border-color-default)',
        borderRadius: '8px',
        padding: '0.8rem 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: '80px'
      }}>
        <div>
          <span style={{ 
            fontSize: '0.65rem', 
            textTransform: 'uppercase', 
            color: 'var(--f1-red)', 
            fontWeight: 800,
            letterSpacing: '1px'
          }}>
            {title}
          </span>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0.1rem 0 0 0', color: 'var(--text-bright)' }}>
            {item.name}
          </h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {item.year ? `${t.yearLabel}: ${item.year}` : item.era || ''}
          </span>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span className="text-numeric" style={{ 
            fontSize: '1.2rem', 
            fontWeight: 900, 
            color: 'var(--yellow-neon)' 
          }}>
            {item.rating || '—'}
          </span>
          <div style={{ fontSize: '0.55rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800 }}>{t.rating}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h3 className="text-numeric" style={{ 
        fontSize: '1.1rem', 
        borderBottom: '1px solid var(--border-color-default)', 
        paddingBottom: '0.5rem', 
        color: 'var(--text-bright)',
        letterSpacing: '1px'
      }}>
        {t.teamStatusTitle}
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {renderSlot("driver1", driver1)}
        {renderSlot("driver2", driver2)}
        {renderSlot("chassis", chassis)}
        {renderSlot("engine", engine)}
        {renderSlot("principal", principal)}
      </div>

      {/* Synergies display */}
      <div style={{ 
        marginTop: '0.5rem',
        borderTop: '1px solid var(--border-color-default)',
        paddingTop: '1rem'
      }}>
        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {t.synergyActiveTitle} ({activeSynergies.length})
        </h4>
        
        {activeSynergies.length === 0 ? (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            {t.noSynergyMsg}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {activeSynergies.map((syn) => (
              <div 
                key={syn.id} 
                style={{
                  background: 'rgba(0, 255, 135, 0.05)',
                  border: '1px solid rgba(0, 255, 135, 0.15)',
                  borderRadius: '6px',
                  padding: '0.5rem 0.75rem'
                }}
              >
                <div className="synergy-badge" style={{ marginBottom: '0.25rem' }}>
                  {syn.name}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-card-desc)', margin: 0, lineHeight: 1.25 }}>
                  {syn.desc}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
