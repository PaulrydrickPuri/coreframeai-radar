# Work Package Checklist: 3D Inference Pipeline Visualizer

**Plan:** `docs/plans/3d-inference-pipeline.md`  
**Branch:** `feat/3d-inference-pipeline`  
**Status:** 🔴 Not started

---

## 🧠 Backend (Python — Core Modules)
**Assignee:** _(unassigned)_
- [ ] Task 1: Pipeline Feature Extractor — `test_extract_backbone_shapes`, `test_extract_neck_shapes`, `test_extract_returns_dict` pass
- [ ] Task 2: 3D Feature Map Visualization — `test_create_feature_block_returns_figure`, `test_create_pipeline_overview_returns_figure`, `test_feature_block_downsampled` pass
- [ ] Task 3: 3D Detection Box Visualization — `test_create_detection_3d_returns_figure`, `test_detection_3d_box_count`, `test_detection_3d_confidence_height` pass

---

## 🎨 Frontend (Streamlit — App Tabs)
**Assignee:** _(unassigned)_
- [ ] Task 4: Pipeline Overview Tab — Tab 1 renders 3D pipeline overview without errors
- [ ] Task 5: Stage Walkthrough Tab — Slider advances through 23 stages with feature map + info card
- [ ] Task 6: Detection in 3D Tab — Detection boxes render with confidence-proportional height
- [ ] Task 7: Pipeline Comparison Tab — Side-by-side teacher vs student feature maps at 6 key stages

---

## 🧪 QA / Integration
**Assignee:** _(unassigned)_
- [ ] Task 8: Integration test & docs — all 4 tabs load without errors, README updated

---

## How to Pick Up a Work Package

### Step 1 — Claim it (edit this file)
```
**Assignee:** @your-name   **Status:** 🟡 In progress
```
Commit and push the change so teammates know it's taken.

### Step 2 — Create your worktree (run in project root)
```bash
git fetch origin
git worktree add -b feat/3d-inference-pipeline-[package] ../neural-network-3d-viz-[package] origin/main
cd ../neural-network-3d-viz-[package]
```

Replace `[package]` with your discipline: `backend`, `frontend`, or `qa`.

### Step 3 — Open Claude Code and start work
```bash
claude
```

Then tell Claude:
```
I'm picking up the [Backend / Frontend / QA] work package for 3D inference pipeline.
My tasks are in docs/checklists/3d-inference-pipeline-checklist.md.
Let's start implementing.
```

Claude will read the plan and checklist and begin `/tdd` automatically.

### Step 4 — When all your tasks are done
```bash
/simplify   # always (reduces complexity, removes duplication)
/review     # always (self code-review before anyone else sees it)
/pr         # always (rebase, test, push, open PR, update checklist)
```

### Step 5 — After your PR is merged
```bash
cd ../neural-network-3d-viz
git worktree remove ../neural-network-3d-viz-[package]
git worktree prune
```

---

## Parallel Work Strategy

This project is designed for sequential execution by a solo developer:

1. **Backend** (Tasks 1-3) must complete first — all UI depends on data extraction
2. **Frontend** (Tasks 4-7) builds on backend modules — each tab uses the extractors and visualizers
3. **QA** (Task 8) runs last — integration testing after everything works

**Recommended sequence:**
- Task 1 → Tasks 2 & 3 (parallel) → Task 4 → Task 5 → Task 6 → Task 7 → Task 8

---

## Quick Reference

**Total tasks:** 8  
**Estimated time:** 4-5 hours (solo)  
**Tech stack:** Python 3.12 / Streamlit / Plotly / PyTorch / Ultralytics  
**Run command:** `PYTHONPATH=. streamlit run viz_tool/app.py`  
**Access URL:** http://localhost:8501  
**Repository:** https://github.com/PaulrydrickPuri/neural-network-3d-viz
