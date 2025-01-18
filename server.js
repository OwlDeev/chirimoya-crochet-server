const express = require("express");
const app = express();
const { resolve } = require("path");
// Replace if using a different env file or config
const env = require("dotenv").config({ path: "./.env" });
const https = require("https");
const fs = require("fs");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-08-01",
});

app.use(express.json()); // Middleware para interpretar JSON

app.use(express.static(process.env.STATIC_DIR));

const cors = require("cors");

app.use(
  cors({
    origin: ["https://www.chirimoyacrochet.com", "https://chirimoyacrochet.com"], // Permitir ambos orígenes    methods: ["GET", "POST", "OPTIONS"], // Métodos permitidos
    credentials: true, // Permitir cookies si es necesario
    allowedHeaders: ["Content-Type", "Authorization"], // Cabeceras permitidas
  })
);

app.get("/", (req, res) => {
  const path = resolve(process.env.STATIC_DIR + "/index.html");
  res.sendFile(path);
});

app.get("/config", (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

app.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body; // Lee el monto enviado desde el frontend
    if (!amount) {
      return res.status(400).send({ error: "Amount is required" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      currency: "EUR",
      amount, // Usa el valor dinámico enviado desde el frontend
      automatic_payment_methods: { enabled: true },
    });

    // Devuelve la clave secreta al cliente
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
});

const httpsOptions = {
  key: fs.readFileSync("/etc/letsencrypt/live/chirimoyacrochet.com/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/chirimoyacrochet.com/fullchain.pem"),
};

const server = https.createServer(httpsOptions, app);

server.listen(5253, "0.0.0.0", () => {
  console.log("HTTPS Server listening at https://localhost:5253");
});