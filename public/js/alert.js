const hideAlert = () => {
  const el = document.querySelector('.alert');
  el.parentElement.removeChild(el);
};

export const showAlert = (type, message, timestamp = 5) => {
  const el = `<div class='alert alert--${type}'>${message}</div>`;
  document.body.insertAdjacentHTML('afterbegin', el);

  window.setTimeout(hideAlert, timestamp * 1000);
};
