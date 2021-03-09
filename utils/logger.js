const info = (...params) => {
  //if condition check added after environments are introduced into the code
  if (process.env.NODE_ENV !== "test") {
    console.log(...params);
  }
};

const error = (...params) => {
  console.error(...params);
};

module.exports = {
  info,
  error,
};
