/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alert';

export const updateSettings = async (data, type) => {
  // console.log(data, type);
  try {
    const url =
      type === 'Password'
        ? '/api/v1/users/updatePassword'
        : '/api/v1/users/updateMe';

    const response = await axios({
      method: 'PATCH',
      url,
      // url: 'http://127.0.0.1:8000/api/v1/users/updateMe', --- giving csp error
      data,
    });

    if (response.data.status === 'success') {
      showAlert(`${type} updated successfully!`, 'success');
      return 'response primise.....';
    }
  } catch (error) {
    // console.log('There was an error💥💥💥', error)
    // console.log(error.response);
    if(error.response){
      return showAlert(error.response.data.message, 'error');
    }
    showAlert('An error occured!😕. Pls check your internet!', 'error');

  }
};
