import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import Cookies from 'js-cookie';

function CursusPage() {
  const { cursusId } = useParams();
  const { cart, addToCart } = useCart();
  const [cursus, setCursus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [loadingItem, setLoadingItem] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  
  useEffect(() => {
    const fetchCursus = async () => {
      const abortController = new AbortController();
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/cursus/${cursusId}`, {
          signal: abortController.signal,
        });

        setCursus(response.data);

        // Ici, on peut vérifier si l'utilisateur est connecté, mais on ne bloque pas l'accès
        const token = Cookies.get('authToken');
        const userId = Cookies.get('userId');
        if (token && userId) {
          // Si connecté, récupérer les achats
          const purchaseResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/achats/user/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const purchasedCursus = purchaseResponse.data.map(item => item.cursusId);
          if (purchasedCursus.includes(cursusId)) {
            setIsPurchased(true);
          }
        }
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error('Error fetching cursus:', err);
          setError(err.response?.data?.message || 'Erreur lors de la récupération des données.');
        }
      } finally {
        setLoading(false);
      }

      return () => {
        abortController.abort();
      };
    };

    fetchCursus();
  }, [cursusId]);

  const handleAddToCart = (lesson) => {
    setLoadingItem(true);

    const alreadyInCart = cart.some((cartItem) => cartItem.id === lesson.id);
    if (alreadyInCart) {
      setMessage(`${lesson.title} est déjà dans le panier !`);
    } else {
      addToCart(lesson);
      setMessage(`${lesson.title} ajouté au panier !`);
    }

    setLoadingItem(false);
  };

  if (loading) {
    return <div className="text-center">Chargement...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto pt-24">
      <h1 className="text-3xl font-bold mb-4">{cursus.title}</h1>
      <p className="mb-4">{cursus.description}</p>
      {message && <p className="text-green-500">{message}</p>}
      <h2 className="text-2xl mt-4">Leçons disponibles</h2>
      <ul>
        {cursus.lessons.map((lesson) => (
          <li key={lesson.id} className="mb-2">
            <div className="flex justify-between items-center">
              <Link to={`/lessons/${lesson.id}`} className="text-blue-500 hover:underline">
                {lesson.title}
              </Link>
              {!isPurchased ? (
                <button
                  onClick={() => handleAddToCart(lesson)}
                  className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200 ${
                    loadingItem ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={loadingItem}
                >
                  {loadingItem ? 'Chargement...' : 'Ajouter au panier'}
                </button>
              ) : (
                <span className="text-green-500">Déjà acheté</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CursusPage;
