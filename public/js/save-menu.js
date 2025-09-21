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

    // Validate menu data before sending
    if (menuData.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'No Menu Data',
            text: 'Please add some sections and items before saving.',
            confirmButtonColor: '#7c3aed'
        });
        return;
    }

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

    // Get the current menu ID from the URL
    const currentPath = window.location.pathname;
    const menuId = currentPath.split('/').pop();

    fetch(`/main/${menuId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: jsonData
    })
    .then(res => {
        // Check if response is JSON
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Server returned non-JSON response");
        }
        return res.json();
    })
    .then(data => {
        if (data.status === 200) {
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
        } else {
            throw new Error(data.message || 'Save failed');
        }
    })
    .catch(err => {
        console.error("Error:", err);
        Swal.fire({
            icon: 'error',
            title: 'Save Failed',
            text: err.message || 'There was an error saving your menu. Please try again.',
            confirmButtonColor: '#ef4444'
        });
    });
});
