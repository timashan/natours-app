import axios from 'axios';
import { showAlert } from './alert';

export const createSession = async tourId => {
  const stripe = Stripe(
    'pk_test_51L2GmwJki957f6I2IAY9o24UhNCZ9fxtfgyKUhlBLoM8XFCXCDjXWBqEo71t66LpdJWEZnjallmL2lYNFaCQ6DEe004cwgHxm0'
  );
  try {
    const res = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    await stripe.redirectToCheckout({ sessionId: res.data.session.id });
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
