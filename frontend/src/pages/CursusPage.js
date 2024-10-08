import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import Cookies from 'js-cookie';
import {jwtDecode} from 'jwt-decode'; // Correctly import jwtDecode

function CursusPage() {
    const { cursusId } = useParams();
    const { cart, addToCart } = useCart();
    const [cursus, setCursus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const [purchasedLessons, setPurchasedLessons] = useState([]);
    const [completedLessons, setCompletedLessons] = useState([]); // Track completed lessons

    // Fetch the cursus details
    useEffect(() => {
        const fetchCursus = async () => {
            const abortController = new AbortController();
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/cursus/${cursusId}`, {
                    signal: abortController.signal,
                });
                setCursus(response.data);
                setLoading(false);
            } catch (err) {
                if (err.name !== 'CanceledError') {
                    setError('Erreur lors du chargement du cursus');
                    setLoading(false);
                }
            }
            return () => abortController.abort();
        };

        fetchCursus();
    }, [cursusId]);

    // Fetch user's purchased lessons and completed lessons
    useEffect(() => {
        const token = Cookies.get('authToken');
        
        if (token) {
            const fetchUserLessons = async () => {
                try {
                    const decodedToken = jwtDecode(token);
                    const userId = decodedToken?.id || decodedToken?.userId;

                    if (!userId) {
                        console.error('User ID introuvable dans le token.');
                        return;
                    }

                    // Fetch the purchased lessons
                    const purchasesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/achats/user/${userId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setPurchasedLessons(purchasesResponse.data);

                    // Fetch the completed lessons
                    const completedResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/progress/user/${userId}/cursus/${cursusId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setCompletedLessons(completedResponse.data); // Assuming it's an array of completed lesson IDs
                } catch (error) {
                    console.error('Erreur lors de la récupération des leçons:', error);
                }
            };

            fetchUserLessons();
        } else {
            console.error("Aucun token d'authentification trouvé.");
        }
    }, [cursusId]);

    // Handle adding a lesson to the cart
    const handleAddToCart = (lesson) => {
        if (!cart.some(item => item.id === lesson.id)) {
            addToCart(lesson);
            setMessage('Leçon ajoutée au panier!');
        } else {
            setMessage('Cette leçon est déjà dans votre panier.');
        }
    };

    if (loading) return <div>Chargement...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="p-24">
            <h1 className="text-2xl font-bold mb-4">{cursus?.title}</h1>
            <p>{cursus?.description}</p>

            <h2 className="text-xl font-bold mt-4">Leçons</h2>
            {cursus?.lessons?.map((lesson) => {
                // Check if the lesson is purchased or completed by the user
                const isLessonPurchased = purchasedLessons.some(purchased => purchased.lessonId === lesson.id);
                const isLessonCompleted = completedLessons.some(completed => completed.lessonId === lesson.id);

                return (
                    <div key={lesson.id} className="border p-4 mb-4 rounded">
                        <h3 className="text-lg font-semibold">{lesson.title}</h3>
                        <p>{lesson.description}</p>
                        
                        {isLessonCompleted ? (
                            <button disabled className="mt-2 bg-green-500 text-white px-4 py-2 rounded">
                                Leçon complétée
                            </button>
                        ) : isLessonPurchased ? (
                            // If the lesson is purchased, show a link to the lesson
                            <Link to={`/lessons/${lesson.id}`} className="text-blue-500">
                                Voir leçon
                            </Link>
                        ) : (
                            // If not purchased, show the "Add to cart" button
                            <button
                                onClick={() => handleAddToCart(lesson)}
                                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
                            >
                                Ajouter au panier
                            </button>
                        )}
                    </div>
                );
            })}
            {message && <p className="text-green-500">{message}</p>}
        </div>
    );
}

export default CursusPage;
