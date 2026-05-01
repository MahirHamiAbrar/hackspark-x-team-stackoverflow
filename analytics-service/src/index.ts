import express from "express";

const serviceName = "analytics-service";
const port = Number(process.env.PORT || 8003);

const CENTRAL_API_URL = process.env.CENTRAL_API_URL || ''; 		// || "https://technocracy.brittoo.xyz";
const CENTRAL_API_TOKEN = process.env.CENTRAL_API_TOKEN || "";

const app = express();
app.use(express.json());


async function fetchData(path: string): Promise<any> {
  const res = await fetch(`${CENTRAL_API_URL}${path}`, {
    headers: { Authorization: `Bearer ${CENTRAL_API_TOKEN}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw Object.assign(new Error(body), { status: res.status });
  }
  return res.json();
}


function isValidDateFormat(s: string): boolean {
  return /^\d{4}-\d{2}$/.test(s) && !isNaN(Date.parse(`${s}-01`));
}

function isValidDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));
}

// Months between two YYYY-MM strings, inclusive
function monthRange(from: string, to: string): string[] {
  const months: string[] = [];
  const [fy, fm] = from.split("-").map(Number);
  const [ty, tm] = to.split("-").map(Number);
  let y = fy, m = fm;
  while (y < ty || (y === ty && m <= tm)) {
    months.push(`${y}-${String(m).padStart(2, "0")}`);
    m++;
    if (m > 12) { m = 1; y++; }
  }
  return months;
}

// All calendar days between two YYYY-MM-DD strings, inclusive
function dayRange(fromStr: string, toStr: string): string[] {
  const days: string[] = [];
  const cur = new Date(fromStr + "T00:00:00Z");
  const end = new Date(toStr + "T00:00:00Z");
  while (cur <= end) {
    days.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return days;
}

// First day of a YYYY-MM month
function monthStart(m: string): string { return `${m}-01`; }

// Last day of a YYYY-MM month
function monthEnd(m: string): string {
  const [y, mo] = m.split("-").map(Number);
  const d = new Date(Date.UTC(y, mo, 0)); // day 0 of next month = last day of this month
  return d.toISOString().slice(0, 10);
}

// Total months between two YYYY-MM strings (inclusive count - 1 = diff)
function monthDiff(a: string, b: string): number {
  const [ay, am] = a.split("-").map(Number);
  const [by, bm] = b.split("-").map(Number);
  return (by - ay) * 12 + (bm - am);
}

// Fetch daily rental stats for a range of months
async function fetchDailyStats(months: string[]): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  await Promise.all(
    months.map(async (month) => {
      const data = await fetchData(`/api/data/rentals/stats?group_by=date&month=${month}`);
      for (const item of data.data ?? []) {
        map.set(item.date, (map.get(item.date) || 0) + item.count);
      }
    })
  );
  return map;
}

// P11: GET /analytics/peak-window  (sliding window, O(n))
app.get("/analytics/peak-window", async (req, res) => {
  const { from, to } = req.query as Record<string, string>;

  if (!from || !to || !isValidDateFormat(from) || !isValidDateFormat(to)) {
    return res.status(400).json({ error: "from and to must be valid YYYY-MM strings" });
  }
  if (from > to) {
    return res.status(400).json({ error: "from must not be after to" });
  }
  if (monthDiff(from, to) >= 12) {
    return res.status(400).json({ error: "Max range is 12 months" });
  }

  try {
    const months = monthRange(from, to);
    const statsMap = await fetchDailyStats(months);

    // Build full day array with zeros filled in
    const startDay = monthStart(from);
    const endDay = monthEnd(to);
    const days = dayRange(startDay, endDay);

    if (days.length < 7) {
      return res.status(400).json({ error: "Not enough data for a 7-day window (need at least 7 days in range)" });
    }

    const counts = days.map((d) => statsMap.get(d) ?? 0);

    // Sliding window of size 7 — O(n)
    let windowSum = counts.slice(0, 7).reduce((a, b) => a + b, 0);
    let bestSum = windowSum;
    let bestStart = 0;

    for (let i = 7; i < counts.length; i++) {
      windowSum += counts[i] - counts[i - 7];
      if (windowSum > bestSum) {
        bestSum = windowSum;
        bestStart = i - 6;
      }
    }

    return res.json({
      from,
      to,
      peakWindow: {
        from: days[bestStart],
        to: days[bestStart + 6],
        totalRentals: bestSum,
      },
    });
  } catch (err: any) {
    console.error("P11 error:", err);
    return res.status(err.status || 502).json({ error: err.message });
  }
});

// P13: GET /analytics/surge-days  (monotonic stack — Next Greater Element, O(n))
app.get("/analytics/surge-days", async (req, res) => {
  const { month } = req.query as Record<string, string>;

  if (!month || !isValidDateFormat(month)) {
    return res.status(400).json({ error: "month must be a valid YYYY-MM string" });
  }

  try {
    const statsMap = await fetchDailyStats([month]);

    const days = dayRange(monthStart(month), monthEnd(month));
    // Fill missing dates with 0
    const entries = days.map((d) => ({ date: d, count: statsMap.get(d) ?? 0 }));

    // Next Greater Element using a monotonic stack — O(n), no nested loop
    const nextSurge: (string | null)[] = new Array(entries.length).fill(null);
    const stack: number[] = []; // indices of entries still waiting for their answer

    for (let i = 0; i < entries.length; i++) {
      // While current day is strictly greater than the day at top of stack
      while (stack.length > 0 && entries[i].count > entries[stack[stack.length - 1]].count) {
        const idx = stack.pop()!;
        nextSurge[idx] = entries[i].date;
      }
      stack.push(i);
    }

    const data = entries.map((e, i) => {
      const ns = nextSurge[i];
      let daysUntil: number | null = null;
      if (ns) {
        daysUntil = Math.round(
          (new Date(ns).getTime() - new Date(e.date).getTime()) / 86_400_000
        );
      }
      return { date: e.date, count: e.count, nextSurgeDate: ns, daysUntil };
    });

    return res.json({ month, data });
  } catch (err: any) {
    console.error("P13 error:", err);
    return res.status(err.status || 502).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// P14: GET /analytics/recommendations  (seasonal 15-day window, past 2 years)
// ─────────────────────────────────────────────────────────────────────────────
app.get("/analytics/recommendations", async (req, res) => {
  const { date, limit: limitStr = "10" } = req.query as Record<string, string>;
  const limit = Number(limitStr);

  if (!date || !isValidDate(date)) {
    return res.status(400).json({ error: "date must be a valid YYYY-MM-DD string" });
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    return res.status(400).json({ error: "limit must be a positive integer, max 50" });
  }

  try {
    const center = new Date(date + "T00:00:00Z");
    const year = center.getUTCFullYear();

    // Seasonal window: 7 days before and after — check across past 2 years
    const productCount = new Map<number, number>();

    for (let offset = 1; offset <= 2; offset++) {
      const windowCenter = new Date(center);
      windowCenter.setUTCFullYear(year - offset);

      const windowStart = new Date(windowCenter);
      windowStart.setUTCDate(windowStart.getUTCDate() - 7);
      const windowEnd = new Date(windowCenter);
      windowEnd.setUTCDate(windowEnd.getUTCDate() + 7);

      const startStr = windowStart.toISOString().slice(0, 10);
      const endStr = windowEnd.toISOString().slice(0, 10);

      // Fetch all rentals in this window (paginate)
      let page = 1;
      while (true) {
        const data = await fetchData(
          `/api/data/rentals?from=${startStr}&to=${endStr}&page=${page}&limit=100`
        );
        for (const rental of data.data ?? []) {
          productCount.set(rental.productId, (productCount.get(rental.productId) || 0) + 1);
        }
        if (!data.data || data.data.length < 100) break;
        page++;
      }
    }

    if (productCount.size === 0) {
      return res.json({ date, recommendations: [] });
    }

    // Sort by count descending, take top `limit` product IDs
    const sorted = [...productCount.entries()].sort((a, b) => b[1] - a[1]);
    const topIds = sorted.slice(0, limit).map(([id]) => id);

    // Batch-fetch product details (max 50 per call)
    const batchSize = 50;
    const productMap = new Map<number, { name: string; category: string }>();
    for (let i = 0; i < topIds.length; i += batchSize) {
      const chunk = topIds.slice(i, i + batchSize);
      const batchData = await fetchData(`/api/data/products/batch?ids=${chunk.join(",")}`);
      for (const p of batchData.data ?? []) {
        productMap.set(p.id, { name: p.name, category: p.category });
      }
    }

    const recommendations = topIds
      .filter((id) => productMap.has(id))
      .map((id) => ({
        productId: id,
        name: productMap.get(id)!.name,
        category: productMap.get(id)!.category,
        score: productCount.get(id)!,
      }));

    return res.json({ date, recommendations });
  } catch (err: any) {
    console.error("P14 error:", err);
    return res.status(err.status || 502).json({ error: err.message });
  }
});

// ─── Status ──────────────────────────────────────────────────────────────────
app.get("/status", (_req, res) => {
  res.json({ service: serviceName, status: "OK" });
});

app.use((_req, res) => {
  res.status(404).send("Not Found");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`${serviceName} listening on 0.0.0.0:${port}`);
});
