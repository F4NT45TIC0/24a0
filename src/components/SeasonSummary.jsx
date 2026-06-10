import React, { useState } from 'react';
import TeamPreview from './TeamPreview';
import { trackLayouts } from '../data/trackLayouts';

export default function SeasonSummary({ 
  team, 
  currentRaceIndex, 
  tracks, 
  standings, 
  history, 
  onStartRace, 
  onRestartGame,
  t,
  lang
}) {
  const [activeTab, setActiveTab] = useState('drivers'); // 'drivers', 'constructors', 'calendar'
  const [selectedTrack, setSelectedTrack] = useState(null);
  
  const currentRace = tracks[currentRaceIndex];
  const isFinished = currentRaceIndex >= tracks.length;

  // Standard F1 points list
  const pointsAllocation = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

  // Check if player achieved the "24a0" (24 wins for their Driver 1 or Driver 2)
  const countPlayerWins = () => {
    let p1Wins = 0;
    let p2Wins = 0;
    let teamWins = 0;
    
    history.forEach(race => {
      const winner = race.results[0];
      if (winner.id === 'player_d1') p1Wins++;
      if (winner.id === 'player_d2') p2Wins++;
      if (winner.id === 'player_d1' || winner.id === 'player_d2') teamWins++;
    });

    return { p1Wins, p2Wins, teamWins };
  };

  const { p1Wins, p2Wins, teamWins } = countPlayerWins();
  const isPerfectSeason = teamWins === 24;

  // Find player positions in standings
  const playerDriver1Standing = standings.drivers.find(d => d.id === 'player_d1');
  const playerDriver2Standing = standings.drivers.find(d => d.id === 'player_d2');
  const playerConstructorStanding = standings.constructors.find(c => c.id === 'player_team');

  return (
    <div className="container">
      {/* Top Banner */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 className="glow-text" style={{ fontSize: '2.5rem', color: 'var(--f1-red)', fontWeight: 900 }}>
          {isFinished ? t.seasonFinished.toUpperCase() : (lang === 'pt' ? `GP DO ${currentRace.country.toUpperCase()}` : `GP OF ${currentRace.country.toUpperCase()}`)}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>
          {isFinished 
            ? (lang === 'pt' ? 'A temporada de 24 corridas foi concluída. Veja os campeões!' : 'The 24-race season has concluded. See the champions!') 
            : (lang === 'pt' ? `Corrida ${currentRaceIndex + 1} de 24 • Próxima parada: ${currentRace.name}` : `Race ${currentRaceIndex + 1} of 24 • Next stop: ${currentRace.name}`)}
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Left Column: Standings and Tabs */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', minHeight: '500px' }}>
          {/* Tabs header */}
          <div style={{ 
            display: 'flex', 
            borderBottom: '1px solid var(--border-color-default)',
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            gap: '1rem'
          }}>
            <button 
              className={`btn ${activeTab === 'drivers' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              onClick={() => setActiveTab('drivers')}
            >
              <span className="btn-content">{t.driversStandings}</span>
            </button>
            <button 
              className={`btn ${activeTab === 'constructors' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              onClick={() => setActiveTab('constructors')}
            >
              <span className="btn-content">{t.teamsStandings}</span>
            </button>
            <button 
              className={`btn ${activeTab === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              onClick={() => setActiveTab('calendar')}
            >
              <span className="btn-content">{t.calendarResults}</span>
            </button>
          </div>

          {/* TAB 1: Drivers Standings */}
          {activeTab === 'drivers' && (
            <div className="custom-scroll" style={{ flex: 1, maxHeight: '420px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color-default)', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '0.5rem 0', color: 'var(--text-muted)' }}>{t.pos}</th>
                    <th style={{ color: 'var(--text-muted)' }}>{t.driver}</th>
                    <th style={{ color: 'var(--text-muted)' }}>{t.team}</th>
                    <th style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{t.wins}</th>
                    <th style={{ textAlign: 'right', paddingRight: '0.5rem', color: 'var(--text-muted)' }}>{t.points}</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.drivers.map((drv, idx) => {
                    const isPlayer = drv.id === 'player_d1' || drv.id === 'player_d2';
                    return (
                      <tr 
                        key={drv.id} 
                        style={{ 
                          borderBottom: '1px solid var(--border-color-default)',
                          background: isPlayer ? 'rgba(0, 255, 135, 0.05)' : 'transparent',
                          color: isPlayer ? 'var(--green-neon)' : 'var(--text-main)',
                          fontWeight: isPlayer ? '700' : 'normal'
                        }}
                      >
                        <td className="text-numeric" style={{ padding: '0.75rem 0', fontWeight: 'bold' }}>{idx + 1}</td>
                        <td style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>{drv.name}</span>
                          {isPlayer && <span className="synergy-badge" style={{ padding: '0.05rem 0.25rem', fontSize: '0.6rem' }}>P</span>}
                        </td>
                        <td style={{ color: isPlayer ? 'var(--green-neon)' : 'var(--text-muted)' }}>{drv.teamName}</td>
                        <td className="text-numeric" style={{ textAlign: 'right' }}>{drv.wins}</td>
                        <td className="text-numeric" style={{ textAlign: 'right', paddingRight: '0.5rem', fontWeight: 'bold' }}>{drv.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: Constructors Standings */}
          {activeTab === 'constructors' && (
            <div className="custom-scroll" style={{ flex: 1, maxHeight: '420px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color-default)', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '0.5rem 0', color: 'var(--text-muted)' }}>{t.pos}</th>
                    <th style={{ color: 'var(--text-muted)' }}>{t.team}</th>
                    <th style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{t.wins}</th>
                    <th style={{ textAlign: 'right', paddingRight: '0.5rem', color: 'var(--text-muted)' }}>{t.points}</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.constructors.map((cst, idx) => {
                    const isPlayer = cst.id === 'player_team';
                    return (
                      <tr 
                        key={cst.id} 
                        style={{ 
                          borderBottom: '1px solid var(--border-color-default)',
                          background: isPlayer ? 'rgba(0, 255, 135, 0.05)' : 'transparent',
                          color: isPlayer ? 'var(--green-neon)' : 'var(--text-main)',
                          fontWeight: isPlayer ? '700' : 'normal'
                        }}
                      >
                        <td className="text-numeric" style={{ padding: '0.75rem 0', fontWeight: 'bold' }}>{idx + 1}</td>
                        <td style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>{cst.name}</span>
                          {isPlayer && <span className="synergy-badge" style={{ padding: '0.05rem 0.25rem', fontSize: '0.6rem' }}>P</span>}
                        </td>
                        <td className="text-numeric" style={{ textAlign: 'right' }}>{cst.wins}</td>
                        <td className="text-numeric" style={{ textAlign: 'right', paddingRight: '0.5rem', fontWeight: 'bold' }}>{cst.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: Calendar / Results */}
          {activeTab === 'calendar' && (
            <div className="custom-scroll" style={{ flex: 1, maxHeight: '420px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {tracks.map((track, idx) => {
                  const result = history[idx];
                  const isCurrent = idx === currentRaceIndex;
                  const isCompleted = idx < currentRaceIndex;

                  return (
                    <div 
                      key={track.id}
                      onClick={() => setSelectedTrack(track)}
                      style={{
                        background: isCurrent ? 'var(--f1-red-glow)' : 'var(--bg-qualifying-header)',
                        border: `1px solid ${isCurrent ? 'var(--f1-red)' : isCompleted ? 'rgba(0, 255, 135, 0.2)' : 'var(--border-color-default)'}`,
                        borderRadius: '8px',
                        padding: '0.6rem 0.8rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      <div>
                        <span className="text-numeric" style={{ 
                          fontSize: '0.75rem', 
                          color: isCurrent ? 'var(--f1-red)' : isCompleted ? 'var(--green-neon)' : 'var(--text-muted)',
                          fontWeight: 'bold',
                          marginRight: '0.5rem'
                        }}>
                          GP {idx + 1}
                        </span>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--text-bright)' }}>{track.name} ({track.country})</strong>
                      </div>
                      
                      <div>
                        {isCompleted && result ? (
                          <div style={{ fontSize: '0.8rem', textAlign: 'right' }}>
                            <span style={{ color: 'var(--text-muted)' }}>{t.winner}: </span>
                            <strong style={{ 
                              color: result.results[0].id.startsWith('player') ? 'var(--green-neon)' : 'var(--text-bright)' 
                            }}>
                              {result.results[0].name}
                            </strong>
                          </div>
                        ) : isCurrent ? (
                          <span style={{ fontSize: '0.8rem', color: 'var(--f1-red)', fontWeight: 'bold' }}>{t.nextLabel}</span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.lockedLabel}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Actions / Team Preview / End Season */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Next Race / Final Campaign Actions Panel */}
          <div className="panel" style={{ textAlign: 'center', background: 'linear-gradient(to bottom, var(--bg-card), rgba(15,17,21,0.05))' }}>
            {isFinished ? (
              <div>
                <h3 className="text-numeric" style={{ color: 'var(--yellow-neon)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>
                  {isPerfectSeason ? t.perfectSeasonTitle : t.seasonFinished}
                </h3>
                
                {isPerfectSeason ? (
                  <div style={{ margin: '1.5rem 0' }}>
                    <p style={{ color: 'var(--green-neon)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                      {t.perfectSeasonMsg.split('! ')[0]}!
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                      {t.perfectSeasonMsg.split('! ')[1]}
                    </p>
                  </div>
                ) : (
                  <div style={{ margin: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem' }}>
                    <p style={{ color: 'var(--text-card-desc)' }}>
                      {t.teamWinsMsg.replace('{wins}', teamWins)}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {t.p1WinsLabel.replace('{name}', team.driver1.name).replace('{wins}', p1Wins)}
                      <br/>
                      {t.p2WinsLabel.replace('{name}', team.driver2.name).replace('{wins}', p2Wins)}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                      {t.finalStandingLabel
                        .replace('{pos}', standings.constructors.findIndex(c => c.id === 'player_team') + 1)
                        .replace('{points}', playerConstructorStanding?.points || 0)}
                    </p>
                  </div>
                )}
                
                <button 
                  className="btn btn-primary" 
                  onClick={onRestartGame}
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  <span className="btn-content">{t.playAgain}</span>
                </button>
              </div>
            ) : (
              <div>
                <span className="text-numeric" style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--f1-red)', 
                  fontWeight: 900,
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase'
                }}>
                  {t.nextStage}
                </span>
                
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-bright)', margin: '0.2rem 0' }}>
                  GP {lang === 'pt' ? 'do' : 'of'} {currentRace.country}
                </h3>
                
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem 0', lineHeight: 1.3 }}>
                  {currentRace.description}
                  <br/>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.8 }}>
                    {t.requirement}: [{t.motor.toUpperCase()}] {(currentRace.characteristics.powerWeight * 100).toFixed(0)}% | [{t.aero.toUpperCase()}] {(currentRace.characteristics.downforceWeight * 100).toFixed(0)}%
                  </span>
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Interactive race simulation */}
                  <button 
                    className="btn btn-primary" 
                    onClick={() => onStartRace(true)}
                    style={{ width: '100%' }}
                  >
                    <span className="btn-content">{t.interactiveSimBtn}</span>
                  </button>
                  
                  {/* Quick race simulation */}
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => onStartRace(false)}
                    style={{ width: '100%' }}
                  >
                    <span className="btn-content">{t.quickSimBtn}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Current team stats preview */}
          <TeamPreview team={team} t={t} lang={lang} />
        </div>
      </div>

      {/* Track Map modal */}
      {selectedTrack && (
        <div className="modal-overlay" style={{ zIndex: 110 }}>
          <div className="modal-content animate-fadeIn" style={{ maxWidth: '500px', border: '1px solid var(--f1-red)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color-default)', paddingBottom: '0.5rem' }}>
              <h2 className="text-numeric" style={{ color: 'var(--text-bright)', fontSize: '1.4rem', fontWeight: 800 }}>
                {selectedTrack.name} ({selectedTrack.country})
              </h2>
              <span className="text-numeric" style={{ color: 'var(--f1-red)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                {selectedTrack.laps} {lang === 'pt' ? 'Voltas' : 'Laps'}
              </span>
            </div>

            {/* SVG Track Layout */}
            <div style={{ background: 'var(--bg-darker)', borderRadius: '6px', padding: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1.5rem', border: '1px solid var(--border-color-default)' }}>
              {trackLayouts[selectedTrack.id] ? (
                <svg 
                  viewBox={trackLayouts[selectedTrack.id].viewBox} 
                  style={{ 
                    width: '100%', 
                    maxHeight: '200px', 
                    stroke: 'var(--f1-red)', 
                    strokeWidth: '4', 
                    fill: 'none', 
                    strokeLinecap: 'round', 
                    strokeLinejoin: 'round',
                    filter: 'drop-shadow(0 0 8px rgba(225, 6, 0, 0.5))'
                  }}
                >
                  <path d={trackLayouts[selectedTrack.id].path} />
                </svg>
              ) : (
                <div style={{ color: 'var(--text-muted)' }}>[Layout N/A]</div>
              )}
            </div>

            {/* Description */}
            <p style={{ fontSize: '0.85rem', color: 'var(--text-card-desc)', lineHeight: 1.4, marginBottom: '1.5rem', fontStyle: 'italic', borderLeft: '3px solid var(--f1-red)', paddingLeft: '0.75rem' }}>
              {selectedTrack.description}
            </p>

            {/* Track attributes */}
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t.characteristics}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {/* Rain Chance */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{t.rainChance}</span>
                <strong style={{ color: 'var(--text-bright)' }}>{(selectedTrack.characteristics.rainChance * 100).toFixed(0)}%</strong>
              </div>
              {/* Tyre Wear */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{t.tireWearRate}</span>
                <strong style={{ color: 'var(--text-bright)' }}>{(selectedTrack.characteristics.tireWearRate * 100).toFixed(0)}%</strong>
              </div>
              {/* Overtake difficulty */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{t.overtakeDifficulty}</span>
                <strong style={{ color: 'var(--text-bright)' }}>{(selectedTrack.characteristics.overtakeDifficulty * 100).toFixed(0)}%</strong>
              </div>
            </div>

            <button className="btn btn-secondary" onClick={() => setSelectedTrack(null)} style={{ width: '100%' }}>
              <span className="btn-content">{t.closeBtn}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
