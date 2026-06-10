import React, { useState, useEffect } from 'react';
import { drivers } from '../data/drivers';
import { chassisOptions, engineOptions } from '../data/constructors';
import { principals } from '../data/principals';
import DraftCard from './DraftCard';
import TeamPreview from './TeamPreview';

const SLOTS = [
  { key: 'driver1', label: 'Piloto 1', type: 'driver1', db: drivers },
  { key: 'driver2', label: 'Piloto 2', type: 'driver2', db: drivers },
  { key: 'chassis', label: 'Chassi', type: 'chassis', db: chassisOptions },
  { key: 'engine', label: 'Motor', type: 'engine', db: engineOptions },
  { key: 'principal', label: 'Chefe de Equipe', type: 'principal', db: principals }
];

export default function DraftScreen({ gameMode, onDraftComplete, t, lang }) {
  const getSlotLabel = (key) => {
    switch(key) {
      case 'driver1': return lang === 'pt' ? 'Piloto 1' : 'Driver 1';
      case 'driver2': return lang === 'pt' ? 'Piloto 2' : 'Driver 2';
      case 'chassis': return lang === 'pt' ? 'Chassi' : 'Chassis';
      case 'engine': return lang === 'pt' ? 'Motor' : 'Engine';
      case 'principal': return lang === 'pt' ? 'Chefe de Equipe' : 'Team Principal';
      default: return '';
    }
  };
  const [currentSlotIndex, setCurrentSlotIndex] = useState(0);
  const [team, setTeam] = useState({
    driver1: null,
    driver2: null,
    chassis: null,
    engine: null,
    principal: null
  });
  const [options, setOptions] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [rerolls, setRerolls] = useState(3);

  const currentSlot = SLOTS[currentSlotIndex];

  // Helper to get random items from array
  const getRandomOptions = (db, count, currentTeam) => {
    let pool = [...db];
    
    // If we are drafting Driver 2, we shouldn't show the Driver 1 that was already selected
    if (currentSlot.key === 'driver2' && team.driver1) {
      pool = pool.filter(item => item.id !== team.driver1.id);
    }
    
    // Sort pool randomly and take count
    const shuffled = pool.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  };

  // Generate options when slot changes
  useEffect(() => {
    if (currentSlot) {
      const drawn = getRandomOptions(currentSlot.db, 3);
      setOptions(drawn);
      setSelectedItem(null);
    }
  }, [currentSlotIndex]);

  // Handle Reroll
  const handleReroll = () => {
    if (rerolls > 0) {
      setRerolls(prev => prev - 1);
      const drawn = getRandomOptions(currentSlot.db, 3);
      setOptions(drawn);
      setSelectedItem(null);
    }
  };

  // Handle Select Card
  const handleSelect = (item) => {
    setSelectedItem(item);
  };

  // Handle Confirm Selection
  const handleConfirm = () => {
    if (!selectedItem) return;

    const updatedTeam = {
      ...team,
      [currentSlot.key]: selectedItem
    };

    setTeam(updatedTeam);

    if (currentSlotIndex < SLOTS.length - 1) {
      // Go to next slot
      setCurrentSlotIndex(prev => prev + 1);
    } else {
      // Completed!
      onDraftComplete(updatedTeam);
    }
  };

  return (
    <div className="container">
      {/* Header Info */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 className="glow-text" style={{ fontSize: '2.5rem', color: 'var(--f1-red)', fontWeight: 900 }}>
          {t.draftTitle}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>
          {t.draftSubtitle} {t.gameModeLabel}: <strong style={{ color: 'var(--text-bright)' }}>{gameMode === 'classic' ? t.classic : t.almanac}</strong>
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Left Side: Draft Selection */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            {/* Steps indicator */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              background: 'var(--bg-qualifying-header)', 
              borderRadius: '8px', 
              padding: '0.75rem 1rem', 
              marginBottom: '1.5rem' 
            }}>
              {SLOTS.map((slot, index) => (
                <div 
                  key={slot.key} 
                  style={{ 
                    textAlign: 'center', 
                    flex: 1, 
                    position: 'relative',
                    opacity: index === currentSlotIndex ? 1 : index < currentSlotIndex ? 0.5 : 0.3
                  }}
                >
                  <div style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 800, 
                    color: index === currentSlotIndex ? 'var(--f1-red)' : index < currentSlotIndex ? 'var(--green-neon)' : 'var(--text-bright)',
                    textTransform: 'uppercase'
                  }}>
                    {t.step} {index + 1}
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-bright)', marginTop: '0.1rem' }}>
                    {getSlotLabel(slot.key)}
                  </div>
                  {index < SLOTS.length - 1 && (
                    <div style={{ 
                      position: 'absolute', 
                      right: '-50%', 
                      top: '50%', 
                      transform: 'translateX(50%)', 
                      color: 'rgba(255,255,255,0.1)', 
                      display: 'none' 
                    }}>▶</div>
                  )}
                </div>
              ))}
            </div>

            {/* Title for current selection */}
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '0.5rem' }}>
              {t.selectYour} <span style={{ color: 'var(--f1-red)' }}>{getSlotLabel(currentSlot.key)}</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {t.draftDescription}
            </p>

            {/* Cards Grid */}
            <div className="cards-grid">
              {options.map((item) => (
                <DraftCard 
                  key={item.id}
                  item={item}
                  type={currentSlot.type}
                  isSelected={selectedItem?.id === item.id}
                  onClick={() => handleSelect(item)}
                  hideAttributes={gameMode === 'almanac'}
                />
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-color-default)'
          }}>
            {/* Reroll info */}
            <div>
              <button 
                className="btn btn-secondary" 
                onClick={handleReroll}
                disabled={rerolls === 0}
              >
                <span className="btn-content">{t.rerollBtn}</span>
              </button>
              <span className="text-numeric" style={{ 
                marginLeft: '1rem', 
                fontSize: '0.9rem', 
                color: rerolls > 0 ? 'var(--yellow-neon)' : 'var(--f1-red)',
                fontWeight: 'bold'
              }}>
                {t.rerollsLeft}: {rerolls}
              </span>
            </div>

            {/* Confirm button */}
            <button 
              className="btn btn-primary"
              onClick={handleConfirm}
              disabled={!selectedItem}
              style={{ minWidth: '160px' }}
            >
              <span className="btn-content">{t.confirmChoice}</span>
            </button>
          </div>
        </div>

        {/* Right Side: Current Team Status */}
        <TeamPreview team={team} t={t} lang={lang} />
      </div>
    </div>
  );
}
