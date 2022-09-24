class httpError extends Error {
  constructor(message, erroCode) {
    super(message);
    this.code = erroCode;
  }
}

module.exports = httpError;
