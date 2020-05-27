"use strict";

const fs = require('fs');

const get = require('lodash.get');

const _require = require('gatsby/dist/utils/babel-parse-to-ast'),
      babelParseToAst = _require.babelParseToAst;

const getRootQuery = componentPath => {
  try {
    const content = fs.readFileSync(componentPath, 'utf-8');
    const ast = babelParseToAst(content, componentPath);
    const exported = get(ast, 'program.body', []).filter(n => n.type === 'ExportNamedDeclaration');
    const exportedQuery = exported.find(exp => get(exp, 'declaration.declarations.0.id.name') === 'query');

    if (exportedQuery) {
      const query = get(exportedQuery, 'declaration.declarations.0.init.quasi.quasis.0.value.raw');

      if (query) {
        return query;
      }
    }
  } catch (err) {
    console.error('gatsby-source-graphql-universal: Could not parse component path: ', componentPath);
    console.error(err);
  }

  return null;
};

exports.getRootQuery = getRootQuery;