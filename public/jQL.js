// const axios = require('axios').default;

class ElementCollection extends Array {
  ready(cb) {
    const isReady = this.some((e) => {
      return e.readState != null && e.readyState != 'loading';
    });
    if (isReady) {
      cb();
    } else {
      this.on('DOMContentLoaded', cb);
    }
    return this;
  }

  // on(event, cbOrSelector, cb) {
  //   if (typeof cbOrSelector === 'function') {
  //     this.forEach((e) => e.addEventListener(event, cbOrSelector));
  //   } else {
  //     this.forEach((elem) => {
  //       elem.addEventListener(event, (e) => {
  //         if (e.target.matches(cbOrSelector)) cb(e);
  //       });
  //     });
  //   }
  //   return this;
  // }

  on(event, cb) {
    // this[0].addEventListener(event, cb);
    this.forEach((e) => e.addEventListener(event, cb));
  }

  removeClass(className) {
    // this.classList.remove(className);
    this.forEach((e) => e.classList.remove(className));
    return this;
  }

  addClass(className) {
    // this[0].classList.add(className);
    this.forEach((e) => e.classList.add(className));
    return this;
  }

  hasClass(className) {
    return this[0].classList.contains(className);
  }

  containsClass(className) {
    return this[0].classList.contains(className);
  }

  addAttr(attr, val) {
    this.forEach((e) => e.setAttribute(attr, val));
    return this;
  }

  removeAttr(attr) {
    this.forEach((e) => e.removeAttribute(attr));
    return this;
  }

  getAttr(attr) {
    return this[0].getAttribute();
  }

  hasAttr(attr) {
    return this[0].hasAttribute();
  }

  // hide(el) {
  //   el.style.display = 'none';
  //   return this;
  // }

  // show(el) {
  //   el.style.display = 'block';
  //   return this;
  // }

  // css(property, value) {
  //   console.log(`Passed property: ${property}`);
  //   // const camelProp = property.replace(/(-[a-z])/, (g) => {
  //   //   let prop = g.replace('-', '').toUpperCase();
  //   //   console.log(`New property: ${prop}`);
  //   //   return prop;
  //   // });

  //   if (arguments.length < 2) {
  //     // console.log(`Style: ${this.style(camelProp)}`);
  //     console.log(this.style[property]);
  //     return this.style[property];
  //     // console.log(`Style: ${this[0].style[camelProp]}`);
  //     // return this[0].style[camelProp];
  //   } else {
  //     // this.forEach((e) => (e.style[camelProp] = value));
  //     console.log(`New Value: ${value}`);
  //     this.forEach((e) => (e.style[property] = value));
  //   }
  //   return this;
  // }

  innerTxt(text) {
    this[0].innerText = text;
    return this;
  }

  inHtml(text) {
    if (arguments.length < 1) {
      return this[0].innerHTML;
    } else {
      this[0].innerHTML = text;
      return this;
    }
  }

  disabled(value) {
    this.disabled = value;
    return this;
  }

  val(v) {
    if (arguments.length < 1) {
      // console.log(`Get: ${this[0].value}`);
      return this[0].value;
    } else {
      this[0].value = v;
      // console.log(`Set: ${v}`);
      return this[0];
    }
  }

  len() {
    this.forEach((e) => {
      console.log(e.length);
      return e.length;
    });
  }
}

function $(sel) {
  if (typeof sel === 'string' || sel instanceof String) {
    return new ElementCollection(...document.querySelectorAll(sel));
  } else {
    return new ElementCollection(sel);
  }
}

// $.get = function ({ url, data = {}, success = () => {}, dataType }) {
// const queryString = Object.entries(data)
// .map(([key, value]) => {
//   return `${key}=${value}`;
// })
// .join('&');
//   fetch(`${url}?${queryString}`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': dataType,
//     },
//   })
//     .then((res) => {
//       return res.json();
//     })
//     .then((data) => success(data));
// };

// async function getResponse() {}

// $.get = function (url, data = {}) {
//   const queryString = Object.entries(data)
//     .map(([key, value]) => {
//       return `${key}=${value}`;
//     })
//     .join('&');

//   // const res = await getResponse()

//   axios
//     .get(`${url}?${queryString}`)
//     // axios({
//     //   method: 'get',
//     //   url: `${url}?${queryString}`,
//     //   headers: { 'Content-Type': 'application/json' },
//     //   data: {},
//     // })
//     .then((response) => {
//       console.debug(response.data);
//       return response.data;
//     })
//     .catch((error) => {
//       console.error(error.response);
//     });
// };

// $.post = function (url, data = {}) {};
