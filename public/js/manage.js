/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alert';

export const update = async (id, data, type) => {
  // console.log([...data], { ...data }, id, type);
  let url = `/api/v1/tours/${id}`;
  let method = type === 'update' ? 'PATCH' : 'DELETE';

  if (type === 'create') {
    method = 'POST';
    url = '/api/v1/tours';
  }
  try {
    const response = await axios({
      method,
      data,
      url,
    });

    console.log(response);

    if (response.data.status === 'success') {
      console.log(response.data);
      showAlert(`Data ${type}ed Successfully`, 'success', 10);
    }
  } catch (error) {
    console.log(error);
    showAlert(
      'Problem updating data. Pls try again and make sure all data is correct.',
      'error',
      15
    );
  }
};
