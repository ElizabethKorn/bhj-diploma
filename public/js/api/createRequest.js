/**
 * Основная функция для совершения запросов
 * на сервер.
 * */
const createRequest = (options = {}) => {
  const xhr = new XMLHttpRequest();
  let url = options.url;

  if (options.method === "GET") {
    let urlParams = new URLSearchParams(options.data).toString();
    url += `?${urlParams}`;
  }

  xhr.open(options.method, url);
  xhr.responseType = "json";

  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 400) {
      options.callback(null, xhr.response);
    } else {
      options.callback(new Error(`Request failed with status ${xhr.status}`));
    }
  };

  if (options.method !== "GET") {
    const formData = new FormData();
    for (let key in options.data) {
      if (options.data.hasOwnProperty(key)) {
        formData.append(key, options.data[key]);
      }
    }
    xhr.send(formData);
  } else {
    xhr.send();
  }
};
