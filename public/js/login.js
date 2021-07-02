/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status == 'success') {
      showAlert('Logged in successfully!!', 'success');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    // console.log('there was an error');
    showAlert(error.response.data.message, 'error');
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    if (res.data.status === 'success') {
      showAlert('Logged out successfully!', 'success');
      window.setTimeout(() => {
        location.reload(true);
      }, 1500);
    }
  } catch (error) {
    showAlert(error.response.data, 'error');
    console.log(error.response.data);
  }
};
