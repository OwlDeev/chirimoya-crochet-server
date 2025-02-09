const express = require("express");
const sendEmail = require("./email-service"); // Importa tu servicio de corre
const app = express();
const { resolve } = require("path");
// Replace if using a different env file or config
const env = require("dotenv").config({ path: "./.env" });
// production
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
    origin: 
      // "http://localhost:3000",
      "https://chirimoyacrochet.com",
    //  "http://localhost:3000"],
    credentials: true, // Permitir cookies si es necesario
    allowedHeaders: ["Content-Type", "Authorization"], // Cabeceras permitidas
    methods: ["GET", "POST", "OPTIONS"], // Métodos permitidos
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

app.post("/send-email", async (req, res) => {
  try {
    const { order, userEmail } = req.body;
    console.log("order",order)
    const subject = `Thank you for your purchase`;
    const text = `Hello, your order with ID was successfully created. The total is €.`;
    const html = `
    <h1>Thank you for your purchase</h1>
    <p>Your order with ID <strong>${
      order.id
    }</strong> has been successfully created.</p>
    <p>Total: <strong>${order.total} €</strong></p>
    <h2>Order details:</h2>
    <ul>
      ${order.items
        .map(
          (item) =>
            `<li><strong>${item.quantity}</strong> x ${item.name} - ${item.price} €</li>`
        )
        .join("")}
    </ul>
    <p>Thank you for choosing Chirimoya Crochet.</p>
  `;

    // Llama a la función para enviar el correo
    await sendEmail(userEmail, subject, text, html);
  } catch (error) {
    console.log("Error al enviar el correo: ", error);
  }
});

app.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body; // Lee el monto enviado desde el frontend
    console.log(amount)
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

// production
const httpsOptions = {
  key: fs.readFileSync("/etc/letsencrypt/live/chirimoyacrochet.com/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/chirimoyacrochet.com/fullchain.pem"),
};

// localhost
// const httpsOptions = {
//   key: fs.readFileSync("./chirimoyacrochet.com_ssl/privkey.pem"),
//   cert: fs.readFileSync("./chirimoyacrochet.com_ssl/fullchain.pem"),
// };

// production
const server = https.createServer(httpsOptions, app);

// production
server.listen(5253, "0.0.0.0", () => {
  console.log("HTTPS Server listening at https://localhost:5253");
});

//localhost
// app.listen(5253, "0.0.0.0", () => {
//   console.log("HTTP Server listening at http://localhost:5253");
// });
