'use strict';

exports.checkIsDashFormat = (value) =>
    !!value && typeof value === 'string' &&
    value.length > 0 &&
    value.match(/^[a-z][a-z0-9]*(\-[a-z0-9]+)*[a-z0-9]$/i);

exports.testIsDashFormat = (value) =>
    exports.checkIsDashFormat(value) ? value : null;

exports.dashToCamel = (value, replaceChar = '') =>
    value.replace(/(-.)/g, (match) =>
        match.replace('-', replaceChar).toUpperCase()
    );

exports.dashToPascal = (value, replaceChar = '') => {
  const dash = exports.dashToCamel(value, replaceChar);

  return dash[0].toUpperCase() + exports.dashToCamel(dash.slice(1));
}

exports.dashToCap = (value, replaceChar = '') =>
    value[0].toUpperCase() +
    exports.dashToCamel(value.slice(1), replaceChar);

exports.dashToWords = (value) =>
    exports.dashToCap(value, ' ');
