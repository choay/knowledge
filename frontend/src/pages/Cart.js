import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

function Cart() {
    const { cart, clearCart } = useCart();
    const [total, setTotal] = useState(0);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const userId = Cookies.get('userId');

    useEffect(() => {
        if (!userId) {
            navigate('/login');
        }
    }, [userId, navigate]);

    useEffect(() => {
        const calculatedTotal = cart.reduce((acc, item) => acc + item.prix, 0);
        setTotal(calculatedTotal);
    }, [cart]);

    const handlePayment = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        if (cart.length === 0) {
            setError("Votre panier est vide.");
            setLoading(false);
            return;
        }

        const cursusId = cart[0]?.cursusId;
        const lessonId = cart[0]?.id;

        if (!userId || !cursusId || !email || !stripe || !elements || !elements.getElement(CardElement)) {
            setError("Tous les champs sont requis.");
            setLoading(false);
            return;
        }

        const token = Cookies.get('authToken');
        if (!token) {
            setError("Le jeton d'authentification est manquant.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/achats/create-payment-intent`, {
                amount: total * 100,
                currency: 'eur',
                email: email,
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const { clientSecret } = response.data;

            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: { email },
                },
            });

            if (stripeError) {
                setError(`Erreur de paiement: ${stripeError.message}`);
            } else if (paymentIntent.status === 'succeeded') {
                try {
                    const purchaseResponse = await axios.post(`${process.env.REACT_APP_API_URL}/api/achats/confirm-payment`, {
                        paymentIntentId: paymentIntent.id,
                        userId,
                        cursusId,
                        lessonId: lessonId || null,
                        amount: total * 100,
                    }, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    console.log('Réponse de l\'API de confirmation de paiement :', purchaseResponse.data);
                    setSuccess(true);
                    clearCart();
                } catch (confirmationError) {
                    console.error('Erreur lors de la confirmation de l\'achat:', confirmationError.response?.data || confirmationError);
                    setError('Une erreur est survenue lors de la confirmation du paiement. Veuillez réessayer.');
                }
            }
        } catch (err) {
            console.error('Erreur lors de la demande de paiement:', err.response ? err.response.data : err);
            setError('Le paiement a échoué. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    if (!userId) {
        return <div className="flex justify-center items-center min-h-screen bg-gray-50">Veuillez vous connecter pour accéder à votre panier.</div>;
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-6 bg-gray-100 rounded-lg shadow-md">
                <h1 className="text-xl font-bold mb-4 text-center">Votre Panier</h1>
                <div className="mb-4">
                    <ul className="divide-y divide-gray-300">
                        {cart.map(item => (
                            <li key={item.id} className="flex justify-between py-2">
                                <span>{item.title}</span> <span>{item.prix} €</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <p className="text-lg font-semibold text-right">Total: {total.toFixed(2)} €</p>

                <form onSubmit={handlePayment} className="mt-6">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full p-2 border border-gray-300 rounded mt-2 mb-4"
                    />
                    <CardElement className="p-2 border border-gray-300 rounded mb-4" />
                    <button
                        type="submit"
                        className={`w-full py-2 text-white font-semibold rounded ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
                        disabled={loading}
                    >
                        {loading ? 'Traitement en cours...' : 'Payer'}
                    </button>
                    {error && <div className="text-red-500 mt-4">{error}</div>}
                    {success && <div className="text-green-500 mt-4">Paiement réussi ! Merci pour votre achat.</div>}
                </form>
            </div>
        </div>
    );
}

export default Cart;
