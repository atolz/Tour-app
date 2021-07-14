/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alert';

export const hasSaved = async (tourId, userId) => {
  // console.log(tourId, userId)
  if (tourId === 'null' || userId === 'null') {
    console.log('no user id', userId);
    return false;
  }
  try {
    const res = await axios({
      method: 'GET',
      url: `/api/v1/saved?tour=${tourId}&user=${userId}`,
    });
    console.log(res);
    if (res.data.status === 'success') {
      if (!res.data.data.doc[0]) return false;
      return true;
    }
  } catch (error) {
    showAlert(`${error.response.data.message} `, 'error', 20);
    return false;
  }
};

export const addToSaved = async (tourId, userId) => {
  if (tourId === 'null' || userId === 'null') {
    console.log('no user id', userId);
    return false;
  }
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/v1/tours/${tourId}/saved`,
    });
    console.log(res);
    if (res.data.status === 'success') {
      return true;
    }
  } catch (error) {
    console.log(error.response.data);
    console.log(error.response.data.code);
    console.log(error.response.data.err.code);
    if (error.response.data.err.code === 11000) return true;
    return false;
  }
};
export const removeSaved = async (tourId, userId) => {
  console.log(tourId, userId);
  if (tourId === 'null' || userId === 'null') {
    console.log('no user id', userId);
    return false;
  }
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/tours/${tourId}/saved`,
    });
    console.log(res);
    if (res.data.status === 'success' || res.status === 204) {
      return true;
    }
  } catch (error) {
    showAlert(`${error.response.data.message} `, 'error', 20);
    return false;
  }
};
