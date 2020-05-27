import React from 'react';

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  const { typeName, fieldName, url, headers } = pluginOptions;
  setHeadComponents([
    <script
      key={`plugin-graphql-universal-${typeName}`}
      dangerouslySetInnerHTML={{
        __html: `window.___graphqlUniversal = window.___graphqlUniversal || {}; window.___graphqlUniversal["${fieldName}"] = ${JSON.stringify({ typeName, fieldName, url, headers })}; `
      }}
    />
  ]);
}