const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// Fonction pour formater la date
const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
  return date.toLocaleDateString('fr-FR', options);
};

router.post("/", (req, res) => {
  const { name, email, subject, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "gartabdou@gmail.com",
      pass: "fjclrycqqprbhflo", // Utiliser 'pass' au lieu de 'password'
    },
  });

  const mail_configs = {
    from: `"${email}" <gartabdou@gmail.com>`, // Afficher l'email de l'utilisateur comme nom
    replyTo: email, // L'adresse email saisie par l'utilisateur
    to: "gartabdou@gmail.com",
    subject: subject,
    html: `
        <p>Vous avez reçu un nouveau message de la part de <strong>${name}</strong> depuis le formulaire de contact de votre application:</p>
        <p><strong>Email :</strong> ${email} <p>
        <p><strong>Date d'envoi :</strong> ${formatDate(new Date())}</p>
        <br>
        <p><strong>Message :</strong></p>
        <p>${message}</p>
        <br>
        <p>Cordialement,</p>
        <p>Votre équipe</p>
    `,
  };

  transporter.sendMail(mail_configs, function (error, info) {
    if (error) {
      console.log(error);
      return res.status(500).json({ message: "An error has occurred" });
    }
    return res.status(200).json({ message: "Email sent successfully" });
  });
});

module.exports = router;