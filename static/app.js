const translations = {
    he: {
        pageTitle: "Image2PDF — המרת תמונות ל־PDF",
        languageLabel: "שפה",
        heroTitle: "הפוך תמונות ל־PDF",
        heroDescription: "בחר כמה תמונות, סדר אותן לפי הצורך והורד קובץ PDF אחד.",
        chooseImages: "לחץ לבחירת תמונות",
        dropImages: "או גרור אותן לכאן",
        fileLimits: "JPG, PNG, WEBP, BMP · עד 40MB לבקשה",
        yourImages: "התמונות שלך",
        reorderHint: "השתמש בחצים כדי לשנות את סדר העמודים.",
        reverseOrder: "הפוך סדר",
        clearAll: "נקה הכל",
        createPdf: "צור PDF",
        creatingPdf: "יוצר PDF...",
        privacyNote: "התמונות מעובדות בזיכרון בלבד ואינן נשמרות על השרת.",
        imagePreview: "תצוגת תמונה",
        imageEditor: "עריכת תמונה",
        close: "סגור",
        editImage: "עריכת התמונה",
        cropHint: "גרור על התמונה כדי לסמן את אזור החיתוך",
        editorTools: "כלי עריכת תמונה",
        brightness: "בהירות",
        contrast: "ניגודיות",
        saturation: "רוויה",
        hue: "גוון",
        rotation: "רוטציה",
        grayscale: "שחור־לבן",
        cropImage: "חתוך תמונה",
        finishSelection: "סיים סימון",
        clearCrop: "בטל חיתוך",
        resetChanges: "איפוס כל השינויים",
        backToPreview: "חזרה לתצוגה",
        saveChanges: "שמור שינויים",
        saving: "שומר...",
        enlargeImage: "הגדל תמונה",
        editImageAction: "ערוך תמונה",
        moveUp: "העבר למעלה",
        moveDown: "העבר למטה",
        remove: "הסר",
        loadingEditor: "טוען את כלי העריכה...",
        loadEditorFailed: "לא ניתן לטעון את התמונה לעריכה.",
        processingImage: "מעבד את התמונה...",
        saveFailed: "שמירת השינויים נכשלה. נסה שוב.",
    },
    en: {
        pageTitle: "Image2PDF — Convert Images to PDF",
        languageLabel: "Language",
        heroTitle: "Convert images to PDF",
        heroDescription: "Choose multiple images, arrange them as needed, and download one PDF file.",
        chooseImages: "Click to choose images",
        dropImages: "or drag them here",
        fileLimits: "JPG, PNG, WEBP, BMP · up to 40MB per request",
        yourImages: "Your images",
        reorderHint: "Use the arrows to change the page order.",
        reverseOrder: "Reverse order",
        clearAll: "Clear all",
        createPdf: "Create PDF",
        creatingPdf: "Creating PDF...",
        privacyNote: "Images are processed in memory only and are not stored on the server.",
        imagePreview: "Image preview",
        imageEditor: "Edit image",
        close: "Close",
        editImage: "Edit image",
        cropHint: "Drag over the image to select the crop area",
        editorTools: "Image editing tools",
        brightness: "Brightness",
        contrast: "Contrast",
        saturation: "Saturation",
        hue: "Hue",
        rotation: "Rotation",
        grayscale: "Black and white",
        cropImage: "Crop image",
        finishSelection: "Finish selection",
        clearCrop: "Clear crop",
        resetChanges: "Reset all changes",
        backToPreview: "Back to preview",
        saveChanges: "Save changes",
        saving: "Saving...",
        enlargeImage: "Enlarge image",
        editImageAction: "Edit image",
        moveUp: "Move up",
        moveDown: "Move down",
        remove: "Remove",
        loadingEditor: "Loading the editor...",
        loadEditorFailed: "The image could not be loaded for editing.",
        processingImage: "Processing the image...",
        saveFailed: "Could not save the changes. Please try again.",
    },
};

const input = document.getElementById("images");
const form = document.getElementById("pdfForm");
const dropZone = document.getElementById("dropZone");
const previewSection = document.getElementById("previewSection");
const previewList = document.getElementById("previewList");
const submitButton = document.getElementById("submitButton");
const reverseButton = document.getElementById("reverseButton");
const clearButton = document.getElementById("clearButton");
const languageSelect = document.getElementById("languageSelect");
const languageInput = document.getElementById("languageInput");

const hoverPreview = document.getElementById("hoverPreview");
const hoverPreviewImage = document.getElementById("hoverPreviewImage");
const hoverPreviewName = document.getElementById("hoverPreviewName");
const imageModal = document.getElementById("imageModal");
const modalTitle = document.getElementById("modalTitle");
const modalFileName = document.getElementById("modalFileName");
const modalImage = document.getElementById("modalImage");
const viewMode = document.getElementById("viewMode");
const editMode = document.getElementById("editMode");
const closeModalButton = document.getElementById("closeModalButton");
const closeViewButton = document.getElementById("closeViewButton");
const switchToEditButton = document.getElementById("switchToEditButton");
const cancelEditButton = document.getElementById("cancelEditButton");
const saveEditButton = document.getElementById("saveEditButton");
const editorStatus = document.getElementById("editorStatus");

const editCanvas = document.getElementById("editCanvas");
const editContext = editCanvas.getContext("2d");
const cropHint = document.getElementById("cropHint");
const cropButton = document.getElementById("cropButton");
const clearCropButton = document.getElementById("clearCropButton");
const resetEditButton = document.getElementById("resetEditButton");
const grayscaleToggle = document.getElementById("grayscaleToggle");
const rotateLeftButton = document.getElementById("rotateLeftButton");
const rotateRightButton = document.getElementById("rotateRightButton");

const editorInputs = {
    brightness: document.getElementById("brightnessRange"),
    contrast: document.getElementById("contrastRange"),
    saturation: document.getElementById("saturationRange"),
    hue: document.getElementById("hueRange"),
    rotation: document.getElementById("rotationRange"),
};

const editorOutputs = {
    brightness: document.getElementById("brightnessValue"),
    contrast: document.getElementById("contrastValue"),
    saturation: document.getElementById("saturationValue"),
    hue: document.getElementById("hueValue"),
    rotation: document.getElementById("rotationValue"),
};

const defaultEditState = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    rotation: 0,
    grayscale: false,
};

let selectedFiles = [];
let activeImageIndex = -1;
let activeObjectUrl = null;
let hoverObjectUrl = null;
let editorSourceImage = null;
let editState = { ...defaultEditState };
let cropMode = false;
let cropRect = null;
let cropStart = null;
let lastFocusedElement = null;
let isSubmitting = false;
let currentLanguage = "he";

applyLanguage(getInitialLanguage());

languageSelect.addEventListener("change", () => {
    applyLanguage(languageSelect.value);
});

input.addEventListener("change", () => {
    selectedFiles = Array.from(input.files);
    syncInput();
    renderPreview();
});

["dragenter", "dragover"].forEach(eventName => {
    dropZone.addEventListener(eventName, event => {
        event.preventDefault();
        dropZone.classList.add("dragging");
    });
});

["dragleave", "drop"].forEach(eventName => {
    dropZone.addEventListener(eventName, event => {
        event.preventDefault();
        dropZone.classList.remove("dragging");
    });
});

dropZone.addEventListener("drop", event => {
    selectedFiles = Array.from(event.dataTransfer.files).filter(file =>
        file.type.startsWith("image/")
    );
    syncInput();
    renderPreview();
});

clearButton.addEventListener("click", () => {
    selectedFiles = [];
    syncInput();
    renderPreview();
});

reverseButton.addEventListener("click", () => {
    selectedFiles.reverse();
    syncInput();
    renderPreview();
});

form.addEventListener("submit", () => {
    isSubmitting = true;
    submitButton.disabled = true;
    submitButton.textContent = t("creatingPdf");
});

closeModalButton.addEventListener("click", closeImageModal);
closeViewButton.addEventListener("click", closeImageModal);
switchToEditButton.addEventListener("click", enterEditMode);
cancelEditButton.addEventListener("click", showViewMode);
saveEditButton.addEventListener("click", saveEditedImage);

imageModal.addEventListener("click", event => {
    if (event.target === imageModal) {
        closeImageModal();
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !imageModal.classList.contains("hidden")) {
        closeImageModal();
    }
});

Object.entries(editorInputs).forEach(([key, element]) => {
    element.addEventListener("input", () => {
        editState[key] = Number(element.value);
        if (key === "rotation") {
            clearCropSelection();
        }
        updateEditorValues();
        renderEditor();
    });
});

grayscaleToggle.addEventListener("change", () => {
    editState.grayscale = grayscaleToggle.checked;
    renderEditor();
});

rotateLeftButton.addEventListener("click", () => rotateBy(-90));
rotateRightButton.addEventListener("click", () => rotateBy(90));
resetEditButton.addEventListener("click", resetEditor);

cropButton.addEventListener("click", () => {
    cropMode = !cropMode;
    cropButton.classList.toggle("active", cropMode);
    cropButton.textContent = cropMode ? t("finishSelection") : t("cropImage");
    cropHint.classList.toggle("hidden", !cropMode);
    editCanvas.classList.toggle("cropping", cropMode);
});

clearCropButton.addEventListener("click", () => {
    clearCropSelection();
    renderEditor();
});

editCanvas.addEventListener("pointerdown", startCropSelection);
editCanvas.addEventListener("pointermove", updateCropSelection);
editCanvas.addEventListener("pointerup", finishCropSelection);
editCanvas.addEventListener("pointercancel", finishCropSelection);

function getInitialLanguage() {
    try {
        const savedLanguage = localStorage.getItem("image2pdf-language");
        if (translations[savedLanguage]) {
            return savedLanguage;
        }
    } catch (_error) {
        // The interface still works when browser storage is unavailable.
    }

    return navigator.language.toLowerCase().startsWith("he") ? "he" : "en";
}

function t(key) {
    return translations[currentLanguage][key] || translations.he[key] || key;
}

function setEditorStatus(key = "") {
    editorStatus.dataset.i18nStatus = key;
    editorStatus.textContent = key ? t(key) : "";
}

function applyLanguage(language) {
    currentLanguage = translations[language] ? language : "he";
    const direction = currentLanguage === "he" ? "rtl" : "ltr";

    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = direction;
    languageSelect.value = currentLanguage;
    languageInput.value = currentLanguage;
    form.action = `/create-pdf?lang=${encodeURIComponent(currentLanguage)}`;

    document.querySelectorAll("[data-i18n]").forEach(element => {
        element.textContent = t(element.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach(element => {
        element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
    });

    modalTitle.textContent = editMode.classList.contains("hidden")
        ? t("imagePreview")
        : t("imageEditor");
    cropButton.textContent = cropMode ? t("finishSelection") : t("cropImage");
    submitButton.textContent = isSubmitting ? t("creatingPdf") : t("createPdf");
    saveEditButton.textContent = saveEditButton.disabled ? t("saving") : t("saveChanges");
    if (editorStatus.dataset.i18nStatus) {
        editorStatus.textContent = t(editorStatus.dataset.i18nStatus);
    }

    try {
        localStorage.setItem("image2pdf-language", currentLanguage);
    } catch (_error) {
        // Language switching does not depend on persistent storage.
    }

    if (selectedFiles.length) {
        renderPreview();
    }
}

function syncInput() {
    const transfer = new DataTransfer();
    selectedFiles.forEach(file => transfer.items.add(file));
    input.files = transfer.files;
}

function moveFile(index, offset) {
    const newIndex = index + offset;
    if (newIndex < 0 || newIndex >= selectedFiles.length) {
        return;
    }

    [selectedFiles[index], selectedFiles[newIndex]] =
        [selectedFiles[newIndex], selectedFiles[index]];
    syncInput();
    renderPreview();
}

function removeFile(index) {
    selectedFiles.splice(index, 1);
    syncInput();
    renderPreview();
}

function renderPreview() {
    previewList.innerHTML = "";

    const hasFiles = selectedFiles.length > 0;
    previewSection.classList.toggle("hidden", !hasFiles);
    submitButton.disabled = isSubmitting || !hasFiles;
    reverseButton.disabled = selectedFiles.length < 2;
    if (!isSubmitting) {
        submitButton.textContent = t("createPdf");
    }

    selectedFiles.forEach((file, index) => {
        const item = document.createElement("article");
        item.className = "preview-item";

        const img = document.createElement("img");
        img.alt = file.name;
        const objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;
        img.onload = () => URL.revokeObjectURL(objectUrl);

        const info = document.createElement("div");
        info.className = "file-info";
        const name = document.createElement("strong");
        name.textContent = file.name;
        const size = document.createElement("span");
        size.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
        info.append(name, size);

        const controls = document.createElement("div");
        controls.className = "controls";

        const enlarge = makeButton("🔍", t("enlargeImage"), () => openImageModal(index, false));
        enlarge.classList.add("enlarge");
        enlarge.addEventListener("mouseenter", () => showHoverPreview(file, enlarge));
        enlarge.addEventListener("mouseleave", hideHoverPreview);
        enlarge.addEventListener("focus", () => showHoverPreview(file, enlarge));
        enlarge.addEventListener("blur", hideHoverPreview);

        const edit = makeButton("✎", t("editImageAction"), () => openImageModal(index, true));
        edit.classList.add("edit");

        const up = makeButton("↑", t("moveUp"), () => moveFile(index, -1));
        up.disabled = index === 0;
        const down = makeButton("↓", t("moveDown"), () => moveFile(index, 1));
        down.disabled = index === selectedFiles.length - 1;
        const remove = makeButton("×", t("remove"), () => removeFile(index));
        remove.classList.add("remove");

        controls.append(enlarge, edit, up, down, remove);
        item.append(img, info, controls);
        previewList.appendChild(item);
    });
}

function makeButton(text, label, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.title = label;
    button.setAttribute("aria-label", label);
    button.addEventListener("click", onClick);
    return button;
}

function showHoverPreview(file, anchor) {
    hideHoverPreview();
    hoverObjectUrl = URL.createObjectURL(file);
    hoverPreviewImage.src = hoverObjectUrl;
    hoverPreviewImage.alt = file.name;
    hoverPreviewName.textContent = file.name;
    hoverPreview.classList.remove("hidden");
    hoverPreview.setAttribute("aria-hidden", "false");

    const anchorRect = anchor.getBoundingClientRect();
    const previewRect = hoverPreview.getBoundingClientRect();
    let left = anchorRect.right + 12;
    if (left + previewRect.width > window.innerWidth - 12) {
        left = Math.max(12, anchorRect.left - previewRect.width - 12);
    }
    const top = Math.min(
        Math.max(12, anchorRect.top + anchorRect.height / 2 - previewRect.height / 2),
        window.innerHeight - previewRect.height - 12
    );

    hoverPreview.style.left = `${left}px`;
    hoverPreview.style.top = `${top}px`;
}

function hideHoverPreview() {
    hoverPreview.classList.add("hidden");
    hoverPreview.setAttribute("aria-hidden", "true");
    hoverPreviewImage.removeAttribute("src");
    if (hoverObjectUrl) {
        URL.revokeObjectURL(hoverObjectUrl);
        hoverObjectUrl = null;
    }
}

function openImageModal(index, startEditing) {
    hideHoverPreview();
    activeImageIndex = index;
    lastFocusedElement = document.activeElement;
    const file = selectedFiles[index];

    releaseActiveObjectUrl();
    activeObjectUrl = URL.createObjectURL(file);
    modalImage.src = activeObjectUrl;
    modalImage.alt = file.name;
    modalFileName.textContent = file.name;

    imageModal.classList.remove("hidden");
    imageModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    if (startEditing) {
        enterEditMode();
    } else {
        showViewMode();
        closeModalButton.focus();
    }
}

function closeImageModal() {
    imageModal.classList.add("hidden");
    imageModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    hideHoverPreview();
    releaseActiveObjectUrl();
    editorSourceImage = null;
    activeImageIndex = -1;
    if (lastFocusedElement) {
        lastFocusedElement.focus();
    }
}

function releaseActiveObjectUrl() {
    modalImage.removeAttribute("src");
    if (activeObjectUrl) {
        URL.revokeObjectURL(activeObjectUrl);
        activeObjectUrl = null;
    }
}

function showViewMode() {
    modalTitle.textContent = t("imagePreview");
    viewMode.classList.remove("hidden");
    editMode.classList.add("hidden");
    setEditorStatus();
}

async function enterEditMode() {
    if (activeImageIndex < 0) {
        return;
    }

    modalTitle.textContent = t("imageEditor");
    viewMode.classList.add("hidden");
    editMode.classList.remove("hidden");
    setEditorStatus("loadingEditor");
    resetEditor();

    try {
        editorSourceImage = await loadImageFromFile(selectedFiles[activeImageIndex]);
        setEditorStatus();
        renderEditor();
        saveEditButton.focus();
    } catch (_error) {
        setEditorStatus("loadEditorFailed");
    }
}

function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => {
            URL.revokeObjectURL(url);
            resolve(image);
        };
        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Image load failed"));
        };
        image.src = url;
    });
}

function resetEditor() {
    editState = { ...defaultEditState };
    Object.entries(editorInputs).forEach(([key, element]) => {
        element.value = editState[key];
    });
    grayscaleToggle.checked = false;
    clearCropSelection();
    updateEditorValues();
    if (editorSourceImage) {
        renderEditor();
    }
}

function updateEditorValues() {
    editorOutputs.brightness.textContent = `${editState.brightness}%`;
    editorOutputs.contrast.textContent = `${editState.contrast}%`;
    editorOutputs.saturation.textContent = `${editState.saturation}%`;
    editorOutputs.hue.textContent = `${editState.hue}°`;
    editorOutputs.rotation.textContent = `${editState.rotation}°`;
}

function rotateBy(degrees) {
    let rotation = editState.rotation + degrees;
    if (rotation > 180) rotation -= 360;
    if (rotation < -180) rotation += 360;
    editState.rotation = rotation;
    editorInputs.rotation.value = rotation;
    clearCropSelection();
    updateEditorValues();
    renderEditor();
}

function getRotatedSize(width, height, degrees) {
    const radians = degrees * Math.PI / 180;
    return {
        width: Math.abs(width * Math.cos(radians)) + Math.abs(height * Math.sin(radians)),
        height: Math.abs(width * Math.sin(radians)) + Math.abs(height * Math.cos(radians)),
    };
}

function getCanvasFilter() {
    return [
        `brightness(${editState.brightness}%)`,
        `contrast(${editState.contrast}%)`,
        `saturate(${editState.saturation}%)`,
        `hue-rotate(${editState.hue}deg)`,
        `grayscale(${editState.grayscale ? 100 : 0}%)`,
    ].join(" ");
}

function renderEditor() {
    if (!editorSourceImage) {
        return;
    }

    const rotatedSize = getRotatedSize(
        editorSourceImage.naturalWidth,
        editorSourceImage.naturalHeight,
        editState.rotation
    );
    const scale = Math.min(1, 820 / rotatedSize.width, 540 / rotatedSize.height);
    editCanvas.width = Math.max(1, Math.round(rotatedSize.width * scale));
    editCanvas.height = Math.max(1, Math.round(rotatedSize.height * scale));

    editContext.save();
    editContext.clearRect(0, 0, editCanvas.width, editCanvas.height);
    editContext.fillStyle = "#ffffff";
    editContext.fillRect(0, 0, editCanvas.width, editCanvas.height);
    editContext.translate(editCanvas.width / 2, editCanvas.height / 2);
    editContext.rotate(editState.rotation * Math.PI / 180);
    editContext.filter = getCanvasFilter();
    editContext.drawImage(
        editorSourceImage,
        -editorSourceImage.naturalWidth * scale / 2,
        -editorSourceImage.naturalHeight * scale / 2,
        editorSourceImage.naturalWidth * scale,
        editorSourceImage.naturalHeight * scale
    );
    editContext.restore();

    if (cropRect) {
        drawCropOverlay();
    }
}

function canvasPointFromEvent(event) {
    const rect = editCanvas.getBoundingClientRect();
    return {
        x: Math.max(0, Math.min(editCanvas.width, (event.clientX - rect.left) * editCanvas.width / rect.width)),
        y: Math.max(0, Math.min(editCanvas.height, (event.clientY - rect.top) * editCanvas.height / rect.height)),
    };
}

function startCropSelection(event) {
    if (!cropMode || !editorSourceImage) {
        return;
    }
    editCanvas.setPointerCapture(event.pointerId);
    cropStart = canvasPointFromEvent(event);
    cropRect = { x: cropStart.x, y: cropStart.y, width: 0, height: 0 };
}

function updateCropSelection(event) {
    if (!cropMode || !cropStart || !editCanvas.hasPointerCapture(event.pointerId)) {
        return;
    }
    const point = canvasPointFromEvent(event);
    cropRect = {
        x: Math.min(cropStart.x, point.x),
        y: Math.min(cropStart.y, point.y),
        width: Math.abs(point.x - cropStart.x),
        height: Math.abs(point.y - cropStart.y),
    };
    renderEditor();
}

function finishCropSelection(event) {
    if (!cropStart) {
        return;
    }
    if (editCanvas.hasPointerCapture(event.pointerId)) {
        editCanvas.releasePointerCapture(event.pointerId);
    }
    if (!cropRect || cropRect.width < 10 || cropRect.height < 10) {
        cropRect = null;
    }
    cropStart = null;
    clearCropButton.disabled = !cropRect;
    renderEditor();
}

function drawCropOverlay() {
    editContext.save();
    editContext.fillStyle = "rgba(15, 23, 42, 0.55)";
    editContext.beginPath();
    editContext.rect(0, 0, editCanvas.width, editCanvas.height);
    editContext.rect(cropRect.x, cropRect.y, cropRect.width, cropRect.height);
    editContext.fill("evenodd");
    editContext.strokeStyle = "#ffffff";
    editContext.lineWidth = 2;
    editContext.setLineDash([8, 5]);
    editContext.strokeRect(cropRect.x, cropRect.y, cropRect.width, cropRect.height);
    editContext.restore();
}

function clearCropSelection() {
    cropRect = null;
    cropStart = null;
    cropMode = false;
    cropButton.classList.remove("active");
    cropButton.textContent = t("cropImage");
    cropHint.classList.add("hidden");
    editCanvas.classList.remove("cropping");
    clearCropButton.disabled = true;
}

async function saveEditedImage() {
    if (!editorSourceImage || activeImageIndex < 0) {
        return;
    }

    saveEditButton.disabled = true;
    saveEditButton.textContent = t("saving");
    setEditorStatus("processingImage");

    try {
        const blob = await createEditedBlob();
        const originalFile = selectedFiles[activeImageIndex];
        const baseName = originalFile.name.replace(/\.[^.]+$/, "");
        selectedFiles[activeImageIndex] = new File(
            [blob],
            `${baseName}-edited.jpg`,
            { type: "image/jpeg", lastModified: Date.now() }
        );
        syncInput();
        renderPreview();
        closeImageModal();
    } catch (_error) {
        setEditorStatus("saveFailed");
    } finally {
        saveEditButton.disabled = false;
        saveEditButton.textContent = t("saveChanges");
    }
}

function createEditedBlob() {
    const rotatedSize = getRotatedSize(
        editorSourceImage.naturalWidth,
        editorSourceImage.naturalHeight,
        editState.rotation
    );
    const fullCanvas = document.createElement("canvas");
    fullCanvas.width = Math.max(1, Math.round(rotatedSize.width));
    fullCanvas.height = Math.max(1, Math.round(rotatedSize.height));
    const context = fullCanvas.getContext("2d");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, fullCanvas.width, fullCanvas.height);
    context.save();
    context.translate(fullCanvas.width / 2, fullCanvas.height / 2);
    context.rotate(editState.rotation * Math.PI / 180);
    context.filter = getCanvasFilter();
    context.drawImage(
        editorSourceImage,
        -editorSourceImage.naturalWidth / 2,
        -editorSourceImage.naturalHeight / 2
    );
    context.restore();

    let outputCanvas = fullCanvas;
    if (cropRect) {
        const cropX = Math.round(cropRect.x / editCanvas.width * fullCanvas.width);
        const cropY = Math.round(cropRect.y / editCanvas.height * fullCanvas.height);
        const cropWidth = Math.max(1, Math.round(cropRect.width / editCanvas.width * fullCanvas.width));
        const cropHeight = Math.max(1, Math.round(cropRect.height / editCanvas.height * fullCanvas.height));
        outputCanvas = document.createElement("canvas");
        outputCanvas.width = cropWidth;
        outputCanvas.height = cropHeight;
        outputCanvas.getContext("2d").drawImage(
            fullCanvas,
            cropX,
            cropY,
            cropWidth,
            cropHeight,
            0,
            0,
            cropWidth,
            cropHeight
        );
    }

    return new Promise((resolve, reject) => {
        outputCanvas.toBlob(
            blob => blob ? resolve(blob) : reject(new Error("Canvas export failed")),
            "image/jpeg",
            0.92
        );
    });
}
