/* ==========================================================================
   DJ & MC SION - OFFICIAL PORTFOLIO (CARL COX SIGNATURE DARK STYLE)
   Interactive Engine & Web Audio Soundboard
   ========================================================================== */

function initAll() {
  initHeroCanvasParticles();
  initHeroParallax();
  initAudioVisualizer();
  initDJSoundboard();
  initGalleryModal();
  initBookingForm();
  initCyberEffects();
  initPreloader();
  initScrollReveal();
  initScrollParallax();
  initMobileUI();
  initPosterNav();
}

/* ==========================================================================
   MOBILE UI — Device Detection, Hamburger Menu, Header Shrink
   ========================================================================== */
function initMobileUI() {
  // --- 1. Device Detection ---
  const ua = navigator.userAgent || '';
  if (/iPhone/i.test(ua)) {
    document.body.classList.add('iphone-layout');
  } else if (/SM-|SamsungBrowser|Galaxy/i.test(ua)) {
    document.body.classList.add('samsung-layout');
  } else if (/Android/i.test(ua)) {
    document.body.classList.add('android-layout');
  }

  // --- 2. Hamburger Menu Toggle ---
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
  const mobileNavClose = document.getElementById('mobile-nav-close');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function openMobileMenu() {
    hamburgerBtn.classList.add('open');
    mobileNavOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    hamburgerBtn.classList.remove('open');
    mobileNavOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openMobileMenu);
  if (mobileNavClose) mobileNavClose.addEventListener('click', closeMobileMenu);

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // --- 3. Header Shrink on Scroll ---
  const header = document.querySelector('.header-topbar');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}

/* ==========================================================================
   1. WEB AUDIO SYNTHESIS & DJ SOUNDBOARD
   ========================================================================== */
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSynthBassDrop() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 1.2);

    gain.gain.setValueAtTime(0.8, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 1.2);
  } catch (e) {}
}

function playSynthAirhorn() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    [280, 280, 280, 280].forEach((freq, i) => {
      const startTime = now + i * 0.12;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.5, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.1);
    });
  } catch (e) {}
}

function playSynthScratch() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.1);
    osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {}
}

function playSynthCheer() {
  try {
    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * 1.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + 1.5);
  } catch (e) {}
}

function initDJSoundboard() {
  const pads = document.querySelectorAll('.sound-pad-carl');
  pads.forEach(pad => {
    pad.addEventListener('click', () => {
      const type = pad.dataset.sound;
      switch (type) {
        case 'airhorn': playSynthAirhorn(); break;
        case 'bassdrop': playSynthBassDrop(); break;
        case 'scratch': playSynthScratch(); break;
        case 'cheer': playSynthCheer(); break;
        default: playSynthBassDrop(); break;
      }
    });
  });
}

/* ==========================================================================
   2. AUDIO EQUALIZER CANVAS VISUALIZER
   ========================================================================== */
function initAudioVisualizer() {
  const canvas = document.getElementById('audio-visualizer-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = canvas.parentElement.clientWidth;
  let height = canvas.height = canvas.parentElement.clientHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = canvas.parentElement.clientWidth;
    height = canvas.height = canvas.parentElement.clientHeight;
  });

  const barCount = 40;
  const bars = Array.from({ length: barCount }, () => Math.random() * 0.4 + 0.1);
  let isPlaying = false;

  const playBtn = document.getElementById('main-play-btn');
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      playBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
      if (isPlaying) playSynthBassDrop();
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    const barWidth = (width / barCount) - 3;

    for (let i = 0; i < barCount; i++) {
      if (isPlaying) {
        bars[i] += (Math.random() - 0.48) * 0.15;
        if (bars[i] < 0.05) bars[i] = 0.05;
        if (bars[i] > 0.95) bars[i] = 0.95;
      } else {
        bars[i] = Math.max(0.05, bars[i] - 0.02);
      }

      const barHeight = bars[i] * height;
      const x = i * (barWidth + 3);
      const y = height - barHeight;

      ctx.fillStyle = isPlaying ? '#e60023' : '#333338';
      ctx.fillRect(x, y, barWidth, barHeight);
    }

    requestAnimationFrame(draw);
  }

  draw();
}

/* ==========================================================================
   3. GALLERY LIGHTBOX MODAL & BOOKING FORM
   ========================================================================== */
function initGalleryModal() {
  const modal = document.getElementById('gallery-modal');
  const modalBody = document.getElementById('modal-body-content');
  const closeBtn = document.getElementById('modal-close-btn');

  if (!modal || !modalBody || !closeBtn) return;

  function openModal(htmlContent) {
    modalBody.innerHTML = htmlContent;
    modal.classList.add('active');
  }

  function closeModal() {
    modal.classList.remove('active');
    modalBody.innerHTML = '';
  }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.querySelectorAll('.gallery-item-carl, .poster-item-carl, .artist-portrait').forEach(item => {
    item.addEventListener('click', () => {
      const type = item.dataset.type || 'image';
      const src = item.dataset.src || item.src;
      const title = item.dataset.title || item.alt || '';

      if (type === 'video') {
        openModal(`
          <div style="text-align:center;">
            <video src="${src}" controls autoplay style="width:100%; max-height:75vh; border-radius:8px; border:1px solid #e60023;"></video>
            <h3 style="margin-top:1rem; font-family:'Montserrat',sans-serif; color:#ffffff;">${title}</h3>
          </div>
        `);
      } else {
        openModal(`
          <div style="text-align:center;">
            <img src="${src}" alt="${title}" style="max-width:100%; max-height:75vh; border-radius:8px; border:1px solid #e60023; object-fit:contain;" />
            <h3 style="margin-top:1rem; font-family:'Montserrat',sans-serif; color:#ffffff;">${title}</h3>
          </div>
        `);
      }
    });
  });
}

function initBookingForm() {
  const form = document.getElementById('booking-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    playSynthAirhorn();
    alert('🚀 CẢM ƠN BẠN! Yêu cầu Booking của bạn đã được gửi thành công tới Quản lý của DJ & MC Sion.');
    form.reset();
  });
}

/* ==========================================================================
   4. HERO DYNAMIC EFFECTS (CANVAS, PARALLAX, TYPEWRITER)
   ========================================================================== */
function initHeroCanvasParticles() {
  const canvas = document.getElementById('hero-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width = canvas.width = canvas.parentElement.clientWidth;
  let height = canvas.height = canvas.parentElement.clientHeight;
  
  window.addEventListener('resize', () => {
    width = canvas.width = canvas.parentElement.clientWidth;
    height = canvas.height = canvas.parentElement.clientHeight;
  });

  const particles = [];
  const numParticles = 400;
  
  for(let i = 0; i < numParticles; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      radius: Math.random() * 2,
      alpha: Math.random() * 0.5 + 0.1
    });
  }
  
  const shootingStars = [];
  
  let mouseX = width / 2;
  let mouseY = height / 2;
  
  document.getElementById('hero').addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  function draw() {
    ctx.clearRect(0, 0, width, height);
    
    for(let i = 0; i < numParticles; i++) {
      let p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      
      // Repel from mouse slightly
      const dx = mouseX - p.x;
      const dy = mouseY - p.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 100) {
        p.x -= dx * 0.05;
        p.y -= dy * 0.05;
      }
      
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
      ctx.fill();
    }
    
    const starColors = ['255, 255, 255', '230, 0, 35', '0, 200, 255', '168, 85, 247', '255, 215, 0'];
    
    // Shooting stars logic
    if (Math.random() < 0.05) { // 5% chance per frame to spawn a shooting star
      shootingStars.push({
        x: Math.random() * width * 1.5, // start further right to cross screen
        y: -50, // start above screen
        len: Math.random() * 80 + 20,
        speed: Math.random() * 10 + 10,
        opacity: Math.random() * 0.5 + 0.5,
        color: starColors[Math.floor(Math.random() * starColors.length)]
      });
    }

    for (let i = shootingStars.length - 1; i >= 0; i--) {
      let star = shootingStars[i];
      star.x -= star.speed; // Move left
      star.y += star.speed; // Move down
      
      const grad = ctx.createLinearGradient(star.x, star.y, star.x + star.len, star.y - star.len);
      grad.addColorStop(0, `rgba(${star.color}, ${star.opacity})`);
      grad.addColorStop(1, `rgba(${star.color}, 0)`);
      
      ctx.beginPath();
      ctx.moveTo(star.x, star.y);
      ctx.lineTo(star.x + star.len, star.y - star.len);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Remove if off screen
      if (star.x < -100 || star.y > height + 100) {
        shootingStars.splice(i, 1);
      }
    }
    
    requestAnimationFrame(draw);
  }
  draw();
}

function initHeroParallax() {
  const hero = document.getElementById('hero');
  if(!hero) return;
  
  const parallaxEls = hero.querySelectorAll('[data-parallax-speed]');
  
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const deltaX = x - centerX;
    const deltaY = y - centerY;
    
    parallaxEls.forEach(el => {
      const speed = parseFloat(el.getAttribute('data-parallax-speed'));
      const moveX = deltaX * speed;
      const moveY = deltaY * speed;
      el.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
  });
  
  hero.addEventListener('mouseleave', () => {
    parallaxEls.forEach(el => {
      el.style.transform = 'translate(0px, 0px)';
      el.style.transition = 'transform 0.5s ease-out';
    });
  });
  
  hero.addEventListener('mouseenter', () => {
    parallaxEls.forEach(el => {
      el.style.transition = 'none';
    });
  });
}

function initHeroTypewriter() {
  const quoteEl = document.getElementById('hero-quote');
  if(!quoteEl) return;
  
  const text = quoteEl.getAttribute('data-quote');
  quoteEl.innerHTML = '';
  let i = 0;
  
  // start after short delay (preloader already waited)
  setTimeout(() => {
    const interval = setInterval(() => {
      if(i < text.length) {
        quoteEl.innerHTML += text.charAt(i);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 40); // typing speed
  }, 200);
}

/* ==========================================================================
   5. ULTIMATE CYBERPUNK EFFECTS (CURSOR & SCREEN SHAKE)
   ========================================================================== */
function initCyberEffects() {
  const interactables = document.querySelectorAll('a, button, .sound-pad-carl, .gallery-item-carl, .btn');
  interactables.forEach(el => {
    // Screen shake on click
    el.addEventListener('click', () => {
      if(el.getAttribute('href') === '#hero') {
        // Re-trigger entrance animations for Hero
        const left = document.querySelector('.hero-carl-left');
        const right = document.querySelector('.hero-carl-right');
        if(left && right) {
          left.style.animation = 'none';
          right.style.animation = 'none';
          void left.offsetWidth; // trigger reflow
          left.style.animation = '';
          right.style.animation = '';
        }
      }
      // Đã loại bỏ hiệu ứng rung lắc (screen-shake)
    });
  });
}

/* ==========================================================================
   6. UNIVERSE PRELOADER & SCROLL REVEAL (60 FPS OPTIMIZED)
   ========================================================================== */
function initPreloader() {
  const preloader = document.getElementById('universe-preloader');
  if (!preloader) {
    document.body.classList.add('loaded');
    initHeroTypewriter();
    return;
  }
  
  // Wait 2 seconds for cosmic effect, then trigger flash exit
  setTimeout(() => {
    preloader.classList.add('flash-exit');
    
    // Remove from DOM after flash animation completes (0.5s) to free memory
    setTimeout(() => {
      preloader.remove();
      document.body.classList.add('loaded'); // Kích hoạt CSS Animation cho Hero
      initHeroTypewriter(); // Bắt đầu hiệu ứng gõ chữ
    }, 500);
  }, 2000);
}

function initScrollReveal() {
  const options = {
    root: null, // viewport
    rootMargin: '0px 0px -10% 0px', // trigger slightly before it fully appears
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target); // Chỉ chạy hiệu ứng 1 lần
      }
    });
  }, options);
  
  // Áp dụng cho cả cuộn dọc (reveal-up) và cuộn ngang (reveal-right)
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-right');
  revealElements.forEach(el => {
    observer.observe(el);
  });
}

function initScrollParallax() {
  const parallaxEls = document.querySelectorAll('[data-scroll-parallax]');
  if(parallaxEls.length === 0) return;
  
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    // Tối ưu bằng requestAnimationFrame
    window.requestAnimationFrame(() => {
      parallaxEls.forEach(el => {
        // Chỉ chạy parallax nếu phần tử đang nằm trong viewport
        const rect = el.getBoundingClientRect();
        if(rect.top < window.innerHeight && rect.bottom > 0) {
          const speed = parseFloat(el.getAttribute('data-scroll-parallax'));
          // Di chuyển theo trục Y
          const yPos = (rect.top - window.innerHeight / 2) * speed;
          el.style.transform = `translateY(${yPos}px)`;
        }
      });
    });
  }, { passive: true });
}

/* ==========================================================================
   7. GLOBAL SOUNDCLOUD PLAYER LOGIC
   ========================================================================== */
window.initFeaturedPlayer = function(tracks) {
  if (!tracks || tracks.length === 0) return;
  
  let currentTrackIndex = 0;
  const iframeContainer = document.getElementById('featured-sc-widget').parentElement;
  let widget = SC.Widget(document.getElementById('featured-sc-widget'));
  const playerContainer = document.getElementById('featured-player');
  
  // Nút UI
  const btnPlay = document.getElementById('gp-play');
  const btnPrev = document.getElementById('gp-prev');
  const btnNext = document.getElementById('gp-next');
  const btnShuffle = document.getElementById('gp-shuffle');
  const btnRepeat = document.getElementById('gp-repeat');
  
  // Hiển thị UI
  const uiCover = document.getElementById('gp-cover');
  const uiTitle = document.getElementById('gp-title');
  const uiTimeCurrent = document.getElementById('gp-time-current');
  const uiTimeTotal = document.getElementById('gp-time-total');
  const uiProgressFill = document.getElementById('gp-progress-fill');
  const uiProgressBar = document.getElementById('gp-progress-bar-container');
  const uiPlaylistItems = document.getElementById('gp-playlist-items');

  let isPlaying = false;
  let duration = 0;
  let isShuffle = false;
  let isRepeat = false;

  // Toggle Repeat
  if (btnRepeat) {
    btnRepeat.addEventListener('click', () => {
      isRepeat = !isRepeat;
      btnRepeat.style.color = isRepeat ? '#e60023' : '#ccc';
    });
  }

  // Format time (ms to m:ss)
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Cập nhật thông tin bài hát lên giao diện
  const updateTrackUI = (index) => {
    const track = tracks[index];
    if (!track) return;
    
    const artworkUrl = track.artwork || 'Asset/Logo/logo_final-removebg-preview.png';
    uiCover.src = artworkUrl;
    uiTitle.textContent = track.title;
    
    if (track.duration) {
      duration = track.duration;
      uiTimeTotal.textContent = formatTime(duration);
    } else {
      uiTimeTotal.textContent = '0:00';
    }

    uiTimeCurrent.textContent = '0:00';
    uiProgressFill.style.width = '0%';
    
    // Highlight bài đang phát trong playlist
    const items = uiPlaylistItems.querySelectorAll('.gp-track-item');
    items.forEach((item, i) => {
      if (i === index) {
        item.classList.add('playing');
      } else {
        item.classList.remove('playing');
        item.classList.remove('is-active-playing');
      }
    });
  };

  // Đổi trạng thái Play/Pause
  const togglePlayState = (playing) => {
    isPlaying = playing;
    const icon = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    btnPlay.innerHTML = icon;
    
    const activeItem = uiPlaylistItems.querySelector('.gp-track-item.playing');
    if (activeItem) {
      if (playing) activeItem.classList.add('is-active-playing');
      else activeItem.classList.remove('is-active-playing');
    }
    
    const layout = document.querySelector('.featured-layout');
    if (layout) {
      if (playing) layout.classList.add('is-playing');
      else layout.classList.remove('is-playing');
    }
  };

  // ===================== TẠO IFRAME MỚI THAY VÌ widget.load() =====================
  const createNewIframe = (trackUrl, autoPlay) => {
    // Xoá iframe cũ
    const oldIframe = iframeContainer.querySelector('iframe');
    if (oldIframe) oldIframe.remove();
    
    // Tạo iframe mới
    const newIframe = document.createElement('iframe');
    newIframe.id = 'featured-sc-widget';
    newIframe.scrolling = 'no';
    newIframe.frameBorder = 'no';
    newIframe.setAttribute('allow', 'autoplay; encrypted-media');
    const encodedUrl = encodeURIComponent(trackUrl);
    newIframe.src = `https://w.soundcloud.com/player/?url=${encodedUrl}&color=%23ff0000&auto_play=${autoPlay}&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;
    iframeContainer.appendChild(newIframe);
    
    // Cập nhật widget reference
    widget = SC.Widget(newIframe);
    
    // Bind events cho widget mới
    widget.bind(SC.Widget.Events.READY, () => {
      playerContainer.classList.remove('is-loading');
      bindWidgetEvents();
      // Ép phát nhạc thủ công cho mobile (vì auto_play bị trình duyệt chặn)
      if (autoPlay) {
        widget.play();
      }
    });
  };

  // Tải một bài hát
  const loadTrack = (index, autoPlay = true) => {
    currentTrackIndex = index;
    const track = tracks[index];
    if (!track) return;
    
    updateTrackUI(index);
    if (autoPlay) {
      playerContainer.classList.add('is-loading');
    }
    createNewIframe(track.url, autoPlay);
  };

  // ===================== WIDGET EVENT BINDING =====================
  function bindWidgetEvents() {
    widget.bind(SC.Widget.Events.PLAY, () => {
      togglePlayState(true);
    });
    widget.bind(SC.Widget.Events.PAUSE, () => togglePlayState(false));
    
    widget.bind(SC.Widget.Events.PLAY_PROGRESS, (progress) => {
      const currentMs = progress.currentPosition;
      uiTimeCurrent.textContent = formatTime(currentMs);
      if (duration > 0) {
        const percent = (currentMs / duration) * 100;
        uiProgressFill.style.width = `${percent}%`;
      }
    });

    widget.bind(SC.Widget.Events.LOAD_PROGRESS, () => {
      widget.getDuration((ms) => {
        duration = ms;
        uiTimeTotal.textContent = formatTime(ms);
      });
    });

    widget.bind(SC.Widget.Events.FINISH, () => {
      if (isRepeat) {
        loadTrack(currentTrackIndex, true);
        return;
      }
      if (isShuffle && tracks.length > 1) {
        let nextIndex;
        do {
          nextIndex = Math.floor(Math.random() * tracks.length);
        } while (nextIndex === currentTrackIndex);
        loadTrack(nextIndex, true);
      } else if (currentTrackIndex < tracks.length - 1) {
        loadTrack(currentTrackIndex + 1, true);
      } else {
        loadTrack(0, false);
        togglePlayState(false);
      }
    });
  }

  // ===================== INITIAL SETUP =====================
  widget.bind(SC.Widget.Events.READY, () => {
    // Load bài đầu tiên nhưng KHÔNG autoplay
    loadTrack(0, false);
    
    // Render Playlist
    let playlistHtml = '';
    tracks.forEach((track, i) => {
      const thumb = track.artwork || 'Asset/Logo/logo_final-removebg-preview.png';
      playlistHtml += `
        <div class="gp-track-item" data-index="${i}">
          <div class="gp-track-index-box">
             <span class="gp-track-index">${(i + 1).toString().padStart(2, '0')}</span>
             <i class="fas fa-play gp-track-play-icon"></i>
             <div class="gp-track-eq">
                <span></span><span></span><span></span>
             </div>
          </div>
          <div class="gp-track-thumb">
             <img src="${thumb}" alt="Thumb">
          </div>
          <div class="gp-track-info">
            <div class="gp-track-name">${track.title}</div>
            <div class="gp-track-artist">SION</div>
          </div>
          <div class="gp-track-status">${track.duration ? formatTime(track.duration) : ''}</div>
        </div>
      `;
    });
    uiPlaylistItems.innerHTML = playlistHtml;

    // Gắn sự kiện click cho các item trong playlist
    const items = uiPlaylistItems.querySelectorAll('.gp-track-item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        const index = parseInt(item.getAttribute('data-index'));
        loadTrack(index, true);
        togglePlayState(true);
      });
    });

    // Bind events lần đầu
    bindWidgetEvents();
  });

  // ===================== UI EVENTS =====================
  
  btnPlay.addEventListener('click', () => {
    widget.toggle();
  });

  btnPrev.addEventListener('click', () => {
    if (currentTrackIndex > 0) {
      loadTrack(currentTrackIndex - 1, true);
    }
  });

  btnNext.addEventListener('click', () => {
    if (isShuffle && tracks.length > 1) {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * tracks.length);
      } while (nextIndex === currentTrackIndex);
      loadTrack(nextIndex, true);
    } else if (currentTrackIndex < tracks.length - 1) {
      loadTrack(currentTrackIndex + 1, true);
    }
  });

  // Toggle Shuffle
  btnShuffle.addEventListener('click', () => {
    isShuffle = !isShuffle;
    btnShuffle.style.color = isShuffle ? '#e60023' : '#ccc';
    
    if (isShuffle && tracks.length > 1) {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * tracks.length);
      } while (nextIndex === currentTrackIndex);
      loadTrack(nextIndex, true);
    }
  });

  // Tua nhạc (Seek)
  uiProgressBar.addEventListener('click', (e) => {
    const rect = uiProgressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;
    if (duration > 0) {
      widget.seekTo(percent * duration);
    }
  });
};


/* ==========================================================================
   POSTER NAVIGATION
   ========================================================================== */
function initPosterNav() {
  // 1. Poster Gallery Navigation
  const posterScroll = document.querySelector('#posters .poster-scroll-carl');
  const posterPrev = document.getElementById('poster-prev');
  const posterNext = document.getElementById('poster-next');

  if (posterScroll && posterPrev && posterNext) {
    posterPrev.addEventListener('click', () => {
      const item = posterScroll.querySelector('.poster-item-carl');
      if(item) {
        const itemWidth = item.offsetWidth + 24;
        posterScroll.scrollBy({ left: -itemWidth, behavior: 'smooth' });
      }
    });
    posterNext.addEventListener('click', () => {
      const item = posterScroll.querySelector('.poster-item-carl');
      if(item) {
        const itemWidth = item.offsetWidth + 24;
        posterScroll.scrollBy({ left: itemWidth, behavior: 'smooth' });
      }
    });
  }

  // 2. Stage Gallery Navigation
  const galleryScroll = document.getElementById('gallery-scroll');
  const galleryPrev = document.getElementById('gallery-prev');
  const galleryNext = document.getElementById('gallery-next');

  if (galleryScroll && galleryPrev && galleryNext) {
    galleryPrev.addEventListener('click', () => {
      const item = galleryScroll.querySelector('.gallery-item-carl');
      if(item) {
        const itemWidth = item.offsetWidth + 24; // 24px gap
        galleryScroll.scrollBy({ left: -itemWidth, behavior: 'smooth' });
      }
    });
    galleryNext.addEventListener('click', () => {
      const item = galleryScroll.querySelector('.gallery-item-carl');
      if(item) {
        const itemWidth = item.offsetWidth + 24;
        galleryScroll.scrollBy({ left: itemWidth, behavior: 'smooth' });
      }
    });
  }

  // 3. Photo Shoot Navigation
  const photoScroll = document.getElementById('photo-scroll');
  const photoPrev = document.getElementById('photo-prev');
  const photoNext = document.getElementById('photo-next');

  if (photoScroll && photoPrev && photoNext) {
    photoPrev.addEventListener('click', () => {
      const item = photoScroll.querySelector('.poster-item-carl');
      if(item) {
        const itemWidth = item.offsetWidth + 24; // 24px gap
        photoScroll.scrollBy({ left: -itemWidth, behavior: 'smooth' });
      }
    });
    photoNext.addEventListener('click', () => {
      const item = photoScroll.querySelector('.poster-item-carl');
      if(item) {
        const itemWidth = item.offsetWidth + 24;
        photoScroll.scrollBy({ left: itemWidth, behavior: 'smooth' });
      }
    });
  }
}
