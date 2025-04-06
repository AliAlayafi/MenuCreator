function validateMenu(menu) {
    if (!Array.isArray(menu)) return false; // Menu must be an array

    for (const section of menu) {
        if (typeof section !== "object" || Array.isArray(section)) return false;

        // Required fields in section
        const sectionKeys = ["name", "items"];
        if (!sectionKeys.every(key => key in section)) return false;
        if (typeof section.name !== "string") return false; // Name must be a string
        if (!Array.isArray(section.items)) return false; // Items must be an array

        for (const item of section.items) {
            if (typeof item !== "object" || Array.isArray(item)) return false;

            // Allowed keys in item
            const allowedItemKeys = ["name", "price", "description"];
            const itemKeys = Object.keys(item);

            if (!itemKeys.every(key => allowedItemKeys.includes(key))) {
                return false; // Extra fields detected!
            }

            // Required fields in item
            if (typeof item.name !== "string") return false; // Name must be a string
            if (typeof item.description !== "string") return false; // Description must be a string
            if (typeof item.price !== "number" || item.price < 0) return false; // Price must be a number (≥0)
        }
    }

    return true; // ✅ JSON is valid!
}


module.exports = { validateMenu }