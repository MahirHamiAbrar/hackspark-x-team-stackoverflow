import { Router } from "express";

export const productRoutes = Router();

// Use mock database url for now, but note where to switch
const TARGET_API_URL = "http://172.20.10.12:4000";
// NOTE FOR PUSH: comment out the above line and uncomment the line below to use the real database
// const TARGET_API_URL = process.env.CENTRAL_API_URL || "https://technocracy.brittoo.xyz";

const CENTRAL_API_TOKEN = process.env.CENTRAL_API_TOKEN;

// Category Cache
let cachedCategories: string[] | null = null;
let categoryFetchPromise: Promise<string[]> | null = null;

async function getValidCategories(): Promise<string[]> {
    if (cachedCategories) return cachedCategories;
    
    if (categoryFetchPromise) return categoryFetchPromise;
    
    categoryFetchPromise = (async () => {
        try {
            const response = await fetch(`${TARGET_API_URL}/api/data/categories`, {
                headers: {
                    'Authorization': `Bearer ${CENTRAL_API_TOKEN}`
                }
            });
            if (!response.ok) {
                console.error("Failed to fetch categories", response.status);
                return [];
            }
            const data = await response.json();
            // Extract categories. Adapt to the actual response structure if needed.
            // Often Central APIs wrap lists in { data: [...] }
            if (data && Array.isArray(data.data)) {
                cachedCategories = data.data;
            } else if (Array.isArray(data)) {
                cachedCategories = data;
            } else {
                cachedCategories = [];
            }
            return cachedCategories;
        } catch (error) {
            console.error("Error fetching categories:", error);
            return [];
        } finally {
            categoryFetchPromise = null;
        }
    })();
    
    return categoryFetchPromise;
}

productRoutes.get("/", async (req, res) => {
    try {
        const category = req.query.category as string;
        
        if (category) {
            const validCategories = await getValidCategories();
            if (validCategories.length > 0 && !validCategories.includes(category)) {
                return res.status(400).json({
                    error: "Invalid category",
                    message: `The category '${category}' is not valid.`,
                    validCategories: validCategories
                });
            }
        }
        
        const url = new URL(`${TARGET_API_URL}/api/data/products`);
        
        // Forward all query parameters
        for (const [key, value] of Object.entries(req.query)) {
            if (typeof value === 'string') {
                url.searchParams.append(key, value);
            } else if (Array.isArray(value)) {
                value.forEach(v => url.searchParams.append(key, String(v)));
            }
        }
        
        const response = await fetch(url.toString(), {
            headers: {
                'Authorization': `Bearer ${CENTRAL_API_TOKEN}`
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            let message = "Central API Error";
            if (response.status === 404) message = "Products not found";
            if (response.status === 429) message = "Too many requests to Central API";
            if (response.status >= 500) message = "Central API Server Error";
            
            return res.status(response.status).json({
                error: message,
                details: errorText,
                status: response.status
            });
        }
        
        const data = await response.json();
        // Return response envelope unchanged (e.g. { data, page, limit, total, totalPages })
        return res.json(data);
    } catch (error) {
        console.error("Error proxying to /rentals/products:", error);
        return res.status(500).json({ error: "Internal Server Error proxying to Central API" });
    }
});

productRoutes.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const url = new URL(`${TARGET_API_URL}/api/data/products/${id}`);
        
        const response = await fetch(url.toString(), {
            headers: {
                'Authorization': `Bearer ${CENTRAL_API_TOKEN}`
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            let message = "Central API Error";
            if (response.status === 404) message = "Product not found";
            if (response.status === 429) message = "Too many requests to Central API";
            if (response.status >= 500) message = "Central API Server Error";
            
            return res.status(response.status).json({
                error: message,
                details: errorText,
                status: response.status
            });
        }
        
        const data = await response.json();
        return res.json(data);
    } catch (error) {
        console.error("Error proxying to /rentals/products/:id:", error);
        return res.status(500).json({ error: "Internal Server Error proxying to Central API" });
    }
});
