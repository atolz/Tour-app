/*eslint-disable*/
export const closeAlert = () => {
  const alert = document.querySelector('.alert');
  if (alert) {
    document.querySelector('body').removeChild(alert);
  }
};

export const showAlert = (msg, status, time = 7) => {
  console.log('in showALert--time', time);
  closeAlert();
  const alert = document.createElement('div');
  alert.className = `alert alert--${status}`;
  alert.innerHTML = msg;

  document.querySelector('body').insertAdjacentElement('afterbegin', alert);

  window.setTimeout(() => {
    closeAlert();
  }, time * 1000);
};
