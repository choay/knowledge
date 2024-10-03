const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');
const { User } = require('../models');
require('dotenv').config();

// Configuration du transporteur de courrier électronique
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: process.env.SMTP_PORT || 1025,
  secure: false,
});

// Fonction d'envoi d'email d'activation
const sendActivationEmail = async (email, activationToken) => {
  const activationLink = `${process.env.API_URL}/api/auth/activate/${activationToken}`;
  await transporter.sendMail({
    from: 'no-reply@example.com',
    to: email,
    subject: 'Activation de votre compte',
    html: `<p>Merci pour votre inscription. Veuillez cliquer sur le lien suivant pour activer votre compte :</p><a href="${activationLink}">Activer mon compte</a>`,
  });
};

// Inscription
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const activationToken = crypto.randomBytes(32).toString('hex');
    const activationExpires = new Date(Date.now() + 3600000); // 1 heure

    const newUser = await User.create({
      email,
      password: hashedPassword,
      activationToken,
      activationExpires,
      isActive: false,
    });

    await sendActivationEmail(email, activationToken);
    res.status(201).json({ message: 'Inscription réussie. Veuillez vérifier votre boîte mail pour activer votre compte.' });
  } catch (error) {
    console.error('Erreur lors de l\'inscription :', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'inscription.' });
  }
};

// Activation du compte
exports.activateAccount = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({
      where: {
        activationToken: token,
        activationExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Le lien d\'activation est invalide ou a expiré' });
    }

    user.activationToken = null;
    user.activationExpires = null;
    user.isActive = true;
    await user.save();

    res.json({ message: 'Votre compte a été activé avec succès!' });
  } catch (error) {
    console.error('Erreur lors de l\'activation :', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'activation.' });
  }
};

// Connexion
// Connexion
exports.login = async (req, res) => {
  console.log("Données reçues:", req.body); // Log pour déboguer

  const { email, password } = req.body;

  // Vérifiez les données reçues
  if (!email || !password) {
    console.error("Email ou mot de passe manquant");
    return res.status(400).json({ message: 'Email et mot de passe requis' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Erreurs de validation:", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log("Utilisateur non trouvé pour l'email:", email);
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier si l'utilisateur est actif
    if (!user.isActive) {
      return res.status(403).json({ message: 'Votre compte n\'est pas activé. Veuillez vérifier votre email pour l\'activation.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log("Mot de passe incorrect pour l'utilisateur:", email);
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // Renvoie le token et l'ID utilisateur dans la réponse
    res.json({ message: 'Connexion réussie', token, userId: user.id });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getCurrentUser = async (req, res) => {
  const userId = req.user.id; // Supposons que vous ayez déjà vérifié et décodé le token

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json({ user: { id: user.id, email: user.email } }); // Renvoie les données de l'utilisateur
  } catch (error) {
    console.error('Erreur lors de la récupération de l’utilisateur :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
// Déconnexion
exports.logout = (req, res) => {
  // Ici, vous pouvez supprimer le cookie contenant le token (si vous l'avez stocké dans les cookies)
  res.clearCookie('token'); // Assurez-vous que le nom du cookie correspond à celui utilisé pour le stockage

  // Répondre avec un message de succès
  res.json({ message: 'Déconnexion réussie' });
};
