/* ============================================
   ReadBright — API Service & WCRS Engine
   Connects screening module to FastAPI backend
   ============================================ */

const API_BASE_URL = 'http://127.0.0.1:8000';

// ============================================
// WCRS (Weighted Composite Risk Score) Engine
// Based on DIBELS 8th Edition benchmark logic
// ============================================
const WCRSEngine = {

    /**
     * Weight configuration per task.
     * PSF and NWF are weighted higher as they are stronger
     * predictors of reading difficulty (per DIBELS research).
     */
    WEIGHTS: {
        lnf: 0.30,  // Letter Naming Fluency
        psf: 0.35,  // Phoneme Segmentation Fluency
        nwf: 0.35   // Nonsense Word Fluency
    },

    /**
     * Age-adjusted benchmarks (DIBELS 8th Edition standards).
     * These represent the "expected" scores for each age track.
     * Scores are normalized against these benchmarks.
     */
    BENCHMARKS: {
        foundational: { // Ages 5-8
            lnf: { expected: 15, min: 5 },   // Letters named in 60s
            psf: { expected: 8, min: 3 },     // Correct phonemes
            nwf: { expected: 8, min: 3 }      // Correct letter sounds (CLS)
        },
        decoding: { // Ages 8-10
            lnf: { expected: 25, min: 10 },
            psf: { expected: 12, min: 5 },
            nwf: { expected: 15, min: 6 }
        },
        comprehension: { // Ages 11-13
            lnf: { expected: 30, min: 15 },
            psf: { expected: 15, min: 8 },
            nwf: { expected: 20, min: 10 }
        }
    },

    /**
     * Risk tier thresholds.
     * These map WCRS percentages to risk categories.
     */
    RISK_TIERS: [
        { id: 'low',     label: 'Low Risk',         min: 70, color: '#10B981', description: 'On track — continue enrichment activities' },
        { id: 'some',    label: 'Some Risk',         min: 40, color: '#F59E0B', description: 'Monitor closely — targeted practice recommended' },
        { id: 'at_risk', label: 'At Risk',           min: 0,  color: '#EF4444', description: 'Professional assessment recommended' }
    ],

    /**
     * Normalize a raw score to a 0–100 percentage
     * based on the age-track benchmark.
     * Clamps to 0–100 range.
     */
    normalizeScore(rawScore, benchmark) {
        if (benchmark.expected <= 0) return 0;
        const pct = (rawScore / benchmark.expected) * 100;
        return Math.max(0, Math.min(100, pct));
    },

    /**
     * Calculate the WCRS (Weighted Composite Risk Score).
     * Returns an object with per-task normalized scores,
     * the composite WCRS, and the determined risk tier.
     * 
     * @param {Object} scores  - state.scores from the app
     * @param {string} ageTrack - 'foundational', 'decoding', or 'comprehension'
     * @returns {Object} Full WCRS analysis
     */
    calculate(scores, ageTrack) {
        const benchmarks = this.BENCHMARKS[ageTrack] || this.BENCHMARKS.foundational;

        // --- Normalize each task score ---
        const lnfNorm = this.normalizeScore(scores.lnf.correct, benchmarks.lnf);
        const psfNorm = this.normalizeScore(scores.psf.correctSounds, benchmarks.psf);
        const nwfNorm = this.normalizeScore(scores.nwf.cls, benchmarks.nwf);

        // --- Calculate weighted composite ---
        const wcrs = Math.round(
            (lnfNorm * this.WEIGHTS.lnf) +
            (psfNorm * this.WEIGHTS.psf) +
            (nwfNorm * this.WEIGHTS.nwf)
        );

        // --- Determine risk tier ---
        const riskTier = this.RISK_TIERS.find(t => wcrs >= t.min) || this.RISK_TIERS[this.RISK_TIERS.length - 1];

        // --- Determine per-task risk flags ---
        const taskRisks = {
            lnf: scores.lnf.correct < benchmarks.lnf.min ? 'at_risk' : (lnfNorm < 70 ? 'some' : 'low'),
            psf: scores.psf.correctSounds < benchmarks.psf.min ? 'at_risk' : (psfNorm < 70 ? 'some' : 'low'),
            nwf: scores.nwf.cls < benchmarks.nwf.min ? 'at_risk' : (nwfNorm < 70 ? 'some' : 'low')
        };

        return {
            // Per-task normalized percentages (0-100)
            taskScores: {
                lnf: Math.round(lnfNorm),
                psf: Math.round(psfNorm),
                nwf: Math.round(nwfNorm)
            },
            // Raw scores (for backend storage)
            rawScores: {
                lnf: { correct: scores.lnf.correct, total: scores.lnf.total, timeSpent: scores.lnf.timeSpent },
                psf: { correctSounds: scores.psf.correctSounds, totalSounds: scores.psf.totalSounds, wordsCorrect: scores.psf.wordsCorrect },
                nwf: { cls: scores.nwf.cls, wwr: scores.nwf.wwr, totalWords: scores.nwf.totalWords }
            },
            // Per-task risk flags
            taskRisks,
            // Composite WCRS (0-100)
            wcrs: Math.max(0, Math.min(100, wcrs)),
            // Overall risk tier
            riskTier: riskTier.id,
            riskLabel: riskTier.label,
            riskColor: riskTier.color,
            riskDescription: riskTier.description,
            // Metadata
            ageTrack,
            weights: { ...this.WEIGHTS },
            benchmarksUsed: { ...benchmarks },
            calculatedAt: new Date().toISOString()
        };
    }
};


// ============================================
// API Service — Connects to FastAPI Backend
// ============================================
const ApiService = {

    /**
     * Submit the complete screening session to the backend.
     * Sends child info, all three task scores, WCRS, and risk tier.
     *
     * Endpoint: POST /screening/submit
     *
     * @param {Object} appState   - The full app state object
     * @param {Object} wcrsResult - The calculated WCRS result
     * @returns {Promise<Object>} Server response with session ID
     */
    async submitScreening(appState, wcrsResult) {
        const payload = {
            // --- Child Information ---
            child: {
                name: appState.childName || 'Unknown',
                age: appState.childAge,
                grade: appState.childGrade || '',
                parent_email: appState.parentEmail || '',
                avatar: appState.selectedAvatar || 'knight',
                age_track: appState.ageTrack || 'foundational'
            },

            // --- Task Results (raw scores) ---
            task_results: [
                {
                    task_type: 'LNF',
                    task_name: 'Letter Park',
                    correct: wcrsResult.rawScores.lnf.correct,
                    total: wcrsResult.rawScores.lnf.total,
                    time_spent_seconds: wcrsResult.rawScores.lnf.timeSpent || 60,
                    normalized_score: wcrsResult.taskScores.lnf,
                    risk_flag: wcrsResult.taskRisks.lnf,
                    details: {
                        letters_named: wcrsResult.rawScores.lnf.correct,
                        total_letters: wcrsResult.rawScores.lnf.total
                    }
                },
                {
                    task_type: 'PSF',
                    task_name: 'Sound Tree',
                    correct: wcrsResult.rawScores.psf.correctSounds,
                    total: wcrsResult.rawScores.psf.totalSounds,
                    time_spent_seconds: 60,
                    normalized_score: wcrsResult.taskScores.psf,
                    risk_flag: wcrsResult.taskRisks.psf,
                    details: {
                        correct_sounds: wcrsResult.rawScores.psf.correctSounds,
                        total_sounds: wcrsResult.rawScores.psf.totalSounds,
                        words_correct: wcrsResult.rawScores.psf.wordsCorrect
                    }
                },
                {
                    task_type: 'NWF',
                    task_name: 'Alien Words',
                    correct: wcrsResult.rawScores.nwf.cls,
                    total: wcrsResult.rawScores.nwf.totalWords,
                    time_spent_seconds: 60,
                    normalized_score: wcrsResult.taskScores.nwf,
                    risk_flag: wcrsResult.taskRisks.nwf,
                    details: {
                        correct_letter_sounds: wcrsResult.rawScores.nwf.cls,
                        whole_words_read: wcrsResult.rawScores.nwf.wwr,
                        total_words: wcrsResult.rawScores.nwf.totalWords
                    }
                }
            ],

            // --- WCRS Composite ---
            wcrs_score: wcrsResult.wcrs,
            risk_tier: wcrsResult.riskTier,
            risk_label: wcrsResult.riskLabel,
            age_track: wcrsResult.ageTrack,
            weights_used: wcrsResult.weights,
            benchmarks_used: wcrsResult.benchmarksUsed,

            // --- Rewards (gamification — child-facing only) ---
            rewards: { ...appState.rewards },

            // --- Metadata ---
            screening_version: '1.0.0',
            completed_at: new Date().toISOString()
        };

        console.log('[ReadBright API] Submitting screening payload:', payload);

        const response = await fetch(`${API_BASE_URL}/screening/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[ReadBright API] Server error:', response.status, errorText);
            throw new Error(`Server error ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log('[ReadBright API] Screening submitted successfully:', result);
        return result;
    },

    /**
     * Health check — verify backend is reachable.
     * @returns {Promise<boolean>}
     */
    async healthCheck() {
        try {
            const response = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
            return response.ok;
        } catch (e) {
            console.warn('[ReadBright API] Backend unreachable:', e.message);
            return false;
        }
    }
};
