import React, { useState } from 'react';
import TeamPreview from './TeamPreview';

export default function SeasonSummary({ 
  team, 
  currentRaceIndex, 
  tracks, 
  standings, 
  history, 
  onStartRace, 
  onRestartGame 
}) {
  const [activeTab, setActiveTab] = useState('drivers'); // 'drivers', 'constructors', 'calendar'
  
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
          {isFinished ? 'FIM DA TEMPORADA' : `GP DO ${currentRace.country.toUpperCase()}`}
        </h1>
        <p style={{ color: '#8a92a6', fontSize: '1rem', marginTop: '0.25rem' }}>
          {isFinished 
            ? 'A temporada de 24 corridas foi concluída. Veja os campeões!' 
            : `Corrida ${currentRaceIndex + 1} de 24 • Próxima parada: ${currentRace.name}`}
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Left Column: Standings and Tabs */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', minHeight: '500px' }}>
          {/* Tabs header */}
          <div style={{ 
            display: 'flex', 
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            gap: '1rem'
          }}>
            <button 
              className={`btn ${activeTab === 'drivers' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              onClick={() => setActiveTab('drivers')}
            >
              <span className="btn-content">Pilotos</span>
            </button>
            <button 
              className={`btn ${activeTab === 'constructors' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              onClick={() => setActiveTab('constructors')}
            >
              <span className="btn-content">Construtores</span>
            </button>
            <button 
              className={`btn ${activeTab === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              onClick={() => setActiveTab('calendar')}
            >
              <span className="btn-content">Calendário &amp; Resultados</span>
            </button>
          </div>

          {/* TAB 1: Drivers Standings */}
          {activeTab === 'drivers' && (
            <div className="custom-scroll" style={{ flex: 1, maxHeight: '420px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.08)', color: '#8a92a6', textAlign: 'left' }}>
                    <th style={{ padding: '0.5rem 0' }}>Pos</th>
                    <th>Piloto</th>
                    <th>Equipe</th>
                    <th style={{ textAlign: 'right' }}>Vitórias</th>
                    <th style={{ textAlign: 'right', paddingRight: '0.5rem' }}>Pontos</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.drivers.map((drv, idx) => {
                    const isPlayer = drv.id === 'player_d1' || drv.id === 'player_d2';
                    return (
                      <tr 
                        key={drv.id} 
                        style={{ 
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          background: isPlayer ? 'rgba(0, 255, 135, 0.05)' : 'transparent',
                          color: isPlayer ? 'var(--green-neon)' : '#fff',
                          fontWeight: isPlayer ? '700' : 'normal'
                        }}
                      >
                        <td className="text-numeric" style={{ padding: '0.75rem 0', fontWeight: 'bold' }}>{idx + 1}</td>
                        <td style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>{drv.name}</span>
                          {isPlayer && <span className="synergy-badge" style={{ padding: '0.05rem 0.25rem', fontSize: '0.6rem' }}>P</span>}
                        </td>
                        <td style={{ color: isPlayer ? 'var(--green-neon)' : '#8a92a6' }}>{drv.teamName}</td>
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
                  <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.08)', color: '#8a92a6', textAlign: 'left' }}>
                    <th style={{ padding: '0.5rem 0' }}>Pos</th>
                    <th>Equipe</th>
                    <th style={{ textAlign: 'right' }}>Vitórias</th>
                    <th style={{ textAlign: 'right', paddingRight: '0.5rem' }}>Pontos</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.constructors.map((cst, idx) => {
                    const isPlayer = cst.id === 'player_team';
                    return (
                      <tr 
                        key={cst.id} 
                        style={{ 
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          background: isPlayer ? 'rgba(0, 255, 135, 0.05)' : 'transparent',
                          color: isPlayer ? 'var(--green-neon)' : '#fff',
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
                      style={{
                        background: isCurrent ? 'rgba(255, 24, 1, 0.05)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isCurrent ? 'var(--f1-red)' : isCompleted ? 'rgba(0, 255, 135, 0.2)' : 'rgba(255,255,255,0.05)'}`,
                        borderRadius: '8px',
                        padding: '0.6rem 0.8rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <span className="text-numeric" style={{ 
                          fontSize: '0.75rem', 
                          color: isCurrent ? 'var(--f1-red)' : isCompleted ? 'var(--green-neon)' : '#8a92a6',
                          fontWeight: 'bold',
                          marginRight: '0.5rem'
                        }}>
                          GP {idx + 1}
                        </span>
                        <strong style={{ fontSize: '0.95rem' }}>{track.name} ({track.country})</strong>
                      </div>
                      
                      <div>
                        {isCompleted && result ? (
                          <div style={{ fontSize: '0.8rem', textAlign: 'right' }}>
                            <span style={{ color: '#8a92a6' }}>Vencedor: </span>
                            <strong style={{ 
                              color: result.results[0].id.startsWith('player') ? 'var(--green-neon)' : '#fff' 
                            }}>
                              {result.results[0].name}
                            </strong>
                          </div>
                        ) : isCurrent ? (
                          <span style={{ fontSize: '0.8rem', color: 'var(--f1-red)', fontWeight: 'bold' }}>A SEGUIR</span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>Bloqueado</span>
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
          <div className="panel" style={{ textAlign: 'center', background: 'linear-gradient(to bottom, var(--bg-card), rgba(15,17,21,0.9))' }}>
            {isFinished ? (
              <div>
                <h3 className="text-numeric" style={{ color: 'var(--yellow-neon)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>
                  {isPerfectSeason ? 'DESAFIO 24a0 COMPLETADO!' : 'Temporada Encerrada!'}
                </h3>
                
                {isPerfectSeason ? (
                  <div style={{ margin: '1.5rem 0' }}>
                    <p style={{ color: 'var(--green-neon)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                      INCRÍVEL! 24 Vitórias em 24 Corridas!
                    </p>
                    <p style={{ color: '#8a92a6', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                      Você montou a equipe dos sonhos definitiva e dominou a história do automobilismo!
                    </p>
                  </div>
                ) : (
                  <div style={{ margin: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem' }}>
                    <p style={{ color: '#c2c8d4' }}>
                      Sua equipe conquistou <strong style={{ color: 'var(--green-neon)' }}>{teamWins} vitórias</strong> nesta temporada!
                    </p>
                    <p style={{ color: '#8a92a6', fontSize: '0.85rem' }}>
                      Piloto 1 ({team.driver1.name}): {p1Wins} vitórias.
                      <br/>
                      Piloto 2 ({team.driver2.name}): {p2Wins} vitórias.
                    </p>
                    <p style={{ color: '#8a92a6', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                      Classificação Final do Construtor: <strong>Posição {standings.constructors.findIndex(c => c.id === 'player_team') + 1}</strong> com {playerConstructorStanding?.points} pontos.
                    </p>
                  </div>
                )}
                
                <button 
                  className="btn btn-primary" 
                  onClick={onRestartGame}
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  <span className="btn-content">Jogar Novamente</span>
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
                  Próxima Etapa
                </span>
                
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: '0.2rem 0' }}>
                  GP do {currentRace.country}
                </h3>
                
                <p style={{ fontSize: '0.8rem', color: '#8a92a6', margin: '0.5rem 0 1.5rem 0', lineHeight: 1.3 }}>
                  {currentRace.description}
                  <br/>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                    Exigência: ⚙️ Motor {(currentRace.characteristics.powerWeight * 100).toFixed(0)}% | 🏎️ Aero {(currentRace.characteristics.downforceWeight * 100).toFixed(0)}%
                  </span>
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Interactive race simulation */}
                  <button 
                    className="btn btn-primary" 
                    onClick={() => onStartRace(true)}
                    style={{ width: '100%' }}
                  >
                    <span className="btn-content">Simulação Interativa (Boxes/Pneus)</span>
                  </button>
                  
                  {/* Quick race simulation */}
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => onStartRace(false)}
                    style={{ width: '100%' }}
                  >
                    <span className="btn-content">Simulação Rápida (1-Clique)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Current team stats preview */}
          <TeamPreview team={team} />
        </div>
      </div>
    </div>
  );
}
