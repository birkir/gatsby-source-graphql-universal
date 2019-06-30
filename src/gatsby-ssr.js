import React from 'react';

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  const { typeName, fieldName, url, headers } = pluginOptions;
  setHeadComponents([
    <script
      key={`plugin-wagtail-${typeName}`}
      dangerouslySetInnerHTML={{
        __html: `window.___wagtail = window.___wagtail || {}; window.___wagtail["${fieldName}"] = ${JSON.stringify({ typeName, fieldName, url, headers })}; `
      }}
    />
  ]);
}