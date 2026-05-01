import express from "express";

const serviceName = "rental-service";
const port = Number(process.env.PORT || 8002);

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