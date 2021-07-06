/*eslint-disable*/
import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './map-box';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { showAlert } from './alert';
// console.log('Hello from index.js');

// DOM ELEMENTS
const loginForm = document.querySelector('.form--login');
const mapBox = document.getElementById('map');
const logoutEl = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
const alert = document.querySelector('body').dataset.alert;

if (loginForm) {
  // console.log('in login form');
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  // console.log(locations);
  displayMap(locations);
}

if (logoutEl) {
  logoutEl.addEventListener('click', logout);
}

if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // console.log('target form', e.target.form);
    // console.log('email', e.target.email);
    // console.log('email value', e.target.email.value);
    // console.log('photo', e.target.photo);
    // console.log('photo value', e.target.photo.value);
    // console.log('photo value file//', e.target.photo.files);
    const formData = new FormData();
    formData.append('email', document.getElementById('email').value);
    formData.append('name', document.getElementById('name').value);
    formData.append('photo', document.getElementById('photo').files[0]);
    // console.log(document.getElementById('photo').files[0]);
    // console.log(document.getElementById('photo').files);
    updateSettings(formData, 'Data');
    // const email = document.getElementById('email').value;
    // const name = document.getElementById('name').value;
    // const file = document.getElementById('photo').files[0];
    // updateSettings({ name, email }, 'Data');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    document.querySelector('.btn--save-password').textContent = 'Updating...';
    e.preventDefault();
    const password = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    const update = await updateSettings(
      { password, newPassword, passwordConfirm },
      'Password'
    );
    // console.log('promise update', update);
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
    document.querySelector('.btn--save-password').textContent = 'Save password';
  });
}

if (bookBtn) {
  console.log('in book tour....');
  bookBtn.addEventListener('click', async (e) => {
    const { tourId } = e.target.dataset;
    e.target.textContent = 'Processing...';
    e.target.disabled = true;
    await bookTour(tourId);
    e.target.textContent = 'You have booked this tour.';
    e.target.disabled = false;
  });
}

if (alert) {
  console.log('in alert...', alert);
  console.log(document.querySelector('body').dataset);
  showAlert(alert, 'success', 20);
} else {
  console.log('No alert.....');
}
