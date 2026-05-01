import express from "express";

const serviceName = "rental-service";
const port = Number(process.env.PORT || 8002);

import { productRoutes } from "./routes/product.routes";

const CENTRAL_API_URL = process.env.CENTRAL_API_URL || "https://technocracy.brittoo.xyz";
const CENTRAL_API_TOKEN = process.env.CENTRAL_API_TOKEN || "";
const TARGET_API_URL = CENTRAL_API_URL;

const app = express();

app.use((req, res, next) => {
    console.log("RECEIVED:", req.method, req.url, req.originalUrl);
    next();
});
app.use(express.json());

// ─── Central API helper ──────────────────────────────────────────────────────
async function centralFetch(path: string): Promise<any> {
  const res = await fetch(`${CENTRAL_API_URL}${path}`, {
    headers: { Authorization: `Bearer ${CENTRAL_API_TOKEN}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw Object.assign(new Error(body), { status: res.status });
  }
  return res.json();
}

// ─── Rental record shape ─────────────────────────────────────────────────────
interface Rental {
  id: number;
  productId: number;
  ownerId: number;
  renterId: number;
  rentalStart: string;
  rentalEnd: string;
  discountPercent: number;
}

// ─── Fetch ALL rentals for a product (paginated) ─────────────────────────────
async function fetchAllRentalsForProduct(productId: number): Promise<Rental[]> {
  const all: Rental[] = [];
  let page = 1;
  while (true) {
    const data = await centralFetch(`/api/data/rentals?product_id=${productId}&page=${page}&limit=100`);
    if (!data.data || data.data.length === 0) break;
    all.push(...data.data);
    if (data.data.length < 100) break;
    page++;
  }
  // The Central API returns already-sorted results (chronological per product)
  all.sort((a, b) => a.rentalStart.localeCompare(b.rentalStart));
  return all;
}

// ─── K-way merge (pair-wise divide and conquer, O(N·K·log K)) ────────────────
// Merges two sorted arrays of rentals by rentalStart
function mergeTwoSorted(a: Rental[], b: Rental[]): Rental[] {
  const result: Rental[] = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i].rentalStart <= b[j].rentalStart) {
      result.push(a[i++]);
    } else {
      result.push(b[j++]);
    }
  }
  while (i < a.length) result.push(a[i++]);
  while (j < b.length) result.push(b[j++]);
  return result;
}

// Merge K sorted lists recursively (divide and conquer)
function mergeKSorted(lists: Rental[][]): Rental[] {
  if (lists.length === 0) return [];
  if (lists.length === 1) return lists[0];
  const mid = Math.floor(lists.length / 2);
  const left = mergeKSorted(lists.slice(0, mid));
  const right = mergeKSorted(lists.slice(mid));
  return mergeTwoSorted(left, right);
}

// ─────────────────────────────────────────────────────────────────────────────
// P12: GET /rentals/merged-feed
// ─────────────────────────────────────────────────────────────────────────────
app.get("/rentals/merged-feed", async (req, res) => {
  const { productIds: productIdsStr, limit: limitStr = "30" } = req.query as Record<string, string>;
  const limit = Number(limitStr);

  // Validate limit
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return res.status(400).json({ error: "limit must be a positive integer, max 100" });
  }

  // Validate productIds
  if (!productIdsStr) {
    return res.status(400).json({ error: "productIds is required" });
  }
  const rawIds = productIdsStr.split(",").map((s) => s.trim());
  if (rawIds.length < 1 || rawIds.length > 10) {
    return res.status(400).json({ error: "productIds must be 1–10 comma-separated integers" });
  }
  if (!rawIds.every((id) => /^\d+$/.test(id))) {
    return res.status(400).json({ error: "productIds must be integers" });
  }

  // Deduplicate
  const productIds = [...new Set(rawIds.map(Number))];

  try {
    // Fetch all rental lists in parallel
    const rentalLists = await Promise.all(
      productIds.map((id) => fetchAllRentalsForProduct(id))
    );

    // K-way merge
    const merged = mergeKSorted(rentalLists);
    const feed = merged.slice(0, limit).map((r) => ({
      rentalId: r.id,
      productId: r.productId,
      rentalStart: r.rentalStart.slice(0, 10),
      rentalEnd: r.rentalEnd.slice(0, 10),
    }));

    return res.json({ productIds, limit, feed });
  } catch (err: any) {
    console.error("P12 error:", err);
    return res.status(err.status || 502).json({ error: err.message });
  }
});

// ─── Status ──────────────────────────────────────────────────────────────────
app.get("/status", (_req, res) => {
  res.json({ service: serviceName, status: "OK" });
});

// Proxy routes
app.use("/products", productRoutes);


// MinHeap for optimized Top K queries
class MinHeap {
    heap: { key: string, count: number }[];
    constructor() { this.heap = []; }
    push(item: { key: string, count: number }) {
        this.heap.push(item);
        this.up(this.heap.length - 1);
    }
    pop() {
        const top = this.heap[0];
        const bottom = this.heap.pop();
        if (this.heap.length > 0 && bottom) {
            this.heap[0] = bottom;
            this.down(0);
        }
        return top;
    }
    up(i: number) {
        while (i > 0) {
            const p = Math.floor((i - 1) / 2);
            if (this.heap[p].count <= this.heap[i].count) break;
            [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
            i = p;
        }
    }
    down(i: number) {
        const l = this.heap.length;
        while (i * 2 + 1 < l) {
            let left = i * 2 + 1, right = i * 2 + 2, smallest = left;
            if (right < l && this.heap[right].count < this.heap[left].count) smallest = right;
            if (this.heap[i].count <= this.heap[smallest].count) break;
            [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
            i = smallest;
        }
    }
    size() { return this.heap.length; }
}

// P8: The Record Day
app.get('/kth-busiest-date', async (req, res) => {
    try {
        const fromStr = req.query.from as string;
        const toStr = req.query.to as string;
        const kStr = req.query.k as string;

        if (!fromStr || !toStr || !/^\d{4}-\d{2}$/.test(fromStr) || !/^\d{4}-\d{2}$/.test(toStr)) {
            return res.status(400).json({ error: "from and to must be valid YYYY-MM strings" });
        }
        
        const k = parseInt(kStr, 10);
        if (isNaN(k) || k <= 0) {
            return res.status(400).json({ error: "k must be a positive integer" });
        }

        const [fYear, fMonth] = fromStr.split('-').map(Number);
        const [tYear, tMonth] = toStr.split('-').map(Number);
        const monthsDiff = (tYear - fYear) * 12 + (tMonth - fMonth);
        
        if (monthsDiff < 0) {
            return res.status(400).json({ error: "from must not be after to" });
        }
        if (monthsDiff > 11) {
            return res.status(400).json({ error: "Max range is 12 months" });
        }

        const fromDate = `${fromStr}-01`;
        const toDateObj = new Date(tYear, tMonth, 0); // last day of 'to' month
        const toDate = `${toStr}-${String(toDateObj.getDate()).padStart(2, '0')}`;

        const url = new URL(`${TARGET_API_URL}/api/data/rentals`);
        const response = await fetch(url.toString(), {
            headers: { 'Authorization': `Bearer ${CENTRAL_API_TOKEN}` }
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: "Failed to fetch rentals" });
        }

        const data = await response.json();
        const rentals = data.data || data || [];

        console.log(`[kth-busiest] Total rentals fetched: ${rentals.length}`);
        if (rentals.length > 0) {
            console.log(`[kth-busiest] Sample rental:`, JSON.stringify(rentals[0]));
            console.log(`[kth-busiest] fromDate=${fromDate}, toDate=${toDate}`);
        }

        const dayCounts = new Map<string, number>();

        for (const r of rentals) {
            if (r.start <= toDate && r.end >= fromDate) {
                const start = r.start < fromDate ? fromDate : r.start;
                const end = r.end > toDate ? toDate : r.end;

                let curr = new Date(start);
                const endDate = new Date(end);

                while (curr <= endDate) {
                    const dStr = curr.toISOString().split('T')[0];
                    dayCounts.set(dStr, (dayCounts.get(dStr) || 0) + 1);
                    curr.setDate(curr.getDate() + 1);
                }
            }
        }

        const entries = Array.from(dayCounts.entries());
        if (k > entries.length) {
            return res.status(404).json({ error: "k exceeds total distinct dates available" });
        }

        // Optimized approach using MinHeap
        const heap = new MinHeap();
        for (const [date, count] of entries) {
            heap.push({ key: date, count });
            if (heap.size() > k) {
                heap.pop();
            }
        }

        // The top of the min-heap (size K) is the Kth largest element
        const kth = heap.pop()!;

        return res.json({
            from: fromStr,
            to: toStr,
            k,
            date: kth.key,
            rentalCount: kth.count
        });

    } catch (err) {
        console.error("Error computing kth busiest date:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// P9: What Does This Renter Love?
app.get('/users/:id/top-categories', async (req, res) => {
    try {
        const userId = req.params.id;
        const kStr = req.query.k as string;
        const k = parseInt(kStr, 10);
        
        if (isNaN(k) || k <= 0) return res.status(400).json({ error: "k must be a positive integer" });

        const response = await fetch(`${TARGET_API_URL}/api/data/rentals`, {
            headers: { 'Authorization': `Bearer ${CENTRAL_API_TOKEN}` }
        });
        
        if (!response.ok) return res.status(response.status).json({ error: "Failed to fetch rentals" });
        const data = await response.json();
        const rentals = data.data || data || [];
        
        const userRentals = rentals.filter((r: any) => String(r.userId) === userId || String(r.renterId) === userId || String(r.ownerId) === userId);
        
        if (userRentals.length === 0) return res.json({ userId: Number(userId), topCategories: [] });

        const productIds = Array.from(new Set(userRentals.map((r: any) => r.productId)));

        const categoryCounts = new Map<string, number>();
        const productsMap = new Map<number, any>();
        
        // Batch fetch products 50 at a time
        for (let i = 0; i < productIds.length; i += 50) {
            const batch = productIds.slice(i, i + 50);
            const batchUrl = `${TARGET_API_URL}/api/data/products/batch?ids=${batch.join(',')}`;
            const pRes = await fetch(batchUrl, { headers: { 'Authorization': `Bearer ${CENTRAL_API_TOKEN}` } });
            if (pRes.ok) {
                const pData = await pRes.json();
                const prods = pData.data || pData || [];
                for (const p of prods) productsMap.set(p.id, p);
            }
        }

        for (const r of userRentals) {
            const prod = productsMap.get(r.productId);
            if (prod && prod.category) {
                categoryCounts.set(prod.category, (categoryCounts.get(prod.category) || 0) + 1);
            }
        }

        // Optimized approach using MinHeap
        const heap = new MinHeap();
        for (const [cat, count] of categoryCounts.entries()) {
            heap.push({ key: cat, count });
            if (heap.size() > k) heap.pop();
        }

        const topCategories = [];
        while (heap.size() > 0) {
            const item = heap.pop()!;
            topCategories.push({ category: item.key, rentalCount: item.count });
        }
        topCategories.reverse(); // highest count first

        return res.json({ userId: Number(userId), topCategories });

    } catch (err) {
        console.error("Error computing top categories:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.use((_req, res) => {
  res.status(404).send("Not Found");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`${serviceName} listening on 0.0.0.0:${port}`);
});
