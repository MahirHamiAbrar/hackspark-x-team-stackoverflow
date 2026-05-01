import express from "express";

const serviceName = "rental-service";
const port = Number(process.env.PORT || 8002);

import { productRoutes } from "./routes/product.routes";

const app = express();

app.use((req, res, next) => {
    console.log("RECEIVED:", req.method, req.url, req.originalUrl);
    next();
});

app.get("/status", (_req, res) => {
	res.json({ service: serviceName, status: "OK" });
});

// Proxy routes
app.use("/products", productRoutes);

app.use((_req, res) => {
	res.status(404).send("Not Found");
});

app.listen(port, '0.0.0.0', () => {
	console.log(`${serviceName} listening on 0.0.0.0:${port}`);
});
