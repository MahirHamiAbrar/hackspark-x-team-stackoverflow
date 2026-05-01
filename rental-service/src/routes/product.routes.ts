import { Router } from "express";

export const productRoutes = Router();

// Use mock database url for now, but note where to switch
// const TARGET_API_URL = "http://172.20.10.12:4000";
// NOTE FOR PUSH: comment out the above line and uncomment the line below to use the real database
const TARGET_API_URL = process.env.CENTRAL_API_URL || "https://technocracy.brittoo.xyz";

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

// Helper for interval merging
type Interval = { start: string, end: string };
function mergeIntervals(intervals: Interval[]): Interval[] {
    if (intervals.length === 0) return [];
    
    const sorted = [...intervals].sort((a, b) => a.start.localeCompare(b.start));
    const merged = [sorted[0]];
    
    for (let i = 1; i < sorted.length; i++) {
        const current = sorted[i];
        const lastMerged = merged[merged.length - 1];
        
        if (current.start <= lastMerged.end) {
            // Overlapping, take max end
            lastMerged.end = current.end > lastMerged.end ? current.end : lastMerged.end;
        } else {
            merged.push(current);
        }
    }
    
    return merged;
}

// Helper to calculate days between two dates inclusive of start but not end
function getDaysDifference(startStr: string, endStr: string): number {
    const s = new Date(startStr);
    const e = new Date(endStr);
    return Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

function addDays(dateStr: string, days: number): string {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}

// P7: Is It Available?
productRoutes.get("/:id/availability", async (req, res) => {
    try {
        const id = req.params.id;
        const from = req.query.from as string;
        const to = req.query.to as string;

        if (!from || !to) {
            return res.status(400).json({ error: "Missing from or to query parameters" });
        }

        // Fetch rentals for this product
        // Assuming Central API supports GET /api/data/rentals?productId=:id
        const url = new URL(`${TARGET_API_URL}/api/data/rentals`);
        url.searchParams.append('productId', id);

        const response = await fetch(url.toString(), {
            headers: { 'Authorization': `Bearer ${CENTRAL_API_TOKEN}` }
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: "Failed to fetch rentals from Central API" });
        }

        const data = await response.json();
        const rentals = data.data || data || []; // Adjust based on Central API structure
        
        // Filter rentals that overlap with [from, to]
        // overlap condition: rental.start <= to && rental.end >= from
        const overlappingRentals = rentals.filter((r: any) => r.start <= to && r.end >= from);
        
        const intervals: Interval[] = overlappingRentals.map((r: any) => ({
            start: r.start,
            end: r.end
        }));

        const mergedBusy = mergeIntervals(intervals);

        // Find free windows inside [from, to]
        const freeWindows: Interval[] = [];
        let currentStart = from;

        for (const busy of mergedBusy) {
            // if busy period starts after our current start, we have a free window
            if (busy.start > currentStart) {
                // The free window ends the day before the busy period starts
                // Wait, if busy starts at "2024-03-09", the free window is up to "2024-03-08"?
                // The prompt example: busy {"start": "2024-03-09"}, free window {"end": "2024-03-08"}
                const freeEnd = addDays(busy.start, -1);
                if (currentStart <= freeEnd && freeEnd <= to) {
                    freeWindows.push({ start: currentStart, end: freeEnd > to ? to : freeEnd });
                }
            }
            
            // Advance currentStart to the day after the busy period ends
            const nextStart = addDays(busy.end, 1);
            if (nextStart > currentStart) {
                currentStart = nextStart;
            }
        }

        // Check if there's a free window after the last busy period up to `to`
        if (currentStart <= to) {
            freeWindows.push({ start: currentStart, end: to });
        }

        return res.json({
            productId: Number(id),
            from,
            to,
            available: mergedBusy.length === 0 || freeWindows.length > 0 && freeWindows.some(w => w.start <= from && w.end >= to),
            // Wait, the prompt says available: false if there are any conflicts, true if fully free.
            // Actually, available is true only if there are NO busy periods overlapping the EXACT range.
            // Wait, if requested is [from, to], and it is fully free, mergedBusy will be empty (or not overlapping).
            busyPeriods: mergedBusy,
            freeWindows
        });
    } catch (error) {
        console.error("Error checking availability:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// P10: The Long Vacation
productRoutes.get("/:id/free-streak", async (req, res) => {
    try {
        const id = req.params.id;
        const yearStr = req.query.year as string;

        if (!yearStr || !/^\d{4}$/.test(yearStr)) {
            return res.status(400).json({ error: "Valid year query parameter is required" });
        }

        const yearStart = `${yearStr}-01-01`;
        const yearEnd = `${yearStr}-12-31`;

        // Fetch rentals for this product
        const url = new URL(`${TARGET_API_URL}/api/data/rentals`);
        url.searchParams.append('productId', id);

        const response = await fetch(url.toString(), {
            headers: { 'Authorization': `Bearer ${CENTRAL_API_TOKEN}` }
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: "Failed to fetch rentals from Central API" });
        }

        const data = await response.json();
        const rentals = data.data || data || []; 
        
        // Filter rentals that touch the year
        const yearRentals = rentals.filter((r: any) => r.start <= yearEnd && r.end >= yearStart);
        
        // Clamp to the year boundaries
        const intervals: Interval[] = yearRentals.map((r: any) => ({
            start: r.start < yearStart ? yearStart : r.start,
            end: r.end > yearEnd ? yearEnd : r.end
        }));

        const mergedBusy = mergeIntervals(intervals);

        let longestStreakDays = 0;
        let streakFrom = "";
        let streakTo = "";

        let currentStart = yearStart;

        for (const busy of mergedBusy) {
            if (busy.start > currentStart) {
                const freeEnd = addDays(busy.start, -1);
                // gap is inclusive of start and end
                const days = getDaysDifference(currentStart, busy.start); // e.g. 10th to 12th is 2 days gap?
                // Wait, if currentStart=01-01, busy.start=01-05, free ends 01-04. Days = 4.
                // 01-05 minus 01-01 = 4 days. Which perfectly matches inclusive length.
                if (days > longestStreakDays) {
                    longestStreakDays = days;
                    streakFrom = currentStart;
                    streakTo = freeEnd;
                }
            }
            const nextStart = addDays(busy.end, 1);
            if (nextStart > currentStart) {
                currentStart = nextStart;
            }
        }

        if (currentStart <= yearEnd) {
            const days = getDaysDifference(currentStart, addDays(yearEnd, 1)); // up to end of year
            if (days > longestStreakDays) {
                longestStreakDays = days;
                streakFrom = currentStart;
                streakTo = yearEnd;
            }
        }

        // If no rentals at all, the whole year is free
        if (mergedBusy.length === 0) {
            longestStreakDays = getDaysDifference(yearStart, addDays(yearEnd, 1));
            streakFrom = yearStart;
            streakTo = yearEnd;
        }

        return res.json({
            productId: Number(id),
            year: Number(yearStr),
            longestFreeStreak: {
                from: streakFrom,
                to: streakTo,
                days: longestStreakDays
            }
        });
    } catch (error) {
        console.error("Error computing free streak:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
