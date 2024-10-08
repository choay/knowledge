const { User, Cursus, Lesson, Achat } = require('../models'); // Assurez-vous que User, Cursus et Lesson sont importés
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Fonction pour créer un PaymentIntent
exports.createPaymentIntent = async (req, res) => {
    try {
        console.log('Données reçues pour PaymentIntent:', req.body);
        const { amount, currency } = req.body;

        // Validation des paramètres de la requête
        if (!amount || amount <= 0 || !currency) {
            return res.status(400).json({ error: 'Montant et devise sont requis et doivent être valides.' });
        }

        // Création du PaymentIntent avec Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
        });

        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Erreur lors de la création du PaymentIntent:', error);
        res.status(500).json({ error: error.message || 'Erreur lors de la création du PaymentIntent' });
    }
};

// Fonction pour confirmer le paiement
exports.confirmPayment = async (req, res) => {
    try {
        const { paymentIntentId, userId, cursusId, lessonId, amount } = req.body;

        console.log('Données de confirmation de paiement:', { paymentIntentId, userId, cursusId, lessonId, amount });

        // Validation des utilisateurs et cursus
        const user = await User.findByPk(userId);
        if (!user) {
            console.error('Utilisateur non trouvé:', userId);
            return res.status(400).json({ error: 'ID utilisateur invalide.' });
        }

        const cursus = await Cursus.findByPk(cursusId, {
            include: [{ model: Lesson, as: 'lessons' }],
        });
        if (!cursus) {
            console.error('Cursus non trouvé:', cursusId);
            return res.status(400).json({ error: 'ID cursus invalide.' });
        }

        const lesson = lessonId ? await Lesson.findByPk(lessonId) : null;
        if (lessonId && !lesson) {
            console.error('Leçon non trouvée:', lessonId);
            return res.status(400).json({ error: 'ID leçon invalide.' });
        }

        let achats = [];

        // Vérification du montant payé
        if (!lessonId) {
            // Si aucun lessonId, vérifier le montant du cursus
            if (amount !== cursus.prix * 100) {
                return res.status(400).json({ error: 'Le montant payé ne correspond pas au prix du cursus.' });
            }

            // Créer des achats pour toutes les leçons du cursus
            const lessonAchats = await Promise.all(
                cursus.lessons.map(async (lesson) => {
                    return Achat.create({
                        paymentIntentId,
                        userId,
                        cursusId,
                        lessonId: lesson.id,
                        price: 0,
                    });
                })
            );

            // Créer un achat pour le cursus
            const cursusAchat = await Achat.create({
                paymentIntentId,
                userId,
                cursusId,
                lessonId: null,
                price: amount / 100,
            });

            achats = [cursusAchat, ...lessonAchats];
        } else {
            // Vérifier le montant pour une leçon spécifique
            if (amount !== lesson.prix * 100) {
                return res.status(400).json({ error: 'Le montant payé ne correspond pas au prix de la leçon.' });
            }

            // Créer un achat pour la leçon
            const singleAchat = await Achat.create({
                paymentIntentId,
                userId,
                cursusId,
                lessonId: lessonId,
                price: amount / 100,
            });

            achats.push(singleAchat);
        }

        res.status(201).json(achats);
    } catch (error) {
        console.error('Erreur lors de la confirmation du paiement:', error);
        res.status(500).json({
            error: 'Une erreur est survenue lors de la confirmation du paiement',
            details: error.message || error,
        });
    }
};

// Fonction pour récupérer un achat par son ID
exports.getAchatById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validation de l'ID
        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'ID invalide fourni' });
        }

        // Récupérer l'achat par son ID
        const achat = await Achat.findByPk(id, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'email'],
                },
                {
                    model: Cursus,
                    attributes: ['id', 'title', 'description'],
                },
                {
                    model: Lesson,
                    attributes: ['id', 'title'],
                },
            ],
        });

        // Vérification si l'achat existe
        if (!achat) {
            return res.status(404).json({ error: 'Achat non trouvé' });
        }

        // Renvoyer les détails de l'achat
        res.status(200).json(achat);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'achat:', error.message || error);
        res.status(500).json({
            error: 'Une erreur est survenue lors de la récupération de l\'achat',
            details: error.message || error,
        });
    }
};

// Récupérer tous les achats
exports.getAllAchats = async (req, res) => {
    try {
        const achats = await Achat.findAll({
            include: [
                {
                    model: User,
                    attributes: ['id', 'email'],
                },
                {
                    model: Cursus,
                    attributes: ['id', 'title'],
                },
                {
                    model: Lesson,
                    attributes: ['id', 'title'],
                },
            ],
        });

        res.status(200).json(achats);
    } catch (error) {
        console.error('Erreur lors de la récupération des achats:', error.message || error);
        res.status(500).json({
            error: 'Une erreur est survenue lors de la récupération des achats',
            details: error.message || error,
        });
    }
};

// Récupérer un achat par l'ID de l'utilisateur et l'ID de la leçon
exports.getAchatByLessonAndUser = async (req, res) => {
    try {
        const { userId, lessonId } = req.params;

        // Validation des IDs
        if (!userId || isNaN(userId)) {
            return res.status(400).json({ error: 'ID utilisateur invalide fourni' });
        }
        if (!lessonId || isNaN(lessonId)) {
            return res.status(400).json({ error: 'ID leçon invalide fourni' });
        }

        // Récupérer l'achat correspondant à l'utilisateur et à la leçon
        const achat = await Achat.findOne({
            where: { userId, lessonId },
            include: [
                {
                    model: User,
                    attributes: ['id', 'email'],
                },
                {
                    model: Cursus,
                    attributes: ['id', 'title', 'description'],
                },
                {
                    model: Lesson,
                    attributes: ['id', 'title'],
                },
            ],
        });

        // Vérification si l'achat existe
        if (!achat) {
            return res.status(404).json({ error: 'Achat non trouvé pour cet utilisateur et cette leçon.' });
        }

        // Renvoyer les détails de l'achat
        res.status(200).json(achat);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'achat:', error.message || error);
        res.status(500).json({
            error: 'Une erreur est survenue lors de la récupération de l\'achat',
            details: error.message || error,
        });
    }
};

// Récupérer tous les achats par ID d'utilisateur
exports.getAchatsByUserId = async (req, res) => {
    const { userId } = req.params; // Récupérer l'ID de l'utilisateur

    try {
        const achats = await Achat.findAll({
            where: { userId }, // Filtrer par userId
            include: [
                {
                    model: User,
                    attributes: ['id', 'email'],
                },
                {
                    model: Cursus,
                    attributes: ['id', 'title'],
                },
                {
                    model: Lesson,
                    attributes: ['id', 'title'],
                },
            ],
        });

        // Vérification si des achats existent
        if (!achats || achats.length === 0) {
            return res.status(404).json({ message: 'Aucun achat trouvé pour cet utilisateur.' });
        }

        res.status(200).json(achats);
    } catch (error) {
        console.error('Erreur lors de la récupération des achats:', error.message || error);
        res.status(500).json({ message: 'Erreur lors de la récupération des achats.', details: error.message || error });
    }
};