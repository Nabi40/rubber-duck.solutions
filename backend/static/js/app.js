// Preset Color Palette
const PASSPORT_COLOR_ROWS = [
  ["#EAF4FF", "#D6E9FF", "#BFD9FF", "#A6C8FF", "#8AB6FF", "#6FA4FF", "#4E8FF7", "#3B78D8"],
  ["#F0FAFF", "#D9F2FF", "#BFE7FF", "#A3DAFF", "#85CBFF", "#66BCFF", "#42A7F5", "#2D8ED6"],
  ["#F8F9FA", "#E9ECEF", "#DEE2E6", "#CED4DA", "#ADB5BD", "#868E96", "#6C757D", "#495057"],
  ["#FFF8ED", "#FFF0DB", "#FFE6C7", "#FFD9B0", "#FFC997", "#FFB87E", "#F2A363", "#D88945"],
  ["#FFFDF5", "#FFF8E6", "#FFF1CC", "#FFE9B3", "#FFE199", "#FFD880", "#F5C861", "#DBAE42"],
  ["#F0FFF5", "#D9FBE7", "#BFF6D6", "#A2F0C4", "#82E8B0", "#5EDC98", "#3BC67F", "#29A965"],
  ["#F2FFFB", "#D9FFF2", "#BFFFE6", "#A1F8D8", "#81EEC7", "#5FE2B4", "#3BC99A", "#27A67F"],
  ["#F7F5FF", "#ECE8FF", "#DED7FF", "#CFC5FF", "#BEB1FF", "#A99BFF", "#8E7DE8", "#7563C7"],
  ["#FFF5F7", "#FFE5EC", "#FFD6E0", "#FFC2D1", "#FFAFC2", "#FF99B3", "#F27896", "#D65A78"],
  ["#FFF6F2", "#FFE5DB", "#FFD4C2", "#FFC1A6", "#FFAD8B", "#FF986F", "#F57C52", "#D85F37"],
  ["#FFFDF0", "#FFF8CC", "#FFF2A6", "#FFEB80", "#FFE35C", "#FFD93B", "#F5C81D", "#DBB100"],
  ["#F1F7FF", "#DCEBFF", "#C4DBFF", "#AAC9FF", "#8EB7FF", "#6FA2F5", "#5188D8", "#3D6FB8"],
];

const PASSPORT_SIZE_OPTIONS = ["4", "8", "12", "16", "20"];
const COMBO_SIZE_OPTIONS = ["1", "2", "3", "4", "5"];

// App State
let currentTab = "Background"; // "Background" | "Passport Size Image" | "Passport-Stamp Images"
let currentStep = "crop"; // "crop" | "edit"
let originalFile = null;
let croppedFile = null;
let removedBlob = null;
let removedBgId = null;
let removedBlobUrl = "";
let rawPreviewUrl = "";
let selectedBgColor = "#5f9de8";
let selectedCount = 16;
let cropper = null;

// Attire State
let allAttires = [];
let selectedAttireId = null;
let selectedAttireGender = "male"; // "male" | "female"
let selectedAttireCategory = "all"; // "all" | "suit" | "shirt"
let attireScale = 1.0;
let attireOffsetY = 0;

// Elements
const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("file-input");
const uploadBtn = document.getElementById("upload-btn");
const landingView = document.getElementById("landing-view");
const editorView = document.getElementById("editor-view");
const imageBox = document.getElementById("image-box");
const previewImg = document.getElementById("preview-img");
const cropperTarget = document.getElementById("cropper-target");
const cropStage = document.getElementById("crop-stage");
const previewStage = document.getElementById("preview-stage");
const cropperControls = document.getElementById("cropper-controls");
const zoomSlider = document.getElementById("zoom-slider");
const cropConfirmBtn = document.getElementById("crop-confirm-btn");
const resetBtn = document.getElementById("reset-btn");
const downloadBtn = document.getElementById("download-btn");
const loadingOverlay = document.getElementById("loading-overlay");
const loadingLabel = document.getElementById("loading-label");
const errorMessage = document.getElementById("error-message");
const palettePanel = document.getElementById("palette-panel");
const sizesPanel = document.getElementById("sizes-panel");
const attirePanel = document.getElementById("attire-panel");
const attireGrid = document.getElementById("attire-grid");
const attireOverlayImg = document.getElementById("attire-overlay-img");
const attireMaleBtn = document.getElementById("attire-male-btn");
const attireFemaleBtn = document.getElementById("attire-female-btn");
const attireScaleSlider = document.getElementById("attire-scale");
const attireOffsetYSlider = document.getElementById("attire-offset-y");
const attireNoneBtn = document.getElementById("attire-none-btn");
const attireResetFitBtn = document.getElementById("attire-reset-fit-btn");
const paletteContainer = document.getElementById("palette-container");
const sizeOptionsContainer = document.getElementById("size-options-container");
const a4Grid = document.getElementById("a4-grid");
const customColorInput = document.getElementById("custom-color-input");
const tryNowBtn = document.getElementById("try-now-btn");

// Eraser Elements & State
let isEraserMode = false;
let eraserBrushSize = 18;
let eraserUndoStack = [];
let isErasing = false;
let lastEraseX = 0;
let lastEraseY = 0;
const eraserCanvas = document.getElementById("eraser-canvas");
const eraserToggleBtn = document.getElementById("eraser-toggle-btn");
const eraserUndoBtn = document.getElementById("eraser-undo-btn");
const eraserControls = document.getElementById("eraser-controls");
const eraserSizeSlider = document.getElementById("eraser-size-slider");
const eraserSizeLabel = document.getElementById("eraser-size-label");
const eraserDoneBtn = document.getElementById("eraser-done-btn");
const eraserTools = document.getElementById("eraser-tools");
const eraserModeHint = document.getElementById("eraser-mode-hint");

function showError(msg) {
  if (!msg) {
    errorMessage.classList.add("hidden");
    errorMessage.textContent = "";
  } else {
    errorMessage.textContent = msg;
    errorMessage.classList.remove("hidden");
  }
}

function setLoading(isLoading, label = "Processing...") {
  if (isLoading) {
    loadingLabel.textContent = label;
    loadingOverlay.classList.remove("hidden");
  } else {
    loadingOverlay.classList.add("hidden");
  }
}

// Build Palette UI
function initPalette() {
  if (!paletteContainer) return;
  paletteContainer.innerHTML = "";
  
  // Attach quick action button handlers
  const btnTrans = document.getElementById("btn-color-trans");
  if (btnTrans) {
    btnTrans.onclick = () => setBgColor("transparent");
  }

  const btnCustom = document.getElementById("btn-color-custom");
  if (btnCustom) {
    btnCustom.onclick = () => customColorInput?.click();
  }

  customColorInput?.addEventListener("input", (e) => setBgColor(e.target.value));

  // Color Swatches - 8 columns grid for aesthetic layout
  PASSPORT_COLOR_ROWS.forEach(row => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "grid grid-cols-8 gap-1.5 justify-items-center w-full";
    row.forEach(color => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.color = color;
      btn.className = "h-[19px] w-[19px] rounded-full border border-black/10 shadow-2xs transition-transform duration-150 hover:scale-130 color-swatch cursor-pointer";
      btn.style.backgroundColor = color;
      btn.addEventListener("click", () => setBgColor(color));
      rowDiv.appendChild(btn);
    });
    paletteContainer.appendChild(rowDiv);
  });
}

function setBgColor(color) {
  selectedBgColor = color;
  updateColorUI();
  renderA4Grid();
}

function updateColorUI() {
  if (!imageBox) return;

  // Update image box style
  if (currentTab === "Background") {
    if (selectedBgColor === "transparent") {
      imageBox.className = "relative mx-auto overflow-hidden rounded-lg checkerboard-pattern shadow-inner";
      imageBox.style.backgroundColor = "";
    } else {
      imageBox.className = "relative mx-auto overflow-hidden rounded-lg shadow-inner";
      imageBox.style.backgroundColor = selectedBgColor;
    }
  } else {
    imageBox.className = "relative mx-auto overflow-hidden rounded-lg shadow-inner";
    imageBox.style.backgroundColor = selectedBgColor === "transparent" ? "#ffffff" : selectedBgColor;
  }

  // Update header color pill if present
  const colorDot = document.getElementById("selected-color-dot");
  const colorHex = document.getElementById("selected-color-hex");
  if (colorDot && colorHex) {
    if (selectedBgColor === "transparent") {
      colorDot.className = "w-3 h-3 rounded-full border border-black/20 checkerboard-small";
      colorDot.style.backgroundColor = "";
      colorHex.textContent = "Transparent";
    } else {
      colorDot.className = "w-3 h-3 rounded-full border border-black/20";
      colorDot.style.backgroundColor = selectedBgColor;
      colorHex.textContent = selectedBgColor.toUpperCase();
    }
  }

  // Highlight active swatch
  document.querySelectorAll(".color-swatch").forEach(btn => {
    if (btn.dataset.color.toLowerCase() === selectedBgColor.toLowerCase()) {
      btn.classList.add("ring-2", "ring-[#4d63ea]", "ring-offset-1", "scale-115", "z-10");
    } else {
      btn.classList.remove("ring-2", "ring-[#4d63ea]", "ring-offset-1", "scale-115", "z-10");
    }
  });
}

// Tabs & Panels
function initTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      currentTab = tab;

      // Update active button classes with identical dimensions to prevent layout shifts
      tabButtons.forEach(b => {
        if (b.dataset.tab === tab) {
          b.className = "tab-btn inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs sm:text-[12.5px] font-medium bg-[#7f8ef0] text-white shadow-2xs whitespace-nowrap transition-colors";
        } else {
          b.className = "tab-btn inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs sm:text-[12.5px] font-medium text-[#505050] hover:bg-[#e5e5e5] whitespace-nowrap transition-colors";
        }
      });

      const customControls = document.getElementById("custom-size-controls");

      // Show corresponding right panel
      if (currentTab === "Background") {
        palettePanel?.classList.remove("hidden");
        attirePanel?.classList.add("hidden");
        sizesPanel?.classList.add("hidden");
      } else if (currentTab === "Formal Attire") {
        palettePanel?.classList.add("hidden");
        attirePanel?.classList.remove("hidden");
        sizesPanel?.classList.add("hidden");
        renderAttireGrid();
      } else if (currentTab === "Custom Size Images") {
        palettePanel?.classList.add("hidden");
        attirePanel?.classList.add("hidden");
        sizesPanel?.classList.remove("hidden");
        sizeOptionsContainer?.classList.add("hidden");
        customControls?.classList.remove("hidden");
      } else {
        palettePanel?.classList.add("hidden");
        attirePanel?.classList.add("hidden");
        sizesPanel?.classList.remove("hidden");
        sizeOptionsContainer?.classList.remove("hidden");
        customControls?.classList.add("hidden");
        updateSizeOptions();
      }

      updateColorUI();
      updateAttireOverlay();
      renderA4Grid();
    });
  });

  // Attach input listeners for custom dimensions
  ["custom-w-input", "custom-h-input", "custom-count-input"].forEach(id => {
    document.getElementById(id)?.addEventListener("input", () => {
      if (currentTab === "Custom Size Images") {
        renderA4Grid();
      }
    });
  });
}

// Attire Management
async function loadAttires() {
  try {
    const res = await fetch("/static/attires/manifest.json");
    if (!res.ok) throw new Error("Could not load attires manifest");
    allAttires = await res.json();
    renderAttireGrid();
  } catch (err) {
    console.error("Failed to load attire templates:", err);
  }
}

function renderAttireGrid() {
  if (!attireGrid) return;
  attireGrid.innerHTML = "";

  // 1. First item: Blank / None Option
  const noneCard = document.createElement("button");
  noneCard.type = "button";
  noneCard.title = "No Formal Attire (Blank)";
  const isNoneSelected = selectedAttireId === null;
  noneCard.className = `relative flex flex-col items-center justify-center p-1 rounded-lg border transition-all ${
    isNoneSelected 
      ? "border-[#7f8ef0] bg-blue-50/80 ring-2 ring-[#7f8ef0] shadow-sm scale-105" 
      : "border-gray-200 bg-gray-50/50 hover:bg-gray-100 hover:border-gray-300"
  }`;

  const noneIcon = document.createElement("div");
  noneIcon.className = "w-full h-12 flex items-center justify-center text-gray-400";
  noneIcon.innerHTML = `
    <svg class="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  `;

  const noneLabel = document.createElement("span");
  noneLabel.className = "text-[8px] font-semibold text-gray-700 truncate w-full text-center mt-0.5";
  noneLabel.textContent = "None / Blank";

  noneCard.appendChild(noneIcon);
  noneCard.appendChild(noneLabel);

  noneCard.addEventListener("click", () => {
    selectedAttireId = null;
    attireOffsetX = 0;
    attireOffsetY = 0;
    attireScale = 1.0;
    renderAttireGrid();
    updateAttireOverlay();
  });

  attireGrid.appendChild(noneCard);

  // 2. Filtered Attire Items
  const filtered = allAttires.filter(item => {
    const matchGender = item.gender === selectedAttireGender;
    const matchCat = selectedAttireCategory === "all" || item.category === selectedAttireCategory;
    return matchGender && matchCat;
  });

  filtered.forEach(item => {
    const card = document.createElement("button");
    card.type = "button";
    card.title = item.name;
    const isSelected = selectedAttireId === item.id;
    card.className = `relative flex flex-col items-center justify-center p-1 rounded-lg border transition-all ${
      isSelected 
        ? "border-[#7f8ef0] bg-blue-50/80 ring-2 ring-[#7f8ef0] shadow-sm scale-105" 
        : "border-gray-200 bg-gray-50/50 hover:bg-gray-100 hover:border-gray-300"
    }`;

    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.name;
    img.className = "w-full h-12 object-contain";

    const label = document.createElement("span");
    label.className = "text-[8px] font-semibold text-gray-700 truncate w-full text-center mt-0.5";
    label.textContent = item.name.split("&")[0].trim();

    card.appendChild(img);
    card.appendChild(label);

    card.addEventListener("click", () => {
      if (selectedAttireId === item.id) {
        selectedAttireId = null;
      } else {
        selectedAttireId = item.id;
      }
      renderAttireGrid();
      updateAttireOverlay();
    });

    attireGrid.appendChild(card);
  });
}

let attireOffsetX = 0;

function updateAttireOverlay() {
  if (!attireOverlayImg) return;
  const dragHint = document.getElementById("attire-drag-hint");

  if (!selectedAttireId) {
    attireOverlayImg.classList.add("hidden");
    attireOverlayImg.src = "";
    dragHint?.classList.add("hidden");
    renderA4Grid();
    return;
  }

  const item = allAttires.find(a => a.id === selectedAttireId);
  if (!item) {
    attireOverlayImg.classList.add("hidden");
    dragHint?.classList.add("hidden");
    renderA4Grid();
    return;
  }

  attireOverlayImg.src = item.image;
  attireOverlayImg.classList.remove("hidden");
  
  if (currentTab === "Formal Attire") {
    dragHint?.classList.remove("hidden");
  } else {
    dragHint?.classList.add("hidden");
  }

  // Adjust style transform (translation in X and Y, and zoom scale)
  attireOverlayImg.style.transform = `translate(${attireOffsetX}%, ${attireOffsetY}%) scale(${attireScale})`;

  // Update zoom label & slider
  const labelScale = document.getElementById("label-attire-scale");
  if (labelScale) labelScale.textContent = `${attireScale.toFixed(2)}x`;
  if (attireScaleSlider && parseFloat(attireScaleSlider.value) !== parseFloat(attireScale)) {
    attireScaleSlider.value = attireScale;
  }

  renderA4Grid();
}

function initAttireListeners() {
  // Gender buttons
  attireMaleBtn?.addEventListener("click", () => {
    selectedAttireGender = "male";
    attireMaleBtn.className = "attire-gender-btn rounded-full px-2.5 py-0.5 bg-[#7f8ef0] text-white";
    attireFemaleBtn.className = "attire-gender-btn rounded-full px-2.5 py-0.5 text-[#555] hover:bg-gray-100";
    renderAttireGrid();
  });

  attireFemaleBtn?.addEventListener("click", () => {
    selectedAttireGender = "female";
    attireFemaleBtn.className = "attire-gender-btn rounded-full px-2.5 py-0.5 bg-[#7f8ef0] text-white";
    attireMaleBtn.className = "attire-gender-btn rounded-full px-2.5 py-0.5 text-[#555] hover:bg-gray-100";
    renderAttireGrid();
  });

  // Category buttons
  document.querySelectorAll(".attire-cat-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedAttireCategory = btn.dataset.cat;
      document.querySelectorAll(".attire-cat-btn").forEach(b => {
        if (b.dataset.cat === selectedAttireCategory) {
          b.className = "attire-cat-btn px-2 py-0.5 rounded-md bg-[#7f8ef0] text-white font-medium";
        } else {
          b.className = "attire-cat-btn px-2 py-0.5 rounded-md text-[#555] hover:bg-white/80 font-medium";
        }
      });
      renderAttireGrid();
    });
  });

  // Zoom / Scale slider
  attireScaleSlider?.addEventListener("input", (e) => {
    attireScale = parseFloat(e.target.value) || 1.0;
    updateAttireOverlay();
  });

  // Hand Dragging interaction (Mouse & Touch)
  let isDragging = false;
  let startX = 0, startY = 0;
  let initialOffsetX = 0, initialOffsetY = 0;

  function onDragStart(e) {
    if (!selectedAttireId || !attireOverlayImg) return;
    isDragging = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startX = clientX;
    startY = clientY;
    initialOffsetX = attireOffsetX;
    initialOffsetY = attireOffsetY;
    attireOverlayImg.classList.add("cursor-grabbing");
    e.preventDefault();
  }

  function onDragMove(e) {
    if (!isDragging || !attireOverlayImg) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const boxRect = previewStage ? previewStage.getBoundingClientRect() : { width: 220, height: 270 };

    const dx = ((clientX - startX) / (boxRect.width || 220)) * 100;
    const dy = ((clientY - startY) / (boxRect.height || 270)) * 100;

    attireOffsetX = Math.max(-60, Math.min(60, initialOffsetX + dx));
    attireOffsetY = Math.max(-60, Math.min(60, initialOffsetY + dy));

    updateAttireOverlay();
    e.preventDefault();
  }

  function onDragEnd() {
    if (isDragging) {
      isDragging = false;
      attireOverlayImg?.classList.remove("cursor-grabbing");
    }
  }

  attireOverlayImg?.addEventListener("mousedown", onDragStart);
  attireOverlayImg?.addEventListener("touchstart", onDragStart, { passive: false });
  window.addEventListener("mousemove", onDragMove);
  window.addEventListener("touchmove", onDragMove, { passive: false });
  window.addEventListener("mouseup", onDragEnd);
  window.addEventListener("touchend", onDragEnd);

  // Mouse wheel zoom over preview
  previewStage?.addEventListener("wheel", (e) => {
    if (currentTab === "Formal Attire" && selectedAttireId) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.03 : -0.03;
      attireScale = Math.max(0.6, Math.min(1.6, attireScale + delta));
      if (attireScaleSlider) attireScaleSlider.value = attireScale;
      updateAttireOverlay();
    }
  }, { passive: false });

  // Action Buttons
  attireNoneBtn?.addEventListener("click", () => {
    selectedAttireId = null;
    attireOffsetX = 0;
    attireOffsetY = 0;
    attireScale = 1.0;
    renderAttireGrid();
    updateAttireOverlay();
  });

  attireResetFitBtn?.addEventListener("click", () => {
    attireScale = 1.0;
    attireOffsetX = 0;
    attireOffsetY = 0;
    if (attireScaleSlider) attireScaleSlider.value = 1.0;
    updateAttireOverlay();
  });
}

let portraitBlobHistory = [];

function updateUndoBtnState() {
  if (!eraserUndoBtn) return;
  const canUndo = (isEraserMode && eraserUndoStack.length > 1) || (!isEraserMode && portraitBlobHistory.length > 1);
  if (canUndo) {
    eraserUndoBtn.classList.remove("hidden");
  } else {
    eraserUndoBtn.classList.add("hidden");
  }
}

function initEraser() {
  if (!eraserCanvas) return;
  const ctx = eraserCanvas.getContext("2d", { willReadFrequently: true });

  function enterEraserMode() {
    if (!previewImg || !previewImg.src) return;
    isEraserMode = true;
    eraserControls?.classList.remove("hidden");
    eraserModeHint?.classList.remove("hidden");
    document.getElementById("attire-drag-hint")?.classList.add("hidden");
    
    if (attireOverlayImg) {
      attireOverlayImg.style.pointerEvents = "none";
    }

    if (eraserToggleBtn) {
      eraserToggleBtn.className = "flex items-center gap-1.5 px-3 py-1 rounded-full border border-rose-400 bg-gradient-to-r from-rose-500 to-pink-500 text-[11.5px] font-bold text-white transition-all shadow-md ring-2 ring-rose-200 scale-105 cursor-pointer";
    }

    const w = previewImg.naturalWidth || 640;
    const h = previewImg.naturalHeight || 790;
    eraserCanvas.width = w;
    eraserCanvas.height = h;

    ctx.clearRect(0, 0, w, h);
    try {
      ctx.drawImage(previewImg, 0, 0, w, h);
    } catch (err) {
      console.warn("Direct drawImage error:", err);
    }

    eraserUndoStack = [ctx.getImageData(0, 0, w, h)];
    updateUndoBtnState();

    previewImg.classList.add("opacity-0");
    eraserCanvas.classList.remove("hidden");
  }

  function exitEraserMode() {
    isEraserMode = false;
    eraserControls?.classList.add("hidden");
    eraserModeHint?.classList.add("hidden");

    if (attireOverlayImg) {
      attireOverlayImg.style.pointerEvents = "";
    }

    if (currentTab === "Formal Attire" && selectedAttireId) {
      document.getElementById("attire-drag-hint")?.classList.remove("hidden");
    }
    if (eraserToggleBtn) {
      eraserToggleBtn.className = "flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 text-[11.5px] font-bold text-indigo-700 hover:from-indigo-100 hover:to-pink-100 hover:border-indigo-400 hover:scale-105 transition-all shadow-xs cursor-pointer";
    }

    // Export canvas to blob, add to persistent history, and sync preview
    eraserCanvas.toBlob(async (blob) => {
      if (blob) {
        removedBlob = blob;
        portraitBlobHistory.push(blob);
        if (portraitBlobHistory.length > 25) portraitBlobHistory.shift();

        if (removedBlobUrl) URL.revokeObjectURL(removedBlobUrl);
        removedBlobUrl = URL.createObjectURL(blob);
        if (previewImg) {
          previewImg.src = removedBlobUrl;
          previewImg.classList.remove("opacity-0");
        }
        eraserCanvas.classList.add("hidden");
        updateUndoBtnState();
        renderA4Grid();

        // Sync erased blob to backend
        try {
          const formData = new FormData();
          formData.append("image", blob, "erased_portrait.png");
          const res = await fetch("/api/remove-bg/", { method: "POST", body: formData });
          if (res.ok) {
            const data = await res.json();
            removedBgId = data.id || data.results?.[0]?.id || removedBgId;
          }
        } catch (e) {
          console.warn("Could not sync erased blob:", e);
        }
      }
    }, "image/png");
  }

  eraserToggleBtn?.addEventListener("click", () => {
    if (isEraserMode) {
      exitEraserMode();
    } else {
      enterEraserMode();
    }
  });

  eraserDoneBtn?.addEventListener("click", exitEraserMode);

  eraserSizeSlider?.addEventListener("input", (e) => {
    eraserBrushSize = parseInt(e.target.value) || 18;
    if (eraserSizeLabel) eraserSizeLabel.textContent = `${eraserBrushSize}px`;
  });

  // Undo button works in or outside eraser mode at any time!
  eraserUndoBtn?.addEventListener("click", () => {
    if (isEraserMode) {
      if (eraserUndoStack.length > 1) {
        eraserUndoStack.pop();
        const prevState = eraserUndoStack[eraserUndoStack.length - 1];
        ctx.putImageData(prevState, 0, 0);
      }
    } else {
      if (portraitBlobHistory.length > 1) {
        portraitBlobHistory.pop();
        const prevBlob = portraitBlobHistory[portraitBlobHistory.length - 1];
        removedBlob = prevBlob;
        if (removedBlobUrl) URL.revokeObjectURL(removedBlobUrl);
        removedBlobUrl = URL.createObjectURL(prevBlob);
        if (previewImg) {
          previewImg.src = removedBlobUrl;
        }
        renderA4Grid();
      }
    }
    updateUndoBtnState();
  });

  function getCanvasCoords(e) {
    const rect = eraserCanvas.getBoundingClientRect();
    const clientX = (e.touches && e.touches.length > 0) ? e.touches[0].clientX : e.clientX;
    const clientY = (e.touches && e.touches.length > 0) ? e.touches[0].clientY : e.clientY;
    const scaleX = eraserCanvas.width / (rect.width || 1);
    const scaleY = eraserCanvas.height / (rect.height || 1);
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  function startErase(e) {
    if (!isEraserMode) return;
    isErasing = true;
    const pos = getCanvasCoords(e);
    lastEraseX = pos.x;
    lastEraseY = pos.y;

    eraserUndoStack.push(ctx.getImageData(0, 0, eraserCanvas.width, eraserCanvas.height));
    if (eraserUndoStack.length > 25) eraserUndoStack.shift();
    updateUndoBtnState();

    eraseStroke(pos.x, pos.y, pos.x, pos.y);
    e.preventDefault();
  }

  function moveErase(e) {
    if (!isEraserMode || !isErasing) return;
    const pos = getCanvasCoords(e);
    eraseStroke(lastEraseX, lastEraseY, pos.x, pos.y);
    lastEraseX = pos.x;
    lastEraseY = pos.y;
    e.preventDefault();
  }

  function endErase() {
    if (isErasing) {
      isErasing = false;
      updateUndoBtnState();
    }
  }

  function eraseStroke(x1, y1, x2, y2) {
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const scaledSize = eraserBrushSize * (eraserCanvas.width / 220);
    ctx.lineWidth = scaledSize;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  eraserCanvas.addEventListener("mousedown", startErase);
  eraserCanvas.addEventListener("touchstart", startErase, { passive: false });
  eraserCanvas.addEventListener("mousemove", moveErase);
  eraserCanvas.addEventListener("touchmove", moveErase, { passive: false });
  window.addEventListener("mouseup", endErase);
  window.addEventListener("touchend", endErase);
}

function updateSizeOptions() {
  if (!sizeOptionsContainer) return;
  const isCombo = currentTab === "Passport-Stamp Images";
  const options = isCombo ? COMBO_SIZE_OPTIONS : PASSPORT_SIZE_OPTIONS;
  
  if (isCombo && !COMBO_SIZE_OPTIONS.includes(String(selectedCount))) {
    selectedCount = 1;
  } else if (!isCombo && !PASSPORT_SIZE_OPTIONS.includes(String(selectedCount))) {
    selectedCount = 16;
  }

  sizeOptionsContainer.innerHTML = "";
  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = isCombo ? `${opt} ${opt === "1" ? "Row (7)" : "Rows (" + (Number(opt) * 7) + ")"}` : opt;
    btn.className = `rounded-md border px-3 py-1 text-xs font-medium transition ${
      String(selectedCount) === opt 
        ? "border-[#7d8bee] bg-[#7d8bee] text-white shadow-sm" 
        : "border-[#c8c8c8] text-[#666] hover:bg-gray-100"
    }`;
    btn.addEventListener("click", () => {
      selectedCount = Number(opt);
      updateSizeOptions();
      renderA4Grid();
    });
    sizeOptionsContainer.appendChild(btn);
  });

  renderA4Grid();
}

function renderA4Grid() {
  if (!a4Grid) return;
  const isCombo = currentTab === "Passport-Stamp Images";
  const isCustom = currentTab === "Custom Size Images";
  const imgSrc = (removedBlobUrl || rawPreviewUrl);

  a4Grid.innerHTML = "";

  // Helper to render portrait + formal attire overlay
  function createSheetPhotoElement(aspectRatio = "1.7 / 2.1") {
    const photoWrapper = document.createElement("div");
    photoWrapper.className = "relative h-full w-full overflow-hidden flex items-center justify-center";
    if (aspectRatio) photoWrapper.style.aspectRatio = aspectRatio;

    if (imgSrc) {
      const img = document.createElement("img");
      img.src = imgSrc;
      img.className = "h-full w-full object-contain";
      photoWrapper.appendChild(img);

      // If formal attire is selected, render attire overlay onto each sheet cell
      if (selectedAttireId) {
        const item = allAttires.find(a => a.id === selectedAttireId);
        if (item) {
          const attireImg = document.createElement("img");
          attireImg.src = item.image;
          attireImg.className = "pointer-events-none absolute left-0 top-0 h-full w-full object-contain";
          attireImg.style.transform = `translate(${attireOffsetX}%, ${attireOffsetY}%) scale(${attireScale})`;
          photoWrapper.appendChild(attireImg);
        }
      }
    }

    return photoWrapper;
  }

  if (isCustom) {
    // Custom Dimensions Layout with exact A4 physical boundaries
    const wInput = document.getElementById("custom-w-input");
    const hInput = document.getElementById("custom-h-input");
    const cInput = document.getElementById("custom-count-input");
    const maxLabel = document.getElementById("custom-max-label");

    // Physical dimensions of A4 in inches: 8.27in x 11.69in
    const PAGE_W = 8.27;
    const PAGE_H = 11.69;
    const MARGIN = 0.25;
    const GAP = 0.15;

    const availW = PAGE_W - (2 * MARGIN);
    const availH = PAGE_H - (2 * MARGIN);

    let wIn = Math.min(availW, Math.max(0.5, parseFloat(wInput?.value) || 2.0));
    let hIn = Math.min(availH, Math.max(0.5, parseFloat(hInput?.value) || 2.0));

    // Calculate maximum cols and rows that physically fit within A4
    const cols = Math.max(1, Math.floor((availW + GAP) / (wIn + GAP)));
    const rows = Math.max(1, Math.floor((availH + GAP) / (hIn + GAP)));
    const maxPhotos = cols * rows;

    if (maxLabel) {
      maxLabel.textContent = `Max on A4: ${maxPhotos} (${cols}×${rows})`;
    }
    if (cInput) {
      cInput.max = maxPhotos;
      if (parseInt(cInput.value) > maxPhotos) {
        cInput.value = maxPhotos;
      }
    }

    const count = Math.min(maxPhotos, Math.max(1, parseInt(cInput?.value) || 1));

    a4Grid.className = "w-full h-full relative overflow-hidden";
    a4Grid.style.gridTemplateColumns = "";

    // Proportional percentage layout on A4 paper
    const wPct = (wIn / PAGE_W) * 100;
    const hPct = (hIn / PAGE_H) * 100;
    const gapXPct = (GAP / PAGE_W) * 100;
    const gapYPct = (GAP / PAGE_H) * 100;
    const startXPct = (MARGIN / PAGE_W) * 100;
    const startYPct = (MARGIN / PAGE_H) * 100;

    for (let idx = 0; idx < count; idx++) {
      const r = Math.floor(idx / cols);
      const c = idx % cols;

      const leftPct = startXPct + c * (wPct + gapXPct);
      const topPct = startYPct + r * (hPct + gapYPct);

      const cell = document.createElement("div");
      cell.className = "absolute overflow-hidden rounded-[1px] shadow-2xs";
      cell.style.left = `${leftPct}%`;
      cell.style.top = `${topPct}%`;
      cell.style.width = `${wPct}%`;
      cell.style.height = `${hPct}%`;
      cell.style.backgroundColor = selectedBgColor === "transparent" ? "#e9df8c" : selectedBgColor;

      if (imgSrc) {
        cell.appendChild(createSheetPhotoElement(null));
      }

      a4Grid.appendChild(cell);
    }
  } else if (isCombo) {
    // 5 Combination Rows: Each row has 3 Passport (left) + 4 Stamps in 2x2 grid (right)
    a4Grid.className = "flex flex-col gap-1 w-full h-full justify-start";
    a4Grid.style.gridTemplateColumns = "";

    const totalRows = 5;
    const activeRows = Number(selectedCount) || 1;

    for (let r = 0; r < totalRows; r++) {
      const isRowActive = r < activeRows;

      const rowDiv = document.createElement("div");
      rowDiv.className = "flex items-center gap-1 w-full h-[52px]";

      // Left: 3 Passport Photos
      const ppContainer = document.createElement("div");
      ppContainer.className = "grid grid-cols-3 gap-0.5 flex-[3] h-full";

      for (let p = 0; p < 3; p++) {
        const ppCell = document.createElement("div");
        ppCell.className = "overflow-hidden h-full w-full rounded-[1px] flex items-center justify-center";
        ppCell.style.backgroundColor = isRowActive 
          ? (selectedBgColor === "transparent" ? "#e9df8c" : selectedBgColor) 
          : "transparent";

        if (isRowActive && imgSrc) {
          ppCell.appendChild(createSheetPhotoElement("1.7 / 2.1"));
        }
        ppContainer.appendChild(ppCell);
      }
      rowDiv.appendChild(ppContainer);

      // Right: 4 Stamp Photos (2x2 Grid)
      const stampContainer = document.createElement("div");
      stampContainer.className = "grid grid-cols-2 grid-rows-2 gap-0.5 flex-[1.4] h-full";

      for (let s = 0; s < 4; s++) {
        const stCell = document.createElement("div");
        stCell.className = "overflow-hidden h-full w-full rounded-[1px] flex items-center justify-center";
        stCell.style.backgroundColor = isRowActive 
          ? (selectedBgColor === "transparent" ? "#e9df8c" : selectedBgColor) 
          : "transparent";

        if (isRowActive && imgSrc) {
          stCell.appendChild(createSheetPhotoElement("0.8 / 1.0"));
        }
        stampContainer.appendChild(stCell);
      }
      rowDiv.appendChild(stampContainer);

      a4Grid.appendChild(rowDiv);
    }
  } else {
    // Regular Passport Grid (4 cols x 5 rows)
    a4Grid.className = "grid w-full items-start gap-1";
    a4Grid.style.gridTemplateColumns = "repeat(4, minmax(0, 1fr))";

    const totalCells = 20;
    for (let idx = 0; idx < totalCells; idx++) {
      const isFilled = idx < selectedCount;

      const cell = document.createElement("div");
      cell.className = "overflow-hidden h-full max-h-16 w-full rounded-[1px]";
      cell.style.backgroundColor = isFilled 
        ? (selectedBgColor === "transparent" ? "#e9df8c" : selectedBgColor) 
        : "transparent";

      if (isFilled && imgSrc) {
        cell.appendChild(createSheetPhotoElement("1.7 / 2.1"));
      }

      a4Grid.appendChild(cell);
    }
  }
}

// Cropping & Pipeline
function onFilePicked(file) {
  if (!file || !file.type.startsWith("image/")) return;
  showError("");
  originalFile = file;

  if (rawPreviewUrl) URL.revokeObjectURL(rawPreviewUrl);
  if (removedBlobUrl) URL.revokeObjectURL(removedBlobUrl);
  rawPreviewUrl = URL.createObjectURL(file);
  removedBlob = null;
  removedBgId = null;
  removedBlobUrl = "";

  // Switch to editor view
  landingView?.classList.add("hidden");
  editorView?.classList.remove("hidden");
  
  // Start Crop Step
  startCropper(rawPreviewUrl);
}

function startCropper(url) {
  currentStep = "crop";
  previewStage?.classList.add("hidden");
  cropStage?.classList.remove("hidden");
  cropperControls?.classList.remove("hidden");

  // Keep other tabs and palette hidden during crop
  document.getElementById("tab-passport")?.classList.add("hidden");
  document.getElementById("tab-attire")?.classList.add("hidden");
  document.getElementById("tab-stamp")?.classList.add("hidden");
  document.getElementById("tab-custom")?.classList.add("hidden");
  document.getElementById("right-panel")?.classList.add("hidden");

  // Center editor grid during crop
  const editorGrid = document.getElementById("editor-grid");
  if (editorGrid) {
    editorGrid.classList.remove("md:grid-cols-2", "max-w-[860px]");
    editorGrid.classList.add("max-w-[420px]");
  }

  let baseRatio = null;

  function initCropperInstance() {
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }
    cropper = new Cropper(cropperTarget, {
      aspectRatio: 1.7 / 2.1,
      viewMode: 1,
      autoCropArea: 0.95,
      responsive: true,
      background: false,
      zoomable: true,
      scalable: true,
      ready() {
        const imageData = cropper.getImageData();
        if (imageData && imageData.naturalWidth > 0) {
          baseRatio = imageData.width / imageData.naturalWidth;
        } else {
          baseRatio = 1;
        }
        if (zoomSlider) {
          zoomSlider.value = 1;
        }
      },
      zoom(e) {
        if (baseRatio && zoomSlider && document.activeElement !== zoomSlider) {
          const currentScale = e.detail.ratio / baseRatio;
          zoomSlider.value = Math.max(1, Math.min(3, currentScale));
        }
      }
    });
  }

  if (cropperTarget) {
    cropperTarget.onload = initCropperInstance;
    cropperTarget.src = url;
    if (cropperTarget.complete && cropperTarget.naturalWidth > 0) {
      initCropperInstance();
    }
  }

  if (zoomSlider) {
    zoomSlider.value = 1;
    zoomSlider.oninput = (e) => {
      if (cropper) {
        if (!baseRatio) {
          const imgData = cropper.getImageData();
          if (imgData && imgData.naturalWidth > 0) {
            baseRatio = imgData.width / imgData.naturalWidth;
          }
        }
        if (baseRatio) {
          const scale = parseFloat(e.target.value);
          cropper.zoomTo(baseRatio * scale);
        }
      }
    };
  }
}

async function handleCropConfirm() {
  if (!cropper) return;
  
  setLoading(true, "Applying crop...");
  showError("");

  cropper.getCroppedCanvas().toBlob(async (blob) => {
    if (!blob) {
      setLoading(false);
      showError("Cropping failed.");
      return;
    }

    croppedFile = new File([blob], originalFile.name || "cropped.png", { type: "image/png" });
    if (rawPreviewUrl) URL.revokeObjectURL(rawPreviewUrl);
    rawPreviewUrl = URL.createObjectURL(blob);

    if (cropper) {
      cropper.destroy();
      cropper = null;
    }

    cropStage?.classList.add("hidden");
    cropperControls?.classList.add("hidden");
    previewStage?.classList.remove("hidden");
    if (previewImg) previewImg.src = rawPreviewUrl;

    currentStep = "edit";

    // Reveal other tabs and right panel
    document.getElementById("tab-passport")?.classList.remove("hidden");
    document.getElementById("tab-attire")?.classList.remove("hidden");
    document.getElementById("tab-stamp")?.classList.remove("hidden");
    document.getElementById("tab-custom")?.classList.remove("hidden");
    document.getElementById("right-panel")?.classList.remove("hidden");
    eraserTools?.classList.remove("hidden");

    // Expand editor grid to 2 columns
    const editorGrid = document.getElementById("editor-grid");
    if (editorGrid) {
      editorGrid.classList.remove("max-w-[420px]");
      editorGrid.classList.add("md:grid-cols-2", "max-w-[960px]");
    }

    updateColorUI();
    renderA4Grid();

    // Call Remove BG API
    await removeBackground(croppedFile);
  }, "image/png");
}

async function removeBackground(file) {
  setLoading(true, "Removing background...");
  showError("");

  try {
    const formData = new FormData();
    formData.append("image", file, file.name || "image.png");

    const res = await fetch("/api/remove-bg/", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      let msg = "Background removal failed.";
      try {
        const errObj = JSON.parse(errText);
        msg = errObj.error || errObj.detail || msg;
      } catch {}
      throw new Error(msg);
    }

    const data = await res.json();
    const imageUrl = data.url || data.results?.[0]?.url;
    removedBgId = data.id || data.results?.[0]?.id;

    if (!imageUrl) throw new Error("Image URL missing in response");

    const imgFetch = await fetch(imageUrl);
    if (!imgFetch.ok) throw new Error("Failed to fetch processed image");
    
    removedBlob = await imgFetch.blob();
    portraitBlobHistory = [removedBlob];
    updateUndoBtnState();
    if (removedBlobUrl) URL.revokeObjectURL(removedBlobUrl);
    removedBlobUrl = URL.createObjectURL(removedBlob);

    if (previewImg) {
      previewImg.src = removedBlobUrl;
      previewImg.classList.add("drop-shadow-lg");
    }

    renderA4Grid();
  } catch (err) {
    console.error(err);
    showError(err.message || "Failed to remove background. Please try again.");
  } finally {
    setLoading(false);
  }
}

function triggerBlobDownload(blob, fileName = "output.png") {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

function getObjectFitContainRect(imgW, imgH, containerW, containerH) {
  if (!imgW || !imgH) return { x: 0, y: 0, w: containerW, h: containerH };
  const imgAspect = imgW / imgH;
  const containerAspect = containerW / containerH;
  let w, h, x, y;
  if (imgAspect > containerAspect) {
    w = containerW;
    h = containerW / imgAspect;
    x = 0;
    y = (containerH - h) / 2;
  } else {
    h = containerH;
    w = containerH * imgAspect;
    x = (containerW - w) / 2;
    y = 0;
  }
  return { x, y, w, h };
}

// Helper to render high-res WYSIWYG single composited photo
async function generateHighResCompositedPhoto(targetW = 1020, targetH = 1260) {
  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");

  // 1. Background color
  const bgColor = (selectedBgColor === "transparent" || !selectedBgColor) ? null : selectedBgColor;
  if (bgColor) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, targetW, targetH);
  }

  // 2. Draw portrait image with exact CSS object-contain placement
  if (previewImg && previewImg.src) {
    await new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const nw = img.naturalWidth || targetW;
        const nh = img.naturalHeight || targetH;
        const pRect = getObjectFitContainRect(nw, nh, targetW, targetH);
        ctx.drawImage(img, pRect.x, pRect.y, pRect.w, pRect.h);
        resolve();
      };
      img.onerror = () => {
        if (previewImg.complete && previewImg.naturalWidth > 0) {
          const pRect = getObjectFitContainRect(previewImg.naturalWidth, previewImg.naturalHeight, targetW, targetH);
          ctx.drawImage(previewImg, pRect.x, pRect.y, pRect.w, pRect.h);
        }
        resolve();
      };
      img.src = previewImg.src;
    });
  }

  // 3. Draw formal attire overlay mirroring CSS exactly:
  //    Element: position absolute, left-0 top-0, h-full w-full, object-contain
  //    Transform: translate(X%, Y%) scale(S), transform-origin: center
  //
  //    CSS transform math for a point (px, py) in element space:
  //      screenX = cx + S*(px - cx) + tx_px
  //      screenY = cy + S*(py - cy) + ty_px
  //    where cx=targetW/2, cy=targetH/2 (transform-origin)
  //          tx_px = targetW*(X/100), ty_px = targetH*(Y/100)
  if (selectedAttireId) {
    const item = allAttires.find(a => a.id === selectedAttireId);
    if (item) {
      await new Promise((resolve) => {
        const attireImg = new Image();
        attireImg.crossOrigin = "anonymous";
        attireImg.onload = () => {
          const natW = attireImg.naturalWidth || 1;
          const natH = attireImg.naturalHeight || 1;

          // Step 1: compute object-contain rect (where image renders within targetW×targetH element)
          const oRect = getObjectFitContainRect(natW, natH, targetW, targetH);

          // Step 2: translate offset in pixels (% of element box)
          const tx_px = targetW * (attireOffsetX / 100);
          const ty_px = targetH * (attireOffsetY / 100);

          // Step 3: transform-origin is element center (targetW/2, targetH/2)
          const cx = targetW / 2;
          const cy = targetH / 2;

          // Step 4: apply CSS transform to the oRect top-left corner
          //   drawX = cx + S*(oRect.x - cx) + tx_px
          //   drawY = cy + S*(oRect.y - cy) + ty_px
          const drawX = cx + attireScale * (oRect.x - cx) + tx_px;
          const drawY = cy + attireScale * (oRect.y - cy) + ty_px;
          const scaledW = oRect.w * attireScale;
          const scaledH = oRect.h * attireScale;

          ctx.drawImage(attireImg, drawX, drawY, scaledW, scaledH);
          resolve();
        };
        attireImg.onerror = resolve;
        attireImg.src = item.image;
      });
    }
  }

  return canvas;
}

async function generateA4Sheet(compositedPhotoCanvas, tabType) {
  const A4_W = 2480; // A4 at 300 DPI
  const A4_H = 3508;
  const MARGIN = 50;  // small equal margin on all sides

  const sheetCanvas = document.createElement("canvas");
  sheetCanvas.width = A4_W;
  sheetCanvas.height = A4_H;
  const ctx = sheetCanvas.getContext("2d");

  // White paper background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, A4_W, A4_H);

  const availW = A4_W - 2 * MARGIN;
  const availH = A4_H - 2 * MARGIN;

  if (tabType === "Passport Size Image") {
    const photoW = Math.round(1.7 * 300); // 510 px
    const photoH = Math.round(2.1 * 300); // 630 px
    const cols = 4;
    const count = Math.min(20, Math.max(1, selectedCount || 4));
    const rows = Math.ceil(count / cols);

    // Auto-calculate gaps to perfectly space within available area
    const gapX = cols > 1 ? Math.floor((availW - cols * photoW) / (cols - 1)) : 0;
    const gapY = rows > 1 ? Math.floor((availH - rows * photoH) / (rows - 1)) : 0;
    const safeGapX = Math.max(0, Math.min(gapX, 120));
    const safeGapY = Math.max(0, Math.min(gapY, 120));

    // Center the grid horizontally
    const gridW = cols * photoW + (cols - 1) * safeGapX;
    const startX = MARGIN + Math.floor((availW - gridW) / 2);

    for (let i = 0; i < count; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      const x = startX + c * (photoW + safeGapX);
      const y = MARGIN + r * (photoH + safeGapY);
      ctx.drawImage(compositedPhotoCanvas, x, y, photoW, photoH);
    }
  } else if (tabType === "Passport-Stamp Images") {
    const ppW = Math.round(1.7 * 300); // 510 px
    const ppH = Math.round(2.1 * 300); // 630 px
    const stW = Math.round(0.8 * 300); // 240 px
    const stH = Math.round(1.0 * 300); // 300 px

    const gapPP = 40;       // gap between each passport photo
    const separator = 80;   // gap between passport block and stamp block
    const stGapX = 30;      // gap between stamp photos horizontally
    const stGapY = ppH - (2 * stH); // vertical gap between 2 stamp rows (~30px)

    // Full row width: 3*ppW + 2*gapPP + separator + 2*stW + stGapX
    const fullRowW = 3 * ppW + 2 * gapPP + separator + 2 * stW + stGapX;
    const startX = MARGIN + Math.floor((availW - fullRowW) / 2);

    const rows = Math.min(5, Math.max(1, Number(selectedCount) || 1));
    const rowGapY = rows > 1 ? Math.floor((availH - rows * ppH) / (rows - 1)) : 0;
    const safeRowGapY = Math.max(30, Math.min(rowGapY, 100));

    for (let r = 0; r < rows; r++) {
      const rowY = MARGIN + r * (ppH + safeRowGapY);

      // 3 Passport photos on left with gapPP between them
      for (let c = 0; c < 3; c++) {
        const x = startX + c * (ppW + gapPP);
        ctx.drawImage(compositedPhotoCanvas, x, rowY, ppW, ppH);
      }

      // 4 Stamp photos on right (2x2), separated from passport block by `separator`
      const stampStartX = startX + 3 * ppW + 2 * gapPP + separator;
      ctx.drawImage(compositedPhotoCanvas, stampStartX,               rowY,             stW, stH);
      ctx.drawImage(compositedPhotoCanvas, stampStartX + stW + stGapX, rowY,             stW, stH);
      ctx.drawImage(compositedPhotoCanvas, stampStartX,               rowY + stH + stGapY, stW, stH);
      ctx.drawImage(compositedPhotoCanvas, stampStartX + stW + stGapX, rowY + stH + stGapY, stW, stH);
    }
  } else if (tabType === "Custom Size Images") {
    const wIn = Math.min(7.8, Math.max(0.5, parseFloat(document.getElementById("custom-w-input")?.value) || 2.0));
    const hIn = Math.min(11.0, Math.max(0.5, parseFloat(document.getElementById("custom-h-input")?.value) || 2.0));
    const count = Math.max(1, parseInt(document.getElementById("custom-count-input")?.value) || 6);

    const photoW = Math.round(wIn * 300);
    const photoH = Math.round(hIn * 300);
    const gap = 45;

    const availW = A4_W - 2 * MARGIN;
    const availH = A4_H - 2 * MARGIN;
    const cols = Math.max(1, Math.floor((availW + gap) / (photoW + gap)));
    const maxPhotos = cols * Math.max(1, Math.floor((availH + gap) / (photoH + gap)));
    const toPlace = Math.min(count, maxPhotos);

    for (let i = 0; i < toPlace; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      const x = MARGIN + c * (photoW + gap);
      const y = MARGIN + r * (photoH + gap);
      ctx.drawImage(compositedPhotoCanvas, x, y, photoW, photoH);
    }
  }

  return sheetCanvas;
}

// Download Logic - 100% WYSIWYG Pixel Perfect Instant Output
async function handleDownload() {
  if (!previewImg || !previewImg.src) {
    showError("Please upload an image first.");
    return;
  }

  setLoading(true, "Preparing high-resolution download...");
  showError("");

  try {
    const isSinglePhoto = currentTab === "Background" || currentTab === "Formal Attire";
    const compositedPhoto = await generateHighResCompositedPhoto(1020, 1260);

    if (isSinglePhoto) {
      compositedPhoto.toBlob((blob) => {
        if (blob) {
          triggerBlobDownload(blob, "passport-photo.png");
        }
        setLoading(false);
      }, "image/png");
    } else {
      const sheet = await generateA4Sheet(compositedPhoto, currentTab);
      sheet.toBlob((blob) => {
        if (blob) {
          const fileName = currentTab === "Passport Size Image" 
            ? "passport-sheet-a4.png" 
            : currentTab === "Passport-Stamp Images" 
              ? "passport-stamp-combo-a4.png" 
              : "custom-size-sheet-a4.png";
          triggerBlobDownload(blob, fileName);
        }
        setLoading(false);
      }, "image/png");
    }
  } catch (err) {
    console.error("Download error:", err);
    showError("Failed to generate download. Please try again.");
    setLoading(false);
  }
}

function resetApp() {
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
  if (rawPreviewUrl) URL.revokeObjectURL(rawPreviewUrl);
  if (removedBlobUrl) URL.revokeObjectURL(removedBlobUrl);

  originalFile = null;
  croppedFile = null;
  removedBlob = null;
  removedBgId = null;
  rawPreviewUrl = "";
  removedBlobUrl = "";
  selectedAttireId = null;
  attireScale = 1.0;
  attireOffsetY = 0;
  updateAttireOverlay();

  if (fileInput) fileInput.value = "";
  showError("");

  landingView?.classList.remove("hidden");
  editorView?.classList.add("hidden");
  if (previewImg) previewImg.src = "";

  // Reset eraser state
  isEraserMode = false;
  eraserUndoStack = [];
  portraitBlobHistory = [];
  eraserCanvas?.classList.add("hidden");
  eraserControls?.classList.add("hidden");
  eraserTools?.classList.add("hidden");
  eraserModeHint?.classList.add("hidden");
  updateUndoBtnState();
  previewImg?.classList.remove("opacity-0");
  if (eraserToggleBtn) {
    eraserToggleBtn.className = "flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-gray-300 bg-white text-[11px] font-medium text-gray-700 hover:bg-[#7f8ef0] hover:text-white hover:border-[#7f8ef0] transition shadow-2xs";
  }

  // Reset tab visibility and panel
  document.getElementById("tab-passport")?.classList.add("hidden");
  document.getElementById("tab-attire")?.classList.add("hidden");
  document.getElementById("tab-stamp")?.classList.add("hidden");
  document.getElementById("tab-custom")?.classList.add("hidden");
  document.getElementById("right-panel")?.classList.add("hidden");

  const editorGrid = document.getElementById("editor-grid");
  if (editorGrid) {
    editorGrid.classList.remove("md:grid-cols-2", "max-w-[960px]");
    editorGrid.classList.add("max-w-[420px]");
  }

  document.getElementById("hero")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Event Listeners
uploadBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  if (fileInput) {
    fileInput.value = "";
    fileInput.click();
  }
});

dropzone?.addEventListener("click", (e) => {
  if (e.target !== fileInput) {
    if (fileInput) {
      fileInput.value = "";
      fileInput.click();
    }
  }
});

fileInput?.addEventListener("change", (e) => {
  if (e.target.files && e.target.files.length > 0) {
    onFilePicked(e.target.files[0]);
  }
});

dropzone?.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("border-[#7f8ef0]", "bg-blue-50");
});
dropzone?.addEventListener("dragleave", (e) => {
  e.preventDefault();
  dropzone.classList.remove("border-[#7f8ef0]", "bg-blue-50");
});
dropzone?.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("border-[#7f8ef0]", "bg-blue-50");
  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    onFilePicked(e.dataTransfer.files[0]);
  }
});

cropConfirmBtn?.addEventListener("click", handleCropConfirm);
resetBtn?.addEventListener("click", resetApp);
downloadBtn?.addEventListener("click", handleDownload);
tryNowBtn?.addEventListener("click", () => {
  document.getElementById("hero")?.scrollIntoView({ behavior: "smooth", block: "start" });
});

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  initPalette();
  initTabs();
  initAttireListeners();
  initEraser();
  loadAttires();
  updateColorUI();
});
