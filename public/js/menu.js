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


document.querySelector("#add-section")
.addEventListener("click", () => {

    // Alert get the menu name
    Swal.fire({
        title: "Section name",
        input: "text",
        showCancelButton: true,
        confirmButtonText: "Create",
        }).then((result) => {
        if (result.isConfirmed) {
            // insert the section
            const id = generateID();
            addSection(id,result.value)
        }
        });


})

function deleteSection(id){
    document.querySelector(`#s${id}`).remove();
    refresh();
}
function deleteItem(id){
    document.querySelector(`#i${id}`).remove();
}

function addSection(id,value){
            const newSection = document.createElement("div");
            newSection.className = `collapse collapse-arrow bg-base-100 border border-base-300 w-4/5 mb-3`;
            newSection.id = `s${id}`;
            newSection.innerHTML = `
                <input type="radio" name="my-accordion-2"/>
                <div class="collapse-title font-semibold">${value}</div>
                <div class="collapse-content text-sm">
                    <div class="w-full flex justify-end gap-1 mb-4">
                        <button class="btn btn-soft btn-error" onclick="deleteSection('${id}')">Delete</button>

                        <button class="btn btn-success" onclick="addItem('${id}')">Add</button>
                    </div>
                    <div class="inputs flex flex-col items-center i${id}" id="sortable-list"></div>
                </div>
            `
            document.querySelector(".container").appendChild(newSection);
            initializeSortables();  
            refresh();
}
function addItem(id,value) {
    const inputId = generateID();
    const inputsSection = document.querySelector(`.i${id}`);
    const newItem = document.createElement("div");
    newItem.className = "flex shadow-md p-2 rounded-sm cursor-move w-4/5 gap-1";
    newItem.id = `i${inputId}`;
    newItem.innerHTML = `
        <div class="left w-4/5 h-full">
                <div class="top join w-full gap-1">
                    <input type="text" placeholder="Item name" class="input w-1/2 focus:outline-none join-item" value="${value != undefined ? value.name : ""}">
                    <input type="number" placeholder="Price" class="input w-1/2 focus:outline-none join-item" value="${value != undefined ? value.price : ""}">
                </div>
                <div class="bottom w-full pt-1">
                    <input type="text" placeholder="Description" class="input focus:outline-none w-full" value="${value != undefined ? value.description : ""}" >
                </div>
        </div>
        <div class="right w-1/5 flex-grow">
            <button class="btn btn-soft btn-error delete-btn h-full w-full" onclick="deleteItem('${inputId}')">Delete</button>
        </div>
    `;
    inputsSection.appendChild(newItem);
}

function generateID(){
    
    return Math.floor((Math.random() * 10000000)).toString()

}

function initializeSortables() {
    document.querySelectorAll("#sortable-list").forEach((list) => {
        new Sortable(list, {
            animation: 200, // Smooth animation
            ghostClass: "bg-blue-200", // Class for dragged item
        });
    });
}

function refresh(){


    const container = document.querySelector(".container");
    const sectionsCount = container.childElementCount;
    if(sectionsCount < 1){
        // add No Sextions yet
        container.innerHTML = `<h5 class="text-lg font-regular mt-20 text-pretty">No Sections yet.</h5>`
    }else{
        const h5 = document.querySelector(".container h5");
        if(h5){
            h5.remove();
        }
    }


}
new Sortable(document.querySelector(".container"), {
    animation: 200, // Smooth animation
    ghostClass: "bg-blue-200", // Class for dragged item
});
refresh();