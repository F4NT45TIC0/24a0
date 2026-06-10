import React, { useState, useEffect, useRef } from 'react';
import { calculateSynergies } from './TeamPreview';
import { nationalityMap } from '../data/itemTranslations';

// AI competitors configuration
const AI_GRID = [
  { id: 'verstappen', name: 'Max Verstappen', teamId: 'redbull', teamName: 'Red Bull Racing', speed: 96, rain: 94, reliability: 98, strategy: 95 },
  { id: 'perez', name: 'Sergio Pérez', teamId: 'redbull', teamName: 'Red Bull Racing', speed: 82, rain: 85, reliability: 95, strategy: 88 },
  { id: 'hamilton', name: 'Lewis Hamilton', teamId: 'mercedes', teamName: 'Mercedes AMG', speed: 94, rain: 95, reliability: 98, strategy: 94 },
  { id: 'russell', name: 'George Russell', teamId: 'mercedes', teamName: 'Mercedes AMG', speed: 89, rain: 86, reliability: 94, strategy: 89 },
  { id: 'leclerc', name: 'Charles Leclerc', teamId: 'ferrari', teamName: 'Scuderia Ferrari', speed: 93, rain: 82, reliability: 92, strategy: 88 },
  { id: 'sainz', name: 'Carlos Sainz', teamId: 'ferrari', teamName: 'Scuderia Ferrari', speed: 88, rain: 86, reliability: 94, strategy: 92 },
  { id: 'norris', name: 'Lando Norris', teamId: 'mclaren', teamName: 'McLaren F1', speed: 90, rain: 85, reliability: 95, strategy: 90 },
  { id: 'piastri', name: 'Oscar Piastri', teamId: 'mclaren', teamName: 'McLaren F1', speed: 87, rain: 82, reliability: 95, strategy: 88 },
  { id: 'alonso', name: 'Fernando Alonso', teamId: 'aston', teamName: 'Aston Martin', speed: 92, rain: 92, reliability: 96, strategy: 95 },
  { id: 'stroll', name: 'Lance Stroll', teamId: 'aston', teamName: 'Aston Martin', speed: 77, rain: 85, reliability: 90, strategy: 78 },
  { id: 'gasly', name: 'Pierre Gasly', teamId: 'alpine', teamName: 'Alpine Renault', speed: 82, rain: 83, reliability: 90, strategy: 82 },
  { id: 'ocon', name: 'Esteban Ocon', teamId: 'alpine', teamName: 'Alpine Renault', speed: 81, rain: 82, reliability: 90, strategy: 80 },
  { id: 'albon', name: 'Alex Albon', teamId: 'williams', teamName: 'Williams Racing', speed: 83, rain: 80, reliability: 91, strategy: 85 },
  { id: 'sargeant', name: 'Logan Sargeant', teamId: 'williams', teamName: 'Williams Racing', speed: 62, rain: 58, reliability: 80, strategy: 60 },
  { id: 'hulkenberg', name: 'Nico Hülkenberg', teamId: 'haas', teamName: 'Haas F1', speed: 82, rain: 80, reliability: 92, strategy: 84 },
  { id: 'magnussen', name: 'Kevin Magnussen', teamId: 'haas', teamName: 'Haas F1', speed: 79, rain: 78, reliability: 90, strategy: 78 },
  { id: 'bottas', name: 'Valtteri Bottas', teamId: 'sauber', teamName: 'Kick Sauber', speed: 83, rain: 76, reliability: 92, strategy: 82 },
  { id: 'zhou', name: 'Zhou Guanyu', teamId: 'sauber', teamName: 'Kick Sauber', speed: 76, rain: 74, reliability: 91, strategy: 78 }
];

function translateLogLine(line, lang) {
  if (!line || lang === 'pt') return line;
  
  let translated = line;
  
  // Basic replacements
  translated = translated.replace(/Volta (\d+)/gi, 'Lap $1');
  translated = translated.replace(/VOLTA (\d+)/gi, 'LAP $1');
  
  // Start
  translated = translated.replace(
    'Luzes apagadas, os carros partem para a volta 1!',
    'Lights out, the cars set off for lap 1!'
  );
  translated = translated.replace('[SINAL] LARGADA', '[SIGNAL] START');

  // Weather
  translated = translated.replace('Começa a CHOVER forte no circuito!', 'Heavy RAIN starts falling on the circuit!');
  translated = translated.replace('A chuva para e o asfalto seca!', 'The rain stops and the asphalt dries!');
  translated = translated.replace('Nuvens cobrem a pista... COMEÇOU A CHOVER!', 'Clouds cover the track... IT HAS STARTED TO RAIN!');
  translated = translated.replace('A chuva parou! O trilho seco está aparecendo.', 'The rain has stopped! The dry line is appearing.');
  translated = translated.replace('[CLIMA: CHUVA]', '[WEATHER: RAIN]');
  translated = translated.replace('[CLIMA: SECO]', '[WEATHER: DRY]');

  // Incidents
  translated = translated.replace('está FORA da corrida! (Razão: ', 'is OUT of the race! (Reason: ');
  translated = translated.replace('rodou e bateu forte! Abandono (DNF).', 'spun and crashed hard! Retirement (DNF).');
  translated = translated.replace('[INCIDENTE]', '[INCIDENT]');
  translated = translated.replace('[QUEBRA]', '[ENGINE BLOW]');
  
  // SC / VSC
  translated = translated.replace('DEPLOYED para limpar os destroços de', 'DEPLOYED to clear debris from');
  translated = translated.replace('Safety Car retornando aos boxes nesta volta. PISTA LIBERADA!', 'Safety Car returning to pits this lap. GREEN FLAG!');
  translated = translated.replace('Corrida sob regime de', 'Race under');
  translated = translated.replace('Ultrapassagens proibidas.', 'Overtaking prohibited.');
  translated = translated.replace('[PISTA LIBERADA]', '[GREEN FLAG]');
  translated = translated.replace('[REGIME DE SC]', '[SAFETY CAR STATE]');
  translated = translated.replace('Pista liberada! CORRIDA REINICIADA!', 'Green flag! RACE RESTARTED!');

  // Overtakes / Leadership
  translated = translated.replace('assume a ponta da corrida na volta', 'takes the lead of the race on lap');
  translated = translated.replace('subiu para P', 'moved up to P');
  translated = translated.replace('ultrapassou', 'overtook');
  translated = translated.replace('furo de pneu', 'puncture');
  translated = translated.replace('superaquecimento', 'overheating');
  translated = translated.replace('[LIDERANÇA]', '[LEADERSHIP]');
  translated = translated.replace('[ULTRAPASSAGEM]', '[OVERTAKE]');
  translated = translated.replace('[RÁDIO: SC]', '[RADIO: SC]');
  translated = translated.replace('[RÁDIO: BOX]', '[RADIO: BOX]');

  // Stopwatch / Summary
  translated = translated.replace('Concluída: Liderança por', 'Completed: Led by');
  translated = translated.replace('em P', 'in P');
  translated = translated.replace('desgaste', 'wear');
  translated = translated.replace('[CRONÔMETRO]', '[LAP TIMING]');
  
  return translated;
}

export default function RaceSimulation({ 
  team, 
  track, 
  interactive, 
  onRaceComplete,
  aiGrid = AI_GRID,
  t,
  lang
}) {
  const [phase, setPhase] = useState('lights'); // 'lights', 'qualifying', 'race', 'podium'
  const [lightsCount, setLightsCount] = useState(0);
  const [grid, setGrid] = useState([]);
  const [currentLap, setCurrentLap] = useState(0);
  const totalLaps = 20; // Standard simulation length in both modes
  
  // Weather
  const [weather, setWeather] = useState('seco'); // 'seco', 'chuva'
  const [rainLap, setRainLap] = useState(null); // Lap when rain starts
  const [dryLap, setDryLap] = useState(null); // Lap when rain stops
  
  // F1 advanced statuses
  const [safetyCarStatus, setSafetyCarStatus] = useState('none'); // 'none', 'sc', 'vsc'
  const [safetyCarLapsLeft, setSafetyCarLapsLeft] = useState(0);
  
  // Active critical full screen alert (e.g. crash, safety car, rain)
  const [activeAlert, setActiveAlert] = useState(null); 
  
  // Interactive driver settings
  const [d1Tyre, setD1Tyre] = useState('M'); // 'S' (Soft), 'M' (Medium), 'H' (Hard), 'W' (Wet)
  const [d2Tyre, setD2Tyre] = useState('M');
  const [d1Posture, setD1Posture] = useState('balanced'); // 'aggressive', 'balanced', 'conservative'
  const [d2Posture, setD2Posture] = useState('balanced');
  
  // Overheating and puncture flags
  const [d1Overheating, setD1Overheating] = useState(false);
  const [d2Overheating, setD2Overheating] = useState(false);
  const [d1Puncture, setD1Puncture] = useState(false);
  const [d2Puncture, setD2Puncture] = useState(false);

  // Pitstop requests for next lap
  const [d1PitRequest, setD1PitRequest] = useState(false);
  const [d2PitRequest, setD2PitRequest] = useState(false);
  const [d1SelectedNextTyre, setD1SelectedNextTyre] = useState('M');
  const [d2SelectedNextTyre, setD2SelectedNextTyre] = useState('M');
  
  // Live simulation states
  const [driverStates, setDriverStates] = useState([]);
  const [log, setLog] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const radioLogEndRef = useRef(null);

  // Synergy calculations
  const { bonuses } = calculateSynergies(team);

  // Scroll radio log to bottom
  useEffect(() => {
    if (radioLogEndRef.current) {
      radioLogEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [log]);

  // 1. Initial Start Lights animation
  useEffect(() => {
    if (phase === 'lights') {
      const interval = setInterval(() => {
        setLightsCount(prev => {
          if (prev < 5) {
            return prev + 1;
          } else {
            clearInterval(interval);
            setTimeout(() => {
              setPhase('qualifying');
              runQualifying();
            }, 1000);
            return prev;
          }
        });
      }, 300); // Speed up lights to 300ms
      return () => clearInterval(interval);
    }
  }, [phase]);

  // 2. Safe React Effect Autoplay system
  useEffect(() => {
    let timer;
    if (isPlaying && phase === 'race' && !activeAlert) {
      timer = setTimeout(() => {
        runInteractiveLap();
      }, 2000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, currentLap, phase, activeAlert, d1Tyre, d2Tyre, d1Posture, d2Posture, d1PitRequest, d2PitRequest, safetyCarStatus]);

  // Keyboard shortcut listener: Space or Enter to run next lap (Requested!)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeAlert || phase !== 'race') return;

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault(); // Stop scrolling under Space
        if (!isPlaying) {
          runInteractiveLap();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentLap, phase, activeAlert, d1Tyre, d2Tyre, d1Posture, d2Posture, d1PitRequest, d2PitRequest, safetyCarStatus]);

  // Set up weather forecast
  useEffect(() => {
    const willRain = Math.random() < track.characteristics.rainChance;
    if (willRain) {
      const start = Math.floor(Math.random() * 5) + 3;
      setRainLap(start);
      if (Math.random() < 0.5) {
        setDryLap(start + Math.floor(Math.random() * 3) + 2);
      }
    }
  }, [track]);

  // 3. RUN QUALIFYING
  const runQualifying = () => {
    const list = [];
    
    // Add AI drivers
    aiGrid.forEach(ai => {
      const paceVal = calculateBasePace(ai.speed, ai.speed, ai.reliability, track);
      const qScore = paceVal + (Math.random() * 3 - 1.5);
      list.push({
        ...ai,
        isPlayer: false,
        qScore
      });
    });

    // Add Player Driver 1
    const p1Pace = calculateBasePace(
      team.driver1.attributes.speed + bonuses.driver1Speed,
      team.driver1.attributes.racecraft,
      team.chassis.attributes.downforce,
      track,
      team.engine.attributes.power,
      team.chassis.attributes.efficiency
    );
    const p1QScore = p1Pace + (Math.random() * 2.5 - 1.25);
    list.push({
      id: 'player_d1',
      name: team.driver1.name,
      teamId: 'player_team',
      teamName: 'Sua Equipe',
      speed: team.driver1.attributes.speed + bonuses.driver1Speed,
      rain: team.driver1.attributes.rain,
      reliability: team.chassis.attributes.reliability + bonuses.carReliability,
      strategy: team.principal.attributes.strategy + bonuses.teamStrategy,
      isPlayer: true,
      driverKey: 'driver1',
      qScore: p1QScore
    });

    // Add Player Driver 2
    const p2Pace = calculateBasePace(
      team.driver2.attributes.speed + bonuses.driver2Speed,
      team.driver2.attributes.racecraft,
      team.chassis.attributes.downforce,
      track,
      team.engine.attributes.power,
      team.chassis.attributes.efficiency
    );
    const p2QScore = p2Pace + (Math.random() * 2.5 - 1.25);
    list.push({
      id: 'player_d2',
      name: team.driver2.name,
      teamId: 'player_team',
      teamName: 'Sua Equipe',
      speed: team.driver2.attributes.speed + bonuses.driver2Speed,
      rain: team.driver2.attributes.rain,
      reliability: team.chassis.attributes.reliability + bonuses.carReliability,
      strategy: team.principal.attributes.strategy + bonuses.teamStrategy,
      isPlayer: true,
      driverKey: 'driver2',
      qScore: p2QScore
    });

    // Sort descending by qScore to get Grid
    list.sort((a, b) => b.qScore - a.qScore);
    setGrid(list);

    // Initialize Race States
    const initialRaceStates = list.map((driver, index) => ({
      ...driver,
      gridPos: index + 1,
      pos: index + 1,
      tyre: 'M',
      tyreWear: 0,
      posture: 'balanced',
      totalTime: index * 0.2, // Small qualifying gap between cars
      lapsRemainingInPit: 0,
      dNF: false,
      dnfReason: ''
    }));

    setDriverStates(initialRaceStates);
  };

  const calculateBasePace = (dSpeed, dRacecraft, cDownforce, track, ePower = 80, cEfficiency = 80) => {
    const trackAero = track.characteristics.downforceWeight;
    const trackPower = track.characteristics.powerWeight;
    
    const dVal = (dSpeed * 0.45) + (dRacecraft * 0.15);
    const cVal = (cDownforce * trackAero * 0.25) + (cEfficiency * trackAero * 0.05);
    const eVal = (ePower * trackPower * 0.10);
    
    return dVal + cVal + eVal;
  };

  // Start the Race phase
  const handleStartRace = () => {
    if (!interactive) {
      runQuickSimulation();
    } else {
      setPhase('race');
      setCurrentLap(1);
      setLog(["[SINAL] LARGADA: Luzes apagadas, os carros partem para a volta 1!"]);
    }
  };

  // 4. QUICK SIMULATION (Runs all laps instantly)
  const runQuickSimulation = () => {
    let currentStates = [...driverStates];
    let simWeather = 'seco';
    let simulationLogs = ["[SINAL] LARGADA: Os carros iniciam o GP!"];
    let simSCStatus = 'none';

    currentStates = currentStates.map(d => {
      if (d.isPlayer) {
        return { ...d, tyre: 'M', tyreWear: 0, posture: 'balanced' };
      }
      return d;
    });

    for (let lap = 1; lap <= totalLaps; lap++) {
      // Weather check
      if (rainLap && lap === rainLap) {
        simWeather = 'chuva';
        simulationLogs.push(`[CLIMA: CHUVA] Volta ${lap}: Começa a CHOVER forte no circuito!`);
      }
      if (dryLap && lap === dryLap) {
        simWeather = 'seco';
        simulationLogs.push(`[CLIMA: SECO] Volta ${lap}: A chuva para e o asfalto seca!`);
      }

      // Safety Car countdown
      let scActiveThisLap = simSCStatus !== 'none';

      // Lap calculations
      currentStates = currentStates.map(drv => {
        if (drv.dNF) return drv;

        // Crash check
        const crashChance = calculateCrashChance(drv, simWeather);
        if (Math.random() < crashChance) {
          const reason = getRandomDNFReason(drv);
          simulationLogs.push(`[INCIDENTE] Volta ${lap}: ${drv.name} está FORA da corrida! (Razão: ${reason})`);
          
          // Trigger Safety Car (60% chance upon DNF)
          if (simSCStatus === 'none' && Math.random() < 0.6) {
            simSCStatus = Math.random() < 0.5 ? 'sc' : 'vsc';
            simulationLogs.push(`[REGIME DE SC] Volta ${lap}: ${simSCStatus === 'sc' ? 'SAFETY CAR' : 'VSC'} DEPLOYED para limpar os destroços de ${drv.name}!`);
          }

          return { ...drv, dNF: true, dnfReason: reason, pos: 20 };
        }

        // AI strategy & tire management
        let needsPit = false;
        let nextTyre = drv.tyre;

        if (simWeather === 'chuva' && drv.tyre !== 'W') {
          needsPit = true;
          nextTyre = 'W';
        } else if (simWeather === 'seco' && drv.tyre === 'W') {
          needsPit = true;
          nextTyre = 'M';
        } else if (drv.tyreWear > 75) {
          needsPit = true;
          nextTyre = drv.tyre === 'S' ? 'M' : 'S';
        }

        let pitTimeAdded = 0;
        let tyreWearInc = calculateTyreWearIncrease(drv.tyre, drv.posture, track);
        let newWear = drv.tyreWear + tyreWearInc;

        if (needsPit) {
          // Pitstop under Safety Car is cheaper!
          let pitstopBase = scActiveThisLap ? 10 : 20;
          const principalBonus = drv.isPlayer ? (team.principal.attributes.pitstops / 10) : 8.5;
          const pitEfficiency = 11 - principalBonus;
          
          let pitError = 0;
          if (Math.random() < (drv.isPlayer ? (1 - team.principal.attributes.strategy/100)*0.08 : 0.05)) {
            pitError = Math.random() * 6 + 4;
          }

          pitTimeAdded = pitstopBase + pitEfficiency + pitError;
          newWear = 0;
          drv.tyre = nextTyre;
        }

        // Lap pace
        const trackBase = scActiveThisLap ? 120 : 80; // Safety car pace is 40s slower!
        const speedBonus = drv.isPlayer ? (drv.driverKey === 'driver1' ? bonuses.driver1Speed : bonuses.driver2Speed) : 0;
        const performanceIndex = calculateBasePace(drv.speed + speedBonus, drv.speed, drv.reliability, track);
        
        let lapTime = trackBase - (performanceIndex * 0.15);

        // Tyre impact
        const tyreSpeedEffect = getTyreSpeedModifier(drv.tyre, simWeather);
        lapTime += tyreSpeedEffect;
        lapTime += (newWear * (scActiveThisLap ? 0.02 : 0.08)); // wear has less impact at low speed

        // Posture factor
        if (drv.posture === 'aggressive') lapTime -= 0.6;
        if (drv.posture === 'conservative') lapTime += 0.8;

        // Random variance
        lapTime += (Math.random() * 2 - 1);
        lapTime += pitTimeAdded;

        return {
          ...drv,
          tyreWear: Math.min(newWear, 100),
          totalTime: drv.totalTime + lapTime
        };
      });

      // Bunch up the pack if Safety Car is deployed (NOT VSC)
      if (simSCStatus === 'sc') {
        let sortedActive = currentStates.filter(d => !d.dNF).sort((a, b) => a.totalTime - b.totalTime);
        let leaderTime = sortedActive[0]?.totalTime || 0;
        
        currentStates = currentStates.map(d => {
          if (d.dNF) return d;
          const activeIdx = sortedActive.findIndex(sa => sa.id === d.id);
          return {
            ...d,
            totalTime: leaderTime + (activeIdx * 1.2)
          };
        });
      }

      // VSC or Safety Car turn countdown
      if (simSCStatus !== 'none') {
        simSCStatus = 'none';
        simulationLogs.push(`🟢 Volta ${lap}: Pista liberada! CORRIDA REINICIADA!`);
      }

      // Recalculate positions
      currentStates = updateRacePositions(currentStates, lap, simulationLogs);
    }

    setDriverStates(currentStates);
    setLog(simulationLogs);
    setPhase('podium');
  };

  // Helper values
  const getTyreSpeedModifier = (tyre, weatherState) => {
    if (weatherState === 'chuva') {
      if (tyre === 'W') return 0;
      return 15;
    } else {
      if (tyre === 'W') return 8;
      if (tyre === 'S') return -0.8;
      if (tyre === 'M') return 0;
      if (tyre === 'H') return 0.6;
    }
    return 0;
  };

  const calculateTyreWearIncrease = (tyre, posture, trackDetails) => {
    const trackWear = trackDetails.characteristics.tireWearRate;
    let base = 8;
    if (tyre === 'S') base = 18;
    if (tyre === 'H') base = 4.5;
    if (tyre === 'W') base = 7;

    let postMult = 1.0;
    if (posture === 'aggressive') postMult = 1.5;
    if (posture === 'conservative') postMult = 0.6;

    return base * trackWear * postMult;
  };

  const calculateCrashChance = (drv, weatherState) => {
    let base = 0.005;
    
    if (weatherState === 'chuva') {
      if (drv.tyre !== 'W') {
        base += 0.08;
      } else {
        base += (1 - drv.rain / 100) * 0.04;
      }
    }

    if (drv.tyreWear > 80) base += 0.04;
    if (drv.posture === 'aggressive') base += 0.01;
    if (drv.reliability < 70) base += 0.008;

    return base;
  };

  const getRandomDNFReason = (drv) => {
    const reasons = [
      "Batida na barreira de pneus",
      "Pane elétrica geral",
      "Vazamento hidráulico de óleo",
      "Quebra da suspensão traseira",
      "Estouro de motor (fumaça branca)",
      "Erro de pilotagem na curva rápida",
      "Colisão com outro competidor"
    ];
    if (drv.id === 'maldonado' || drv.id === 'crasheris') {
      return "Colisão espetacular com outro carro";
    }
    if (drv.id === 'mazepin' || drv.id === 'yuji_ide') {
      return "Rodou sozinho e atolou na brita";
    }
    return reasons[Math.floor(Math.random() * reasons.length)];
  };

  const updateRacePositions = (drivers, lap, logs) => {
    const active = drivers.filter(d => !d.dNF);
    const retired = drivers.filter(d => d.dNF);

    active.sort((a, b) => a.totalTime - b.totalTime);

    const ordered = active.map((d, index) => {
      const oldPos = d.pos;
      const newPos = index + 1;
      
      if (lap > 1 && newPos === 1 && oldPos !== 1) {
        logs.push(`[LIDERANÇA] ${d.name} assume a ponta da corrida na volta ${lap}!`);
      }
      if (d.isPlayer && newPos < oldPos && newPos <= 10 && lap > 1) {
        logs.push(`[ULTRAPASSAGEM] ${d.name} subiu para P${newPos}!`);
      }

      return {
        ...d,
        pos: newPos
      };
    });

    const finalGrid = [...ordered];
    retired.forEach((ret, idx) => {
      finalGrid.push({
        ...ret,
        pos: ordered.length + idx + 1
      });
    });

    return finalGrid;
  };

  // 5. INTERACTIVE SIMULATION: RUN LAP STEP BY STEP
  const runInteractiveLap = () => {
    if (currentLap > totalLaps) return;

    let currentStates = [...driverStates];
    let simWeather = weather;
    let lapLogs = [];
    let scTriggeredThisLap = false;
    let newSCStatus = safetyCarStatus;

    // Trigger Weather Changes
    if (rainLap && currentLap === rainLap) {
      simWeather = 'chuva';
      setWeather('chuva');
      lapLogs.push(`[CLIMA: CHUVA] VOLTA ${currentLap}: Nuvens cobrem a pista... COMEÇOU A CHOVER!`);
      setActiveAlert({
        title: "ALERTA DE CHUVA",
        message: "A pista está molhada. Carros com pneus slicks perderão muito tempo e correm alto risco de bater! Planeje paradas para pneu de Chuva (W).",
        type: "rain"
      });
      setIsPlaying(false); // Pause autoplay
    }

    if (dryLap && currentLap === dryLap) {
      simWeather = 'seco';
      setWeather('seco');
      lapLogs.push(`[CLIMA: SECO] VOLTA ${currentLap}: A chuva parou! O trilho seco está aparecendo.`);
      setActiveAlert({
        title: "A PISTA ESTÁ SECANDO",
        message: "A chuva parou. Os pneus de chuva (W) começarão a superaquecer e se desgastar rapidamente. Considere voltar para os slicks (Macios, Médios, Duros).",
        type: "rain"
      });
      setIsPlaying(false);
    }

    // Safety Car countdown
    let scActiveThisLap = safetyCarStatus !== 'none';
    let currentSCLaps = safetyCarLapsLeft;

    if (scActiveThisLap) {
      currentSCLaps -= 1;
      setSafetyCarLapsLeft(currentSCLaps);
      if (currentSCLaps <= 0) {
        newSCStatus = 'none';
        setSafetyCarStatus('none');
        lapLogs.push(`[PISTA LIBERADA] VOLTA ${currentLap}: Safety Car retornando aos boxes nesta volta. PISTA LIBERADA!`);
      } else {
        lapLogs.push(`[REGIME DE SC] VOLTA ${currentLap}: Corrida sob regime de ${safetyCarStatus === 'sc' ? 'SAFETY CAR' : 'VSC'}. Ultrapassagens proibidas.`);
      }
    }

    // Process Driver Overheating and Puncture States
    currentStates = currentStates.map(drv => {
      if (drv.dNF) return drv;

      const isD1 = drv.id === 'player_d1';
      const isD2 = drv.id === 'player_d2';

      // Puncture check (Chance if tyres > 75%)
      if (!scActiveThisLap && drv.tyreWear > 75 && Math.random() < 0.08) {
        if (isD1) {
          setD1Puncture(true);
          setD1PitRequest(true); // Automatically request pitstop to help user!
          setActiveAlert({
            title: `PNEU FURADO - ${drv.name}`,
            message: "O pneu esvaziou devido ao alto desgaste! O piloto foi chamado automaticamente para os boxes nesta volta, mas perderá muito tempo na pista.",
            type: "puncture"
          });
          setIsPlaying(false);
        } else if (isD2) {
          setD2Puncture(true);
          setD2PitRequest(true);
          setActiveAlert({
            title: `PNEU FURADO - ${drv.name}`,
            message: "O pneu esvaziou devido ao alto desgaste! O piloto foi chamado automaticamente para os boxes nesta volta, mas perderá muito tempo na pista.",
            type: "puncture"
          });
          setIsPlaying(false);
        } else {
          // AI puncture
          drv.tyreWear = 99;
        }
        lapLogs.push(`[INCIDENTE] Pneu furado para ${drv.name}! Andando em ritmo lento.`);
      }

      // Overheating check (Aggressive posture for too long)
      if (!scActiveThisLap && drv.isPlayer) {
        const postureSetting = isD1 ? d1Posture : d2Posture;
        const isOverheating = isD1 ? d1Overheating : d2Overheating;

        if (postureSetting === 'aggressive') {
          if (!isOverheating && Math.random() < 0.15) {
            if (isD1) setD1Overheating(true);
            if (isD2) setD2Overheating(true);
            setActiveAlert({
              title: `MOTOR SUPERAQUECENDO - ${drv.name}`,
              message: "O motor está atingindo temperaturas críticas devido à postura Agressiva! Mude a postura para 'Econômica' na próxima volta para resfriar, ou o motor poderá quebrar e abandonar a corrida!",
              type: "engine"
            });
            setIsPlaying(false);
            lapLogs.push(`[AVISO] Temperatura do motor subindo rapidamente para ${drv.name}!`);
          } else if (isOverheating && Math.random() < 0.40) {
            // Explode!
            lapLogs.push(`[QUEBRA] O motor de ${drv.name} explodiu em fumaça!`);
            setActiveAlert({
              title: `QUEBRA DE MOTOR - ${drv.name}`,
              message: `O motor superaquecido não aguentou a pressão e estourou. Fim de prova para ${drv.name}.`,
              type: "dnf"
            });
            setIsPlaying(false);
            return { ...drv, dNF: true, dnfReason: "Estouro de motor (superaquecimento)", pos: 20 };
          }
        } else if (postureSetting === 'conservative' && isOverheating) {
          // Cool down
          if (isD1) setD1Overheating(false);
          if (isD2) setD2Overheating(false);
          lapLogs.push(`[RÁDIO] Temperaturas normalizadas para ${drv.name}.`);
        }
      }

      return drv;
    });

    // Apply Player Pit Strategy
    currentStates = currentStates.map(drv => {
      if (!drv.isPlayer || drv.dNF) return drv;

      const isD1 = drv.driverKey === 'driver1';
      const tyreSetting = isD1 ? d1Tyre : d2Tyre;
      const postureSetting = isD1 ? d1Posture : d2Posture;
      
      let nextTyre = tyreSetting;
      let pitstopOccurs = false;
      let pitTime = 0;

      const hasRequest = isD1 ? d1PitRequest : d2PitRequest;
      const requestedTyre = isD1 ? d1SelectedNextTyre : d2SelectedNextTyre;

      if (hasRequest) {
        pitstopOccurs = true;
        nextTyre = requestedTyre;
        
        // Reset requests and flags
        if (isD1) {
          setD1PitRequest(false);
          setD1Tyre(requestedTyre);
          setD1Puncture(false);
        } else {
          setD2PitRequest(false);
          setD2Tyre(requestedTyre);
          setD2Puncture(false);
        }

        const pitstopBase = scActiveThisLap ? 10 : 20;
        const principalBonus = team.principal.attributes.pitstops / 10;
        const pitEfficiency = 11 - principalBonus;
        
        let pitError = 0;
        if (Math.random() < (1 - team.principal.attributes.strategy / 100) * 0.08) {
          pitError = Math.random() * 6 + 4;
          lapLogs.push(`[RÁDIO: BOX] Lentidão na troca do pneu de ${drv.name}! (+${pitError.toFixed(1)}s)`);
        } else {
          lapLogs.push(`[RÁDIO: BOX] Pitstop perfeito de ${drv.name} (${pitEfficiency.toFixed(1)}s). Trocou para pneu ${requestedTyre}.`);
        }

        pitTime = pitstopBase + pitEfficiency + pitError;
      }

      return {
        ...drv,
        tyre: nextTyre,
        tyreWear: pitstopOccurs ? 0 : drv.tyreWear,
        posture: postureSetting,
        pitTimeAdded: pitTime
      };
    });

    // Calculations for all active drivers
    currentStates = currentStates.map(drv => {
      if (drv.dNF) return drv;

      // Crash check (only if not SC/VSC!)
      if (!scActiveThisLap) {
        const crashChance = calculateCrashChance(drv, simWeather);
        if (Math.random() < crashChance) {
          const reason = getRandomDNFReason(drv);
          lapLogs.push(`[INCIDENTE] VOLTA ${currentLap}: ${drv.name} rodou e bateu forte! Abandono (DNF).`);
          
          // Trigger safety car chance
          if (newSCStatus === 'none' && Math.random() < 0.6) {
            scTriggeredThisLap = true;
            newSCStatus = Math.random() < 0.5 ? 'sc' : 'vsc';
            setSafetyCarStatus(newSCStatus);
            setSafetyCarLapsLeft(2);
            
            setActiveAlert({
              title: `${newSCStatus === 'sc' ? 'SAFETY CAR' : 'VIRTUAL SAFETY CAR'} DEPLOYED`,
              message: `${drv.name} bateu no muro e deixou destroços perigosos na pista. ${newSCStatus === 'sc' ? 'O pelotão será compactado!' : 'A velocidade de pista foi limitada.'} Aproveite para fazer pitstops mais baratos!`,
              type: newSCStatus
            });
            setIsPlaying(false);
          } else {
            if (drv.isPlayer) {
              setActiveAlert({
                title: "ABANDONO DE CORRIDA",
                message: `${drv.name} abandonou a prova após: ${reason}.`,
                type: "dnf"
              });
              setIsPlaying(false);
            }
          }

          return { ...drv, dNF: true, dnfReason: reason, pos: 20 };
        }
      }

      // AI Pit Decisions
      let aiPits = false;
      let aiNextTyre = drv.tyre;
      let aiPitTime = 0;

      if (!drv.isPlayer) {
        if (simWeather === 'chuva' && drv.tyre !== 'W') {
          aiPits = true;
          aiNextTyre = 'W';
        } else if (simWeather === 'seco' && drv.tyre === 'W') {
          aiPits = true;
          aiNextTyre = 'M';
        } else if (drv.tyreWear > 75) {
          aiPits = true;
          aiNextTyre = drv.tyre === 'S' ? 'M' : 'S';
        }

        if (aiPits) {
          const pitBase = scActiveThisLap ? 10 : 20;
          aiPitTime = pitBase + (Math.random() * 3) + (Math.random() < 0.05 ? Math.random() * 5 + 3 : 0);
          drv.tyre = aiNextTyre;
          drv.tyreWear = 0;
          lapLogs.push(`[BOX] ${drv.name} (${drv.teamName}) faz sua parada nos boxes.`);
        }
      }

      // Compute tyre wear
      const carryPitTime = drv.isPlayer ? (drv.pitTimeAdded || 0) : aiPitTime;
      const tyreWearInc = calculateTyreWearIncrease(drv.tyre, drv.posture, track);
      const isPunctured = drv.isPlayer ? (drv.driverKey === 'driver1' ? d1Puncture : d2Puncture) : (drv.tyreWear === 99);
      
      const newWear = isPunctured ? 99 : drv.tyreWear + tyreWearInc;

      // Base Pace
      let trackBase = 85;
      if (newSCStatus === 'sc') trackBase = 125;
      else if (newSCStatus === 'vsc') trackBase = 105;

      const speedBonus = drv.isPlayer ? (drv.driverKey === 'driver1' ? bonuses.driver1Speed : bonuses.driver2Speed) : 0;
      const performanceIndex = calculateBasePace(drv.speed + speedBonus, drv.speed, drv.reliability, track);
      
      let lapTime = trackBase - (performanceIndex * 0.15);

      // Tyre speeds & puncture modifier
      const tyreSpeedEffect = getTyreSpeedModifier(drv.tyre, simWeather);
      lapTime += tyreSpeedEffect;
      lapTime += (newWear * (newSCStatus !== 'none' ? 0.02 : 0.08));
      
      if (isPunctured) {
        lapTime += 30;
      }

      // Posture
      if (drv.posture === 'aggressive') lapTime -= 0.6;
      if (drv.posture === 'conservative') lapTime += 0.8;

      // Randomness
      lapTime += (Math.random() * 2 - 1);
      lapTime += carryPitTime;

      return {
        ...drv,
        tyreWear: Math.min(newWear, 100),
        totalTime: drv.totalTime + lapTime,
        pitTimeAdded: 0
      };
    });

    // BUNCH UP THE PACK IN CASE OF SAFETY CAR
    if (newSCStatus === 'sc' && scTriggeredThisLap) {
      let sortedActive = currentStates.filter(d => !d.dNF).sort((a, b) => a.totalTime - b.totalTime);
      let leaderTime = sortedActive[0]?.totalTime || 0;
      
      currentStates = currentStates.map(d => {
        if (d.dNF) return d;
        const activeIdx = sortedActive.findIndex(sa => sa.id === d.id);
        return {
          ...d,
          totalTime: leaderTime + (activeIdx * 1.2)
        };
      });
      lapLogs.push("[RÁDIO: SC] Pelotão agrupado sob bandeira amarela.");
    }

    // Update positions and logs
    const updatedPositions = updateRacePositions(currentStates, currentLap, lapLogs);
    setDriverStates(updatedPositions);
    
    const leader = updatedPositions[0];
    const player1 = updatedPositions.find(d => d.id === 'player_d1');
    const player2 = updatedPositions.find(d => d.id === 'player_d2');
    
    let summaryComment = `[CRONÔMETRO] Volta ${currentLap} Concluída: Liderança por ${leader.name} (${leader.teamName}).`;
    if (player1 && !player1.dNF) {
      summaryComment += ` P1: ${player1.name} em P${player1.pos} (${player1.tyre}, ${player1.tyreWear.toFixed(0)}% desgaste).`;
    }
    if (player2 && !player2.dNF) {
      summaryComment += ` P2: ${player2.name} em P${player2.pos} (${player2.tyre}, ${player2.tyreWear.toFixed(0)}% desgaste).`;
    }

    setLog(prev => [...prev, ...lapLogs, summaryComment]);

    if (currentLap < totalLaps) {
      setCurrentLap(prev => prev + 1);
    } else {
      setIsPlaying(false);
      setPhase('podium');
    }
  };

  // Autoplay toggler
  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  // Quick simulation finisher
  const handleQuickFinish = () => {
    onRaceComplete(driverStates);
  };

  // Render start lights
  const renderLights = () => {
    return (
      <div className="panel animate-fadeIn" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2 className="text-numeric" style={{ color: 'var(--f1-red)', fontSize: '1.8rem', marginBottom: '1.5rem' }}>
          {t.preparingStart}
        </h2>
        
        <div className="lights-container">
          {[1, 2, 3, 4, 5].map(idx => (
            <div key={idx} className="light-post">
              <div className={`light-bulb ${lightsCount >= idx ? 'red-on' : ''}`} />
              <div className={`light-bulb ${lightsCount >= idx ? 'red-on' : ''}`} />
            </div>
          ))}
        </div>
        
        {lightsCount === 5 && (
          <h3 className="flash-effect text-numeric" style={{ color: 'var(--f1-red)', marginTop: '2rem', fontSize: '1.5rem' }}>
            {t.lightsOut}
          </h3>
        )}
      </div>
    );
  };

  // Render Qualifying Grid
  const renderQualifying = () => {
    return (
      <div className="panel animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <span className="text-numeric" style={{ color: 'var(--yellow-neon)', fontSize: '0.9rem', letterSpacing: '1px' }}>{t.practiceSession}</span>
          <h2 className="text-numeric" style={{ color: 'var(--text-bright)', fontSize: '2rem', marginTop: '0.2rem' }}>{t.startingGrid}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t.qualifyingDesc.replace('{name}', track.name)}</p>
        </div>

        <div className="custom-scroll" style={{ maxHeight: '380px', border: '1px solid var(--border-color-default)', borderRadius: '8px', overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '500px', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color-default)', color: 'var(--text-muted)', textAlign: 'left', background: 'var(--bg-qualifying-header)' }}>
                <th style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)' }}>{t.pos}</th>
                <th style={{ color: 'var(--text-muted)' }}>{t.driver}</th>
                <th style={{ color: 'var(--text-muted)' }}>{t.team}</th>
                <th style={{ textAlign: 'right', paddingRight: '1rem', color: 'var(--text-muted)' }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {grid.map((drv, idx) => (
                <tr 
                  key={drv.id} 
                  style={{ 
                    borderBottom: '1px solid var(--border-color-default)',
                    color: drv.isPlayer ? 'var(--green-neon)' : 'var(--text-main)',
                    fontWeight: drv.isPlayer ? 'bold' : 'normal',
                    background: drv.isPlayer ? 'rgba(0, 255, 135, 0.05)' : 'transparent'
                  }}
                >
                  <td className="text-numeric" style={{ padding: '0.6rem 1rem', fontWeight: 'bold' }}>{idx + 1}</td>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>{drv.name}</span>
                    {drv.isPlayer && <span className="synergy-badge" style={{ padding: '0.05rem 0.25rem', fontSize: '0.6rem' }}>P</span>}
                  </td>
                  <td style={{ color: drv.isPlayer ? 'var(--green-neon)' : 'var(--text-muted)' }}>{drv.teamName}</td>
                  <td className="text-numeric" style={{ textAlign: 'right', paddingRight: '1rem' }}>{drv.qScore.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="btn btn-primary" onClick={handleStartRace} style={{ alignSelf: 'center', minWidth: '200px' }}>
          <span className="btn-content">{t.gridAndRunBtn}</span>
        </button>
      </div>
    );
  };

  // Render Podium / Results
  const renderPodium = () => {
    const sorted = [...driverStates].sort((a, b) => {
      if (a.dNF && !b.dNF) return 1;
      if (!a.dNF && b.dNF) return -1;
      return a.totalTime - b.totalTime;
    });

    const podium = sorted.slice(0, 3);
    const player1 = sorted.find(d => d.id === 'player_d1');
    const player2 = sorted.find(d => d.id === 'player_d2');

    return (
      <div className="panel animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ textAlign: 'center' }}>
          <span className="text-numeric" style={{ color: 'var(--green-neon)', fontSize: '0.9rem', letterSpacing: '1.5px' }}>{t.checkeredFlag}</span>
          <h2 className="text-numeric" style={{ color: 'var(--text-bright)', fontSize: '2.2rem', marginTop: '0.2rem' }}>{t.raceResult}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t.stageCompleted.replace('{name}', track.name).replace('{country}', track.country)}</p>
        </div>

        {/* Podium Visual */}
        <div className="podium-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '1.5rem', margin: '1rem 0' }}>
          {podium[1] && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '0.5rem', maxWidth: '100px' }}>{podium[1].name}</div>
              <div style={{
                background: 'linear-gradient(to top, #6c757d, #adb5bd)',
                width: '70px',
                height: '80px',
                borderTopLeftRadius: '6px',
                borderTopRightRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
              }}>
                <span className="text-numeric" style={{ fontSize: '1.8rem', fontWeight: 900, color: '#000' }}>2</span>
              </div>
            </div>
          )}

          {podium[0] && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span className="synergy-badge" style={{ fontSize: '0.65rem', marginBottom: '0.4rem', padding: '0.1rem 0.4rem' }}>{lang === 'pt' ? 'VENCEDOR' : 'WINNER'}</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--yellow-neon)', textAlign: 'center', marginBottom: '0.5rem', maxWidth: '110px' }}>{podium[0].name}</div>
              <div style={{
                background: 'linear-gradient(to top, #9a780b, #d4af37)',
                width: '85px',
                height: '110px',
                borderTopLeftRadius: '6px',
                borderTopRightRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)'
              }}>
                <span className="text-numeric" style={{ fontSize: '2.5rem', fontWeight: 900, color: '#000' }}>1</span>
              </div>
            </div>
          )}

          {podium[2] && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '0.5rem', maxWidth: '100px' }}>{podium[2].name}</div>
              <div style={{
                background: 'linear-gradient(to top, #704214, #cd7f32)',
                width: '70px',
                height: '60px',
                borderTopLeftRadius: '6px',
                borderTopRightRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
              }}>
                <span className="text-numeric" style={{ fontSize: '1.8rem', fontWeight: 900, color: '#000' }}>3</span>
              </div>
            </div>
          )}
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--border-color-default)',
          borderRadius: '8px',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <h4 style={{ color: 'var(--green-neon)', fontSize: '0.95rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            {t.teamPerformance}
          </h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-card-desc)' }}>
            {player1.name}:{' '}
            <strong>
              {player1.dNF ? `${t.outOfRace} (${player1.dnfReason})` : `P${player1.pos}`}
            </strong>{' '}
            | {player2.name}:{' '}
            <strong>
              {player2.dNF ? `${t.outOfRace} (${player2.dnfReason})` : `P${player2.pos}`}
            </strong>
          </p>
        </div>

        <div className="custom-scroll" style={{ maxHeight: '250px', border: '1px solid var(--border-color-default)', borderRadius: '8px', overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '500px', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color-default)', color: 'var(--text-muted)', textAlign: 'left', background: 'var(--bg-qualifying-header)' }}>
                <th style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)' }}>{t.pos}</th>
                <th style={{ color: 'var(--text-muted)' }}>{t.driver}</th>
                <th style={{ color: 'var(--text-muted)' }}>{t.team}</th>
                <th style={{ textAlign: 'right', paddingRight: '1rem', color: 'var(--text-muted)' }}>{t.timeStatus}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((drv, idx) => (
                <tr 
                  key={drv.id} 
                  style={{ 
                    borderBottom: '1px solid var(--border-color-default)',
                    color: drv.isPlayer ? 'var(--green-neon)' : 'var(--text-main)',
                    background: drv.isPlayer ? 'rgba(0, 255, 135, 0.05)' : 'transparent'
                  }}
                >
                  <td className="text-numeric" style={{ padding: '0.5rem 1rem', fontWeight: 'bold' }}>{idx + 1}</td>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>{drv.name}</span>
                    {drv.isPlayer && <span className="synergy-badge" style={{ padding: '0.05rem 0.25rem', fontSize: '0.6rem' }}>P</span>}
                  </td>
                  <td style={{ color: drv.isPlayer ? 'var(--green-neon)' : 'var(--text-muted)' }}>{drv.teamName}</td>
                  <td className="text-numeric" style={{ textAlign: 'right', paddingRight: '1rem' }}>
                    {drv.dNF ? (
                      <span style={{ color: 'var(--f1-red)', fontSize: '0.75rem' }}>DNF ({drv.dnfReason})</span>
                    ) : idx === 0 ? (
                      lang === 'pt' ? 'VENCEDOR' : 'WINNER'
                    ) : (
                      `+${(drv.totalTime - sorted[0].totalTime).toFixed(2)}s`
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="btn btn-primary" onClick={handleQuickFinish} style={{ alignSelf: 'center', minWidth: '220px' }}>
          <span className="btn-content">{t.backToChampionship}</span>
        </button>
      </div>
    );
  };

  // Render Interactive Sim Interface (3-Column Layout with Pit Wall Radio walkie-talkie aesthetic!)
  const renderInteractiveRace = () => {
    const orderedDrivers = [...driverStates].sort((a, b) => a.pos - b.pos);
    const player1 = driverStates.find(d => d.id === 'player_d1');
    const player2 = driverStates.find(d => d.id === 'player_d2');

    return (
      <div className="container animate-fadeIn" style={{ padding: 0, maxWidth: '1240px' }}>
        {/* Info header */}
        <div className="sim-header-container">
          <div>
            <h2 className="text-numeric" style={{ fontSize: '1.4rem', color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span>{lang === 'pt' ? `GP DO ${track.country.toUpperCase()}` : `${(nationalityMap[track.country] || track.country).toUpperCase()} GP`}</span>
              {weather === 'chuva' ? (
                <span className="pulse-effect" style={{ fontSize: '0.9rem', background: 'var(--blue-neon)', color: '#000', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>{lang === 'pt' ? 'CHUVA' : 'RAIN'}</span>
              ) : (
                <span style={{ fontSize: '0.9rem', background: 'var(--yellow-neon)', color: '#000', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>{lang === 'pt' ? 'SECO' : 'DRY'}</span>
              )}

              {safetyCarStatus === 'sc' && (
                <span className="flash-effect" style={{ fontSize: '0.9rem', background: 'var(--f1-red)', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>SAFETY CAR</span>
              )}
              {safetyCarStatus === 'vsc' && (
                <span className="flash-effect" style={{ fontSize: '0.9rem', background: 'var(--yellow-neon)', color: '#000', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>VSC</span>
              )}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.1rem' }}>
              {lang === 'pt' ? 'Circuito:' : 'Circuit:'} <strong style={{ color: 'var(--text-bright)' }}>{track.name}</strong> • {lang === 'pt' ? 'Volta' : 'Lap'} <strong className="text-numeric" style={{ color: 'var(--f1-red)', fontSize: '0.95rem' }}>{currentLap}</strong> {lang === 'pt' ? 'de' : 'of'} {totalLaps}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'right', marginRight: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button 
                  className={`btn ${isPlaying ? 'btn-danger' : 'btn-primary'}`} 
                  onClick={togglePlay}
                  style={{ minWidth: '140px', padding: '0.5rem 1rem', fontSize: '0.8rem', height: '42px' }}
                >
                  <span className="btn-content">{isPlaying ? t.pauseBtn : t.autoplayBtn}</span>
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={runInteractiveLap}
                  disabled={isPlaying}
                  style={{ minWidth: '160px', padding: '0.5rem 1rem', fontSize: '0.8rem', height: '42px' }}
                >
                  <span className="btn-content" style={{ display: 'flex', flexDirection: 'column', gap: '2px', lineHeight: 1.1 }}>
                    <span>{t.nextLapBtn}</span>
                    {!isPlaying && (
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 'normal', textTransform: 'none' }}>
                        [Espaço / Enter]
                      </span>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Column Grid for Positions, Radio/Telemetry, and Controls */}
        <div className="sim-grid">
          {/* COLUMN 1: Live Positions */}
          <div className="panel sim-col-1" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 className="text-numeric" style={{ fontSize: '0.95rem', color: 'var(--text-bright)', borderBottom: '1px solid var(--border-color-default)', paddingBottom: '0.5rem' }}>
              {t.gridPositions}
            </h3>

            {/* Progress tracks for top cars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', background: 'var(--bg-qualifying-header)', padding: '0.75rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>{t.trackPositions}</div>
              {orderedDrivers.slice(0, 5).map(drv => (
                <div key={drv.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', minWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{drv.name.split(' ')[1] || drv.name}</span>
                  <div className="race-progress-bar">
                    {!drv.dNF && (
                      <div 
                        className={`car-indicator ${drv.isPlayer ? 'player' : ''}`}
                        style={{ left: `${(drv.pos === 1 ? 95 : 95 - (drv.pos * 5.2))}%` }}
                      >
                        {drv.pos}
                      </div>
                    )}
                    {drv.dNF && (
                      <div style={{ color: 'var(--f1-red)', fontSize: '0.7rem', paddingLeft: '1rem', lineHeight: '20px', fontWeight: 'bold' }}>
                        DNF
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {player1 && player1.pos > 5 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', minWidth: '80px', color: 'var(--green-neon)', fontWeight: 'bold' }}>{player1.name.split(' ')[1]}</span>
                  <div className="race-progress-bar">
                    {!player1.dNF && (
                      <div 
                        className="car-indicator player"
                        style={{ left: `${(95 - (player1.pos * 5.2))}%` }}
                      >
                        {player1.pos}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {player2 && player2.pos > 5 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', minWidth: '80px', color: 'var(--green-neon)', fontWeight: 'bold' }}>{player2.name.split(' ')[1]}</span>
                  <div className="race-progress-bar">
                    {!player2.dNF && (
                      <div 
                        className="car-indicator player"
                        style={{ left: `${(95 - (player2.pos * 5.2))}%` }}
                      >
                        {player2.pos}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Complete classification table */}
            <div className="custom-scroll" style={{ flex: 1, maxHeight: '250px', overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '450px', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color-default)', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th style={{ color: 'var(--text-muted)' }}>{t.pos}</th>
                    <th style={{ color: 'var(--text-muted)' }}>{t.driver}</th>
                    <th style={{ color: 'var(--text-muted)' }}>{t.tyre}</th>
                    <th style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{t.wear}</th>
                    <th style={{ textAlign: 'right', paddingRight: '0.5rem', color: 'var(--text-muted)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orderedDrivers.map(drv => (
                    <tr 
                      key={drv.id} 
                      style={{ 
                        borderBottom: '1px solid var(--border-color-default)',
                        color: drv.isPlayer ? 'var(--green-neon)' : 'var(--text-main)',
                        fontWeight: drv.isPlayer ? 'bold' : 'normal',
                        background: drv.isPlayer ? 'rgba(0, 255, 135, 0.04)' : 'transparent'
                      }}
                    >
                      <td className="text-numeric">{drv.pos}</td>
                      <td>{drv.name}</td>
                      <td>
                        <span style={{
                          background: drv.tyre === 'S' ? 'var(--f1-red)' : drv.tyre === 'M' ? 'var(--yellow-neon)' : drv.tyre === 'H' ? '#fff' : 'var(--blue-neon)',
                          color: drv.tyre === 'H' || drv.tyre === 'M' ? '#000' : '#fff',
                          padding: '0.1rem 0.3rem',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 'bold'
                        }}>
                          {drv.tyre}
                        </span>
                      </td>
                      <td className="text-numeric" style={{ textAlign: 'right' }}>
                        {!drv.dNF ? `${drv.tyreWear.toFixed(0)}%` : '—'}
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: '0.5rem' }}>
                        {drv.dNF ? (
                          <span style={{ color: 'var(--f1-red)', fontSize: '0.7rem' }}>DNF</span>
                        ) : drv.pos === 1 ? (
                          t.leader
                        ) : (
                          t.active
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* COLUMN 2: Beautiful Pit Wall Radio Walkie-Talkie UI (Requested / Redesigned!) */}
          <div className="panel sim-col-2" style={{ 
            position: 'relative',
            border: '2px solid #282f3d',
            borderTop: '6px solid var(--f1-red)', 
            background: 'linear-gradient(to bottom, #11141c, #0a0b0f)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
          }}>
            {/* Walkie-Talkie Antenna Stick effect */}
            <div style={{
              position: 'absolute',
              top: '-45px',
              left: '20px',
              width: '12px',
              height: '40px',
              background: '#202632',
              borderRadius: '4px 4px 0 0',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 -2px 10px rgba(0,0,0,0.5)'
            }} />
            
            {/* Volume Knobs effect */}
            <div style={{
              position: 'absolute',
              top: '-12px',
              right: '30px',
              width: '24px',
              height: '8px',
              background: '#343a40',
              borderRadius: '3px 3px 0 0',
              border: '1px solid rgba(255,255,255,0.1)'
            }} />
            <div style={{
              position: 'absolute',
              top: '-12px',
              right: '65px',
              width: '18px',
              height: '8px',
              background: '#343a40',
              borderRadius: '3px 3px 0 0',
              border: '1px solid rgba(255,255,255,0.1)'
            }} />

            {/* Radio status banner */}
            <div>
              <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <span className="text-numeric" style={{ fontSize: '0.8rem', color: '#ff1801', fontWeight: 900, letterSpacing: '1px' }}>
                  PIT WALL RADIO
                </span>
                
                {/* Pulsing signal LED */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sinal</span>
                  <div 
                    className={isPlaying ? 'flash-effect' : ''} 
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: safetyCarStatus !== 'none' ? 'var(--yellow-neon)' : isPlaying ? 'var(--green-neon)' : '#ff4a4a',
                      boxShadow: `0 0 10px ${safetyCarStatus !== 'none' ? 'var(--yellow-neon)' : isPlaying ? 'var(--green-neon)' : '#ff4a4a'}`
                    }}
                  />
                </div>
              </div>
              
              {/* Speaker Grille dots pattern */}
              <div style={{
                height: '35px',
                width: '100%',
                background: 'radial-gradient(circle, #252b36 20%, transparent 20%)',
                backgroundSize: '8px 8px',
                borderRadius: '6px',
                marginBottom: '1rem',
                opacity: 0.6
              }} />
            </div>

            {/* walkie talkie messages feed */}
            <div 
              className="custom-scroll" 
              style={{ 
                background: '#040508', 
                border: '2px solid #1a202c',
                borderRadius: '8px',
                padding: '0.8rem 1rem',
                fontSize: '0.82rem',
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                boxShadow: 'inset 0 4px 15px rgba(0,0,0,0.9)',
                fontFamily: 'monospace',
                maxHeight: '340px'
              }}
            >
              {log.map((line, idx) => {
                const translatedLine = translateLogLine(line, lang);
                let color = '#d2d6dd';
                let weight = 'normal';

                if (translatedLine.includes('[REGIME DE SC]') || translatedLine.includes('[SAFETY CAR STATE]') || translatedLine.includes('VSC') || translatedLine.includes('SAFETY CAR')) {
                  color = '#ffca00';
                  weight = 'bold';
                } else if (translatedLine.includes('[CLIMA: CHUVA]') || translatedLine.includes('[WEATHER: RAIN]') || translatedLine.includes('RAIN') || translatedLine.includes('CHOVER')) {
                  color = '#00f0ff';
                  weight = 'bold';
                } else if (translatedLine.includes('[INCIDENT]') || translatedLine.includes('[INCIDENTE]') || translatedLine.includes('[ENGINE BLOW]') || translatedLine.includes('[QUEBRA]') || translatedLine.includes('Abandono') || translatedLine.includes('Retirement') || translatedLine.includes('OUT') || translatedLine.includes('DNF')) {
                  color = 'var(--f1-red)';
                  weight = 'bold';
                } else if (translatedLine.includes('[BOX]') || translatedLine.includes('[RADIO: BOX]') || translatedLine.includes('Pitstop') || translatedLine.includes('BOX')) {
                  color = '#00ff87';
                } else if (translatedLine.includes('[CRONÔMETRO]') || translatedLine.includes('[LAP TIMING]')) {
                  color = '#ffffff';
                  weight = 'bold';
                } else if (translatedLine.includes('[AVISO]') || translatedLine.includes('[WARNING]') || translatedLine.includes('OVERHEATING') || translatedLine.includes('SUPERAQUECENDO')) {
                  color = '#ff6c00';
                  weight = 'bold';
                }

                return (
                  <div key={idx} style={{ color, fontWeight: weight, display: 'flex', gap: '0.4rem', lineHeight: 1.25 }}>
                    <span style={{ color: 'rgba(255,255,255,0.15)' }}>&gt;</span>
                    <span>{translatedLine}</span>
                  </div>
                );
              })}
              <div ref={radioLogEndRef} />
            </div>

            {/* Help guidelines at the bottom of the radio */}
            <div style={{ 
              marginTop: '1rem', 
              paddingTop: '0.8rem', 
              borderTop: '1px solid var(--border-color-default)',
              fontSize: '0.72rem', 
              color: 'var(--text-muted)',
              textAlign: 'center',
              lineHeight: '1.3'
            }}>
              <span>
                {lang === 'pt' ? (
                  <>Pressione <strong>Espaço</strong> ou <strong>Enter</strong> na pista seca para simular o próximo giro de cronômetro.</>
                ) : (
                  <>Press <strong>Space</strong> or <strong>Enter</strong> on dry track to simulate the next lap timer.</>
                )}
              </span>
            </div>
          </div>

          {/* COLUMN 3: Player Controls & Tire wear */}
          <div className="sim-col-3" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Driver 1 Controller */}
            {player1 && !player1.dNF ? (
              <div className="panel" style={{ 
                borderLeft: '4px solid var(--green-neon)', 
                padding: '1.1rem',
                boxShadow: d1Overheating ? '0 0 15px rgba(255, 108, 0, 0.2)' : 'none',
                borderColor: d1Overheating ? '#ff6c00' : 'var(--green-neon)',
                flex: 1
              }}>
                <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <h4 style={{ color: 'var(--text-bright)', fontSize: '0.95rem', fontWeight: 'bold' }}>
                    {player1.name}
                  </h4>
                  <span className="text-numeric" style={{ 
                    fontSize: '1rem', 
                    color: 'var(--yellow-neon)', 
                    fontWeight: 'bold', 
                    background: 'rgba(0,0,0,0.1)', 
                    padding: '0.15rem 0.4rem',
                    borderRadius: '5px'
                  }}>
                    P{player1.pos}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                  <span>{t.tyre}: <strong style={{ color: 'var(--text-bright)' }}>{player1.tyre}</strong> ({player1.tyreWear.toFixed(0)}% {t.wear.toLowerCase()})</span>
                  <span>{lang === 'pt' ? 'Modo' : 'Mode'}: <strong style={{ color: 'var(--text-bright)' }}>{player1.posture === 'aggressive' ? t.aggressive : player1.posture === 'conservative' ? t.conservative : t.balanced}</strong></span>
                </div>

                {d1Overheating && (
                  <div className="flash-effect" style={{ color: '#ff6c00', fontSize: '0.72rem', fontWeight: 'bold', marginBottom: '0.4rem' }}>
                    {t.overheatingAlert}
                  </div>
                )}

                {/* Posture select */}
                <div style={{ marginBottom: '0.8rem' }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>{t.postureLabel}</label>
                  <div style={{ display: 'flex', gap: '0.2rem' }}>
                    <button 
                      className={`btn ${d1Posture === 'aggressive' ? 'btn-danger' : 'btn-secondary'}`}
                      style={{ flex: 1, padding: '0.4rem 0.2rem', fontSize: '0.75rem', fontFamily: 'var(--font-f1-body)', letterSpacing: 'normal' }}
                      onClick={() => setD1Posture('aggressive')}
                    >
                      <span className="btn-content">{t.aggressive}</span>
                    </button>
                    <button 
                      className={`btn ${d1Posture === 'balanced' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1, padding: '0.4rem 0.2rem', fontSize: '0.75rem', fontFamily: 'var(--font-f1-body)', letterSpacing: 'normal' }}
                      onClick={() => setD1Posture('balanced')}
                    >
                      <span className="btn-content">{t.balanced}</span>
                    </button>
                    <button 
                      className={`btn ${d1Posture === 'conservative' ? 'btn-secondary' : 'btn-secondary'}`}
                      style={{ 
                        flex: 1, 
                        padding: '0.4rem 0.2rem', 
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-f1-body)',
                        letterSpacing: 'normal',
                        borderColor: d1Posture === 'conservative' ? 'var(--blue-neon)' : 'var(--border-color-default)',
                        color: d1Posture === 'conservative' ? 'var(--blue-neon)' : 'var(--text-main)',
                        background: d1Posture === 'conservative' ? 'rgba(0, 240, 255, 0.05)' : 'transparent'
                      }}
                      onClick={() => setD1Posture('conservative')}
                    >
                      <span className="btn-content">{t.conservative}</span>
                    </button>
                  </div>
                </div>

                {/* Pitstop setup */}
                <div style={{ background: 'var(--bg-qualifying-header)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color-default)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 'bold', color: d1PitRequest ? 'var(--green-neon)' : 'var(--text-main)' }}>Chamar Box nesta Volta</span>
                    <input 
                      type="checkbox" 
                      checked={d1PitRequest}
                      onChange={(e) => setD1PitRequest(e.target.checked)}
                      style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                    />
                  </div>
                  
                  {d1PitRequest && (
                    <div style={{ marginTop: '0.4rem' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.15rem' }}>Pneu p/ próxima perna:</span>
                      <div style={{ display: 'flex', gap: '0.2rem' }}>
                        {['S', 'M', 'H', 'W'].map(t => (
                          <button 
                            key={t}
                            onClick={() => setD1SelectedNextTyre(t)}
                            style={{
                              flex: 1,
                              padding: '0.2rem',
                              fontSize: '0.72rem',
                              fontWeight: 'bold',
                              background: d1SelectedNextTyre === t ? 'var(--f1-red)' : 'var(--bg-card)',
                              border: '1px solid var(--border-color-default)',
                              color: d1SelectedNextTyre === t ? '#fff' : 'var(--text-main)',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="panel" style={{ opacity: 0.5, borderLeft: '4px solid var(--f1-red)', flex: 1 }}>
                <h4 style={{ color: 'var(--f1-red)', fontSize: '0.95rem' }}>
                  {player1?.name} — DNF ({lang === 'pt' ? 'Abandono' : 'Retirement'})
                </h4>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{lang === 'pt' ? 'Razão' : 'Reason'}: {player1?.dnfReason}</p>
              </div>
            )}

            {/* Driver 2 Controller */}
            {player2 && !player2.dNF ? (
              <div className="panel" style={{ 
                borderLeft: '4px solid var(--green-neon)', 
                padding: '1.1rem',
                boxShadow: d2Overheating ? '0 0 15px rgba(255, 108, 0, 0.2)' : 'none',
                borderColor: d2Overheating ? '#ff6c00' : 'var(--green-neon)',
                flex: 1
              }}>
                <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <h4 style={{ color: 'var(--text-bright)', fontSize: '0.95rem', fontWeight: 'bold' }}>
                    {player2.name}
                  </h4>
                  <span className="text-numeric" style={{ 
                    fontSize: '1rem', 
                    color: 'var(--yellow-neon)', 
                    fontWeight: 'bold', 
                    background: 'rgba(0,0,0,0.1)', 
                    padding: '0.15rem 0.4rem',
                    borderRadius: '5px'
                  }}>
                    P{player2.pos}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                  <span>{t.tyre}: <strong style={{ color: 'var(--text-bright)' }}>{player2.tyre}</strong> ({player2.tyreWear.toFixed(0)}% {t.wear.toLowerCase()})</span>
                  <span>{lang === 'pt' ? 'Modo' : 'Mode'}: <strong style={{ color: 'var(--text-bright)' }}>{player2.posture === 'aggressive' ? t.aggressive : player2.posture === 'conservative' ? t.conservative : t.balanced}</strong></span>
                </div>

                {d2Overheating && (
                  <div className="flash-effect" style={{ color: '#ff6c00', fontSize: '0.72rem', fontWeight: 'bold', marginBottom: '0.4rem' }}>
                    {t.overheatingAlert}
                  </div>
                )}

                {/* Posture select */}
                <div style={{ marginBottom: '0.8rem' }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>{t.postureLabel}</label>
                  <div style={{ display: 'flex', gap: '0.2rem' }}>
                    <button 
                      className={`btn ${d2Posture === 'aggressive' ? 'btn-danger' : 'btn-secondary'}`}
                      style={{ flex: 1, padding: '0.4rem 0.2rem', fontSize: '0.75rem', fontFamily: 'var(--font-f1-body)', letterSpacing: 'normal' }}
                      onClick={() => setD2Posture('aggressive')}
                    >
                      <span className="btn-content">{t.aggressive}</span>
                    </button>
                    <button 
                      className={`btn ${d2Posture === 'balanced' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1, padding: '0.4rem 0.2rem', fontSize: '0.75rem', fontFamily: 'var(--font-f1-body)', letterSpacing: 'normal' }}
                      onClick={() => setD2Posture('balanced')}
                    >
                      <span className="btn-content">{t.balanced}</span>
                    </button>
                    <button 
                      className={`btn ${d2Posture === 'conservative' ? 'btn-secondary' : 'btn-secondary'}`}
                      style={{ 
                        flex: 1, 
                        padding: '0.4rem 0.2rem', 
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-f1-body)',
                        letterSpacing: 'normal',
                        borderColor: d2Posture === 'conservative' ? 'var(--blue-neon)' : 'var(--border-color-default)',
                        color: d2Posture === 'conservative' ? 'var(--blue-neon)' : 'var(--text-main)',
                        background: d2Posture === 'conservative' ? 'rgba(0, 240, 255, 0.05)' : 'transparent'
                      }}
                      onClick={() => setD2Posture('conservative')}
                    >
                      <span className="btn-content">{t.conservative}</span>
                    </button>
                  </div>
                </div>

                {/* Pitstop setup */}
                <div style={{ background: 'var(--bg-qualifying-header)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color-default)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 'bold', color: d2PitRequest ? 'var(--green-neon)' : 'var(--text-main)' }}>Chamar Box nesta Volta</span>
                    <input 
                      type="checkbox" 
                      checked={d2PitRequest}
                      onChange={(e) => setD2PitRequest(e.target.checked)}
                      style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                    />
                  </div>
                  
                  {d2PitRequest && (
                    <div style={{ marginTop: '0.4rem' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.15rem' }}>Pneu p/ próxima perna:</span>
                      <div style={{ display: 'flex', gap: '0.2rem' }}>
                        {['S', 'M', 'H', 'W'].map(t => (
                          <button 
                            key={t}
                            onClick={() => setD2SelectedNextTyre(t)}
                            style={{
                              flex: 1,
                              padding: '0.2rem',
                              fontSize: '0.72rem',
                              fontWeight: 'bold',
                              background: d2SelectedNextTyre === t ? 'var(--f1-red)' : 'var(--bg-card)',
                              border: '1px solid var(--border-color-default)',
                              color: d2SelectedNextTyre === t ? '#fff' : 'var(--text-main)',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="panel" style={{ opacity: 0.5, borderLeft: '4px solid var(--f1-red)', flex: 1 }}>
                <h4 style={{ color: 'var(--f1-red)', fontSize: '0.95rem' }}>
                  {player2?.name} — DNF ({lang === 'pt' ? 'Abandono' : 'Retirement'})
                </h4>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{lang === 'pt' ? 'Razão' : 'Reason'}: {player2?.dnfReason}</p>
              </div>
            )}
          </div>
        </div>

        {/* Full-Screen Critical Event Notification Modal */}
        {activeAlert && (
          <div className="modal-overlay">
            <div className="modal-content animate-fadeIn" style={{ 
              maxWidth: '500px', 
              border: `2px solid ${
                activeAlert.type === 'dnf' || activeAlert.type === 'puncture' ? 'var(--f1-red)' :
                activeAlert.type === 'engine' ? '#ff6c00' :
                activeAlert.type === 'rain' ? 'var(--blue-neon)' : 'var(--yellow-neon)'
              }`,
              boxShadow: '0 0 30px rgba(0,0,0,0.9)'
            }}>
              <h2 className="text-numeric" style={{ 
                color: activeAlert.type === 'dnf' || activeAlert.type === 'puncture' ? 'var(--f1-red)' :
                       activeAlert.type === 'engine' ? '#ff6c00' :
                       activeAlert.type === 'rain' ? 'var(--blue-neon)' : 'var(--yellow-neon)',
                fontSize: '1.6rem',
                fontWeight: 900,
                textAlign: 'center',
                marginBottom: '1rem'
              }}>
                {activeAlert.title}
              </h2>
              
              <p style={{ 
                color: 'var(--text-bright)', 
                fontSize: '0.95rem', 
                lineHeight: 1.5, 
                textAlign: 'center',
                marginBottom: '1.5rem' 
              }}>
                {activeAlert.message}
              </p>
              
              <div style={{ textAlign: 'center' }}>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setActiveAlert(null);
                  }}
                  style={{ minWidth: '150px' }}
                >
                  {t.adjustStrategy}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render view router based on simulation phase
  const renderPhaseView = () => {
    switch(phase) {
      case 'lights':
        return renderLights();
      case 'qualifying':
        return renderQualifying();
      case 'race':
        if (interactive) {
          return renderInteractiveRace();
        }
        return null;
      case 'podium':
        return renderPodium();
      default:
        return null;
    }
  };

  return (
    <div className="container">
      {renderPhaseView()}
    </div>
  );
}
export { AI_GRID };
