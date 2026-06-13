## Plan: 3D Inference Pipeline Visualizer

**Goal:** Build a step-by-step 3D visualization showing how a YOLO model transforms an input image into detection predictions — making the "black box" visible and understandable.

**Tech stack:** Python 3.12 / Streamlit / Plotly 3D / PyTorch / Ultralytics  
**Related skills needed:** tdd  
**Estimated tasks:** 8

### Assumptions
- YOLO26 architecture (backbone → neck → head), same as models used in testing
- Plotly 3D surfaces and mesh objects are sufficient for the visualization quality
- User wants to understand inference flow, not training mechanics
- One image at a time (not batch visualization)

### Simpler Alternative Considered
A static 2D diagram of the pipeline with text labels would be simpler, but the user explicitly wants 3D because they want to **see** the feature maps as 3D volumes and **navigate** the pipeline spatially. A 2D diagram doesn't convey the dimensional transformations (channels increasing, resolution decreasing) in an intuitive way.

---

### Pipeline Stages (from model introspection)

```
INPUT: 640×640×3 image
  │
  ▼
BACKBONE (Feature Extraction)
  model.0  Conv      → 32ch,  320×320  (first features, stride 2)
  model.1  Conv      → 64ch,  160×160  (stride 2)
  model.2  C3k2      → 128ch, 160×160  (refine)
  model.3  Conv      → 128ch, 80×80    (stride 2) ← P3 output
  model.4  C3k2      → 256ch, 80×80    (refine P3)
  model.5  Conv      → 256ch, 40×40    (stride 2) ← P4 output
  model.6  C3k2      → 256ch, 40×40    (refine P4)
  model.7  Conv      → 512ch, 20×20    (stride 2) ← P5 output
  model.8  C3k2      → 512ch, 20×20    (refine P5)
  model.9  SPPF      → 512ch, 20×20    (spatial pyramid pooling)
  model.10 C3k2+PSA  → 512ch, 20×20    (attention)
  │
  ▼
NECK (FPN + PANet — Feature Fusion)
  model.12 Concat    → 768ch, 40×40    (P4 + upsampled P5)
  model.13 C3k2      → 256ch, 40×40    (refined N4)
  model.15 Concat    → 512ch, 80×80    (P3 + upsampled N4)
  model.16 C3k2      → 128ch, 80×80    (refined N3)
  model.17 Conv↓     → 128ch, 40×40    (downsample N3)
  model.18 Concat    → 384ch, 40×40    (N4 + downsampled N3)
  model.19 C3k2      → 256ch, 40×40    (refined N4')
  model.20 Conv↓     → 256ch, 20×20    (downsample N4')
  model.21 Concat    → 768ch, 20×20    (P5 + downsampled N4')
  model.22 C3k2+PSA  → 512ch, 20×20    (refined N5')
  │
  ▼
HEAD (Detection)
  model.23 Detect    → predictions at 3 scales:
                        Scale 1: 80×80  (small objects — N3)
                        Scale 2: 40×40  (medium objects — N4')
                        Scale 3: 20×20  (large objects — N5')
  │
  ▼
NMS (Non-Maximum Suppression)
  Filter overlapping boxes, keep highest confidence
  │
  ▼
OUTPUT: Predicted bounding boxes with class + confidence
  Example: forklift (0.95), person (0.93), pallet (0.28)
```

### Visualization Design

The app has **2 main sections**:

**Section A: 3D Pipeline Overview** (Tab 1)
- Horizontal 3D scene showing all stages as blocks
- Block size proportional to feature map dimensions (W×H, depth = channels)
- Color: blue=Backbone, green=Neck, red=Head
- Arrows between blocks showing data flow
- Click a stage to highlight it and show details in sidebar
- Input image on left, output detections on right

**Section B: Stage-by-Stage Walkthrough** (Tab 2)
- Slider: step through each stage (0 to 22)
- For each stage:
  - Left panel: 3D surface of the feature map activation (top channels averaged)
  - Right panel: info card showing layer name, type, output shape, explanation
  - Bottom: progress bar showing where in the pipeline you are
- "Play" button to auto-advance through stages

**Section C: Detection Output in 3D** (Tab 3)
- Original image as a flat plane
- Each detection box as a 3D wireframe box rising above the image
- Box height = confidence score
- Box color = class color
- Labels floating above each box
- Side-by-side teacher vs student comparison

**Section D: Pipeline Comparison** (Tab 4)
- Load both models, show their feature maps at key stages side-by-side
- Highlights where teacher and student diverge
- Useful for understanding what KD transfers

### File Map

```
MODIFY  viz_tool/app.py
CREATE  viz_tool/pipeline_extractor.py
CREATE  viz_tool/pipeline_viz.py
CREATE  viz_tool/detection_viz.py
CREATE  viz_tool/tests/test_pipeline_extractor.py
CREATE  viz_tool/tests/test_pipeline_viz.py
CREATE  viz_tool/tests/test_detection_viz.py
```

---

### Task Breakdown

#### Task 1: Pipeline Feature Extractor — capture intermediate activations
**Files:** `viz_tool/pipeline_extractor.py`, `viz_tool/tests/test_pipeline_extractor.py`  
**Success criteria:** `test_extract_backbone_shapes` and `test_extract_neck_shapes` pass — shapes match known YOLO26 architecture  
**Steps:**
1. Write test: `test_extract_backbone_shapes` — load model, run extractor on 640x640 image, verify backbone output shapes match: model.0→(1,32,320,320), model.5→(1,256,40,40), model.10→(1,512,20,20)
2. Write test: `test_extract_neck_shapes` — verify neck outputs: model.13→(1,256,40,40), model.19→(1,256,40,40), model.22→(1,512,20,20)
3. Write test: `test_extract_returns_dict` — verify `PipelineExtractor.extract()` returns dict with layer names as keys
4. Verify tests fail (expected: `ImportError: No module named 'pipeline_extractor'`)
5. Implement `PipelineExtractor` class:
   ```python
   class PipelineExtractor:
       def __init__(self, model: YOLO):
           """Register hooks on key backbone/neck/head layers."""
       
       def extract(self, image: np.ndarray) -> dict:
           """Run forward pass, return {layer_name: feature_tensor} for all hooked layers."""
       
       def get_stage_info(self) -> list:
           """Return metadata: [{name, type, stage, channels, height, width, description}, ...]"""
   ```
6. Verify tests pass
7. `git commit -m "feat: add pipeline feature extractor with intermediate activations"`

---

#### Task 2: 3D Feature Map Visualization — render activations as surfaces
**Files:** `viz_tool/pipeline_viz.py`, `viz_tool/tests/test_pipeline_viz.py`  
**Success criteria:** `test_create_feature_block_returns_figure` and `test_create_pipeline_overview_returns_figure` pass  
**Steps:**
1. Write test: `test_create_feature_block_returns_figure` — pass a random (C,H,W) tensor, verify returns `go.Figure`
2. Write test: `test_create_pipeline_overview_returns_figure` — pass dict of {name: tensor}, verify returns `go.Figure` with correct number of traces
3. Write test: `test_feature_block_downsampled` — pass (512,20,20) tensor, verify surface resolution is 20x20 (not 512 channels)
4. Verify tests fail
5. Implement visualization functions:
   ```python
   def create_feature_block(tensor: torch.Tensor, name: str, color: str, position: tuple) -> go.Figure:
       """Render a single feature map as a 3D surface block.
       - Average top-K channels to get a single (H,W) surface
       - Position in 3D space at (x,y,z)
       - Color by stage (blue/green/red)
       """
   
   def create_pipeline_overview(activations: dict, stage_info: list) -> go.Figure:
       """Render all pipeline stages as connected 3D blocks.
       - Each block sized by (W, H, log(channels))
       - Arrows (scatter lines) between connected stages
       - Input image plane on the left
       """
   
   def create_stage_detail(tensor: torch.Tensor, layer_name: str, layer_info: dict) -> go.Figure:
       """Detailed view of one stage's feature maps.
       - Show top 4 channels as individual surfaces
       - Show channel-averaged activation as a combined surface
       """
   ```
6. Verify tests pass
7. `git commit -m "feat: add 3D feature block and pipeline overview visualizations"`

---

#### Task 3: 3D Detection Box Visualization — show predictions as 3D volumes
**Files:** `viz_tool/detection_viz.py`, `viz_tool/tests/test_detection_viz.py`  
**Success criteria:** `test_create_detection_3d_returns_figure` and `test_detection_3d_box_count` pass  
**Steps:**
1. Write test: `test_create_detection_3d_returns_figure` — pass model + image, verify returns `go.Figure`
2. Write test: `test_detection_3d_box_count` — pass model + image with known detections, verify correct number of 3D box traces
3. Write test: `test_detection_3d_confidence_height` — pass a detection with conf=0.95, verify box height is proportional to confidence
4. Verify tests fail
5. Implement detection visualization:
   ```python
   def create_detection_3d(model: YOLO, image: np.ndarray, title: str) -> go.Figure:
       """Run inference, render each detection as a 3D wireframe box.
       - Image as flat plane at z=0
       - Each box as wireframe rising from z=0 to z=confidence*100
       - Color by class (forklift=blue, pallet=green, person=orange)
       - Labels floating above each box with class name + confidence
       """
   
   def create_detection_comparison(teacher_model: YOLO, student_model: YOLO, image: np.ndarray) -> tuple:
       """Run both models, return (teacher_fig, student_fig) side by side."""
   ```
6. Verify tests pass
7. `git commit -m "feat: add 3D detection box visualization with confidence height"`

---

#### Task 4: Pipeline Overview Tab — 3D scene of full inference flow
**Files:** `viz_tool/app.py`  
**Success criteria:** Tab 1 renders 3D pipeline overview without errors when model is loaded  
**Steps:**
1. Modify `viz_tool/app.py` to restructure tabs:
   ```python
   tab1, tab2, tab3, tab4 = st.tabs([
       "Pipeline Overview",      # NEW: 3D pipeline scene
       "Stage Walkthrough",      # NEW: step-by-stage slider
       "Detection in 3D",        # NEW: 3D detection boxes
       "Pipeline Comparison"     # NEW: teacher vs student features
   ])
   ```
2. Implement Tab 1 (Pipeline Overview):
   - Sidebar: model path input, dataset path input
   - Load model with `PipelineExtractor`
   - Run `extract()` on first image
   - Render `create_pipeline_overview()` with full Plotly 3D scene
   - Camera angle: isometric view showing the pipeline flowing left-to-right
   - Sidebar info: total parameters, number of layers, number of detections
3. Verify tab renders without errors
4. `git commit -m "feat: add Pipeline Overview tab with 3D inference flow"`

---

#### Task 5: Stage Walkthrough Tab — interactive step-by-stage exploration
**Files:** `viz_tool/app.py`  
**Success criteria:** Slider advances through 23 stages, each stage shows feature map surface + info card  
**Steps:**
1. Implement Tab 2 (Stage Walkthrough):
   - Slider: `st.slider("Stage", 0, 22, 0)` — select which pipeline stage to view
   - Left column: `create_stage_detail()` — 3D surface of selected stage's feature map
   - Right column: Info card with:
     - Layer name (e.g., "model.5 — Conv")
     - Stage (Backbone/Neck/Head)
     - Output shape (e.g., "256 channels × 40×40")
     - Plain-English explanation (e.g., "Downsamples from 80×80 to 40×40, doubling channels. This is where the model starts seeing medium-sized features.")
   - Bottom: progress bar showing position in pipeline
   - Stage descriptions stored as a dict mapping layer names to explanations
2. Verify slider advances through all stages
3. Verify feature map surface updates for each stage
4. `git commit -m "feat: add Stage Walkthrough tab with interactive slider"`

---

#### Task 6: Detection in 3D Tab — predictions as interactive 3D boxes
**Files:** `viz_tool/app.py`  
**Success criteria:** Tab 3 renders detection boxes over the image, boxes have height proportional to confidence  
**Steps:**
1. Implement Tab 3 (Detection in 3D):
   - Run `model.predict()` on selected image
   - Render `create_detection_3d()` showing:
     - Original image as flat textured plane
     - Each detection as a colored wireframe box
     - Confidence labels above each box
   - Sidebar: class selector to filter by class
   - Bottom: detection table with class, confidence, bbox coordinates
2. Verify detections render correctly
3. Verify confidence filtering works
4. `git commit -m "feat: add Detection in 3D tab with confidence-proportional boxes"`

---

#### Task 7: Pipeline Comparison Tab — teacher vs student feature maps
**Files:** `viz_tool/app.py`  
**Success criteria:** Tab 4 shows side-by-side feature maps at key stages for both models  
**Steps:**
1. Implement Tab 4 (Pipeline Comparison):
   - Requires both teacher and student models loaded
   - Select key comparison stages: P3 (model.4), P4 (model.6), P5 (model.10), N3 (model.16), N4' (model.19), N5' (model.22)
   - For each stage: side-by-side 3D surfaces of teacher vs student feature maps
   - Highlight stages where activations diverge significantly (difference heatmap)
   - Bottom: table showing activation statistics (mean, max, sparsity) for each stage
2. Verify side-by-side rendering works
3. Verify divergence highlighting works
4. `git commit -m "feat: add Pipeline Comparison tab for teacher vs student analysis"`

---

#### Task 8: Integration Test & Documentation
**Files:** `viz_tool/app.py`  
**Success criteria:** Full app loads all 4 tabs without errors, README updated  
**Steps:**
1. Run full integration test:
   ```bash
   PYTHONPATH=. python3 -c "
   from viz_tool.pipeline_extractor import PipelineExtractor
   from viz_tool.pipeline_viz import create_pipeline_overview, create_stage_detail
   from viz_tool.detection_viz import create_detection_3d
   # Load models, run all visualizations, verify no errors
   "
   ```
2. Verify Streamlit app launches: `PYTHONPATH=. streamlit run viz_tool/app.py --server.port 8501`
3. Navigate through all 4 tabs with real models
4. Update README.md with new features and screenshots description
5. `git commit -m "feat: integration test and docs update for 3D inference pipeline"`

---

## Execution Order

```
Task 1 (Pipeline Extractor)
  ↓
Task 2 (3D Feature Blocks)  ←→  Task 3 (3D Detection Boxes)
  ↓                                    ↓
Task 4 (Pipeline Overview Tab)
  ↓
Task 5 (Stage Walkthrough Tab)
  ↓
Task 6 (Detection in 3D Tab)
  ↓
Task 7 (Pipeline Comparison Tab)
  ↓
Task 8 (Integration + Docs)
```

Tasks 2 and 3 are independent and can be done in parallel.  
Tasks 4-7 are sequential (each tab builds on previous modules).
