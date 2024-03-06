module.exports = function myLoader(source) {
  var value =
    `
  /**
   * just for test
  */

  ${source};
  `
  return value;
}