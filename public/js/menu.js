// Initialize menu on page load
document.addEventListener("DOMContentLoaded", function () {
    if (data && data.length > 0) {
        loadExistingMenu(data);
    }
    initializeEventListeners();
    initializeSortables();
    refresh();
});

// Event listeners
function initializeEventListeners() {
    document.querySelector("#add-section")?.addEventListener("click", addNewSection);
    document.querySelector("#add-first-section")?.addEventListener("click", addNewSection);
    document.querySelector("#ai-camera")?.addEventListener("click", openSmartScan);
}

// Load existing menu data
function loadExistingMenu(menuData) {
    menuData.forEach(section => {
        const id = generateID();
        addSection(id, section.name);
        section.items.forEach(item => {
            addItem(id, item);
        });
    });
}

// Smart Scan functionality
function openSmartScan() {
    Swal.fire({
        title: "Smart Scan - Upload Menu Photo",
        html: `
            <div class="text-left space-y-4">
                <div class="text-center">
                    <div class="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-camera text-white text-2xl"></i>
                    </div>
                    <p class="text-gray-600 text-sm">Take a photo of your paper menu and our smart technology will automatically extract the items and create your digital menu!</p>
                </div>
                <div>
                    <input type="file" id="menuPhoto" accept="image/*" class="hidden" />
                    <button type="button" id="uploadPhotoBtn" class="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 font-medium">
                        <i class="fas fa-upload mr-2"></i>Choose Photo
                    </button>
                </div>
            </div>
        `,
        showConfirmButton: false,
        showCancelButton: false,
        background: "#ffffff",
        color: "#374151",
        width: window.innerWidth < 640 ? "90%" : "500px",
        padding: window.innerWidth < 640 ? "1rem" : "2rem"
    });
    
    setupPhotoUpload();
}

function setupPhotoUpload() {
    document.getElementById('uploadPhotoBtn').addEventListener('click', () => {
        document.getElementById('menuPhoto').click();
    });
    
    document.getElementById('menuPhoto').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            processMenuPhoto();
        }
    });
}

// Process menu photo with AI
function processMenuPhoto() {
    const imageFile = document.getElementById('menuPhoto').files[0];
    
    if (!imageFile) {
        showError("No Image Selected", "Please select an image first.");
        return;
    }

    showProcessingDialog();
    convertAndProcessImage(imageFile);
}

function showProcessingDialog() {
    Swal.fire({
        title: "Processing Your Menu",
        html: `
            <div class="text-center">
                <div class="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
                    <i class="fas fa-spinner text-white text-2xl"></i>
                </div>
                <p class="text-gray-600">Let us process your menu...</p>
                <div class="mt-4 space-y-2">
                    <div class="flex items-center justify-center space-x-2 text-sm text-gray-500">
                        <i class="fas fa-eye"></i>
                        <span>Detecting text...</span>
                    </div>
                    <div class="flex items-center justify-center space-x-2 text-sm text-gray-500">
                        <i class="fas fa-list"></i>
                        <span>Extracting menu items...</span>
                    </div>
                    <div class="flex items-center justify-center space-x-2 text-sm text-gray-500">
                        <i class="fas fa-tags"></i>
                        <span>Organizing sections...</span>
                    </div>
                </div>
            </div>
        `,
        allowOutsideClick: false,
        showConfirmButton: false,
        showCancelButton: false
    });
}

async function convertAndProcessImage(imageFile) {
    const reader = new FileReader();
    reader.onload = async function(e) {
        const imageBase64 = e.target.result;
        await callMenuAnalysisAPI(imageBase64);
    };
    reader.readAsDataURL(imageFile);
}

async function callMenuAnalysisAPI(imageBase64) {
    try {
        const response = await fetch('/api/analyze-menu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64 })
        });

        const result = await response.json();

        if (result.success && result.data) {
            handleSuccessfulAnalysis(result.data);
        } else {
            throw new Error(result.message || 'Failed to process image');
        }
    } catch (error) {
        console.error('API Error:', error);
        Swal.close();
        showError("Unable to Process Image", "We cannot process your image. Please try again or add items manually.");
    }
}

function handleSuccessfulAnalysis(sections) {
    Swal.close();
    clearExistingMenu();
    addAIMenuData(sections);
    
    const totalItems = sections.reduce((sum, section) => sum + section.items.length, 0);
    showSuccess("Menu Replaced!", `Successfully replaced your menu with ${totalItems} items from ${sections.length} sections.`);
}

// Menu management functions
function clearExistingMenu() {
    const menuContainer = document.querySelector("#menu-container");
    const existingSections = menuContainer.querySelectorAll("[id^='s']");
    existingSections.forEach(section => section.remove());
    refresh();
}

function addAIMenuData(sections) {
    sections.forEach(section => {
        const id = generateID();
        addSection(id, section.name);
        section.items.forEach(item => addItem(id, item));
    });
}

// Utility functions
function showError(title, text) {
    Swal.fire({
        title,
        text,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#ef4444"
    });
}

function showSuccess(title, text) {
    Swal.fire({
        title,
        text,
        icon: "success",
        confirmButtonText: "Great!",
        confirmButtonColor: "#10b981"
    });
}

// Section management
function addNewSection() {
    Swal.fire({
        title: "Create New Section",
        html: `
            <div class="text-left">
                <label class="block text-sm font-medium text-gray-700 mb-2">Section Name</label>
                <input type="text" id="sectionName" class="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base" placeholder="Enter section name" />
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: "Create Section",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#3b82f6",
        cancelButtonColor: "#ef4444",
        background: "#ffffff",
        color: "#374151",
        width: window.innerWidth < 640 ? "90%" : "400px",
        padding: window.innerWidth < 640 ? "1rem" : "2rem",
        showLoaderOnConfirm: true,
        preConfirm: () => {
            const sectionName = document.getElementById('sectionName').value.trim();
            if (!sectionName) {
                Swal.showValidationMessage('Please enter a section name');
                return false;
            }
            if (sectionName.length < 2) {
                Swal.showValidationMessage('Section name must be at least 2 characters');
                return false;
            }
            return sectionName;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const id = generateID();
            addSection(id, result.value);
        }
    });
}

function deleteSection(id) {
    document.querySelector(`#s${id}`).remove();
    refresh();
}

function deleteItem(id) {
    document.querySelector(`#i${id}`).remove();
}

// DOM manipulation functions
function addSection(id, value) {
    hideEmptyState();
    
    const newSection = document.createElement("div");
    newSection.className = "bg-white border border-gray-200 rounded-lg p-2 sm:p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow w-full cursor-move";
    newSection.id = `s${id}`;
    newSection.innerHTML = createSectionHTML(id, value);
    
    document.querySelector("#menu-container").appendChild(newSection);
    initializeSortables();
    refresh();
}

function addItem(id, value) {
    const inputId = generateID();
    const inputsSection = document.querySelector(`.i${id}`);
    const newItem = document.createElement("div");
    newItem.className = "bg-gray-50 border border-gray-200 rounded-lg p-2 sm:p-3 cursor-move hover:bg-gray-100 transition-colors flex items-center space-x-2 sm:space-x-3 w-full";
    newItem.id = `i${inputId}`;
    newItem.innerHTML = createItemHTML(inputId, value);
    
    inputsSection.appendChild(newItem);
}

function createSectionHTML(id, value) {
    return `
        <div class="flex items-center justify-between mb-2 sm:mb-3">
            <div class="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div class="text-gray-400 cursor-move flex-shrink-0">
                    <i class="fas fa-grip-vertical text-xs sm:text-sm"></i>
                </div>
                <h3 class="text-base sm:text-lg font-semibold text-gray-900 truncate">${value}</h3>
            </div>
            <div class="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                <button class="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer" onclick="deleteSection('${id}')" title="Delete Section">
                    <i class="fas fa-trash text-xs sm:text-sm"></i>
                </button>
                <button class="text-gray-400 hover:text-blue-500 transition-colors p-1 cursor-pointer" onclick="addItem('${id}')" title="Add Item">
                    <i class="fas fa-plus text-xs sm:text-sm"></i>
                </button>
            </div>
        </div>
        <div class="space-y-1 sm:space-y-2 i${id}" id="sortable-list-${id}"></div>
    `;
}

function createItemHTML(inputId, value) {
    const itemName = value?.name || "";
    const itemPrice = value?.price || "";
    const itemDescription = value?.description || "";
    
    return `
        <div class="text-gray-400 cursor-move flex-shrink-0">
            <i class="fas fa-grip-vertical text-xs sm:text-sm"></i>
        </div>
        <div class="flex-1 space-y-1 sm:space-y-2 min-w-0">
            <div class="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                <input type="text" placeholder="Item name" class="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base" value="${itemName}">
                <input type="number" placeholder="Price" class="w-full sm:w-24 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base" value="${itemPrice}">
            </div>
            <input type="text" placeholder="Description" class="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base" value="${itemDescription}">
        </div>
        <button class="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer flex-shrink-0" onclick="deleteItem('${inputId}')">
            <i class="fas fa-trash text-xs sm:text-sm"></i>
        </button>
    `;
}

function hideEmptyState() {
    const emptyState = document.querySelector("#empty-state");
    if (emptyState) {
        emptyState.style.display = "none";
    }
}

// Utility functions
function generateID() {
    return Math.floor(Math.random() * 10000000).toString();
}

function initializeSortables() {
    document.querySelectorAll("[id^='sortable-list-']").forEach((list) => {
        new Sortable(list, {
            animation: 200,
            ghostClass: "bg-blue-200",
            handle: ".cursor-move"
        });
    });
}

function refresh() {
    const container = document.querySelector("#menu-container");
    const emptyState = document.querySelector("#empty-state");
    const sectionsCount = container.childElementCount;
    
    if (emptyState) {
        emptyState.style.display = sectionsCount < 1 ? "block" : "none";
    }
}

// Initialize sortable for sections
new Sortable(document.querySelector("#menu-container"), {
    animation: 200,
    ghostClass: "bg-blue-200",
    handle: ".cursor-move"
});