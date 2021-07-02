/*eslint-disable*/
export const closeAlert = () => {
  const alert = document.querySelector('.alert');
  if (alert) {
    document.querySelector('body').removeChild(alert);
  }
};

export const showAlert = (msg, status) => {
  closeAlert();
  const alert = document.createElement('div');
  alert.className = `alert alert--${status}`;
  alert.innerHTML = msg;

  document.querySelector('body').insertAdjacentElement('afterbegin', alert);

  window.setTimeout(() => {
    closeAlert();
  }, 5000);
};
