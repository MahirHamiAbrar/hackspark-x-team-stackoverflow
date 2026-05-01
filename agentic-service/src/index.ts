import express from "express";
import { MongoClient, type Db } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const serviceName = "agentic-service";
const port = Number(process.env.PORT || 8004);
const MONGO_URI = process.env.MONGO_URI || "mongodb://mongodb:27017/rentpi_agentic";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const CENTRAL_API_URL = process.env.CENTRAL_API_URL || "https://technocracy.brittoo.xyz";
const CENTRAL_API_TOKEN = process.env.CENTRAL_API_TOKEN || "";
const ANALYTICS_SERVICE_URL = process.env.ANALYTICS_SERVICE_URL || "http://analytics-service:8003";
const RENTAL_SERVICE_URL = process.env.RENTAL_SERVICE_URL || "http://rental-service:8002";

// ── MongoDB Setup ────────────────────────────────────────────────────────────
let db: Db;
const mongoClient = new MongoClient(MONGO_URI);

async function connectMongo() {
  try {
    await mongoClient.connect();
    db = mongoClient.db();
    // Create indexes
    await db.collection("sessions").createIndex({ sessionId: 1 }, { unique: true });
    await db.collection("sessions").createIndex({ lastMessageAt: -1 });
    await db.collection("messages").createIndex({ sessionId: 1, timestamp: 1 });
    console.log("[agentic] MongoDB connected");
  } catch (err) {
    console.error("[agentic] MongoDB connection error:", err);
  }
}

// ── Topic Guard ──────────────────────────────────────────────────────────────
const RENTPI_KEYWORDS = [
  "rental", "rent", "product", "category", "price", "discount",
  "available", "availability", "renter", "owner", "rentpi",
  "booking", "gear", "surge", "peak", "trending", "trend",
  "recommend", "recommendation", "season", "seasonal",
  "electronics", "furniture", "vehicles", "tools", "outdoor",
  "sports", "music", "cameras", "office", "busy", "free",
  "streak", "vacation", "feed", "merged", "categories",
  "rented", "most", "busiest", "top", "window", "rush",
  "hi", "hello", "hey", "help", "what can you do",
  "who are you", "what are you",
];

function isOnTopic(message: string): boolean {
  const lower = message.toLowerCase();
  return RENTPI_KEYWORDS.some(kw => lower.includes(kw));
}

// ── LangChain Tools for Data Grounding ───────────────────────────────────────

const getCategoryStatsTool = tool(
  async () => {
    try {
      const resp = await fetch(`${CENTRAL_API_URL}/api/data/rentals/stats?group_by=category`, {
        headers: { Authorization: `Bearer ${CENTRAL_API_TOKEN}` },
      });
      if (!resp.ok) return JSON.stringify({ error: `API returned ${resp.status}` });
      const data = await resp.json();
      return JSON.stringify(data);
    } catch (e: any) {
      return JSON.stringify({ error: e.message });
    }
  },
  {
    name: "get_category_stats",
    description: "Get rental statistics grouped by category. Returns each category with rental_count and avg_discount. Use this when the user asks about most rented categories, category comparisons, or rental distribution across categories.",
    schema: z.object({}),
  }
);

const getProductAvailabilityTool = tool(
  async ({ productId, from, to }) => {
    try {
      const resp = await fetch(
        `${RENTAL_SERVICE_URL}/rentals/products/${productId}/availability?from=${from}&to=${to}`
      );
      if (!resp.ok) return JSON.stringify({ error: `API returned ${resp.status}` });
      const data = await resp.json();
      return JSON.stringify(data);
    } catch (e: any) {
      return JSON.stringify({ error: e.message });
    }
  },
  {
    name: "get_product_availability",
    description: "Check if a specific product is available during a date range. Returns busy periods and free windows. Use when users ask about product availability.",
    schema: z.object({
      productId: z.number().describe("The product ID to check availability for"),
      from: z.string().describe("Start date in YYYY-MM-DD format"),
      to: z.string().describe("End date in YYYY-MM-DD format"),
    }),
  }
);

const getRecommendationsTool = tool(
  async ({ date, limit }) => {
    try {
      const resp = await fetch(
        `${ANALYTICS_SERVICE_URL}/analytics/recommendations?date=${date}&limit=${limit}`
      );
      if (!resp.ok) return JSON.stringify({ error: `API returned ${resp.status}` });
      const data = await resp.json();
      return JSON.stringify(data);
    } catch (e: any) {
      return JSON.stringify({ error: e.message });
    }
  },
  {
    name: "get_recommendations",
    description: "Get trending/recommended products for a given date based on seasonal patterns. Use when users ask about trending products, what's popular, or recommendations.",
    schema: z.object({
      date: z.string().describe("Date in YYYY-MM-DD format, defaults to today"),
      limit: z.number().default(5).describe("Number of recommendations to return"),
    }),
  }
);

const getPeakWindowTool = tool(
  async ({ from, to }) => {
    try {
      const resp = await fetch(
        `${ANALYTICS_SERVICE_URL}/analytics/peak-window?from=${from}&to=${to}`
      );
      if (!resp.ok) return JSON.stringify({ error: `API returned ${resp.status}` });
      const data = await resp.json();
      return JSON.stringify(data);
    } catch (e: any) {
      return JSON.stringify({ error: e.message });
    }
  },
  {
    name: "get_peak_window",
    description: "Get the peak 7-day rental window for a given date range. Use when users ask about peak periods, busiest times, or rush periods.",
    schema: z.object({
      from: z.string().describe("Start month in YYYY-MM format"),
      to: z.string().describe("End month in YYYY-MM format"),
    }),
  }
);

const getSurgeDaysTool = tool(
  async ({ month }) => {
    try {
      const resp = await fetch(
        `${ANALYTICS_SERVICE_URL}/analytics/surge-days?month=${month}`
      );
      if (!resp.ok) return JSON.stringify({ error: `API returned ${resp.status}` });
      const data = await resp.json();
      return JSON.stringify(data);
    } catch (e: any) {
      return JSON.stringify({ error: e.message });
    }
  },
  {
    name: "get_surge_days",
    description: "Get surge day analysis for a given month. Shows for each day, when the next higher-activity day occurs. Use when users ask about surge pricing, busy days, or activity spikes.",
    schema: z.object({
      month: z.string().describe("Month in YYYY-MM format"),
    }),
  }
);

const getProductDetailsTool = tool(
  async ({ productId }) => {
    try {
      const resp = await fetch(
        `${RENTAL_SERVICE_URL}/rentals/products/${productId}`
      );
      if (!resp.ok) return JSON.stringify({ error: `API returned ${resp.status}` });
      const data = await resp.json();
      return JSON.stringify(data);
    } catch (e: any) {
      return JSON.stringify({ error: e.message });
    }
  },
  {
    name: "get_product_details",
    description: "Get details of a specific product by ID including name, category, and price. Use when users ask about a specific product.",
    schema: z.object({
      productId: z.number().describe("The product ID"),
    }),
  }
);

const getProductListTool = tool(
  async ({ category, page, limit }) => {
    try {
      let url = `${RENTAL_SERVICE_URL}/rentals/products?page=${page}&limit=${limit}`;
      if (category) url += `&category=${category}`;
      const resp = await fetch(url);
      if (!resp.ok) return JSON.stringify({ error: `API returned ${resp.status}` });
      const data = await resp.json();
      return JSON.stringify(data);
    } catch (e: any) {
      return JSON.stringify({ error: e.message });
    }
  },
  {
    name: "get_product_list",
    description: "List products with optional category filter and pagination. Use when users ask about browsing products or product listings.",
    schema: z.object({
      category: z.string().optional().describe("Optional category filter"),
      page: z.number().default(1).describe("Page number"),
      limit: z.number().default(10).describe("Results per page"),
    }),
  }
);

const tools = [
  getCategoryStatsTool,
  getProductAvailabilityTool,
  getRecommendationsTool,
  getPeakWindowTool,
  getSurgeDaysTool,
  getProductDetailsTool,
  getProductListTool,
];

// ── LLM Setup ────────────────────────────────────────────────────────────────

function createLLM() {
  return new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    apiKey: GEMINI_API_KEY,
    temperature: 0.3,
    maxRetries: 2,
  });
}

const SYSTEM_PROMPT = `You are RentPi Assistant, an AI helper for the RentPi rental marketplace platform.
You help users with questions about:
- Product availability and details
- Rental categories and statistics
- Trending/recommended products
- Peak rental periods and surge days
- Discount information
- General RentPi platform questions

IMPORTANT RULES:
1. ONLY answer questions related to RentPi (rentals, products, categories, pricing, availability, users, discounts).
2. Use the provided tools to fetch real data. NEVER invent or guess numbers.
3. If data is unavailable due to service errors, say so explicitly.
4. Be concise and helpful. Present data in a readable format.
5. When showing numbers, use proper formatting (commas for thousands, etc.).
6. Today's date is ${new Date().toISOString().split('T')[0]}.`;

async function generateSessionName(firstMessage: string): Promise<string> {
  try {
    const llm = createLLM();
    const resp = await llm.invoke([
      new HumanMessage(
        `Given this first user message to a rental platform chatbot, reply with ONLY a short 3-5 word title for this conversation. No punctuation. No quotes.\n\nUser message: "${firstMessage}"`
      ),
    ]);
    const name = (typeof resp.content === 'string' ? resp.content : '').trim().slice(0, 50);
    return name || "New Chat";
  } catch {
    return "New Chat";
  }
}

async function processChat(sessionId: string, userMessage: string): Promise<string> {
  // 1) Topic guard
  if (!isOnTopic(userMessage)) {
    return "I'm sorry, I can only help with RentPi-related questions — things like product availability, rental categories, pricing, trends, and discounts. Please ask me something about the RentPi platform!";
  }

  // 2) Load conversation history from MongoDB
  const historyMessages: Array<HumanMessage | AIMessage> = [];
  try {
    const pastMessages = await db
      .collection("messages")
      .find({ sessionId })
      .sort({ timestamp: 1 })
      .toArray();
    for (const msg of pastMessages) {
      if (msg.role === "user") {
        historyMessages.push(new HumanMessage(msg.content));
      } else {
        historyMessages.push(new AIMessage(msg.content));
      }
    }
  } catch (e) {
    console.error("[agentic] Failed to load history:", e);
  }

  // 3) Build messages array
  const messages = [
    new SystemMessage(SYSTEM_PROMPT),
    ...historyMessages,
    new HumanMessage(userMessage),
  ];

  // 4) Invoke LLM with tools
  try {
    const llm = createLLM();
    const llmWithTools = llm.bindTools(tools);

    let response = await llmWithTools.invoke(messages);

    // Process tool calls iteratively
    let iterations = 0;
    const maxIterations = 5;
    while (response.tool_calls && response.tool_calls.length > 0 && iterations < maxIterations) {
      iterations++;
      // Add the AI message with tool calls
      messages.push(response);

      // Execute each tool call
      for (const toolCall of response.tool_calls) {
        const matchedTool = tools.find(t => t.name === toolCall.name);
        if (matchedTool) {
          try {
            const toolResult = await matchedTool.invoke(toolCall.args);
            messages.push({
              role: "tool" as any,
              content: typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult),
              tool_call_id: toolCall.id,
              name: toolCall.name,
            } as any);
          } catch (toolErr: any) {
            messages.push({
              role: "tool" as any,
              content: JSON.stringify({ error: toolErr.message }),
              tool_call_id: toolCall.id,
              name: toolCall.name,
            } as any);
          }
        }
      }

      // Re-invoke LLM with tool results
      response = await llmWithTools.invoke(messages);
    }

    const content = typeof response.content === 'string'
      ? response.content
      : Array.isArray(response.content)
        ? response.content.map((c: any) => typeof c === 'string' ? c : c.text || '').join('')
        : String(response.content);

    return content || "I'm sorry, I couldn't generate a response. Please try again.";
  } catch (e: any) {
    console.error("[agentic] LLM error:", e.message, e.stack?.split('\n').slice(0, 3).join('\n'));
    return "I'm sorry, I encountered an error while processing your question. The AI service may be temporarily unavailable. Please try again in a moment.";
  }
}

// ── Express App ──────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());

// Health check
app.get("/status", (_req, res) => {
  res.json({ service: serviceName, status: "OK" });
});

// ── P15 + P16: POST /chat ────────────────────────────────────────────────────
app.post("/chat", async (req, res) => {
  try {
    const { sessionId: rawSessionId, message } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const sessionId = rawSessionId || uuidv4();
    const now = new Date();

    // Check if session exists
    const existingSession = await db.collection("sessions").findOne({ sessionId });
    const isNewSession = !existingSession;

    // Generate reply
    const reply = await processChat(sessionId, message.trim());

    // Store user message
    await db.collection("messages").insertOne({
      sessionId,
      role: "user",
      content: message.trim(),
      timestamp: now,
    });

    // Store assistant reply
    await db.collection("messages").insertOne({
      sessionId,
      role: "assistant",
      content: reply,
      timestamp: new Date(),
    });

    if (isNewSession) {
      // Generate session name from first message
      const name = await generateSessionName(message.trim());
      await db.collection("sessions").insertOne({
        sessionId,
        name,
        createdAt: now,
        lastMessageAt: new Date(),
      });
    } else {
      // Update lastMessageAt
      await db.collection("sessions").updateOne(
        { sessionId },
        { $set: { lastMessageAt: new Date() } }
      );
    }

    res.json({ sessionId, reply });
  } catch (e: any) {
    console.error("[agentic] POST /chat error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── P16: GET /chat/sessions ──────────────────────────────────────────────────
app.get("/chat/sessions", async (_req, res) => {
  try {
    const sessions = await db
      .collection("sessions")
      .find({})
      .sort({ lastMessageAt: -1 })
      .toArray();

    res.json({
      sessions: sessions.map(s => ({
        sessionId: s.sessionId,
        name: s.name,
        lastMessageAt: s.lastMessageAt,
      })),
    });
  } catch (e: any) {
    console.error("[agentic] GET /chat/sessions error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── P16: GET /chat/:sessionId/history ────────────────────────────────────────
app.get("/chat/:sessionId/history", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await db.collection("sessions").findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const messages = await db
      .collection("messages")
      .find({ sessionId })
      .sort({ timestamp: 1 })
      .toArray();

    res.json({
      sessionId,
      name: session.name,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      })),
    });
  } catch (e: any) {
    console.error("[agentic] GET /chat/:sessionId/history error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── P16: DELETE /chat/:sessionId ─────────────────────────────────────────────
app.delete("/chat/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    await db.collection("sessions").deleteOne({ sessionId });
    await db.collection("messages").deleteMany({ sessionId });

    res.json({ success: true, sessionId });
  } catch (e: any) {
    console.error("[agentic] DELETE /chat/:sessionId error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 404 catch-all
app.use((_req, res) => {
  res.status(404).send("Not Found");
});

// ── Start Server ─────────────────────────────────────────────────────────────
connectMongo().then(() => {
  app.listen(port, "0.0.0.0", () => {
    console.log(`${serviceName} listening on 0.0.0.0:${port}`);
  });
});