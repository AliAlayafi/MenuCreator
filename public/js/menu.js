document.addEventListener("DOMContentLoaded", function () {

    if(data.length){
        // Add sections
        data.forEach(item => {
            const id = generateID();
            addSection(id,item.name);
            item.items.forEach(i => {
                addItem(id,i)
            })
        })

    }

})


// Add event listeners for both buttons
document.querySelector("#add-section")?.addEventListener("click", addNewSection);
document.querySelector("#add-first-section")?.addEventListener("click", addNewSection);

function addNewSection() {
    // Alert get the menu name
    Swal.fire({
        title: "Create New Section",
        html: `
            <div class="text-left">
                <label class="block text-sm font-medium text-gray-700 mb-2">Section Name</label>
                <input type="text" id="sectionName" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Enter section name" />
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: "Create Section",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#7c3aed",
        cancelButtonColor: "#ef4444",
        background: "#ffffff",
        color: "#374151",
        width: "400px",
        padding: "2rem",
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
            // insert the section
            const id = generateID();
            addSection(id, result.value);
        }
    });
}

function deleteSection(id){
    document.querySelector(`#s${id}`).remove();
    refresh();
}
function deleteItem(id){
    document.querySelector(`#i${id}`).remove();
}

function addSection(id,value){
    // Hide empty state if it exists
    const emptyState = document.querySelector("#empty-state");
    if (emptyState) {
        emptyState.style.display = "none";
    }
    
    const newSection = document.createElement("div");
    newSection.className = `bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow`;
    newSection.id = `s${id}`;
    newSection.innerHTML = `
        <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-semibold text-gray-900">${value}</h3>
            <div class="flex items-center space-x-2">
                <button class="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer" onclick="deleteSection('${id}')">
                    <i class="fas fa-trash text-sm"></i>
                </button>
                <button class="text-gray-400 hover:text-purple-500 transition-colors p-1 cursor-pointer" onclick="addItem('${id}')">
                    <i class="fas fa-plus text-sm"></i>
                </button>
            </div>
        </div>
        <div class="space-y-2 i${id}" id="sortable-list-${id}"></div>
    `;
    document.querySelector("#menu-container").appendChild(newSection);
    initializeSortables();  
    refresh();
}
function addItem(id,value) {
    const inputId = generateID();
    const inputsSection = document.querySelector(`.i${id}`);
    const newItem = document.createElement("div");
    newItem.className = "bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-move hover:bg-gray-100 transition-colors flex items-center space-x-3";
    newItem.id = `i${inputId}`;
    newItem.innerHTML = `
        <div class="text-gray-400 cursor-move flex-shrink-0">
            <i class="fas fa-grip-vertical"></i>
        </div>
        <div class="flex-1 space-y-2">
            <div class="flex space-x-2">
                <input type="text" placeholder="Item name" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" value="${value != undefined ? value.name : ""}">
                <input type="number" placeholder="Price" class="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" value="${value != undefined ? value.price : ""}">
            </div>
            <input type="text" placeholder="Description" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" value="${value != undefined ? value.description : ""}">
        </div>
        <button class="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer flex-shrink-0" onclick="deleteItem('${inputId}')">
            <i class="fas fa-trash text-sm"></i>
        </button>
    `;
    inputsSection.appendChild(newItem);
}

function generateID(){
    
    return Math.floor((Math.random() * 10000000)).toString()

}

function initializeSortables() {
    document.querySelectorAll("[id^='sortable-list-']").forEach((list) => {
        new Sortable(list, {
            animation: 200, // Smooth animation
            ghostClass: "bg-blue-200", // Class for dragged item
            handle: ".cursor-move", // Only allow dragging by the item itself
        });
    });
}

function refresh(){
    const container = document.querySelector("#menu-container");
    const emptyState = document.querySelector("#empty-state");
    const sectionsCount = container.childElementCount;
    
    if(sectionsCount < 1){
        // Show empty state
        if (emptyState) {
            emptyState.style.display = "block";
        }
    } else {
        // Hide empty state
        if (emptyState) {
            emptyState.style.display = "none";
        }
    }
}
// Initialize sortable for sections
new Sortable(document.querySelector("#menu-container"), {
    animation: 200, // Smooth animation
    ghostClass: "bg-blue-200", // Class for dragged item
});
refresh();