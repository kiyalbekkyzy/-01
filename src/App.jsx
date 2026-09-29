import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Trophy, Heart, Zap, Sparkles, Award } from 'lucide-react';

// Web Audio API Synthesizer for retro cartoon sound effects
class SoundEffects {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playStretch() {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {
      console.error(e);
    }
  }

  playShoot() {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(480, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {
      console.error(e);
    }
  }

  playHit() {
    if (this.muted || !this.ctx) return;
    try {
      // Cartoonish pop sound
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(850, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {
      console.error(e);
    }
  }

  playBonus() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.25, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.12);
      });
    } catch (e) {
      console.error(e);
    }
  }

  playMiss() {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch (e) {
      console.error(e);
    }
  }

  playGameOver() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [300, 260, 220, 150];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);

        gain.gain.setValueAtTime(0.25, now + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.15 + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.2);
      });
    } catch (e) {
      console.error(e);
    }
  }
}

const sounds = new SoundEffects();

// Bird Types Configuration
const BIRD_TYPES = [
  { type: 'NORMAL', emoji: '🐥', points: 1, speedMult: 1.0, size: 42, color: '#facc15', label: 'Цыпа' },
  { type: 'FAST', emoji: '🐔', points: 2, speedMult: 1.6, size: 46, color: '#f97316', label: 'Курица' },
  { type: 'SUPER', emoji: '🐓', points: 3, speedMult: 2.3, size: 50, color: '#ef4444', label: 'Петух' },
  { type: 'BONUS', emoji: '🦆', points: 5, speedMult: 1.4, size: 44, color: '#3b82f6', isBonus: true, label: 'Утка' },
];

export default function App() {
  // Game states
  const [gameState, setGameState] = useState('START'); // START, PLAYING, GAMEOVER
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('slingshot_chick_highscore') || '0', 10);
  });
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [combo, setCombo] = useState(0);

  // References
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const lastTimeRef = useRef(0);
  const spawnTimerRef = useRef(0);

  // Slingshot State
  const slingPos = useRef({ x: 0, y: 0 });
  const pullPos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const maxPullRadiusRef = useRef(150);
  const MAX_POWER = 27; // launch speed at full draw, independent of screen size

  // Game Objects
  const birds = useRef([]);
  const stones = useRef([]);
  const particles = useRef([]);
  const floatingTexts = useRef([]);
  const clouds = useRef([]);

  // Resize and Canvas Setup
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      // Raised up from the very bottom edge — much easier to reach and pull back
      slingPos.current = { x: canvas.width / 2, y: canvas.height * 0.66 };
      // Pull radius scales with screen size, so the draw feels the same on phone and desktop
      const minDim = Math.min(canvas.width, canvas.height);
      maxPullRadiusRef.current = Math.max(130, Math.min(220, minDim * 0.32));
      if (!isDragging.current) {
        pullPos.current = { ...slingPos.current };
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Initialize decorative clouds
    clouds.current = Array.from({ length: 5 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * (window.innerHeight * 0.35),
      speed: 0.2 + Math.random() * 0.4,
      scale: 0.6 + Math.random() * 0.6,
    }));

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync mute state
  useEffect(() => {
    sounds.muted = isMuted;
  }, [isMuted]);

  const startGame = () => {
    sounds.init();
    setGameState('PLAYING');
    setScore(0);
    setLives(3);
    setLevel(1);
    setCombo(0);
    birds.current = [];
    stones.current = [];
    particles.current = [];
    floatingTexts.current = [];
    spawnTimerRef.current = 0;
  };

  const spawnBird = (width, height) => {
    // Choose bird type based on probability
    const rand = Math.random();
    let typeConfig = BIRD_TYPES[0]; // Normal

    if (rand > 0.90) {
      typeConfig = BIRD_TYPES[3]; // Bonus Duck (10% chance)
    } else if (rand > 0.70) {
      typeConfig = BIRD_TYPES[2]; // Super Rooster (20% chance)
    } else if (rand > 0.40) {
      typeConfig = BIRD_TYPES[1]; // Fast Hen (30% chance)
    }

    const direction = Math.random() > 0.5 ? 1 : -1;
    const startX = direction === 1 ? -60 : width + 60;
    // Vary heights in upper 45% of screen
    const minY = 60;
    const maxY = height * 0.45;
    const startY = minY + Math.random() * (maxY - minY);

    // Reduced base speed and level scaling for much slower and easier targets
    const baseSpeed = (1.1 + level * 0.15) * typeConfig.speedMult;
    const vx = direction * baseSpeed;

    // Gentle wave motion for super rooster
    const waveAmp = typeConfig.type === 'SUPER' ? 1.0 + Math.random() * 1.2 : 0;
    const waveFreq = 0.03 + Math.random() * 0.03;

    birds.current.push({
      id: Math.random(),
      x: startX,
      y: startY,
      initialY: startY,
      vx,
      vy: 0,
      waveAmp,
      waveFreq,
      waveTime: Math.random() * 100,
      radius: typeConfig.size / 2,
      ...typeConfig,
    });
  };

  const createExplosion = (x, y, color, count = 16) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      particles.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 5,
        color,
        alpha: 1,
        life: 1,
        decay: 0.02 + Math.random() * 0.03,
      });
    }
  };

  const addFloatingText = (text, x, y, color = '#fef08a') => {
    floatingTexts.current.push({
      text,
      x,
      y,
      color,
      alpha: 1,
      vy: -1.8,
    });
  };

  const getEventPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  // Clamp the pull point to the max draw radius around the slingshot
  const updatePull = (pos) => {
    const dx = pos.x - slingPos.current.x;
    const dy = pos.y - slingPos.current.y;
    const dist = Math.hypot(dx, dy);
    const maxR = maxPullRadiusRef.current;

    if (dist > maxR) {
      const angle = Math.atan2(dy, dx);
      pullPos.current = {
        x: slingPos.current.x + Math.cos(angle) * maxR,
        y: slingPos.current.y + Math.sin(angle) * maxR,
      };
    } else {
      pullPos.current = pos;
    }
  };

  const handlePointerDown = (e) => {
    if (gameState !== 'PLAYING') return;
    sounds.init();
    // Grab from ANYWHERE on screen — no need to precisely hit the tiny pouch.
    // The pouch snaps toward your finger/cursor, clamped to the max draw radius.
    isDragging.current = true;
    updatePull(getEventPos(e));
    sounds.playStretch();
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    updatePull(getEventPos(e));
  };

  const handlePointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    // Calculate launch velocity vector (opposite direction of pull)
    const dx = slingPos.current.x - pullPos.current.x;
    const dy = slingPos.current.y - pullPos.current.y;
    const dist = Math.hypot(dx, dy);
    const maxR = maxPullRadiusRef.current;

    // Release elastic back to origin
    pullPos.current = { ...slingPos.current };

    if (dist > 15) {
      sounds.playShoot();
      // Power scales from 0 to MAX_POWER based on how far of the max draw you used —
      // consistent launch strength no matter the screen size.
      const power = (Math.min(dist, maxR) / maxR) * MAX_POWER;
      const angle = Math.atan2(dy, dx);

      stones.current.push({
        x: slingPos.current.x,
        y: slingPos.current.y,
        vx: Math.cos(angle) * power,
        vy: Math.sin(angle) * power,
        radius: 12,
        gravity: 0.34,
        active: true,
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const updateAndRender = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = timestamp;

      const width = canvas.width;
      const height = canvas.height;

      // --- CLEAR CANVAS & DRAW BACKGROUND ---
      ctx.clearRect(0, 0, width, height);

      // Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#7dd3fc');
      skyGrad.addColorStop(0.65, '#bae6fd');
      skyGrad.addColorStop(1, '#e0f2fe');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Sun
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(width * 0.85, 80, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(width * 0.85, 80, 36, 0, Math.PI * 2);
      ctx.fill();

      // Clouds
      clouds.current.forEach((cloud) => {
        cloud.x += cloud.speed;
        if (cloud.x > width + 100) cloud.x = -100;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, 25 * cloud.scale, 0, Math.PI * 2);
        ctx.arc(cloud.x + 20 * cloud.scale, cloud.y - 10 * cloud.scale, 30 * cloud.scale, 0, Math.PI * 2);
        ctx.arc(cloud.x + 45 * cloud.scale, cloud.y, 22 * cloud.scale, 0, Math.PI * 2);
        ctx.fill();
      });

      // Distant Hills
      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.ellipse(width * 0.25, height, width * 0.4, 180, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.ellipse(width * 0.75, height, width * 0.5, 200, 0, 0, Math.PI * 2);
      ctx.fill();

      // Foreground Grass Field
      const grassGrad = ctx.createLinearGradient(0, height - 120, 0, height);
      grassGrad.addColorStop(0, '#22c55e');
      grassGrad.addColorStop(1, '#15803d');
      ctx.fillStyle = grassGrad;
      ctx.fillRect(0, height - 100, width, 100);

      // --- GAMEPLAY LOGIC (When active) ---
      if (gameState === 'PLAYING') {
        // Spawn birds timer - slightly longer intervals between birds
        spawnTimerRef.current += dt;
        const currentSpawnInterval = Math.max(1.5, 3.0 - level * 0.15);
        if (spawnTimerRef.current > currentSpawnInterval) {
          spawnBird(width, height);
          spawnTimerRef.current = 0;
        }

        // 1. UPDATE & DRAW BIRDS
        for (let i = birds.current.length - 1; i >= 0; i--) {
          const bird = birds.current[i];
          bird.x += bird.vx;
          bird.waveTime += bird.waveFreq;
          bird.y = bird.initialY + Math.sin(bird.waveTime) * bird.waveAmp;

          // Render Bird Emoji with shadows
          ctx.save();
          ctx.font = `${bird.radius * 2}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Flip bird image if moving left
          if (bird.vx < 0) {
            ctx.translate(bird.x, bird.y);
            ctx.scale(-1, 1);
            ctx.fillText(bird.emoji, 0, 0);
          } else {
            ctx.fillText(bird.emoji, bird.x, bird.y);
          }
          ctx.restore();

          // Check if bird escapes off screen
          if ((bird.vx > 0 && bird.x > width + 70) || (bird.vx < 0 && bird.x < -70)) {
            birds.current.splice(i, 1);
            // Non-bonus birds lower lives when missed
            if (!bird.isBonus) {
              sounds.playMiss();
              setCombo(0);
              setLives((prev) => {
                const next = prev - 1;
                if (next <= 0) {
                  sounds.playGameOver();
                  setGameState('GAMEOVER');
                  setHighScore((curr) => {
                    const newHigh = Math.max(curr, score);
                    localStorage.setItem('slingshot_chick_highscore', newHigh.toString());
                    return newHigh;
                  });
                }
                return next;
              });
            }
          }
        }

        // 2. UPDATE & DRAW STONES
        for (let sIdx = stones.current.length - 1; sIdx >= 0; sIdx--) {
          const stone = stones.current[sIdx];
          stone.x += stone.vx;
          stone.vy += stone.gravity;
          stone.y += stone.vy;

          // Draw Stone
          ctx.save();
          ctx.fillStyle = '#64748b';
          ctx.beginPath();
          ctx.arc(stone.x, stone.y, stone.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Stone specular highlight
          ctx.fillStyle = '#94a3b8';
          ctx.beginPath();
          ctx.arc(stone.x - 3, stone.y - 3, stone.radius * 0.35, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Check collisions with birds
          let stoneHit = false;
          for (let bIdx = birds.current.length - 1; bIdx >= 0; bIdx--) {
            const bird = birds.current[bIdx];
            const dist = Math.hypot(stone.x - bird.x, stone.y - bird.y);

            if (dist < stone.radius + bird.radius) {
              stoneHit = true;

              // Hit mechanics
              createExplosion(bird.x, bird.y, bird.color, 20);

              if (bird.isBonus) {
                sounds.playBonus();
                // Random bonus: +1 life or +5 pts
                if (Math.random() > 0.5 && lives < 5) {
                  setLives((l) => l + 1);
                  addFloatingText('❤️ +1 Жизнь!', bird.x, bird.y, '#ef4444');
                } else {
                  setScore((s) => s + 5);
                  addFloatingText('+5 БОНУС!', bird.x, bird.y, '#3b82f6');
                }
              } else {
                sounds.playHit();
                const pts = bird.points;
                setScore((s) => {
                  const newScore = s + pts;
                  // Level up every 10 points
                  const nextLvl = Math.floor(newScore / 10) + 1;
                  setLevel(nextLvl);
                  return newScore;
                });
                setCombo((c) => c + 1);

                addFloatingText(`+${pts}`, bird.x, bird.y, '#facc15');
              }

              birds.current.splice(bIdx, 1);
              break;
            }
          }

          // Remove stone if off-screen or hit
          if (
            stoneHit ||
            stone.x > width + 50 ||
            stone.x < -50 ||
            stone.y > height + 50
          ) {
            stones.current.splice(sIdx, 1);
          }
        }
      }

      // --- DRAW SLINGSHOT & TRAJECTORY ---
      const sX = slingPos.current.x;
      const sY = slingPos.current.y;

      // Idle hint ring — pulses around the pouch so it's obvious where/how to grab
      if (gameState === 'PLAYING' && !isDragging.current) {
        ctx.save();
        const pulse = 0.25 + Math.sin(timestamp / 280) * 0.12;
        ctx.globalAlpha = pulse;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 7]);
        ctx.beginPath();
        ctx.arc(sX, sY, 30, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Trajectory Prediction Line (while dragging)
      if (isDragging.current) {
        const dx = sX - pullPos.current.x;
        const dy = sY - pullPos.current.y;
        const maxR = maxPullRadiusRef.current;
        const power = (Math.min(Math.hypot(dx, dy), maxR) / maxR) * MAX_POWER;
        const angle = Math.atan2(dy, dx);

        let simX = sX;
        let simY = sY;
        let simVx = Math.cos(angle) * power;
        let simVy = Math.sin(angle) * power;

        ctx.save();
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(simX, simY);

        for (let step = 0; step < 26; step++) {
          simX += simVx;
          simVy += 0.34; // Gravity — matches the real stone
          simY += simVy;
          ctx.lineTo(simX, simY);
          if (simY > height + 40) break;
        }
        ctx.stroke();
        ctx.restore();
      }

      // Slingshot Back Fork
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(sX - 22, sY - 35);
      ctx.lineTo(sX, sY + 20);
      ctx.lineTo(sX + 22, sY - 35);
      ctx.stroke();

      // Slingshot Base Post
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.moveTo(sX, sY + 15);
      ctx.lineTo(sX, height - 70);
      ctx.stroke();

      // Back Elastic Band
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(sX - 22, sY - 35);
      ctx.lineTo(pullPos.current.x, pullPos.current.y);
      ctx.stroke();

      // Rock in Slingshot (if dragging or ready)
      if (gameState === 'PLAYING') {
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(pullPos.current.x, pullPos.current.y, 11, 0, Math.PI * 2);
        ctx.fill();
      }

      // Front Elastic Band
      ctx.beginPath();
      ctx.moveTo(pullPos.current.x, pullPos.current.y);
      ctx.lineTo(sX + 22, sY - 35);
      ctx.stroke();

      // --- DRAW PARTICLES ---
      for (let pIdx = particles.current.length - 1; pIdx >= 0; pIdx--) {
        const p = particles.current[pIdx];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.current.splice(pIdx, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // --- DRAW FLOATING TEXT ---
      for (let tIdx = floatingTexts.current.length - 1; tIdx >= 0; tIdx--) {
        const ft = floatingTexts.current[tIdx];
        ft.y += ft.vy;
        ft.alpha -= 0.02;

        if (ft.alpha <= 0) {
          floatingTexts.current.splice(tIdx, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.font = 'bold 24px "Fredoka", "Arial Rounded MT Bold", sans-serif';
        ctx.fillStyle = ft.color;
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText(ft.text, ft.x, ft.y);
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      requestRef.current = requestAnimationFrame(updateAndRender);
    };

    requestRef.current = requestAnimationFrame(updateAndRender);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [gameState, level, lives, score]);

  return (
    <div className="relative w-full h-screen bg-slate-900 font-sans select-none overflow-hidden">
      {/* Main Interactive Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        className="w-full h-full block cursor-crosshair touch-none"
      />

      {/* Top HUD Overlay */}
      {gameState === 'PLAYING' && (
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none">
          {/* Stats Bar */}
          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg border border-white/40">
            {/* Score */}
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500 fill-yellow-400" />
              <span className="text-2xl font-black text-amber-900">{score}</span>
            </div>

            <div className="h-6 w-px bg-slate-300" />

            {/* Level */}
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <Zap className="w-5 h-5 fill-emerald-500" />
              <span>Уровень {level}</span>
            </div>

            {combo > 1 && (
              <>
                <div className="h-6 w-px bg-slate-300" />
                <div className="flex items-center gap-1 text-orange-600 font-extrabold animate-bounce">
                  <Sparkles className="w-5 h-5 fill-orange-400" />
                  <span>x{combo} Комбо!</span>
                </div>
              </>
            )}
          </div>

          {/* Lives & Audio Controls */}
          <div className="flex items-center gap-3">
            {/* Lives Counter */}
            <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-full shadow-lg border border-white/40">
              {Array.from({ length: 5 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-6 h-6 transition-transform ${
                    i < lives
                      ? 'text-red-500 fill-red-500 scale-100'
                      : 'text-slate-300 scale-75 opacity-40'
                  }`}
                />
              ))}
            </div>

            {/* Mute Button */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="pointer-events-auto p-3 bg-white/80 hover:bg-white backdrop-blur-md rounded-full shadow-lg border border-white/40 transition active:scale-95 text-slate-700"
            >
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
          </div>
        </div>
      )}

      {/* START SCREEN OVERLAY */}
      {gameState === 'START' && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-amber-50 to-orange-100 border-4 border-amber-400 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden">
            <div className="text-6xl mb-3 animate-bounce">🐥🪃</div>
            <h1 className="text-3xl font-black text-amber-950 mb-2 tracking-wide">
              Рогатка: Поймай цыпу!
            </h1>
            <p className="text-amber-800 font-medium mb-6">
              Натягивай рогатку мышкой или пальцем и метко целишься в пролетающих птиц!
            </p>

            {/* Birds Info Legend */}
            <div className="grid grid-cols-2 gap-2 text-left mb-6 bg-white/60 p-3 rounded-2xl border border-amber-200">
              {BIRD_TYPES.map((b) => (
                <div key={b.type} className="flex items-center gap-2 p-1">
                  <span className="text-2xl">{b.emoji}</span>
                  <div>
                    <div className="text-xs font-bold text-amber-900">{b.label}</div>
                    <div className="text-[11px] text-amber-700 font-semibold">
                      {b.isBonus ? '+1 Жизнь / +5 очков' : `+${b.points} очк.`}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {highScore > 0 && (
              <div className="flex items-center justify-center gap-2 mb-6 text-amber-900 font-bold bg-amber-200/60 py-2 rounded-xl">
                <Award className="w-5 h-5 text-amber-600" />
                <span>Рекорд: {highScore} очков</span>
              </div>
            )}

            <button
              onClick={startGame}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-xl rounded-2xl shadow-lg shadow-green-600/30 transform active:scale-95 transition flex items-center justify-center gap-2"
            >
              <Play className="fill-white w-6 h-6" /> Играть!
            </button>
          </div>
        </div>
      )}

      {/* GAME OVER OVERLAY */}
      {gameState === 'GAMEOVER' && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-slate-50 to-amber-50 border-4 border-red-400 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
            <div className="text-6xl mb-2 animate-pulse">😭💥</div>
            <h2 className="text-3xl font-black text-red-600 mb-1">Игра Окончена!</h2>
            <p className="text-slate-600 font-medium mb-6">Птички улетели слишком далеко...</p>

            <div className="bg-white/80 rounded-2xl p-4 mb-6 border border-slate-200 space-y-3">
              <div className="flex justify-between items-center text-slate-700 font-bold">
                <span>Ваш счёт:</span>
                <span className="text-2xl text-amber-600 font-black">{score}</span>
              </div>
              <div className="h-px bg-slate-200" />
              <div className="flex justify-between items-center text-slate-700 font-bold">
                <span>Рекорд:</span>
                <span className="text-xl text-emerald-600 font-black">{highScore}</span>
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xl rounded-2xl shadow-lg shadow-orange-500/30 transform active:scale-95 transition flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-6 h-6" /> Играть Снова
            </button>
          </div>
        </div>
      )}
    </div>
  );
}