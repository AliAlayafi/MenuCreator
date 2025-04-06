document.querySelector("#save").addEventListener("click", () => {
    const sections = document.querySelectorAll(".collapse");
    let menuData = [];

    sections.forEach((section) => {
        const sectionName = section.querySelector(".collapse-title").innerText.trim();
        const itemsContainer = section.querySelector(".inputs");
        const items = itemsContainer.querySelectorAll(".flex.shadow-md");

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
    fetch("", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: jsonData
    })
    .then(res => res.json())
    .then(data => {
        console.log("Saved:", data)
        location.href = "/main"
    })
    .catch(err => console.error("Error:", err));
});
