import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import Cookies from 'js-cookie';

function Theme() {
    const { themeId } = useParams(); // Récupère l'ID du thème depuis les paramètres de l'URL

    const { cart, addToCart } = useCart(); // Gestion du panier via le contexte
    const [cursus, setCursus] = useState([]); // État pour stocker les cursus
    const [loading, setLoading] = useState(true); // Indicateur de chargement
    const [error, setError] = useState(null); // Gestion des erreurs
    const [message, setMessage] = useState(''); // Message utilisateur
    const [themeTitle, setThemeTitle] = useState(''); // Titre du thème
    const navigate = useNavigate(); // Hook de navigation pour rediriger

    // Vérification de l'ID du thème
    useEffect(() => {
        console.log('themeId:', themeId); // Vérifie la valeur de themeId
    }, [themeId]);

    const handleFetchError = useCallback((err) => {
        let errorMessage = 'Erreur lors de la récupération des données.';
        if (err.response) {
            errorMessage = err.response.data?.message || `Erreur: ${err.response.status}`;
        } else if (err.request) {
            errorMessage = 'Aucune réponse du serveur.';
        } else {
            errorMessage = err.message || 'Erreur lors de la configuration de la requête.';
        }

        console.error('Erreur lors de la récupération des données :', errorMessage);
        setError(errorMessage);
    }, []);

    const fetchTheme = useCallback(async () => {
    if (!themeId) {
        setError('Identifiant de thème manquant.');
        setLoading(false);
        return;
    }

    const apiUrl = process.env.REACT_APP_API_URL;
    console.log('API URL:', apiUrl); // Vérifiez que l'URL est bien définie
    const url = `${apiUrl}/api/themes/${themeId}`;

    console.log('Fetching URL:', url); // Vérifiez l'URL finale

    try {
        const response = await axios.get(url);
        console.log('Réponse API:', response.data);

        if (response.data) {
            setCursus(response.data.Cursus || []);
            setThemeTitle(response.data.title || '');
        } else {
            throw new Error('Format de données invalide reçu');
        }
    } catch (err) {
        handleFetchError(err);
    } finally {
        setLoading(false);
    }
}, [themeId, handleFetchError]);


    useEffect(() => {
        fetchTheme(); // Appel à l'API lors du montage du composant
    }, [fetchTheme]);

    const handleAddToCart = (cursusItem) => {
        const token = Cookies.get('authToken'); // Vérifie si l'utilisateur est connecté

        if (!token) {
            setMessage('Veuillez vous connecter pour ajouter des éléments au panier.');
            setTimeout(() => setMessage(''), 5000); // Message temporaire
            navigate('/login');
            return;
        }

        // Vérifie si le cursus est déjà dans le panier
        const alreadyInCart = cart.some(cartItem => cartItem.id === cursusItem.id);
        if (alreadyInCart) {
            setMessage(`${cursusItem.title} est déjà dans le panier !`);
        } else {
            const itemToAdd = {
                id: cursusItem.id,
                title: cursusItem.title,
                prix: cursusItem.prix,
                cursusId: themeId,  // Associer le cursus au thème
                lessonId: null,     // Pas de leçon spécifique à ce niveau
            };

            addToCart(itemToAdd); // Ajoute l'élément au panier
            setMessage(`${cursusItem.title} a été ajouté au panier !`);
        }

        setTimeout(() => {
            setMessage(''); // Réinitialise le message après 5 secondes
        }, 5000);
    };

    if (loading) return <div>Chargement...</div>; // Affiche un indicateur de chargement

    if (error) {
        return (
            <div className="text-red-500">
                {error}
                <Link to="/">
                    <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                        Retour à l'accueil
                    </button>
                </Link>
            </div>
        );
    }

    if (!cursus.length) return <div>Aucun cursus trouvé pour ce thème.</div>; // Affiche un message si aucun cursus

    return (
        <div className="min-h-screen pt-24 pl-12">
            {message && <p className="text-green-500">{message}</p>}
            <h1 className="text-3xl font-bold mb-4">Liste des Cursus pour le thème : {themeTitle}</h1>
            <ul>
                {cursus.map((cursusItem) => (
                    <li key={cursusItem.id} className="mb-4">
                        <h3 className="text-xl font-semibold">{cursusItem.title}</h3>
                        <p>Prix : {cursusItem.prix} €</p>
                        <button
                            onClick={() => handleAddToCart(cursusItem)}
                            className={`mt-2 px-4 py-2 ${cart.some(cartItem => cartItem.id === cursusItem.id) ? 'bg-gray-300' : 'bg-blue-500'} text-white rounded mr-4`}
                            disabled={cart.some(cartItem => cartItem.id === cursusItem.id)}
                        >
                            {cart.some(cartItem => cartItem.id === cursusItem.id) ? 'Déjà dans le panier' : 'Ajouter au panier'}
                        </button>
                        <Link to={`/cursus/${cursusItem.id}`}>
                            <button className="mt-2 px-4 py-2 bg-gray-500 text-white rounded">
                                Voir le Cursus
                            </button>
                        </Link>
                        {cursusItem.lessons && cursusItem.lessons.length > 0 ? (
                            <div>
                                {cursusItem.lessons.map((lesson) => (
                                    <Link key={lesson.id} to={`/lessons/${lesson.id}`}>
                                        <button className="mt-2 px-4 py-2 bg-gray-300 text-white rounded">
                                            Voir {lesson.title}
                                        </button>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p>Aucune leçon disponible pour ce cursus.</p>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Theme;
