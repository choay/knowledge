import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Cookies from 'js-cookie';

function LessonPage() {
    const { lessonId } = useParams();
    const { user } = useAuth(); // Récupération de l'utilisateur depuis le contexte
    const navigate = useNavigate();

    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [completed, setCompleted] = useState(false);
    const [isLoadingComplete, setIsLoadingComplete] = useState(false); // Gestion du chargement du bouton

    // Récupération des données de la leçon
    useEffect(() => {
        const fetchLesson = async () => {
            const token = Cookies.get('authToken');
            if (!token) {
                setError('Le token d\'authentification est manquant.');
                setLoading(false);
                navigate('/login');
                return;
            }

            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/lessons/${lessonId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setLesson(response.data);
                setCompleted(response.data.completed); // Définit l'état de complétion
            } catch (error) {
                setError(error.response?.data?.message || 'Erreur lors de la récupération des données de la leçon.');
            } finally {
                setLoading(false);
            }
        };

        fetchLesson();
    }, [lessonId, navigate]);

    // Récupération de la progression de l'utilisateur
    useEffect(() => {
        const fetchProgress = async () => {
            if (!user || !user.id) return;

            const token = Cookies.get('authToken');
            if (!token) {
                setError('Le token est manquant.');
                return;
            }

            try {
                const progressResponse = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/progress/find/${user.id}/${lessonId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setCompleted(progressResponse.data.progress.completed);
            } catch (error) {
                setError('Erreur lors de la récupération de la progression.');
            }
        };

        fetchProgress();
    }, [lessonId, user]);

    // Gestion de la complétion de la leçon
    const handleCompleteLesson = async () => {
        if (completed || isLoadingComplete) return; // Bloque l'action si la leçon est déjà complétée ou en cours de chargement

        const userId = user?.id || Cookies.get('userId');
        const lessonIdParsed = parseInt(lessonId);

        if (!userId) {
            setError('Veuillez vous connecter pour marquer la leçon comme complétée.');
            return;
        }

        const token = Cookies.get('authToken');
        if (!token) {
            setError('Le token est manquant.');
            return;
        }

        setIsLoadingComplete(true); // Activation du chargement

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/progress/complete`,
                { lessonId: lessonIdParsed, userId: userId },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.status === 201 || response.status === 200) {
                setCompleted(true); // Marque la leçon comme complétée
            } else {
                setError(response.data.message || 'Une erreur inconnue est survenue.');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Erreur lors de la complétion de la leçon.');
        } finally {
            setIsLoadingComplete(false); // Désactivation du chargement
        }
    };

    // Gestion des états de chargement et d'erreur
    if (loading) return <div className="text-center">Chargement...</div>;
    if (error) return <div className="text-red-500 text-center">{error}</div>;
    if (!lesson) return <div className="text-center">Leçon non trouvée</div>;
    if (!user && !Cookies.get('userId')) return <div className="text-center">Veuillez vous connecter pour accéder à cette leçon.</div>;

    return (
        <div className="min-h-screen flex flex-col justify-center bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative pb-9/16">
                    <video className="w-full h-auto" controls>
                        <source src={lesson.videoUrl} type="video/mp4" />
                        Votre navigateur ne prend pas en charge la vidéo.
                    </video>
                </div>
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">{lesson.title}</h2>
                    <p className="mb-4 text-gray-700">{lesson.content || 'Aucun contenu disponible pour cette leçon.'}</p>

                    {/* Bouton de complétion */}
                    <button
                        onClick={handleCompleteLesson}
                        className={`mt-4 px-4 py-2 rounded ${completed || isLoadingComplete ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white transition duration-200`}
                        disabled={completed || isLoadingComplete}
                    >
                        {isLoadingComplete ? 'En cours de complétion...' : completed ? 'Leçon Complétée' : 'Marquer comme Complétée'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LessonPage;
