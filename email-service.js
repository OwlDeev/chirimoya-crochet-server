const nodemailer = require("nodemailer");

// Configura el transportador de Nodemailer con Postmark
const transporter = nodemailer.createTransport({
  host: "smtp.postmarkapp.com", // Host SMTP de Postmark
  port: 587, // Puerto SMTP
  secure: false, // false porque estamos usando STARTTLS
  auth: {
    user: "e71cd423-72c6-4775-96fd-f16ac7099adb", // Reemplaza con tu Server Token de Postmark
    pass: "e71cd423-72c6-4775-96fd-f16ac7099adb", // Usualmente el mismo que el usuario
  },
});

// Función para enviar correos
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: "chirimoyacrochet@humanx.la", // Reemplaza con el correo registrado en Postmark
      to, // Correo del destinatario
      subject, // Asunto del correo
      text, // Versión en texto plano
      html, // Versión HTML (opcional)
    });

    console.log("Correo enviado: ", info.messageId);
    console.log(info)
  } catch (error) {
    console.error("Error al enviar el correo: ", error);
  }
};

module.exports = sendEmail;
