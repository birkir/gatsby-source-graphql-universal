"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _react = _interopRequireDefault(require("react"));

var _jsxFileName = "/Users/nathanhorrigan/Code/gatsby-source-wagtail-grapple/src/gatsby-ssr.js";

exports.onRenderBody = ({
  setHeadComponents
}, pluginOptions) => {
  const {
    typeName,
    fieldName,
    url,
    headers
  } = pluginOptions;
  setHeadComponents([_react.default.createElement("script", {
    key: `plugin-wagtail-${typeName}`,
    dangerouslySetInnerHTML: {
      __html: `window.___wagtail = window.___wagtail || {}; window.___wagtail["${fieldName}"] = ${JSON.stringify({
        typeName,
        fieldName,
        url,
        headers
      })}; `
    },
    __source: {
      fileName: _jsxFileName,
      lineNumber: 6
    },
    __self: void 0
  })]);
};