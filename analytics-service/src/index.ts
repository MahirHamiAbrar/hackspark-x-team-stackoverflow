import express from "express";

const serviceName = "analytics-service";
const port = Number(process.env.PORT || 8003);

const app = express();

app.get("/status", (_req, res) => {
	res.json({ service: serviceName, status: "OK" });
});

app.use((_req, res) => {
	res.status(404).send("Not Found");
});

app.listen(port, '0.0.0.0', () => {
	console.log(`${serviceName} listening on 0.0.0.0:${port}`);
});
});