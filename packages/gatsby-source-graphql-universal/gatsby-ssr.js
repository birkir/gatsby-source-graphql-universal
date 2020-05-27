"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _react = _interopRequireDefault(require("react"));

exports.onRenderBody = ({
  setHeadComponents
}, pluginOptions) => {
  const typeName = pluginOptions.typeName,
        fieldName = pluginOptions.fieldName,
        url = pluginOptions.url,
        headers = pluginOptions.headers;
  setHeadComponents([_react.default.createElement("script", {
    key: `plugin-graphql-universal-${typeName}`,
    dangerouslySetInnerHTML: {
      __html: `window.___graphqlUniversal = window.___graphqlUniversal || {}; window.___graphqlUniversal["${fieldName}"] = ${JSON.stringify({
        typeName,
        fieldName,
        url,
        headers
      })}; `
    }
  })]);
};