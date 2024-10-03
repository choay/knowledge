const { Progress } = require('../models'); // Importer le modèle Progress

// Function to mark a lesson as complete
const markLessonComplete = async (req, res) => {
    console.log('Données reçues :', req.body); // Log des données reçues

    const { userId, lessonId } = req.body;

    // Vérification des paramètres
    if (!userId || !lessonId) {
        return res.status(400).json({ message: 'userId et lessonId sont requis.' });
    }

    try {
        // Vérifier si ce progrès existe déjà pour cet utilisateur et cette leçon
        let progress = await Progress.findOne({ where: { userId, lessonId } });

        if (progress) {
            // Si le progrès existe déjà, on le met à jour comme complété
            progress.completed = true;
            await progress.save();
            return res.status(200).json({ message: 'Leçon déjà marquée comme complétée.', progress });
        } else {
            // Sinon, on crée un nouveau progrès
            progress = await Progress.create({
                userId,
                lessonId,
                completed: true,
            });

            return res.status(201).json({ message: 'Progression ajoutée avec succès.', progress });
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la progression:', error);
        return res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
};

// Function to get progress for a specific user and lesson
const getProgress = async (req, res) => {
    const { userId, lessonId } = req.params; // Get userId and lessonId from route parameters

    // Vérification des paramètres
    if (!userId || !lessonId) {
        return res.status(400).json({ message: 'userId et lessonId sont requis.' });
    }

    try {
        // Vérifier si le progrès existe pour cet utilisateur et cette leçon
        const progress = await Progress.findOne({ where: { userId, lessonId } });

        if (progress) {
            // Si le progrès existe, on renvoie l'état de complétion
            return res.status(200).json({ completed: progress.completed });
        } else {
            // Si aucun progrès trouvé, indiquer que la leçon n'est pas complétée
            return res.status(404).json({ message: 'Leçon non complétée pour cet utilisateur.' });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération de la progression:', error);
        return res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
};

// Function to find progress by user ID and lesson ID
const findProgressByUserAndLesson = async (req, res) => {
    const { userId, lessonId } = req.params; // Get userId and lessonId from route parameters

    // Vérification des paramètres
    if (!userId || !lessonId) {
        return res.status(400).json({ message: 'userId et lessonId sont requis.' });
    }

    try {
        // Vérifier si le progrès existe pour cet utilisateur et cette leçon
        const progress = await Progress.findOne({ where: { userId, lessonId } });

        if (progress) {
            // Si le progrès existe, on renvoie les détails de la progression
            return res.status(200).json({ message: 'Progression trouvée.', progress });
        } else {
            // Si aucun progrès trouvé, renvoyer un message approprié
            return res.status(404).json({ message: 'Aucun progrès trouvé pour cet utilisateur et cette leçon.' });
        }
    } catch (error) {
        console.error('Erreur lors de la recherche de la progression:', error);
        return res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
};

module.exports = { markLessonComplete, getProgress, findProgressByUserAndLesson };
