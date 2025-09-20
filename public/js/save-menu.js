document.querySelector("#save").addEventListener("click", () => {
    const sections = document.querySelectorAll("#menu-container > div[id^='s']");
    let menuData = [];

    sections.forEach((section) => {
        const sectionName = section.querySelector("h3").innerText.trim();
        const itemsContainer = section.querySelector(`[class*="i${section.id.substring(1)}"]`);
        const items = itemsContainer.querySelectorAll("[id^='i']");

        let sectionData = {
            name: sectionName,
            items: []
        };

        items.forEach((item) => {
            const inputs = item.querySelectorAll("input");
            let itemData = {
                name: inputs[0].value.trim(),  // Item name
                price: parseFloat(inputs[1].value) || 0, // Price
                description: inputs[2].value.trim()  // Description
            };
            sectionData.items.push(itemData);
        });

        menuData.push(sectionData);
    });

    const jsonData = JSON.stringify(menuData, null, 2);
    
    // Show loading state
    Swal.fire({
        title: 'Saving...',
        text: 'Please wait while we save your menu',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    fetch("", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: jsonData
    })
    .then(res => res.json())
    .then(data => {
        Swal.fire({
            icon: 'success',
            title: 'Menu Saved!',
            text: 'Your menu has been saved successfully',
            confirmButtonColor: '#7c3aed',
            timer: 2000,
            showConfirmButton: false
        }).then(() => {
            location.href = "/main";
        });
    })
    .catch(err => {
        console.error("Error:", err);
        Swal.fire({
            icon: 'error',
            title: 'Save Failed',
            text: 'There was an error saving your menu. Please try again.',
            confirmButtonColor: '#ef4444'
        });
    });
});
