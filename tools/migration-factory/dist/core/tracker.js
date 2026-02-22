/**
 * Tracker I/O: read, update, and persist tracker.json.
 */
import fs from 'node:fs';
// ─── Read tracker ────────────────────────────────────────────────
export const readTracker = (filePath) => {
    const raw = fs.readFileSync(filePath, 'utf8');
    const doc = JSON.parse(raw);
    return {
        version: doc.version ?? '1.0',
        methodology: doc.methodology ?? 'SPECMAP',
        created: doc.created ?? new Date().toISOString().slice(0, 10),
        updated: doc.updated ?? new Date().toISOString().slice(0, 10),
        status: doc.status ?? 'pending',
        stats: {
            totalPrograms: doc.stats?.total_programs ?? doc.stats?.totalPrograms ?? 0,
            livePrograms: doc.stats?.live_programs ?? doc.stats?.livePrograms ?? 0,
            orphanPrograms: doc.stats?.orphan_programs ?? doc.stats?.orphanPrograms ?? 0,
            sharedPrograms: doc.stats?.ecf_programs ?? doc.stats?.sharedPrograms ?? 0,
            contracted: doc.stats?.contracted ?? 0,
            enriched: doc.stats?.enriched ?? 0,
            verified: doc.stats?.verified ?? 0,
            maxLevel: doc.stats?.max_level ?? doc.stats?.maxLevel ?? 0,
            lastComputed: doc.stats?.last_computed ?? doc.stats?.lastComputed ?? '',
        },
        batches: (doc.batches ?? []).map(mapBatch),
        notes: doc.notes ?? [],
        calibration: doc.calibration ? {
            hoursPerPoint: Number(doc.calibration.hoursPerPoint ?? doc.calibration.hours_per_point ?? 0),
            dataPoints: Number(doc.calibration.dataPoints ?? doc.calibration.data_points ?? 0),
            calibratedAt: String(doc.calibration.calibratedAt ?? doc.calibration.calibrated_at ?? ''),
            accuracy: Number(doc.calibration.accuracy ?? 0),
        } : undefined,
    };
};
// ─── Write tracker ───────────────────────────────────────────────
export const writeTracker = (tracker, filePath) => {
    const doc = {
        version: tracker.version,
        methodology: tracker.methodology,
        created: tracker.created,
        updated: new Date().toISOString().slice(0, 10),
        status: tracker.status,
        stats: {
            total_programs: tracker.stats.totalPrograms,
            live_programs: tracker.stats.livePrograms,
            orphan_programs: tracker.stats.orphanPrograms,
            ecf_programs: tracker.stats.sharedPrograms,
            contracted: tracker.stats.contracted,
            enriched: tracker.stats.enriched,
            verified: tracker.stats.verified,
            max_level: tracker.stats.maxLevel,
            last_computed: tracker.stats.lastComputed,
        },
        batches: tracker.batches.map(b => ({
            id: b.id,
            name: b.name,
            root: b.root,
            programs: b.programs,
            status: b.status,
            contracted_date: b.contractedDate,
            enriched_date: b.enrichedDate,
            verified_date: b.verifiedDate,
            stats: {
                backend_na: b.stats.backendNa,
                frontend_enrich: b.stats.frontendEnrich,
                fully_impl: b.stats.fullyImpl,
                coverage_avg_frontend: b.stats.coverageAvgFrontend,
                total_partial: b.stats.totalPartial,
                total_missing: b.stats.totalMissing,
            },
            priority_order: b.priorityOrder,
            ...(b.domain != null ? { domain: b.domain } : {}),
            ...(b.complexityGrade != null ? { complexity_grade: b.complexityGrade } : {}),
            ...(b.estimatedHours != null ? { estimated_hours: b.estimatedHours } : {}),
            ...(b.autoDetected != null ? { auto_detected: b.autoDetected } : {}),
        })),
        notes: tracker.notes,
        ...(tracker.calibration ? {
            calibration: {
                hoursPerPoint: tracker.calibration.hoursPerPoint,
                dataPoints: tracker.calibration.dataPoints,
                calibratedAt: tracker.calibration.calibratedAt,
                accuracy: tracker.calibration.accuracy,
            },
        } : {}),
    };
    // Preserve migrate section (written by migrate-tracker.ts) if it exists
    if (fs.existsSync(filePath)) {
        try {
            const existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            if (existing.migrate) {
                doc.migrate = existing.migrate;
            }
        }
        catch { /* ignore parse errors */ }
    }
    fs.writeFileSync(filePath, JSON.stringify(doc, null, 2), 'utf8');
};
// ─── Update stats in tracker ─────────────────────────────────────
export const updateTrackerStats = (tracker, updates) => ({
    ...tracker,
    updated: new Date().toISOString().slice(0, 10),
    stats: { ...tracker.stats, ...updates },
});
// ─── Update batch status ─────────────────────────────────────────
export const updateBatchStatus = (tracker, batchId, status) => {
    const today = new Date().toISOString().slice(0, 10);
    const batches = tracker.batches.map(b => {
        if (b.id !== batchId)
            return b;
        const updated = { ...b, status };
        if (status === 'contracted')
            updated.contractedDate = today;
        if (status === 'enriched')
            updated.enrichedDate = today;
        if (status === 'verified')
            updated.verifiedDate = today;
        return updated;
    });
    return { ...tracker, batches, updated: today };
};
// ─── Create fresh tracker ────────────────────────────────────────
export const createTracker = (projectName) => ({
    version: '1.0',
    methodology: 'SPECMAP',
    created: new Date().toISOString().slice(0, 10),
    updated: new Date().toISOString().slice(0, 10),
    status: 'pending',
    stats: {
        totalPrograms: 0,
        livePrograms: 0,
        orphanPrograms: 0,
        sharedPrograms: 0,
        contracted: 0,
        enriched: 0,
        verified: 0,
        maxLevel: 0,
        lastComputed: '',
    },
    batches: [],
    notes: [`Migration tracker for ${projectName}`, 'SPECMAP methodology: EXTRACT -> MAP -> GAP -> CONTRACT -> ENRICH -> VERIFY'],
});
// ─── Helpers ─────────────────────────────────────────────────────
const mapBatch = (b) => ({
    id: String(b.id ?? ''),
    name: String(b.name ?? ''),
    root: b.root ?? 0,
    programs: Number(b.programs ?? 0),
    status: b.status ?? 'pending',
    contractedDate: b.contracted_date,
    enrichedDate: b.enriched_date,
    verifiedDate: b.verified_date,
    stats: {
        backendNa: Number(b.stats?.backend_na ?? 0),
        frontendEnrich: Number(b.stats?.frontend_enrich ?? 0),
        fullyImpl: Number(b.stats?.fully_impl ?? 0),
        coverageAvgFrontend: Number(b.stats?.coverage_avg_frontend ?? 0),
        totalPartial: Number(b.stats?.total_partial ?? 0),
        totalMissing: Number(b.stats?.total_missing ?? 0),
    },
    priorityOrder: b.priority_order ?? [],
    domain: b.domain,
    complexityGrade: b.complexity_grade,
    estimatedHours: b.estimated_hours != null ? Number(b.estimated_hours) : undefined,
    autoDetected: b.auto_detected != null ? Boolean(b.auto_detected) : undefined,
});
// ─── Upsert batches (preserve existing, add new) ────────────────
export const upsertBatches = (tracker, newBatches) => {
    const existingIds = new Set(tracker.batches.map(b => b.id));
    const toAdd = newBatches.filter(b => !existingIds.has(b.id));
    return {
        ...tracker,
        updated: new Date().toISOString().slice(0, 10),
        batches: [...tracker.batches, ...toAdd],
    };
};
//# sourceMappingURL=tracker.js.map