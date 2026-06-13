# Brainstorming: Training Monitor vs Inference Visualizer

**Date:** 2026-06-13  
**Status:** Proposed  
**Context:** MVP is working but doesn't "click" visually

---

## Problem Statement

The current 4-tab MVP (Architecture, Grad-CAM, Feature Space, Metrics) exists but isn't intuitive:
- Architecture tab shows parameter counts (abstract numbers)
- Grad-CAM is a flat 2D overlay (not really 3D)
- Feature Space is an abstract UMAP blob (hard to interpret)
- Metrics needs a CSV file (not immediately useful)

**Core issue:** Every tab shows abstract representations instead of concrete visual things.

**Proposed split:**
1. **Training Monitor in 3D** — watch the model learn over time
2. **Inference Visualizer in 3D** — see what the model "sees" when predicting on an image

---

## Options Considered

### Option A: Two Separate Streamlit Apps

**Description:** Build `inference_app.py` and `training_app.py` as independent apps. Inference focuses on single-image deep analysis. Training focuses on epoch-over-epoch monitoring.

**Pros:**
- Each app is focused, fast to load, easy to understand
- Can run independently
- Clear mental model

**Cons:**
- Shared code needs to be in `viz_tool/` package
- Two apps to maintain, two entry points to document
- Users need to know which one to open

**Complexity:** Medium

---

### Option B: One App, Two Clear Modes

**Description:** Single app with a mode selector at the top. "Inference Mode" and "Training Mode" are top-level tabs. Each mode has its own sub-tabs.

**Pros:**
- One entry point
- Shared sidebar for model/dataset config
- Easier to maintain as one codebase

**Cons:**
- Gets heavy — loading training data when you just want inference
- Tab-within-tabs can be confusing
- Slower startup

**Complexity:** Medium

---

### Option C: Inference-First MVP (3D Surface + Detection Overlay)

**Description:** Focus entirely on the inference module first. Make it visually striking:
- **3D Grad-CAM surface**: Heatmap as a raised 3D terrain over the image
- **Detection boxes as 3D volumes**: Predicted boxes extruded into 3D space with confidence as height
- **Feature pyramid viewer**: Show P3/P4/P5 feature maps at different scales
- **Class confidence bars**: 3D bar chart of detection confidence per class

Only add training monitoring later when you have an active training run producing checkpoints.

**Pros:**
- Immediate visual impact
- You load an image and immediately see something meaningful
- Uses models you already have
- No training logs needed

**Cons:**
- Doesn't address training monitoring yet
- But that's fine — you don't have an active training run right now

**Complexity:** Low-Medium

---

### Option D: Push to React Three Fiber for Real 3D

**Description:** Abandon Streamlit, build with React Three Fiber for true interactive 3D — orbit camera, zoom into feature maps, fly through detection boxes.

**Pros:**
- Much better 3D experience
- Orbit controls, lighting, real depth
- Professional looking

**Cons:**
- 2-3 days of work vs 2-3 hours
- Need React + Three.js + WebGL stack
- Much more code
- You'd be learning a new stack instead of iterating on visualization ideas

**Complexity:** High

---

### Option E: Enhanced Streamlit with 3D Surfaces (Plotly)

**Description:** Stay in Streamlit but upgrade every visualization to Plotly 3D:
- Grad-CAM → **3D surface plot** (x,y = image coords, z = activation height)
- Detections → **3D scatter boxes** with confidence as z-height
- Feature maps → **3D volume rendering** of channel activations
- Keep it fast by processing one image at a time

**Pros:**
- Real 3D in the browser
- Plotly handles orbit/zoom/pan natively
- No new stack to learn
- Can be done in 3-4 hours

**Cons:**
- Plotly 3D surfaces with high-res images can be slow (>10k points)
- Need to downsample heatmaps
- Not as smooth as WebGL

**Complexity:** Medium

---

## Evaluation Matrix

| Criteria | A: Two Apps | B: One App | C: Inference-First | D: React Three Fiber | E: Plotly 3D |
|----------|:-----------:|:----------:|:-------------------:|:-------------------:|:------------:|
| Simplicity | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐ |
| Speed to implement | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐ |
| "I get it" factor | ⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Maintainability | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Testability | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

---

## Recommendation

**Start with Option C (Inference-First) using Option E's 3D techniques.**

### Why This Approach

1. **You don't have a training run right now.** Training monitoring is useless until you start training. But you DO have trained models and images — inference visualization works today.

2. **The "I didn't get it" problem is a visualization problem, not a feature problem.** The current MVP shows numbers and flat overlays. Switching to 3D surfaces (Plotly `go.Surface`) makes it immediately intuitive: "the model is looking HERE because the terrain is highest HERE."

3. **Split into two modules later**, once the inference module proves the concept. The training monitor is a natural second module.

### Concrete Plan for Inference Module

**Tab 1: Image + Detections**
- Original image with predicted 3D bounding boxes
- Boxes extruded as 3D volumes with confidence as height
- Color-coded by class

**Tab 2: Grad-CAM 3D Surface**
- Heatmap as terrain with orbit controls
- Optional: overlay on original image as texture
- Adjustable height scale

**Tab 3: Feature Pyramid**
- P3/P4/P5 feature maps at different scales
- Show how the model processes the image at different resolutions
- Interactive channel selection

**Tab 4: Class Confidence**
- 3D bar chart per detected class
- Show confidence distribution
- Compare teacher vs student if both loaded

### When to Add Training Monitor

Add the training module when:
- You have an active training run producing checkpoints
- You want to watch feature space evolve over epochs
- You need to monitor loss/mAP curves in real-time

---

## Alternative Consideration

**If I'm wrong about the priority:** If you actually have an active training run and want to monitor it live, the training module should come first. But based on what you've shown me (two finished .pt files, no results.csv), inference is the right starting point.

---

## Next Steps

If approved:
1. Create implementation plan for inference-first module
2. Build 3D surface visualizations using Plotly
3. Add detection box visualization
4. Test with current models and dataset
5. Evaluate if the "I get it" factor is achieved
6. Then plan training monitor module

---

## Key Insight

The user's feedback "I didn't get it" is the most important signal. It means:
- The visualizations aren't intuitive enough
- The current approach is too abstract
- We need to make the model's "thinking" visible and concrete

**Solution:** 3D surfaces and volumes make abstract concepts tangible. A heatmap becomes a terrain. A bounding box becomes a 3D volume. Feature maps become a pyramid of activations. This is what makes people say "oh, I see what the model is doing."
