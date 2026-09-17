# CAST-0009 ASSURE

Copy this whole folder to create a new job. Rename the copy to the control number and
codename, for example `CAST-0007_ACQUIRE_TRIAGE/`. Log the new control number in
`CAST_JOBS/_JOB_INDEX.md` the same day, at Phase 0.

Folders map to the CAST-001 lifecycle:

| Folder | CAST-001 phase |
|---|---|
| 00_INTENT | 0. Intent |
| 01_FRAMEWORK | 1. Mission analysis, and the framework Seagull stands up |
| 02_ESTIMATE | continues Phase 1, the seven-question estimate |
| 03_GATE1_COA_DECISION | 4. HITL Gate 1 |
| 04_WARGAME_RESOURCING | 5. Wargame and resourcing |
| 05_GATE2_LAUNCH | 6. HITL Gate 2 |
| 06_EXECUTION | 7. Execution |
| 07_HANDOVER | 8. Handover |
| 08_LESSONS_AND_CLOSE | 9. Lessons and close |

`registers/` holds this job's own R01 to R10, opened empty. `material/` is where Sunray
places input files; anything absent is treated as absent, per Lesson L6. `T27_IRTB.md`
sits at this root because it is used from any phase, not one.

R11, the capability corpus, is not copied in here. It is standing, not per-job: read and
write it at `SEAGULL_CYCLE/standing/R11_CAPABILITY_REGISTER.md`.
