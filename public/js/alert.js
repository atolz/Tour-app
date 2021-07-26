/*eslint-disable*/
export const closeAlert = () => {
  const alert = document.querySelector('.alert');
  if (alert) {
    document.querySelector('body').removeChild(alert);
  }
};

export const showAlert = (msg, status, time = 7) => {
  // console.log('in showALert--time', time);
  closeAlert();
  const alert = document.createElement('div');
  alert.className = `alert alert--${status}`;
  alert.innerHTML = msg;

  document.querySelector('body').insertAdjacentElement('afterbegin', alert);

  window.setTimeout(() => {
    closeAlert();
  }, time * 1000);
};

export const closeConfirm = () => {
  const confirm = document.querySelector('.confirm');

  if (confirm) {
    document.querySelector('body').removeChild(confirm);
  }
  // if (closeConfirmBox) {
  //   closeConfirmBox.addEventListener('click', () => {
  //     document.querySelector('body').removeChild(confirm);
  //   });
  // }
};

export const showConfirm = (msg) => {
  closeConfirm();
  const confirm = document.createElement('div');
  confirm.className = 'confirm';

  const html = `<div class='confirm__box'> 
  <h2 class='heading-secondary ma-bt-lg'> Confrim Your Action </h2>
  <h4 class='card__sub-heading ma-bt-md'> ${msg}? </h4>
  <div class='confirm__action'>
  <button class='button btn btn--red closeConfirm'>Cancle</button>
  <button class='button btn btn--green proceedConfirm'>Confirm</button>
  </div>
  <div>`;

  confirm.innerHTML = html;
  document.querySelector('body').insertAdjacentElement('afterbegin', confirm);
  // closeConfirm();
};
