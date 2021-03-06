/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alert';
// console.log('in stripe');
const stripe = Stripe(
  'pk_test_51J7DyBLL5gBuIClF0GhWIreyaHriKDeZbxqZuI52LF4ZnyhfgbtZXkRIUPwZOLcJAUCz6k8HGKgAUpK1wXre4pp300lssYt9WM'
);
// console.log('in stripe test');

export const bookTour = async (tourId) => {
  try {
    // 1) get checkout session from API/server
    // console.log('b4 api call in stripe');
    const response = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(response.data.checkoutSession.id);
    await stripe.redirectToCheckout({
      sessionId: response.data.checkoutSession.id,
    });
  } catch (error) {
    if (error.response.data.message === 'You have booked this tour already.')
      return showAlert(
        'You have booked this tour already. Pls check your bookings',
        'success'
      );
    showAlert(error, 'error');
  }
};
