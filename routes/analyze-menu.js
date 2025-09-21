const express = require('express');
const router = express.Router();
const { validateMenu } = require('../public/js/validate-menu');

// Configuration
const OPENROUTER_CONFIG = {
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'openai/gpt-4o-mini',
    maxTokens: 2000,
    temperature: 0.1
};

// POST /api/analyze-menu - Analyze menu photo and return structured data
router.post('/api/analyze-menu', async (req, res) => {
    try {
        const { imageBase64 } = req.body;

        // Validate input
        const validationError = validateImageInput(imageBase64);
        if (validationError) {
            return res.status(400).json(validationError);
        }

        console.log('Processing menu image...');
        
        const menuData = await processMenuWithOpenRouter(imageBase64);
        
        res.status(200).json({
            success: true,
            data: menuData,
            message: 'Menu analyzed successfully'
        });

    } catch (error) {
        console.error('Error processing menu image:', error);
        res.status(500).json({ 
            success: false,
            error: 'Unable to process your image',
            message: 'We cannot process your image. Please try again or add items manually.'
        });
    }
});

// Input validation
function validateImageInput(imageBase64) {
    if (!imageBase64) {
        return { 
            error: 'Image data is required',
            message: 'Please provide a base64 encoded image'
        };
    }

    if (!imageBase64.startsWith('data:image/')) {
        return { 
            error: 'Invalid image format',
            message: 'Image must be in base64 format with data URL prefix'
        };
    }

    return null;
}

// Process menu with OpenRouter AI
async function processMenuWithOpenRouter(imageBase64) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
        throw new Error('OpenRouter API key not configured');
    }

    const prompt = createMenuExtractionPrompt();
    const requestBody = createOpenRouterRequest(imageBase64, prompt);
    
    const response = await fetch(OPENROUTER_CONFIG.apiUrl, {
        method: 'POST',
        headers: createOpenRouterHeaders(apiKey),
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const content = extractResponseContent(data);
    const menuData = parseMenuData(content);
    const cleanedData = cleanMenuData(menuData);

    if (!validateMenu(cleanedData)) {
        throw new Error('Generated menu data does not pass validation');
    }

    console.log(`Successfully processed menu with ${cleanedData.length} sections`);
    return cleanedData;
}

// Create the AI prompt for menu extraction
function createMenuExtractionPrompt() {
    return `Analyze this menu image and extract all menu items, sections, and prices. Return the data in the following JSON format:

[
  {
    "name": "Section Name",
    "items": [
      {
        "name": "Item Name",
        "price": 12.99,
        "description": "Item description if available"
      }
    ]
  }
]

Rules:
1. Return an ARRAY of sections (not an object with sections property)
2. Identify all menu sections (Appetizers, Main Courses, Desserts, etc.)
3. Extract all items within each section
4. Price must be a NUMBER (remove $ symbol, convert to decimal)
5. Add descriptions if available (use empty string if none)
6. If no clear sections exist, create logical groupings
7. Return only valid JSON, no additional text
8. If an item has no price, use 0
9. Be thorough and accurate in extraction`;
}

// Create OpenRouter API request body
function createOpenRouterRequest(imageBase64, prompt) {
    return {
        model: OPENROUTER_CONFIG.model,
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: prompt },
                    { type: "image_url", image_url: { url: imageBase64 } }
                ]
            }
        ],
        max_tokens: OPENROUTER_CONFIG.maxTokens,
        temperature: OPENROUTER_CONFIG.temperature
    };
}

// Create OpenRouter API headers
function createOpenRouterHeaders(apiKey) {
    return {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'MenuCreator App'
    };
}

// Extract content from OpenRouter response
function extractResponseContent(data) {
    if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response from OpenRouter API');
    }
    return data.choices[0].message.content;
}

// Parse menu data from AI response
function parseMenuData(content) {
    try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('No JSON array found in response');
        }
        
        const menuData = JSON.parse(jsonMatch[0]);
        
        if (!Array.isArray(menuData)) {
            throw new Error('Invalid menu data structure received - expected array');
        }
        
        return menuData;
    } catch (parseError) {
        console.error('Failed to parse JSON response:', content);
        throw new Error('Failed to parse menu data from AI response');
    }
}

// Clean and normalize menu data
function cleanMenuData(menuData) {
    return menuData.map(section => ({
        name: section.name || 'Untitled Section',
        items: (section.items || []).map(item => ({
            name: item.name || 'Untitled Item',
            price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0,
            description: item.description || ''
        }))
    }));
}

module.exports = router;
