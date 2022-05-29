import { login, logout } from './login';
import { updateData } from './updateData';
import { createMap } from './mapbox';
import { createSession } from './stripe';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

const formLogin = document.querySelector('.form--login');
const formUser = document.querySelector('.form-user-data');
const formPassword = document.querySelector('.form-user-password');
const logoutBtn = document.querySelector('.nav__el--logout');
const mapBox = document.getElementById('map');
const ctaBtn = document.querySelector('.cta__btn');

if (formLogin)
  formLogin.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (logoutBtn) logoutBtn.addEventListener('click', logout);

if (formUser)
  formUser.addEventListener('submit', e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', document.getElementById('name').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('photo', document.getElementById('photo').files[0]);
    updateData('user', formData);
  });

if (formPassword)
  formPassword.addEventListener('submit', e => {
    e.preventDefault();
    const passwordCurrent = document.getElementById('passwordCurrent').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    updateData('password', { passwordCurrent, password, passwordConfirm });
  });

if (mapBox) createMap(JSON.parse(mapBox.dataset.locations));

if (ctaBtn)
  ctaBtn.addEventListener(
    'click',
    createSession.bind(null, ctaBtn.dataset.tourId)
  );
