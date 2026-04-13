/* ============================================
   ReadBright — DIBELS 8th Edition Content Data
   Original content, structurally equivalent to DIBELS
   ============================================ */

// --- LETTER NAMING FLUENCY (LNF) ---
// Random letter arrays per age track (from DIBELS K-G3 structure)
const LNF_DATA = {
    // 5-8: Simple, fewer letters, large display
    foundational: {
        letters: [
            'a','T','m','S','p','L','o','r','u','v',
            'C','M','O','h','k','E','U','e','f','A',
            'B','c','I','D','i','y','N','F','s','g',
            'P','G','d','x','t','H','R','j','n','b'
        ],
        gridCols: 4,
        gridRows: 5,
        displayCount: 20,
        fontSize: 'young',
        showTimer: false,
        timeLimit: 60
    },
    // 8-10: More letters, medium display
    decoding: {
        letters: [
            't','r','c','g','T','M','B','G','s','v',
            'N','U','e','p','A','D','f','C','H','a',
            'y','P','F','d','b','R','j','n','I','x',
            'i','m','S','O','o','u','E','L','h','k',
            'N','j','r','b','x','e','u','A','H','o'
        ],
        gridCols: 5,
        gridRows: 6,
        displayCount: 30,
        fontSize: 'mid',
        showTimer: true,
        timeLimit: 60
    },
    // 11-13: Dense grid, rapid naming
    comprehension: {
        letters: [
            'o','s','c','g','A','E','O','U','n','k',
            'R','j','a','u','I','H','m','C','B','i',
            'v','N','F','r','b','M','L','d','T','D',
            't','f','S','x','e','p','P','G','h','y',
            'E','F','h','g','B','i','m','C','O','e',
            'u','S','U','r','v','P','j','d','b','N'
        ],
        gridCols: 6,
        gridRows: 6,
        displayCount: 36,
        fontSize: 'old',
        showTimer: true,
        timeLimit: 60
    }
};

// --- PHONEMIC SEGMENTATION FLUENCY (PSF) ---
// Words with correct phoneme breakdowns
const PSF_DATA = {
    foundational: {
        words: [
            { word: 'sun', sounds: ['s','u','n'] },
            { word: 'cat', sounds: ['c','a','t'] },
            { word: 'dog', sounds: ['d','o','g'] },
            { word: 'map', sounds: ['m','a','p'] },
            { word: 'bat', sounds: ['b','a','t'] },
            { word: 'hop', sounds: ['h','o','p'] },
            { word: 'red', sounds: ['r','e','d'] },
            { word: 'fin', sounds: ['f','i','n'] },
            { word: 'log', sounds: ['l','o','g'] },
            { word: 'cup', sounds: ['c','u','p'] }
        ],
        distractors: ['p','k','th','sh','z','w','v','ee','oo','ar'],
        timeLimit: 60,
        showTimer: false
    },
    decoding: {
        words: [
            { word: 'store', sounds: ['s','t','or'] },
            { word: 'chain', sounds: ['ch','ai','n'] },
            { word: 'blue', sounds: ['b','l','oo'] },
            { word: 'ride', sounds: ['r','ie','d'] },
            { word: 'south', sounds: ['s','ou','th'] },
            { word: 'week', sounds: ['w','ee','k'] },
            { word: 'wrote', sounds: ['r','oa','t'] },
            { word: 'safe', sounds: ['s','ay','f'] },
            { word: 'hill', sounds: ['h','i','ll'] },
            { word: 'board', sounds: ['b','or','d'] }
        ],
        distractors: ['p','k','z','w','v','ar','er','oy','aw','air'],
        timeLimit: 60,
        showTimer: true
    },
    comprehension: {
        words: [
            { word: 'strike', sounds: ['s','t','r','ie','k'] },
            { word: 'ground', sounds: ['g','r','ou','n','d'] },
            { word: 'bright', sounds: ['b','r','ie','t'] },
            { word: 'float', sounds: ['f','l','oa','t'] },
            { word: 'choice', sounds: ['ch','oi','s'] },
            { word: 'shout', sounds: ['sh','ou','t'] },
            { word: 'stream', sounds: ['s','t','r','ee','m'] },
            { word: 'cloud', sounds: ['c','l','ou','d'] },
            { word: 'throne', sounds: ['th','r','oa','n'] },
            { word: 'plunge', sounds: ['p','l','u','n','j'] }
        ],
        distractors: ['w','v','z','ar','er','air','oy','aw','igh','ear'],
        timeLimit: 60,
        showTimer: true
    }
};

// --- NONSENSE WORD FLUENCY (NWF) ---
// Pseudowords with their correct sound breakdowns
const NWF_DATA = {
    foundational: {
        words: [
            { word: 'sep', sounds: ['s','e','p'] },
            { word: 'rop', sounds: ['r','o','p'] },
            { word: 'lan', sounds: ['l','a','n'] },
            { word: 'tup', sounds: ['t','u','p'] },
            { word: 'nen', sounds: ['n','e','n'] },
            { word: 'het', sounds: ['h','e','t'] },
            { word: 'dem', sounds: ['d','e','m'] },
            { word: 'som', sounds: ['s','o','m'] },
            { word: 'tig', sounds: ['t','i','g'] },
            { word: 'nup', sounds: ['n','u','p'] },
            { word: 'lun', sounds: ['l','u','n'] },
            { word: 'hon', sounds: ['h','o','n'] },
            { word: 'dit', sounds: ['d','i','t'] },
            { word: 'nam', sounds: ['n','a','m'] },
            { word: 'fon', sounds: ['f','o','n'] }
        ],
        timeLimit: 60,
        showTimer: false
    },
    decoding: {
        words: [
            { word: 'strit', sounds: ['s','t','r','i','t'] },
            { word: 'grend', sounds: ['g','r','e','n','d'] },
            { word: 'bloint', sounds: ['b','l','oi','n','t'] },
            { word: 'thaid', sounds: ['th','ai','d'] },
            { word: 'snent', sounds: ['s','n','e','n','t'] },
            { word: 'phot', sounds: ['ph','o','t'] },
            { word: 'tring', sounds: ['t','r','i','ng'] },
            { word: 'shost', sounds: ['sh','o','s','t'] },
            { word: 'gread', sounds: ['g','r','ea','d'] },
            { word: 'twend', sounds: ['t','w','e','n','d'] },
            { word: 'broul', sounds: ['b','r','ou','l'] },
            { word: 'whid', sounds: ['wh','i','d'] }
        ],
        timeLimit: 60,
        showTimer: true
    },
    comprehension: {
        words: [
            { word: 'naspent', sounds: ['n','a','s','p','e','n','t'] },
            { word: 'regust', sounds: ['r','e','g','u','s','t'] },
            { word: 'fintent', sounds: ['f','i','n','t','e','n','t'] },
            { word: 'stispy', sounds: ['s','t','i','s','p','y'] },
            { word: 'plunky', sounds: ['p','l','u','n','k','y'] },
            { word: 'tagent', sounds: ['t','a','g','e','n','t'] },
            { word: 'mifty', sounds: ['m','i','f','t','y'] },
            { word: 'gresty', sounds: ['g','r','e','s','t','y'] },
            { word: 'sloach', sounds: ['s','l','oa','ch'] },
            { word: 'tweep', sounds: ['t','w','ee','p'] }
        ],
        timeLimit: 60,
        showTimer: true
    }
};

// --- ENCOURAGEMENT MESSAGES ---
const ENCOURAGEMENTS = [
    "Amazing!",
    "Great job!",
    "You're a star!",
    "Wonderful!",
    "Keep going!",
    "Brilliant!",
    "Superstar!",
    "Fantastic!",
    "You rock!",
    "Way to go!",
    "Incredible!",
    "So brave!"
];

// --- AVATAR DATA ---
const AVATARS = {
    knight: {
        name: 'The Brave Knight',
        image: 'assets/knight.png',
        description: 'Athletic and confident, with realistic silver-blue armor and glowing teal runes.',
        color: '#00D4C8',
        gradient: 'linear-gradient(135deg, #1565C0, #00ACC1)'
    },
    elf: {
        name: 'The Wise Elf',
        image: 'assets/elf.png',
        description: 'Graceful and curious, with an intelligent spark and flowing auburn hair.',
        color: '#10B981',
        gradient: 'linear-gradient(135deg, #2E7D32, #66BB6A)'
    },
    wizard: {
        name: 'The Star Wizard',
        image: 'assets/wizard.png',
        description: 'Calm and mysterious, with soft intelligent eyes and a crystal staff.',
        color: '#8B5CF6',
        gradient: 'linear-gradient(135deg, #6B46C0, #9575CD)'
    }
};

// --- KINGDOM DATA ---
const KINGDOMS = [
    { id: 'sound', name: 'Sound Kingdom', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>', color: '#3B82F6', focus: 'Phonological Awareness' },
    { id: 'word', name: 'Word Forest', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22v-4"/><path d="M7 18h10"/><path d="M12 18V8"/><path d="M7 8V6a5 5 0 0 1 10 0v2"/><path d="M5 8h14"/><path d="M3 8c0 2 0 4 3 4s3-2 3-4"/><path d="M9 8c0 2 0 4 3 4s3-2 3-4"/><path d="M15 8c0 2 0 4 3 4s3-2 3-4"/></svg>', color: '#10B981', focus: 'Phonics & Decoding' },
    { id: 'sentence', name: 'Sentence Valley', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>', color: '#8B5CF6', focus: 'Reading Fluency' },
    { id: 'maths', name: 'Maths Mountain', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3l4 8 5-5 5 15H2L8 3z"/></svg>', color: '#F59E0B', focus: 'Analytical Thinking' },
    { id: 'memory', name: 'Memory Sea', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h4l2-9 5 18 4-13 3 8h2"/></svg>', color: '#06B6D4', focus: 'Working Memory' },
    { id: 'crown', name: 'Crown of Kingdoms', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 21h14"/><path d="M19 18L19 7l-5 4-2-7-2 7-5-4 0 11"/></svg>', color: '#EF4444', focus: 'All Skills Combined' }
];

// --- AGE TRACK DEFINITIONS ---
const AGE_TRACKS = {
    foundational: {
        name: 'Foundational Track',
        ageRange: '5–8 years',
        focus: 'Foundational Phonics',
        description: 'Large fonts, simple sounds, visual-heavy, minimal time pressure, big rewards',
        color: '#4FC3F7'
    },
    decoding: {
        name: 'Decoding Track',
        ageRange: '8–10 years',
        focus: 'Decoding & Fluency',
        description: 'Medium complexity, blends and digraphs, light timing, sentence-level work',
        color: '#FFB300'
    },
    comprehension: {
        name: 'Comprehension Track',
        ageRange: '11–13 years',
        focus: 'Comprehension & Expression',
        description: 'Complex vocabulary, timed challenges, analytical and memory tasks',
        color: '#FF7043'
    }
};

// Helper: get track from age
function getAgeTrack(age) {
    if (age <= 8) return 'foundational';
    if (age <= 10) return 'decoding';
    return 'comprehension';
}

// Helper: shuffle array
function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// Helper: get random encouragement
function getEncouragement() {
    return ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
}
