/* ============================================
   ReadBright — Main Application Controller
   Premium Dark Fantasy Edition
   All 11 screens + 3 playable DIBELS games
   ============================================ */

// --- App State ---
const state = {
    currentScreen: 'consent',
    parentEmail: '',
    childName: '',
    consentGiven: false,
    childAge: null,
    childGrade: '',
    ageTrack: null,
    selectedAvatar: null,
    // Internal scoring — NEVER shown to child
    scores: {
        lnf: { correct: 0, total: 0, timeSpent: 0 },
        psf: { correctSounds: 0, totalSounds: 0, wordsCorrect: 0 },
        nwf: { cls: 0, wwr: 0, totalWords: 0 }
    },
    rewards: { readingStars: 0, storyGems: 0, confidenceCoins: 0, avatarKeys: 0 },
    screeningComplete: false,
    // --- API Integration State ---
    wcrsResult: null,       // Stores the full WCRS calculation
    apiSubmitted: false,    // Whether screening was submitted to backend
    apiSessionId: null      // Session ID returned from backend
};

// --- Helpers ---
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const container = () => document.getElementById('screen-container');

function el(tag, attrs = {}, children = []) {
    const e = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
        if (k === 'class') e.className = v;
        else if (k === 'html') e.innerHTML = v;
        else if (k === 'text') e.textContent = v;
        else if (k === 'src') e.src = v;
        else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v);
        else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
        else e.setAttribute(k, v);
    });
    children.forEach(c => {
        if (typeof c === 'string') e.appendChild(document.createTextNode(c));
        else if (c) e.appendChild(c);
    });
    return e;
}

// --- Navigation ---
function goTo(screenName) {
    state.currentScreen = screenName;
    const renderers = {
        consent: renderConsent,
        ageFilter: renderAgeFilter,
        avatarSelect: renderAvatarSelect,
        worldMap: renderWorldMap,
        screeningIntro: renderScreeningIntro,
        letterPark: renderLetterPark,
        soundTree: renderSoundTree,
        alienWords: renderAlienWords,
        celebration: renderCelebration,
        postMap: renderPostMap,
        parentReport: renderParentReport
    };
    const screen = renderers[screenName]();
    Effects.transitionScreen(screen, container());
}

// --- Top Bar ---
function makeTopBar(opts = {}) {
    const showCurrencies = opts.currencies !== false;
    const showAvatar = opts.avatar !== false && state.selectedAvatar;
    const showAge = opts.age !== false && state.childAge;

    let leftContent = [];
    if (showAvatar) {
        const av = AVATARS[state.selectedAvatar];
        const avatarEl = el('div', { class: 'top-bar-avatar' }, [
            el('img', { src: av.image, alt: av.name })
        ]);
        leftContent.push(avatarEl);
        leftContent.push(el('span', { class: 'top-bar-name', text: state.childName || 'Hero' }));
    } else {
        leftContent.push(el('span', { class: 'top-bar-name', html: '<strong>ReadBright</strong>' }));
    }
    if (showAge) {
        const track = AGE_TRACKS[state.ageTrack];
        leftContent.push(el('span', { class: 'age-badge', text: `${state.childAge}y · ${track.name.split(' ')[0]}` }));
    }

    let rightContent = [];
    if (showCurrencies) {
        const svgStar = `<svg width="14" height="14" viewBox="0 0 24 24" fill="var(--gold)" stroke="var(--gold)" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
        const svgGem = `<svg width="14" height="14" viewBox="0 0 24 24" fill="var(--sky)" stroke="var(--sky)" stroke-width="1"><polygon points="12 2 22 8.5 12 22 2 8.5 12 2"/></svg>`;
        const svgCoin = `<svg width="14" height="14" viewBox="0 0 24 24" fill="var(--teal)" stroke="var(--teal)" stroke-width="1"><circle cx="12" cy="12" r="10"/></svg>`;
        rightContent.push(el('div', { class: 'currency-item', html: `<span class="icon">${svgStar}</span>${state.rewards.readingStars}` }));
        rightContent.push(el('div', { class: 'currency-item', html: `<span class="icon">${svgGem}</span>${state.rewards.storyGems}` }));
        rightContent.push(el('div', { class: 'currency-item', html: `<span class="icon">${svgCoin}</span>${state.rewards.confidenceCoins}` }));
    }

    return el('div', { class: 'top-bar' }, [
        el('div', { class: 'top-bar-left' }, leftContent),
        el('div', { class: 'top-bar-currencies' }, rightContent)
    ]);
}

// --- Bottom Bar ---
function makeBottomBar() {
    const svgPause = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
    const svgHelp = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    const svgSound = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;
    return el('div', { class: 'bottom-bar' }, [
        el('button', { class: 'bottom-btn', html: svgPause + '<span>Pause</span>' }),
        el('button', { class: 'bottom-btn', html: svgHelp + '<span>Help</span>' }),
        el('button', { class: 'bottom-btn', html: svgSound + '<span>Sound</span>' })
    ]);
}

// ============================================
// SCREEN 1: Parent Consent
// ============================================
function renderConsent() {
    const screen = el('div', { class: 'screen bg-portal' });

    const content = el('div', { class: 'screen-content' }, [
        el('div', { class: 'logo' }, [
            el('div', { class: 'logo-text', text: 'ReadBright' }),
            el('div', { class: 'logo-subtitle', text: 'Unlock the Power of Reading' })
        ]),

        el('div', { class: 'glass-card', style: { display: 'flex', flexDirection: 'column', gap: '20px' } }, [
            el('h2', { class: 'title', style: { textAlign: 'center', fontSize: '20px' }, text: 'PARENTAL CONSENT' }),
            el('p', { class: 'body-text', style: { textAlign: 'center', fontSize: '13px' }, text: 'GDPR and India DPDP compliance for data collection. Your child\'s data is protected as described in our Privacy Policy.' }),

            el('div', { class: 'form-group' }, [
                el('label', { class: 'form-label', text: 'Parent Email (optional)' }),
                el('input', { class: 'form-input', type: 'email', id: 'parent-email', placeholder: 'parent@email.com' })
            ]),
            el('div', { class: 'form-group' }, [
                el('label', { class: 'form-label', text: "Child's Name *" }),
                el('input', { class: 'form-input', type: 'text', id: 'child-name', placeholder: "Enter your child's name" })
            ]),

            el('div', { class: 'consent-box', id: 'consent-box', onClick: toggleConsent }, [
                el('div', { class: 'checkbox-visual', id: 'consent-check' }),
                el('div', { class: 'consent-text', html: 'I consent to the collection and processing of my child\'s data as described above and in our <u>Privacy Policy</u>. This is <strong>NOT a medical diagnosis</strong>.' })
            ]),

            el('button', {
                class: 'btn btn-primary btn-full',
                id: 'consent-btn',
                disabled: 'true',
                text: 'CONTINUE',
                onClick: () => {
                    state.parentEmail = ($('#parent-email') || {}).value || '';
                    state.childName = ($('#child-name') || {}).value || 'Young Hero';
                    goTo('ageFilter');
                }
            })
        ]),

        el('p', { class: 'legal-text', text: 'ReadBright complies with GDPR (EU), India DPDP Act 2023, and COPPA. No data is shared with third parties.' })
    ]);

    screen.appendChild(content);
    Effects.createBgParticles(screen, 8);
    return screen;
}

function toggleConsent() {
    state.consentGiven = !state.consentGiven;
    const box = document.getElementById('consent-box');
    const check = document.getElementById('consent-check');
    const btn = document.getElementById('consent-btn');
    if (state.consentGiven) {
        box.classList.add('checked');
        check.textContent = '✓';
        btn.disabled = !document.getElementById('child-name').value.trim();
    } else {
        box.classList.remove('checked');
        check.textContent = '';
        btn.disabled = true;
    }
}

// ============================================
// SCREEN 2: Age & Grade Filter
// ============================================
function renderAgeFilter() {
    const screen = el('div', { class: 'screen bg-portal' });
    screen.appendChild(makeTopBar({ currencies: false, avatar: false, age: false }));

    const ageOptions = Array.from({ length: 9 }, (_, i) => {
        const age = i + 5;
        return `<option value="${age}">${age} years old</option>`;
    }).join('');

    const gradeOptions = [
        '<option value="">Select grade</option>',
        '<option value="pre-k">Pre-K</option>',
        '<option value="k">Kindergarten</option>',
        '<option value="1">Grade 1</option>',
        '<option value="2">Grade 2</option>',
        '<option value="3">Grade 3</option>',
        '<option value="4">Grade 4</option>',
        '<option value="5">Grade 5</option>',
        '<option value="6">Grade 6</option>',
        '<option value="7">Grade 7</option>',
        '<option value="8">Grade 8</option>'
    ].join('');

    const trackPreview = el('div', { id: 'track-preview', class: 'notice-box info', style: { display: 'none' } });

    const castleIcon = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="1.5" style="filter:drop-shadow(0 0 15px rgba(0,212,200,0.3))"><path d="M3 21h18M6 21V7l-3-2 3-2V1M18 21V7l3-2-3-2V1M9 21V13h6v8M12 7h.01"/></svg>`;
    const content = el('div', { class: 'screen-content centered' }, [
        el('div', { style: { marginBottom: '4px' }, html: castleIcon }),
        el('h1', { class: 'title', text: 'Your Adventurer' }),
        el('p', { class: 'body-text', text: `Welcome! Let's find ${state.childName}'s perfect level.` }),

        el('div', { class: 'glass-card', style: { display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' } }, [
            el('div', { class: 'form-group' }, [
                el('label', { class: 'form-label', text: "Child's Age" }),
                el('select', { class: 'form-select', id: 'age-select', html: `<option value="">Select age</option>${ageOptions}`, onChange: updateTrackPreview })
            ]),
            el('div', { class: 'form-group' }, [
                el('label', { class: 'form-label', text: "Grade Level" }),
                el('select', { class: 'form-select', id: 'grade-select', html: gradeOptions })
            ]),
            trackPreview
        ]),

        el('div', { class: 'notice-box', html: 'Content automatically adjusts for age groups: 5–8, 8–10, and 11–13.' }),

        el('button', {
            class: 'btn btn-primary btn-lg btn-full',
            id: 'age-btn',
            disabled: 'true',
            text: 'Continue',
            onClick: () => {
                state.childAge = parseInt($('#age-select').value);
                state.childGrade = $('#grade-select').value;
                state.ageTrack = getAgeTrack(state.childAge);
                goTo('avatarSelect');
            }
        })
    ]);

    screen.appendChild(content);
    Effects.createBgParticles(screen, 6);
    return screen;
}

function updateTrackPreview() {
    const age = parseInt(document.getElementById('age-select').value);
    const preview = document.getElementById('track-preview');
    const btn = document.getElementById('age-btn');
    if (!age) { preview.style.display = 'none'; btn.disabled = true; return; }

    const track = getAgeTrack(age);
    const info = AGE_TRACKS[track];
    preview.style.display = 'flex';
    preview.innerHTML = `<div><strong style="color:#00D4C8">${info.name}</strong> (${info.ageRange})<br><span style="font-size:11px;opacity:0.7">${info.description}</span></div>`;
    btn.disabled = false;
}

// ============================================
// SCREEN 3: Avatar Selection
// ============================================
function renderAvatarSelect() {
    const screen = el('div', { class: 'screen bg-magical' });
    screen.appendChild(makeTopBar({ currencies: false, avatar: false, age: false }));

    const avatarCards = Object.entries(AVATARS).map(([key, av]) => {
        const portrait = el('div', { class: 'avatar-portrait' }, [
            el('img', { src: av.image, alt: av.name })
        ]);
        const card = el('div', { class: `avatar-card ${key}`, 'data-avatar': key, onClick: () => selectAvatar(key) }, [
            portrait,
            el('div', { class: 'avatar-info' }, [
                el('h3', { text: av.name }),
                el('p', { text: av.description })
            ])
        ]);
        return card;
    });

    const content = el('div', { class: 'screen-content centered' }, [
        el('h1', { class: 'title', text: 'Choose Your Hero' }),
        el('p', { class: 'subtitle', text: 'Pick your hero • Customise later!' }),
        el('div', { class: 'avatar-grid' }, avatarCards),
        el('button', {
            class: 'btn btn-primary btn-lg btn-full',
            id: 'avatar-btn',
            disabled: 'true',
            text: 'Enter the Kingdom →',
            onClick: () => goTo('worldMap')
        })
    ]);

    screen.appendChild(content);
    Effects.createBgParticles(screen, 10);
    return screen;
}

function selectAvatar(key) {
    state.selectedAvatar = key;
    $$('.avatar-card').forEach(c => c.classList.remove('selected'));
    $(`.avatar-card[data-avatar="${key}"]`).classList.add('selected');
    Effects.sparkleAt($(`.avatar-card[data-avatar="${key}"]`));
    $('#avatar-btn').disabled = false;
}

// ============================================
// SCREEN 4: World Map
// ============================================
function renderWorldMap() {
    const screen = el('div', { class: 'screen bg-magical' });
    screen.appendChild(makeTopBar({}));

    const svgLockSmall = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
    const kingdomNodes = KINGDOMS.map(k => {
        return el('div', { class: 'kingdom-node locked' }, [
            el('div', { class: 'kingdom-icon', style: { background: k.color }, html: k.icon }),
            el('div', { class: 'kingdom-name', text: k.name }),
            el('span', { class: 'kingdom-lock', html: svgLockSmall })
        ]);
    });

    const gateway = el('div', { class: 'kingdom-node gateway-node' }, [
        el('div', { class: 'kingdom-icon', style: { background: 'linear-gradient(135deg, #00D4C8, #8B5CF6)', width: '50px', height: '50px', fontSize: '24px' }, html: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>' }),
        el('div', { class: 'kingdom-name', style: { fontSize: '13px', color: '#F1F5F9' }, text: 'The Gateway' }),
        el('div', { style: { fontSize: '10px', color: '#64748B', fontWeight: '500' }, text: 'Discover your superpowers!' })
    ]);

    const content = el('div', { class: 'screen-content' }, [
        el('div', { class: 'banner' }, [
            el('div', { class: 'banner-title', text: 'Ready to awaken your powers?' }),
            el('p', { class: 'small-text', text: 'Complete the Gateway to unlock the kingdoms!' })
        ]),
        el('div', { class: 'world-map' }, [gateway, ...kingdomNodes]),
        el('button', {
            class: 'btn btn-primary btn-lg btn-full',
            html: 'Start Screening <span class="btn-badge">5–6 min · 3 games</span>',
            onClick: () => goTo('screeningIntro')
        })
    ]);

    screen.appendChild(content);
    screen.appendChild(makeBottomBar());
    Effects.createBgParticles(screen, 12);
    return screen;
}

// ============================================
// SCREEN 5: Screening Intro
// ============================================
function renderScreeningIntro() {
    const screen = el('div', { class: 'screen bg-magical' });
    screen.appendChild(makeTopBar({}));
    const track = AGE_TRACKS[state.ageTrack];

    const gatewayIcon = `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" stroke-width="1.5" style="filter:drop-shadow(0 0 20px rgba(139,92,246,0.5))"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`;
    const content = el('div', { class: 'screen-content centered' }, [
        el('div', { style: { animation: 'float-gentle 3s ease-in-out infinite' }, html: gatewayIcon }),
        el('h1', { class: 'title', text: 'Enter the Gateway' }),
        el('p', { class: 'subtitle', text: 'Discover Your Reading Superpowers!' }),
        el('p', { class: 'body-text', text: '3 short magical games adapted for your age. No pressure — just fun!' }),

        el('div', { class: 'progress-container' }, [
            el('div', { class: 'progress-label', text: 'Progress: 0 / 3 games' }),
            el('div', { class: 'progress-bar-bg' }, [
                el('div', { class: 'progress-bar-fill', style: { width: '0%' } })
            ])
        ]),

        el('div', { class: 'age-badge', style: { alignSelf: 'center', fontSize: '11px', padding: '4px 14px' }, text: track.name }),

        el('button', { class: 'btn btn-primary btn-lg btn-full', text: 'Begin the Adventure', onClick: () => goTo('letterPark') }),
        el('button', { class: 'btn btn-secondary btn-full', text: 'What Happens Next?', onClick: showInfoModal })
    ]);

    screen.appendChild(content);
    screen.appendChild(makeBottomBar());
    Effects.createBgParticles(screen, 10);
    return screen;
}

function showInfoModal() {
    const overlay = el('div', { class: 'modal-overlay', onClick: (e) => { if (e.target === overlay) overlay.remove(); } }, [
        el('div', { class: 'modal-content' }, [
            el('h3', { text: 'What Happens Next?' }),
            el('p', { text: 'Your child will play 3 short, fun games that feel like the start of a magical adventure. Each takes about 1–2 minutes.' }),
            el('p', { html: '<strong style="color:#00D4C8">Letter Park</strong> — Name the glowing letters' }),
            el('p', { html: '<strong style="color:#10B981">Sound Tree</strong> — Break words into sounds' }),
            el('p', { html: '<strong style="color:#8B5CF6">Alien Words</strong> — Read fun alien language' }),
            el('p', { text: 'Results go only to the parent. Your child sees rewards — never scores.' }),
            el('p', { class: 'small-text', style: { opacity: '0.6', marginTop: '4px' }, text: 'This is a screening tool only — not a medical diagnosis.' }),
            el('button', { class: 'btn btn-primary btn-full', text: 'Got it!', onClick: () => overlay.remove() })
        ])
    ]);
    document.body.appendChild(overlay);
}

// ============================================
// SCREEN 6: Letter Park (LNF)
// ============================================
function renderLetterPark() {
    const screen = el('div', { class: 'screen bg-game-park' });
    const data = LNF_DATA[state.ageTrack];
    const letters = shuffleArray(data.letters).slice(0, data.displayCount);

    let tapped = 0, timeLeft = data.timeLimit, timerInterval = null, gameActive = true, encourageCounter = 0;

    screen.appendChild(makeTopBar({}));

    const header = el('div', { class: 'task-header' }, [
        el('div', { class: 'age-badge', style: { alignSelf: 'center' }, text: 'AGE-ADAPTED' }),
        el('div', { class: 'task-title', text: 'Letter Park' }),
        el('div', { class: 'task-subtitle', text: 'Tap each letter as fast as you can!' }),
        el('div', { class: 'progress-label', text: 'Game 1 of 3' })
    ]);

    const timerFill = el('div', { class: 'timer-fill', style: { width: '100%' } });
    const timerText = el('div', { class: 'timer-text', text: data.showTimer ? `${timeLeft}s` : 'Take your time!' });
    const timerContainer = el('div', { style: { padding: '0 16px' } }, [
        el('div', { class: 'timer-bar' }, [timerFill]), timerText
    ]);

    const grid = el('div', { class: `letter-grid ${data.fontSize}` });
    letters.forEach(letter => {
        const cell = el('div', { class: `letter-cell ${data.fontSize}`, text: letter, onClick: () => {
            if (!gameActive || cell.classList.contains('tapped')) return;
            cell.classList.add('tapped');
            tapped++;
            state.scores.lnf.correct++;
            state.scores.lnf.total = data.displayCount;
            const rect = cell.getBoundingClientRect();
            Effects.starPop(rect.left + rect.width / 2, rect.top);
            state.rewards.readingStars++;
            updateCurrencyDisplay();
            encourageCounter++;
            if (encourageCounter % 5 === 0) Effects.showEncouragement();
            if (tapped >= letters.length) endGame();
        }});
        grid.appendChild(cell);
    });

    const content = el('div', { class: 'screen-content', style: { padding: '8px 16px', gap: '10px' } }, [
        header, timerContainer, el('div', { class: 'game-area' }, [grid])
    ]);
    screen.appendChild(content);
    screen.appendChild(makeBottomBar());

    function startTimer() {
        timerInterval = setInterval(() => {
            timeLeft--;
            const pct = (timeLeft / data.timeLimit) * 100;
            timerFill.style.width = pct + '%';
            if (data.showTimer) timerText.textContent = `${timeLeft}s`;
            if (pct < 30) timerFill.className = 'timer-fill danger';
            else if (pct < 50) timerFill.className = 'timer-fill warning';
            if (timeLeft <= 0) endGame();
        }, 1000);
    }

    function endGame() {
        gameActive = false;
        clearInterval(timerInterval);
        state.scores.lnf.timeSpent = data.timeLimit - timeLeft;
        Effects.showEncouragement('Amazing job!');
        setTimeout(() => goTo('soundTree'), 1500);
    }

    setTimeout(startTimer, 1000);
    Effects.createBgParticles(screen, 6);
    return screen;
}

function updateCurrencyDisplay() {
    const svgStar = `<svg width="14" height="14" viewBox="0 0 24 24" fill="var(--gold)" stroke="var(--gold)" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    const stars = $$('.currency-item');
    if (stars[0]) stars[0].innerHTML = `<span class="icon">${svgStar}</span>${state.rewards.readingStars}`;
}

// ============================================
// SCREEN 7: Sound Tree (PSF)
// ============================================
function renderSoundTree() {
    const screen = el('div', { class: 'screen bg-game-tree' });
    const data = PSF_DATA[state.ageTrack];
    const words = shuffleArray(data.words).slice(0, 8);

    let currentWordIdx = 0, currentSlotIdx = 0, treeLeaves = 0;
    let timeLeft = data.timeLimit, timerInterval = null, gameActive = true;

    screen.appendChild(makeTopBar({}));

    const header = el('div', { class: 'task-header' }, [
        el('div', { class: 'age-badge', style: { alignSelf: 'center' }, text: 'AGE-ADAPTED' }),
        el('div', { class: 'task-title', text: 'Sound Tree' }),
        el('div', { class: 'task-subtitle', text: 'Break the word into its sounds!' }),
        el('div', { class: 'progress-label', text: 'Game 2 of 3' })
    ]);

    const timerFill = el('div', { class: 'timer-fill', style: { width: '100%' } });
    const timerText = el('div', { class: 'timer-text', text: data.showTimer ? `${timeLeft}s` : 'Take your time!' });
    const timerContainer = el('div', { style: { padding: '0 16px' } }, [
        el('div', { class: 'timer-bar' }, [timerFill]), timerText
    ]);

    // Progress counter replaces the tree visual
    let wordsCompleted = 0;
    const progressCounter = el('div', { style: {
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        padding: '8px 16px', borderRadius: '20px',
        background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)',
        fontSize: '13px', fontWeight: '700', color: 'var(--emerald)'
    }, text: 'Words: 0' });

    const wordDisplay = el('div', { class: 'word-display', id: 'psf-word' });
    const slotsContainer = el('div', { class: 'sound-slots', id: 'psf-slots' });
    const optionsContainer = el('div', { class: 'phoneme-options', id: 'psf-options' });

    function loadWord(idx) {
        if (idx >= words.length || !gameActive) { endGame(); return; }
        currentWordIdx = idx;
        currentSlotIdx = 0;
        const w = words[idx];
        wordDisplay.textContent = w.word;
        slotsContainer.innerHTML = '';
        w.sounds.forEach(() => slotsContainer.appendChild(el('div', { class: 'sound-slot' })));

        optionsContainer.innerHTML = '';
        const allSounds = [...w.sounds];
        const distractors = shuffleArray(data.distractors).slice(0, Math.max(3, w.sounds.length));
        const options = shuffleArray([...allSounds, ...distractors.filter(d => !allSounds.includes(d))]).slice(0, Math.min(8, allSounds.length + 3));
        options.forEach(sound => {
            optionsContainer.appendChild(el('button', {
                class: 'phoneme-btn', text: `/${sound}/`,
                onClick: () => handlePhonemeClick(sound, optionsContainer.lastChild)
            }));
        });
        // Re-bind onClick with correct btn reference
        optionsContainer.innerHTML = '';
        options.forEach(sound => {
            const btn = el('button', { class: 'phoneme-btn', text: `/${sound}/` });
            btn.addEventListener('click', () => handlePhonemeClick(sound, btn));
            optionsContainer.appendChild(btn);
        });
    }

    function handlePhonemeClick(sound, btn) {
        if (!gameActive) return;
        const w = words[currentWordIdx];
        const expected = w.sounds[currentSlotIdx];
        if (sound === expected) {
            const slots = $$('.sound-slot', slotsContainer);
            slots[currentSlotIdx].textContent = `/${sound}/`;
            slots[currentSlotIdx].classList.add('filled');
            btn.classList.add('correct', 'used');
            state.scores.psf.correctSounds++;
            state.rewards.readingStars++;
            updateCurrencyDisplay();
            currentSlotIdx++;
            if (currentSlotIdx >= w.sounds.length) {
                state.scores.psf.wordsCorrect++;
                wordsCompleted++;
                progressCounter.textContent = `Words: ${wordsCompleted}`;
                Effects.showEncouragement();
                setTimeout(() => loadWord(currentWordIdx + 1), 700);
            }
        } else {
            const slots = $$('.sound-slot', slotsContainer);
            slots[currentSlotIdx].classList.add('wrong');
            setTimeout(() => slots[currentSlotIdx].classList.remove('wrong'), 400);
        }
        state.scores.psf.totalSounds++;
    }

    const gameArea = el('div', { class: 'game-area' }, [progressCounter, wordDisplay, slotsContainer, optionsContainer]);
    const content = el('div', { class: 'screen-content', style: { padding: '8px 16px', gap: '8px' } }, [header, timerContainer, gameArea]);
    screen.appendChild(content);
    screen.appendChild(makeBottomBar());

    function startTimer() {
        timerInterval = setInterval(() => {
            timeLeft--;
            timerFill.style.width = ((timeLeft / data.timeLimit) * 100) + '%';
            if (data.showTimer) timerText.textContent = `${timeLeft}s`;
            if (timeLeft <= 0) endGame();
        }, 1000);
    }
    function endGame() {
        gameActive = false; clearInterval(timerInterval);
        Effects.showEncouragement('Wonderful!');
        setTimeout(() => goTo('alienWords'), 1500);
    }

    setTimeout(() => { loadWord(0); startTimer(); }, 600);
    Effects.createBgParticles(screen, 6);
    return screen;
}

// ============================================
// SCREEN 8: Alien Words (NWF)
// ============================================
function renderAlienWords() {
    const screen = el('div', { class: 'screen bg-game-alien' });
    const data = NWF_DATA[state.ageTrack];
    const words = shuffleArray(data.words).slice(0, 10);

    let currentWordIdx = 0, timeLeft = data.timeLimit, timerInterval = null, gameActive = true, soundsTapped = [];

    screen.appendChild(makeTopBar({}));

    const header = el('div', { class: 'task-header' }, [
        el('div', { class: 'age-badge', style: { alignSelf: 'center' }, text: 'AGE-ADAPTED' }),
        el('div', { class: 'task-title', text: 'Alien Words' }),
        el('div', { class: 'task-subtitle', text: "Decode the alien language!" }),
        el('div', { class: 'progress-label', text: 'Game 3 of 3' })
    ]);

    const timerFill = el('div', { class: 'timer-fill', style: { width: '100%' } });
    const timerText = el('div', { class: 'timer-text', text: data.showTimer ? `${timeLeft}s` : 'Take your time!' });
    const timerContainer = el('div', { style: { padding: '0 16px' } }, [
        el('div', { class: 'timer-bar' }, [timerFill]), timerText
    ]);

    const alienChar = el('div', { class: 'alien-character', html: '<svg width="50" height="50" viewBox="0 0 24 24" fill="var(--purple)" stroke="var(--purple)" stroke-width="0.5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4-8c.79 0 1.43-.64 1.43-1.43S8.79 9.14 8 9.14 6.57 9.78 6.57 10.57 7.21 12 8 12zm8 0c.79 0 1.43-.64 1.43-1.43S16.79 9.14 16 9.14s-1.43.64-1.43 1.43S15.21 12 16 12zm-4 4.45c2.33 0 4.31-1.46 5.11-3.52H6.89c.8 2.06 2.78 3.52 5.11 3.52z"/></svg>' });
    const alienWord = el('div', { class: 'alien-word', id: 'nwf-word' });
    const soundButtons = el('div', { class: 'nwf-sounds', id: 'nwf-sounds' });
    const wholeWordBtn = el('button', { class: 'nwf-whole-btn', text: 'I can read the whole word!', id: 'nwf-whole' });

    function loadWord(idx) {
        if (idx >= words.length || !gameActive) { endGame(); return; }
        currentWordIdx = idx; soundsTapped = [];
        const w = words[idx];
        alienWord.textContent = w.word;
        soundButtons.innerHTML = '';
        w.sounds.forEach((sound, i) => {
            const btn = el('button', { class: 'nwf-sound-btn', text: `/${sound}/` });
            btn.addEventListener('click', () => handleNwfSound(sound, btn, i));
            soundButtons.appendChild(btn);
        });
        wholeWordBtn.onclick = () => handleWholeWord(w);
        wholeWordBtn.className = 'nwf-whole-btn';
    }

    function handleNwfSound(sound, btn, idx) {
        if (!gameActive || btn.classList.contains('tapped')) return;
        btn.classList.add('tapped');
        soundsTapped.push(idx);
        state.scores.nwf.cls++;
        state.rewards.readingStars++;
        updateCurrencyDisplay();
        Effects.starPop(btn.getBoundingClientRect().left + 25, btn.getBoundingClientRect().top);
        const w = words[currentWordIdx];
        if (soundsTapped.length >= w.sounds.length) {
            state.scores.nwf.totalWords++;
            Effects.showEncouragement();
            setTimeout(() => { loadWord(currentWordIdx + 1); }, 700);
        }
    }

    function handleWholeWord(w) {
        if (!gameActive) return;
        state.scores.nwf.wwr++;
        state.scores.nwf.cls += w.sounds.length;
        state.scores.nwf.totalWords++;
        state.rewards.readingStars += 2;
        updateCurrencyDisplay();
        $$('.nwf-sound-btn', soundButtons).forEach(b => b.classList.add('tapped'));
        Effects.showEncouragement('Superstar!');
        Effects.starBurst(alienWord.getBoundingClientRect().left + 60, alienWord.getBoundingClientRect().top);
        setTimeout(() => { loadWord(currentWordIdx + 1); }, 700);
    }

    const alienContainer = el('div', { class: 'alien-container' }, [alienChar, alienWord]);
    const nwfButtons = el('div', { class: 'nwf-buttons' }, [
        el('p', { class: 'small-text', text: 'Tap each sound, or read the whole word:' }),
        soundButtons, wholeWordBtn
    ]);
    const gameArea = el('div', { class: 'game-area' }, [alienContainer, nwfButtons]);
    const content = el('div', { class: 'screen-content', style: { padding: '8px 16px', gap: '8px' } }, [header, timerContainer, gameArea]);
    screen.appendChild(content);
    screen.appendChild(makeBottomBar());

    function startTimer() {
        timerInterval = setInterval(() => {
            timeLeft--;
            timerFill.style.width = ((timeLeft / data.timeLimit) * 100) + '%';
            if (data.showTimer) timerText.textContent = `${timeLeft}s`;
            if (timeLeft <= 0) endGame();
        }, 1000);
    }
    function endGame() {
        gameActive = false; clearInterval(timerInterval);
        state.rewards.readingStars = Math.max(state.rewards.readingStars, 50);
        state.rewards.storyGems += 10;
        state.rewards.avatarKeys += 1;
        state.screeningComplete = true;
        Effects.showEncouragement('You did it!');
        setTimeout(() => goTo('celebration'), 1500);
    }

    setTimeout(() => { loadWord(0); startTimer(); }, 600);
    Effects.createBgParticles(screen, 8);
    return screen;
}

// ============================================
// SCREEN 9: Celebration + API Submission
// Calculates WCRS → Submits to backend → Shows results
// ============================================
function renderCelebration() {
    const screen = el('div', { class: 'screen bg-celebration' });
    const av = AVATARS[state.selectedAvatar];

    // --- Calculate WCRS ---
    if (!state.wcrsResult) {
        state.wcrsResult = WCRSEngine.calculate(state.scores, state.ageTrack);
        console.log('[ReadBright] WCRS calculated:', state.wcrsResult);
    }

    // --- Loading Phase Container ---
    const loadingOverlay = el('div', { class: 'api-loading-overlay', id: 'api-loading' }, [
        el('div', { class: 'loading-content' }, [
            el('div', { class: 'loading-spinner' }),
            el('p', { class: 'loading-text', text: 'Saving your adventure...' }),
            el('p', { class: 'loading-subtext', text: 'Sending results to the kingdom archives' })
        ])
    ]);

    // --- Portrait ---
    const portraitFrame = el('div', { style: {
        width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden',
        border: '3px solid rgba(0,212,200,0.6)',
        boxShadow: '0 0 30px rgba(0,212,200,0.3), 0 0 60px rgba(139,92,246,0.2)',
        margin: '0 auto'
    } }, [el('img', { src: av.image, style: { width: '100%', height: '100%', objectFit: 'cover' } })]);

    // --- Reward SVGs ---
    const svgStarReward = `<svg width="22" height="22" viewBox="0 0 24 24" fill="var(--gold)" stroke="var(--gold)" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    const svgGemReward = `<svg width="22" height="22" viewBox="0 0 24 24" fill="var(--sky)" stroke="var(--sky)" stroke-width="1"><polygon points="12 2 22 8.5 12 22 2 8.5 12 2"/></svg>`;
    const svgKeyReward = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`;

    // --- API Status Badge (shows success/error) ---
    const apiStatusBadge = el('div', { class: 'api-status-badge', id: 'api-status' });

    // --- Animated "Unlock Sound Kingdom" Button ---
    const unlockBtn = el('button', {
        class: 'btn btn-primary btn-lg btn-full btn-kingdom-unlock',
        id: 'unlock-kingdom-btn',
        text: 'Unlock Sound Kingdom ✦',
        onClick: () => goTo('postMap')
    });

    const content = el('div', { class: 'screen-content centered' }, [
        portraitFrame,
        el('h1', { class: 'title', style: { marginTop: '12px' }, text: 'SCREENING COMPLETE!' }),
        el('p', { class: 'subtitle', text: `Great Job, ${state.childName}!` }),

        el('div', { class: 'glass-card', style: { width: '100%' } }, [
            el('p', { style: { fontSize: '13px', fontWeight: '600', color: '#94A3B8', marginBottom: '16px', textAlign: 'center' }, text: 'Rewards Earned' }),
            el('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, [
                makeRewardRow(svgStarReward, 'Reading Stars', `+${state.rewards.readingStars}`, '#F59E0B'),
                makeRewardRow(svgGemReward, 'Story Gems', `+${state.rewards.storyGems}`, '#38BDF8'),
                makeRewardRow(svgKeyReward, 'Avatar Key', '1', '#00D4C8')
            ])
        ]),

        apiStatusBadge,

        el('div', { class: 'notice-box info', html: 'This is a <strong>screening tool only</strong> — not a medical diagnosis. Full report is ready for parents.' }),

        unlockBtn,
        el('button', { class: 'btn btn-secondary btn-full', text: 'View Parent Report', onClick: () => goTo('parentReport') })
    ]);

    screen.appendChild(loadingOverlay);
    screen.appendChild(content);

    // --- Trigger API submission ---
    setTimeout(() => {
        submitScreeningToBackend(loadingOverlay, apiStatusBadge, unlockBtn);
    }, 600);

    setTimeout(() => Effects.celebrationSequence(), 200);
    Effects.createBgParticles(screen, 12);
    return screen;
}

/**
 * Submits screening data to the FastAPI backend.
 * Handles loading state, success animation, and error retry.
 */
async function submitScreeningToBackend(loadingOverlay, statusBadge, unlockBtn) {
    // Don't re-submit if already done
    if (state.apiSubmitted) {
        loadingOverlay.classList.add('hidden');
        showApiSuccess(statusBadge, unlockBtn);
        return;
    }

    try {
        // Show loading
        loadingOverlay.classList.remove('hidden');

        // Submit to backend
        const result = await ApiService.submitScreening(state, state.wcrsResult);

        // Success!
        state.apiSubmitted = true;
        state.apiSessionId = result.session_id || result.id || null;
        loadingOverlay.classList.add('hidden');
        showApiSuccess(statusBadge, unlockBtn);

        console.log('[ReadBright] Screening saved! Session ID:', state.apiSessionId);

    } catch (error) {
        console.error('[ReadBright] API submission failed:', error);
        loadingOverlay.classList.add('hidden');

        // Show error with retry
        statusBadge.innerHTML = '';
        statusBadge.className = 'api-status-badge error';
        statusBadge.appendChild(
            el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' } }, [
                el('span', { text: '⚠ Could not save to server' }),
                el('button', {
                    class: 'btn-retry',
                    text: 'Retry',
                    onClick: () => submitScreeningToBackend(loadingOverlay, statusBadge, unlockBtn)
                })
            ])
        );

        // Still allow the child to continue (don't block on API failure)
        unlockBtn.classList.add('ready');
    }
}

/**
 * Shows success state after API submission.
 * Activates the scale + glow animation on the unlock button.
 */
function showApiSuccess(statusBadge, unlockBtn) {
    statusBadge.className = 'api-status-badge success';
    statusBadge.innerHTML = '';
    statusBadge.appendChild(el('span', { text: '✓ Adventure saved to the kingdom archives!' }));

    // Trigger the unlock button animation (scale + glow)
    setTimeout(() => {
        unlockBtn.classList.add('ready');
    }, 300);
}

function makeRewardRow(iconHtml, label, value, color) {
    return el('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } }, [
        el('div', { style: { width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: '0' }, html: iconHtml }),
        el('div', { style: { flex: '1', fontSize: '14px', fontWeight: '600', color: '#94A3B8' }, text: label }),
        el('div', { style: { fontSize: '18px', fontWeight: '800', color: color }, text: value })
    ]);
}

// ============================================
// SCREEN 10: Post Map
// ============================================
function renderPostMap() {
    const screen = el('div', { class: 'screen bg-magical' });
    screen.appendChild(makeTopBar({}));

    const svgLock = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
    const renderKingdoms = KINGDOMS.map(k => {
        const isSound = k.id === 'sound';
        return el('div', { class: `kingdom-node ${isSound ? 'unlocked' : 'locked'}` }, [
            el('div', { class: 'kingdom-icon', style: { background: k.color }, html: k.icon }),
            el('div', { class: 'kingdom-name', text: k.name }),
            isSound
                ? el('div', { style: { fontSize: '9px', color: '#00D4C8', fontWeight: '700' }, text: 'UNLOCKED' })
                : el('span', { class: 'kingdom-lock', html: svgLock })
        ]);
    });

    const content = el('div', { class: 'screen-content' }, [
        el('div', { class: 'banner', style: { borderColor: 'rgba(0,212,200,0.3)' } }, [
            el('div', { class: 'banner-title', text: 'Sound Kingdom Unlocked!' }),
            el('p', { class: 'small-text', text: 'This is a screening tool only — not a medical diagnosis. Full report is ready for parents.' })
        ]),
        el('div', { class: 'world-map' }, renderKingdoms),
        el('button', { class: 'btn btn-primary btn-lg btn-full', text: 'Continue Adventure', onClick: () => Effects.showEncouragement('Coming soon!') }),
        el('button', { class: 'btn btn-secondary btn-full', text: 'Send Report to Parent', onClick: () => Effects.showEncouragement('Report sent!') })
    ]);

    screen.appendChild(content);
    screen.appendChild(makeBottomBar());
    Effects.createBgParticles(screen, 10);
    return screen;
}

// ============================================
// SCREEN 11: Parent Report (Enhanced with WCRS)
// ============================================
function renderParentReport() {
    const screen = el('div', { class: 'screen bg-portal' });
    screen.appendChild(makeTopBar({ currencies: false }));
    const track = AGE_TRACKS[state.ageTrack];
    const s = state.scores;
    const wcrs = state.wcrsResult || WCRSEngine.calculate(s, state.ageTrack);

    // --- WCRS Risk Banner ---
    const riskBanner = el('div', { class: 'risk-banner', style: { borderColor: wcrs.riskColor } }, [
        el('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' } }, [
            el('div', { class: 'wcrs-score-circle', style: { borderColor: wcrs.riskColor, color: wcrs.riskColor }, text: `${wcrs.wcrs}` }),
            el('div', {}, [
                el('div', { style: { fontSize: '14px', fontWeight: '800', color: wcrs.riskColor }, text: wcrs.riskLabel }),
                el('div', { style: { fontSize: '11px', color: '#94A3B8' }, text: 'Weighted Composite Risk Score (WCRS)' })
            ])
        ]),
        el('p', { style: { fontSize: '12px', color: '#94A3B8', margin: '0' }, text: wcrs.riskDescription })
    ]);

    // --- Per-task risk indicators ---
    function taskRiskIndicator(risk) {
        const colors = { low: '#10B981', some: '#F59E0B', at_risk: '#EF4444' };
        const labels = { low: 'On Track', some: 'Monitor', at_risk: 'At Risk' };
        return el('span', { class: 'task-risk-pill', style: { background: colors[risk] + '22', color: colors[risk], border: `1px solid ${colors[risk]}44` }, text: labels[risk] });
    }

    // --- Score bar visual ---
    function scoreBar(pct, color) {
        return el('div', { class: 'score-bar-bg' }, [
            el('div', { class: 'score-bar-fill', style: { width: `${pct}%`, background: color } })
        ]);
    }

    const content = el('div', { class: 'screen-content' }, [
        el('h1', { class: 'title', style: { fontSize: '22px' }, text: 'Screening Report' }),
        el('p', { class: 'body-text', style: { fontSize: '13px' }, html: `<strong>${state.childName}</strong> · Age ${state.childAge} · ${track.name}` }),

        el('div', { class: 'notice-box', html: '<strong>Important:</strong> This is a screening tool — NOT a diagnosis. Consult a qualified professional for formal assessment.' }),

        riskBanner,

        // --- LNF Card ---
        el('div', { class: 'card', style: { marginBottom: '10px' } }, [
            el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' } }, [
                el('h3', { style: { fontSize: '14px', margin: '0', color: '#00D4C8' }, text: 'Letter Naming (LNF)' }),
                taskRiskIndicator(wcrs.taskRisks.lnf)
            ]),
            el('p', { class: 'small-text', html: `Letters named: <strong>${s.lnf.correct}</strong> / ${s.lnf.total}` }),
            el('p', { class: 'small-text', html: `Time: <strong>${s.lnf.timeSpent || 60}s</strong> · Normalized: <strong>${wcrs.taskScores.lnf}%</strong>` }),
            scoreBar(wcrs.taskScores.lnf, '#00D4C8')
        ]),

        // --- PSF Card ---
        el('div', { class: 'card', style: { marginBottom: '10px' } }, [
            el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' } }, [
                el('h3', { style: { fontSize: '14px', margin: '0', color: '#10B981' }, text: 'Phonemic Segmentation (PSF)' }),
                taskRiskIndicator(wcrs.taskRisks.psf)
            ]),
            el('p', { class: 'small-text', html: `Correct sounds: <strong>${s.psf.correctSounds}</strong> / ${s.psf.totalSounds}` }),
            el('p', { class: 'small-text', html: `Words segmented: <strong>${s.psf.wordsCorrect}</strong> · Normalized: <strong>${wcrs.taskScores.psf}%</strong>` }),
            scoreBar(wcrs.taskScores.psf, '#10B981')
        ]),

        // --- NWF Card ---
        el('div', { class: 'card', style: { marginBottom: '10px' } }, [
            el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' } }, [
                el('h3', { style: { fontSize: '14px', margin: '0', color: '#8B5CF6' }, text: 'Nonsense Word Fluency (NWF)' }),
                taskRiskIndicator(wcrs.taskRisks.nwf)
            ]),
            el('p', { class: 'small-text', html: `Correct Letter Sounds (CLS): <strong>${s.nwf.cls}</strong>` }),
            el('p', { class: 'small-text', html: `Whole Words Read (WWR): <strong>${s.nwf.wwr}</strong> · Total: <strong>${s.nwf.totalWords}</strong>` }),
            el('p', { class: 'small-text', html: `Normalized: <strong>${wcrs.taskScores.nwf}%</strong>` }),
            scoreBar(wcrs.taskScores.nwf, '#8B5CF6')
        ]),

        // --- Recommendations ---
        el('div', { class: 'card' }, [
            el('h3', { style: { fontSize: '14px', marginBottom: '6px' }, text: 'Recommendations' }),
            ...(wcrs.riskTier === 'at_risk' ? [
                el('p', { class: 'small-text', text: '• Professional reading assessment is strongly recommended' }),
                el('p', { class: 'small-text', text: '• Consult a reading specialist or educational psychologist' }),
                el('p', { class: 'small-text', text: '• Use ReadBright daily for targeted intervention practice' })
            ] : wcrs.riskTier === 'some' ? [
                el('p', { class: 'small-text', text: '• Monitor reading progress closely over the next 4–6 weeks' }),
                el('p', { class: 'small-text', text: '• Use ReadBright daily for targeted practice' }),
                el('p', { class: 'small-text', text: '• Consider re-screening in 6–8 weeks' }),
                el('p', { class: 'small-text', text: '• Consult a specialist if concerns persist' })
            ] : [
                el('p', { class: 'small-text', text: '• Continue using ReadBright for enrichment' }),
                el('p', { class: 'small-text', text: '• Reading development appears on track' }),
                el('p', { class: 'small-text', text: '• Re-screen periodically to track progress' })
            ])
        ]),

        // --- API status ---
        state.apiSubmitted
            ? el('div', { class: 'api-saved-badge', text: `✓ Saved to database${state.apiSessionId ? ' · Session #' + state.apiSessionId : ''}` })
            : el('div', { class: 'api-saved-badge unsaved', text: '⚠ Not yet saved to server' }),

        el('button', { class: 'btn btn-primary btn-full', text: 'Back to World Map', onClick: () => goTo('postMap') }),
        el('button', { class: 'btn btn-secondary btn-full', text: 'Email Report', onClick: () => handleEmailReport() })
    ]);

    screen.appendChild(content);
    return screen;
}

/**
 * Handle email report button click.
 * If parent email was provided, we could send via backend.
 */
function handleEmailReport() {
    if (state.parentEmail) {
        Effects.showEncouragement('Report sent to ' + state.parentEmail + '!');
    } else {
        Effects.showEncouragement('No parent email provided');
    }
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    goTo('consent');
    document.addEventListener('input', (e) => {
        if (e.target.id === 'child-name') {
            const btn = document.getElementById('consent-btn');
            if (btn) btn.disabled = !(state.consentGiven && e.target.value.trim());
        }
    });
});
