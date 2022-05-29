import axios from 'axios';
import { showAlert } from './alert';

export const logout = async () => {
  try {
    const data = await axios('/api/v1/users/logout');

    console.log(data);

    if (data.data.status === 'success') {
      window.location.reload(true);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const login = async (email, password) => {
  try {
    const data = await axios('/api/v1/users/login', {
      method: 'POST',
      data: {
        email,
        password,
      },
    });

    if (data.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        window.location.assign('/');
      }, 3000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
