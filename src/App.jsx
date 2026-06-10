import React, { useState, useEffect, useRef } from 'react';
import DraftScreen from './components/DraftScreen';
import SeasonSummary from './components/SeasonSummary';
import RaceSimulation, { AI_GRID } from './components/RaceSimulation';
import { tracks } from './data/tracks';
import AdBanner from './components/AdBanner';
import SupportModal from './components/SupportModal';
import { translations } from './data/translations';
import { drivers } from './data/drivers';
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
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'pt');
  const [activeAiGrid, setActiveAiGrid] = useState([]);
  const [introPhase, setIntroPhase] = useState(() => {
    return localStorage.getItem('visited_before') ? 'none' : 'video';
  });
  const [showWelcomeSplash, setShowWelcomeSplash] = useState(() => {
    return !localStorage.getItem('visited_before');
  });
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('bg_volume');
    return saved !== null ? parseFloat(saved) : 0.3;
  });

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    localStorage.setItem('bg_volume', val.toString());
  };

  // Play background audio continuously at target volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      
      const playAudio = () => {
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.log("Audio play failed:", e));
        }
      };

      // Try playing immediately
      audioRef.current.play().catch(() => {
        console.log("Audio autoplay blocked by browser. Setting up interaction listeners...");
        const startOnInteract = () => {
          playAudio();
          document.removeEventListener('click', startOnInteract);
          document.removeEventListener('keydown', startOnInteract);
        };
        document.addEventListener('click', startOnInteract);
        document.addEventListener('keydown', startOnInteract);
      });
    }
  }, []);

  // Sync audio element volume reactively
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Resilient video autoplay check (muted to ensure success)
  useEffect(() => {
    if (introPhase === 'video' && videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.volume = 0;
      videoRef.current.play().catch(e => console.log("Failed to play video:", e));
    }
  }, [introPhase]);

  // Sync audio play position with video play position to avoid any delay/drift
  useEffect(() => {
    let interval;
    if (introPhase === 'video') {
      interval = setInterval(() => {
        if (videoRef.current && audioRef.current && !videoRef.current.paused) {
          const videoTime = videoRef.current.currentTime;
          const audioTime = audioRef.current.currentTime;
          const diff = Math.abs(audioTime - videoTime);
          
          // If the audio is out of sync by more than 150ms, snap it to the video time
          if (diff > 0.15) {
            audioRef.current.currentTime = videoTime;
          }
        }
      }, 150); // check every 150ms
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [introPhase]);

  const handleSkipIntro = () => {
    setIntroPhase('shutting-down');
    setTimeout(() => {
      setIntroPhase('none');
    }, 800); // matches CSS crt-turn-off animation
  };

  const t = translations[lang];

  // Apply theme to body
  React.useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Save lang to localStorage
  React.useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

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

  // Initialize standings with AI + Player slots (prevent duplicates)
  const initializeStandings = (draftedTeam) => {
    const draftedIds = [draftedTeam.driver1.id, draftedTeam.driver2.id];
    const aiGridIds = AI_GRID.map(ai => ai.id);

    // Filter AI competitors to exclude drafted drivers
    let filteredAiGrid = AI_GRID.filter(ai => !draftedIds.includes(ai.id));
    const missingCount = 18 - filteredAiGrid.length;

    if (missingCount > 0) {
      // Find reserves that are not drafted and not in AI_GRID
      const availableReserves = drivers.filter(d => 
        !draftedIds.includes(d.id) && !aiGridIds.includes(d.id)
      );
      
      const reserves = availableReserves.sort(() => 0.5 - Math.random()).slice(0, missingCount);

      reserves.forEach((res, index) => {
        filteredAiGrid.push({
          id: res.id,
          name: res.name,
          teamId: `reserve_${index}`,
          teamName: lang === 'pt' ? `Equipe Reserva ${index + 1}` : `Reserve Team ${index + 1}`,
          speed: res.attributes.speed,
          rain: res.attributes.rain,
          reliability: res.attributes.reliability || 90,
          strategy: res.attributes.strategy || 85
        });
      });
    }

    setActiveAiGrid(filteredAiGrid);

    // 1. Initialize Drivers
    const driverList = filteredAiGrid.map(ai => ({
      id: ai.id,
      name: ai.name,
      teamId: ai.teamId,
      teamName: ai.teamName,
      points: 0,
      wins: 0
    }));

    const playerTeamName = lang === 'pt' ? 'Sua Equipe' : 'Your Team';

    driverList.push({
      id: 'player_d1',
      name: draftedTeam.driver1.name,
      teamId: 'player_team',
      teamName: playerTeamName,
      points: 0,
      wins: 0
    });

    driverList.push({
      id: 'player_d2',
      name: draftedTeam.driver2.name,
      teamId: 'player_team',
      teamName: playerTeamName,
      points: 0,
      wins: 0
    });

    // 2. Initialize Constructors (Teams)
    const uniqueTeams = [
      { id: 'player_team', name: playerTeamName, points: 0, wins: 0 }
    ];

    const addedTeamIds = new Set(['player_team']);
    filteredAiGrid.forEach(ai => {
      if (!addedTeamIds.has(ai.teamId)) {
        addedTeamIds.add(ai.teamId);
        uniqueTeams.push({
          id: ai.teamId,
          name: ai.teamName,
          points: 0,
          wins: 0
        });
      }
    });

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
          <div className="container animate-fadeIn" style={{ maxWidth: '750px', marginTop: '3rem', position: 'relative' }}>
            <video 
              src="/VideoBackground.mp4"
              autoPlay
              loop
              muted
              playsInline
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                objectFit: 'cover',
                zIndex: -1,
                opacity: 0.15,
                pointerEvents: 'none'
              }}
            />
            <div className="panel animate-fadeIn" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
              <span className="text-numeric" style={{ 
                color: 'var(--f1-red)', 
                fontSize: '1.1rem', 
                fontWeight: 900,
                letterSpacing: '3px'
              }}>
                {t.historicalChallenge}
              </span>
              
              <h1 className="glow-text pulse-effect" style={{ 
                fontSize: '4.5rem', 
                margin: '0.5rem 0 1.5rem 0', 
                fontWeight: 900,
                lineHeight: 1.1,
                color: 'var(--text-bright)'
              }}>
                {t.appTitle}
              </h1>
              
              <p style={{ 
                color: 'var(--text-card-desc)', 
                fontSize: '1.1rem', 
                lineHeight: '1.6',
                marginBottom: '2.5rem' 
              }}>
                {t.menuWelcome}
                <br/>
                <span style={{ color: 'var(--green-neon)', fontWeight: 'bold' }}>{t.menuSynergyCall}</span>
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '350px', margin: '0 auto' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={() => handleStartGame('classic')}
                  style={{ width: '100%', fontSize: '0.95rem' }}
                >
                  <span className="btn-content">{t.classicMode}</span>
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
                  <span className="btn-content">{t.almanacMode}</span>
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
                  <span className="btn-content">{t.supportText}</span>
                </button>
              </div>

              <div style={{ 
                marginTop: '3rem', 
                paddingTop: '2rem', 
                borderTop: '1px solid var(--border-color-default)',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                textAlign: 'left'
              }}>
                <h4 style={{ color: 'var(--text-bright)', marginBottom: '0.5rem' }}>{t.howToPlayTitle}</h4>
                <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <li><strong>Draft:</strong> {t.howToPlayDraft}</li>
                  <li><strong>Sinergias:</strong> {t.howToPlaySynergy}</li>
                  <li><strong>Simulação Dupla:</strong> {t.howToPlaySim}</li>
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
            t={t}
            lang={lang}
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
            t={t}
            lang={lang}
          />
        );
      case 'race':
        return (
          <RaceSimulation 
            team={team}
            track={tracks[currentRaceIndex]}
            interactive={interactiveRace}
            onRaceComplete={handleRaceComplete}
            aiGrid={activeAiGrid}
            t={t}
            lang={lang}
          />
        );
      default:
        return null;
    }
  };

  // Phase 1: Video Intro (CRT retro TV)
  if (introPhase === 'video' || introPhase === 'shutting-down') {
    return (
      <div className="crt-wrapper">
        <audio 
          ref={audioRef} 
          src="/Musica.webm" 
          loop 
          autoPlay
          style={{ display: 'none' }}
        />
        <button className="crt-skip-btn" onClick={handleSkipIntro}>
          {lang === 'pt' ? 'Pular Intro' : 'Skip Intro'}
        </button>
        
        <div className="crt-case">
          <div className="crt-screen-container">
            <div className={`crt-screen crt-flicker ${introPhase === 'shutting-down' ? 'turning-off' : ''}`}>
              <video 
                ref={videoRef}
                src="/Video.mp4" 
                playsInline 
                autoPlay 
                onEnded={handleSkipIntro}
                className="crt-video"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Phase 2: Calibration Welcome Splash
  if (showWelcomeSplash) {
    return (
      <div className="modal-overlay" style={{ background: 'var(--bg-darker)', display: 'flex', flexDirection: 'column', justifyItems: 'center', alignItems: 'center', zIndex: 9999 }}>
        <audio 
          ref={audioRef} 
          src="/Musica.webm" 
          loop 
          autoPlay
          style={{ display: 'none' }}
        />
        <div className="panel animate-fadeIn" style={{ maxWidth: '550px', textAlign: 'center', padding: '3.5rem 2rem', border: '1px solid var(--f1-red)', boxShadow: '0 0 40px var(--f1-red-glow)' }}>
          <span className="text-numeric" style={{ color: 'var(--f1-red)', fontSize: '1.2rem', fontWeight: 900, letterSpacing: '4px' }}>
            SYSTEM CALIBRATION
          </span>
          <h1 className="glow-text pulse-effect" style={{ fontSize: '5rem', margin: '1rem 0', fontWeight: 900, lineHeight: 1, color: 'var(--text-bright)' }}>
            24a0
          </h1>
          <p style={{ color: 'var(--text-card-desc)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2.5rem' }}>
            {lang === 'pt' 
              ? 'Conectando ao sistema de telemetria em tempo real. Prepare-se para gerenciar recursos lendários da Fórmula 1 e liderar sua equipe rumo à temporada perfeita.'
              : 'Connecting to real-time telemetry feed. Prepare to draft legendary Formula 1 assets and lead your team to the perfect season.'}
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <button 
              className="theme-toggle" 
              onClick={() => setLang('pt')}
              style={{ border: lang === 'pt' ? '1px solid var(--green-neon)' : '1px solid var(--border-color-default)', color: lang === 'pt' ? 'var(--green-neon)' : 'var(--text-muted)' }}
            >
              <span className="theme-toggle-content">PORTUGUÊS</span>
            </button>
            <button 
              className="theme-toggle" 
              onClick={() => setLang('en')}
              style={{ border: lang === 'en' ? '1px solid var(--green-neon)' : '1px solid var(--border-color-default)', color: lang === 'en' ? 'var(--green-neon)' : 'var(--text-muted)' }}
            >
              <span className="theme-toggle-content">ENGLISH</span>
            </button>
          </div>

          <button 
            className="btn btn-primary"
            style={{ width: '100%', maxWidth: '280px', padding: '1rem' }}
            onClick={() => {
              localStorage.setItem('visited_before', 'true');
              setShowWelcomeSplash(false);
            }}
          >
            <span className="btn-content" style={{ fontSize: '0.9rem' }}>
              {lang === 'pt' ? 'INICIAR TRANSMISSÃO' : 'INITIALIZE FEED'}
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <audio 
        ref={audioRef} 
        src="/Musica.webm" 
        loop 
        autoPlay
        style={{ display: 'none' }}
      />
      {/* Global Navbar */}
      <header style={{
        background: 'var(--bg-dark)',
        borderBottom: '1px solid var(--border-color-default)',
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
            textShadow: '0 0 10px rgba(225,6,0,0.3)'
          }}>
            {t.appTitle}
          </span>
          <span style={{ fontSize: '0.75rem', background: 'var(--bg-qualifying-header)', padding: '0.15rem 0.4rem', borderRadius: '4px', color: 'var(--text-muted)' }}>
            {t.appSubtitle}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button 
            className="theme-toggle" 
            onClick={() => setLang(prev => prev === 'pt' ? 'en' : 'pt')}
            title={lang === 'pt' ? 'Mudar para Inglês' : 'Switch to Portuguese'}
          >
            <span className="theme-toggle-content">
              {t.langToggle}
            </span>
          </button>

          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            title="Alternar Tema"
          >
            <span className="theme-toggle-content">
              {theme === 'light' ? t.themeToggleDark : t.themeToggleLight}
            </span>
          </button>

          {/* Volume Control */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            background: 'transparent', 
            padding: '0.4rem 0.75rem', 
            fontSize: '0.75rem', 
            border: '1px solid var(--border-color-default)', 
            borderRadius: 'var(--border-radius)',
            transform: 'skewX(-12deg)',
            color: 'var(--text-main)',
            height: '29px'
          }}>
            <div style={{ transform: 'skewX(12deg)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', cursor: 'default' }}>
                {volume === 0 ? '🔇' : volume < 0.4 ? '🔈' : volume < 0.75 ? '🔉' : '🔊'}
              </span>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={volume} 
                onChange={handleVolumeChange}
                title={lang === 'pt' ? 'Volume da Música' : 'Music Volume'}
                style={{
                  width: '60px',
                  height: '4px',
                  accentColor: 'var(--f1-red)',
                  cursor: 'pointer',
                  background: 'var(--border-color-default)',
                  border: 'none',
                  outline: 'none'
                }}
              />
              <span className="text-numeric" style={{ fontSize: '0.7rem', fontWeight: 'bold', minWidth: '28px', textAlign: 'right' }}>
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>

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
            <span className="btn-content">{t.supportBtn}</span>
          </button>
          
          {screen !== 'menu' && team.driver1 && (
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <div>{t.car}: <strong style={{ color: 'var(--text-bright)' }}>{team.chassis?.name}</strong></div>
              <div>{t.drivers}: <strong style={{ color: 'var(--text-bright)' }}>{team.driver1?.name} / {team.driver2?.name}</strong></div>
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
        t={t}
        lang={lang}
      />
    </div>
  );
}
