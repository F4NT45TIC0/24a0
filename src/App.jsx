import React, { useState } from 'react';
import DraftScreen from './components/DraftScreen';
import SeasonSummary from './components/SeasonSummary';
import RaceSimulation, { AI_GRID } from './components/RaceSimulation';
import { tracks } from './data/tracks';
import AdBanner from './components/AdBanner';
import SupportModal from './components/SupportModal';
import './App.css';

export default function App() {
  const [screen, setScreen] = useState('menu'); // 'menu', 'draft', 'season', 'race'
  const [gameMode, setGameMode] = useState('classic'); // 'classic', 'almanac'
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  // Apply theme to body
  React.useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  // Player's drafted team
  const [team, setTeam] = useState({
    driver1: null,
    driver2: null,
    chassis: null,
    engine: null,
    principal: null
  });

  // Season states
  const [currentRaceIndex, setCurrentRaceIndex] = useState(0);
  const [standings, setStandings] = useState({ drivers: [], constructors: [] });
  const [history, setHistory] = useState([]);
  const [interactiveRace, setInteractiveRace] = useState(false);

  // Initialize standings with AI + Player slots
  const initializeStandings = (draftedTeam) => {
    // 1. Initialize Drivers
    const driverList = AI_GRID.map(ai => ({
      id: ai.id,
      name: ai.name,
      teamId: ai.teamId,
      teamName: ai.teamName,
      points: 0,
      wins: 0
    }));

    driverList.push({
      id: 'player_d1',
      name: draftedTeam.driver1.name,
      teamId: 'player_team',
      teamName: 'Sua Equipe',
      points: 0,
      wins: 0
    });

    driverList.push({
      id: 'player_d2',
      name: draftedTeam.driver2.name,
      teamId: 'player_team',
      teamName: 'Sua Equipe',
      points: 0,
      wins: 0
    });

    // 2. Initialize Constructors
    const uniqueTeams = [
      { id: 'player_team', name: 'Sua Equipe', points: 0, wins: 0 },
      { id: 'redbull', name: 'Red Bull Racing', points: 0, wins: 0 },
      { id: 'mercedes', name: 'Mercedes AMG', points: 0, wins: 0 },
      { id: 'ferrari', name: 'Scuderia Ferrari', points: 0, wins: 0 },
      { id: 'mclaren', name: 'McLaren F1', points: 0, wins: 0 },
      { id: 'aston', name: 'Aston Martin', points: 0, wins: 0 },
      { id: 'alpine', name: 'Alpine Renault', points: 0, wins: 0 },
      { id: 'williams', name: 'Williams Racing', points: 0, wins: 0 },
      { id: 'haas', name: 'Haas F1', points: 0, wins: 0 },
      { id: 'sauber', name: 'Kick Sauber', points: 0, wins: 0 }
    ];

    setStandings({
      drivers: driverList.sort((a, b) => b.points - a.points),
      constructors: uniqueTeams.sort((a, b) => b.points - a.points)
    });
  };

  // Handle start draft from Menu
  const handleStartGame = (mode) => {
    setGameMode(mode);
    setScreen('draft');
  };

  // Handle draft completed
  const handleDraftComplete = (finalTeam) => {
    setTeam(finalTeam);
    initializeStandings(finalTeam);
    setCurrentRaceIndex(0);
    setHistory([]);
    setScreen('season');
  };

  // Start a GP
  const handleStartRace = (isInteractive) => {
    setInteractiveRace(isInteractive);
    setScreen('race');
  };

  // Race completed: process points and advance calendar
  const handleRaceComplete = (raceResults) => {
    const pointsAllocation = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
    
    // Create copies of standings
    let updatedDrivers = [...standings.drivers];
    let updatedConstructors = [...standings.constructors];

    // Sort race results by totalTime / position
    const sortedResults = [...raceResults].sort((a, b) => {
      if (a.dNF && !b.dNF) return 1;
      if (!a.dNF && b.dNF) return -1;
      return a.totalTime - b.totalTime;
    });

    // 1. Distribute points to top 10
    sortedResults.forEach((res, posIdx) => {
      const isWinner = posIdx === 0;
      const pointsEarned = posIdx < 10 ? pointsAllocation[posIdx] : 0;

      // Update Driver
      updatedDrivers = updatedDrivers.map(d => {
        if (d.id === res.id) {
          return {
            ...d,
            points: d.points + pointsEarned,
            wins: d.wins + (isWinner ? 1 : 0)
          };
        }
        return d;
      });

      // Update Constructor
      updatedConstructors = updatedConstructors.map(c => {
        if (c.id === res.teamId) {
          return {
            ...c,
            points: c.points + pointsEarned,
            wins: c.wins + (isWinner ? 1 : 0)
          };
        }
        return c;
      });
    });

    // Sort standings by points
    updatedDrivers.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.wins - a.wins; // tie breaker: wins
    });
    updatedConstructors.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.wins - a.wins;
    });

    // Save race to history
    const raceRecord = {
      trackId: tracks[currentRaceIndex].id,
      trackName: tracks[currentRaceIndex].name,
      results: sortedResults
    };

    setStandings({
      drivers: updatedDrivers,
      constructors: updatedConstructors
    });
    setHistory([...history, raceRecord]);
    setCurrentRaceIndex(prev => prev + 1);
    setScreen('season');
  };

  // Restart back to menu
  const handleRestartGame = () => {
    setTeam({
      driver1: null,
      driver2: null,
      chassis: null,
      engine: null,
      principal: null
    });
    setCurrentRaceIndex(0);
    setHistory([]);
    setScreen('menu');
  };

  // Render current screen
  const renderScreen = () => {
    switch (screen) {
      case 'menu':
        return (
          <div className="container" style={{ maxWidth: '750px', marginTop: '3rem' }}>
            <div className="panel animate-fadeIn" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
              <span className="text-numeric" style={{ 
                color: 'var(--f1-red)', 
                fontSize: '1.1rem', 
                fontWeight: 900,
                letterSpacing: '3px'
              }}>
                DESAFIO HISTÓRICO
              </span>
              
              <h1 className="glow-text pulse-effect" style={{ 
                fontSize: '4.5rem', 
                margin: '0.5rem 0 1.5rem 0', 
                fontWeight: 900,
                lineHeight: 1.1,
                color: '#fff'
              }}>
                24a0
              </h1>
              
              <p style={{ 
                color: '#c2c8d4', 
                fontSize: '1.1rem', 
                lineHeight: '1.6',
                marginBottom: '2.5rem' 
              }}>
                Bem-vindo ao <strong>24a0</strong>. Seu objetivo é draftar os melhores recursos históricos da Fórmula 1 (Pilotos, Chassi, Motor e Estrategista) e dominar as <strong>24 corridas</strong> do campeonato mundial.
                <br/>
                <span style={{ color: 'var(--green-neon)', fontWeight: 'bold' }}>Consegue atingir o feito impossível de 24 vitórias consecutivas?</span>
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '350px', margin: '0 auto' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={() => handleStartGame('classic')}
                  style={{ width: '100%', fontSize: '0.95rem' }}
                >
                  <span className="btn-content">Modo Clássico (Ver Atributos)</span>
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => handleStartGame('almanac')}
                  style={{ 
                    width: '100%', 
                    fontSize: '0.95rem',
                    border: '1px solid var(--tier-legendary)',
                    color: 'var(--tier-legendary)'
                  }}
                >
                  <span className="btn-content">Modo Almanaque (Ocular Stats)</span>
                </button>
                
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setIsSupportOpen(true)}
                  style={{ 
                    width: '100%', 
                    fontSize: '0.95rem',
                    background: 'rgba(0, 255, 135, 0.03)',
                    borderColor: 'var(--green-neon)',
                    color: 'var(--green-neon)'
                  }}
                >
                  <span className="btn-content">Apoiar o Jogo (PIX)</span>
                </button>
              </div>

              <div style={{ 
                marginTop: '3rem', 
                paddingTop: '2rem', 
                borderTop: '1px solid rgba(255,255,255,0.05)',
                fontSize: '0.85rem',
                color: '#8a92a6',
                textAlign: 'left'
              }}>
                <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>Como jogar:</h4>
                <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <li><strong>Draft:</strong> Escolha 5 componentes. Você recebe 3 opções aleatórias por slot e tem 3 rerolls.</li>
                  <li><strong>Sinergias:</strong> Combine pilotos, carros e chefes compatíveis na história real para ganhar bônus significativos.</li>
                  <li><strong>Simulação Dupla:</strong> Corra de forma rápida em 1 clique ou assuma o controle estratégico da corrida nas paradas de box, reação à chuva e postura dos pilotos.</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 'draft':
        return (
          <DraftScreen 
            gameMode={gameMode} 
            onDraftComplete={handleDraftComplete} 
          />
        );
      case 'season':
        return (
          <SeasonSummary 
            team={team}
            currentRaceIndex={currentRaceIndex}
            tracks={tracks}
            standings={standings}
            history={history}
            onStartRace={handleStartRace}
            onRestartGame={handleRestartGame}
          />
        );
      case 'race':
        return (
          <RaceSimulation 
            team={team}
            track={tracks[currentRaceIndex]}
            interactive={interactiveRace}
            onRaceComplete={handleRaceComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Global Navbar */}
      <header style={{
        background: 'rgba(11, 13, 18, 0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div 
          onClick={handleRestartGame} 
          style={{ 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem' 
          }}
        >
          <span className="text-numeric" style={{ 
            fontSize: '1.6rem', 
            fontWeight: 900, 
            color: 'var(--f1-red)',
            letterSpacing: '1px',
            textShadow: '0 0 10px rgba(255,24,1,0.3)'
          }}>
            24a0
          </span>
          <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '0.15rem 0.4rem', borderRadius: '4px', color: '#8a92a6' }}>
            F1 Draft Sim
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            title="Alternar Tema"
          >
            <span className="theme-toggle-content">
              {theme === 'light' ? 'ESCURO' : 'CLARO'}
            </span>
          </button>

          <button 
            className="btn" 
            onClick={() => setIsSupportOpen(true)}
            style={{ 
              padding: '0.4rem 0.8rem', 
              fontSize: '0.75rem', 
              border: '1px solid var(--yellow-neon)', 
              color: 'var(--yellow-neon)',
              textTransform: 'none',
              background: 'rgba(255, 202, 0, 0.05)'
            }}
          >
            <span className="btn-content">Apoiar (PIX)</span>
          </button>
          
          {screen !== 'menu' && team.driver1 && (
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#8a92a6' }}>
              <div>Carro: <strong style={{ color: '#fff' }}>{team.chassis?.name}</strong></div>
              <div>Pilotos: <strong style={{ color: '#fff' }}>{team.driver1?.name} / {team.driver2?.name}</strong></div>
            </div>
          )}
        </div>
      </header>

      {renderScreen()}

      {/* Global Ad Banner placeholder at the bottom */}
      {screen !== 'race' && <AdBanner type="leaderboard" />}

      {/* Support Modal dialog */}
      <SupportModal 
        isOpen={isSupportOpen} 
        onClose={() => setIsSupportOpen(false)} 
      />
    </div>
  );
}
