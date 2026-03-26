const isNotNumber = (input) => !Number.isInteger(parseInt(input));

const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

module.exports.isNotNumber = isNotNumber;
module.exports.capitalizeFirstLetter = capitalizeFirstLetter;
