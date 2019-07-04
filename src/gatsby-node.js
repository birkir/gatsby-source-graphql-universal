const fetch = require('node-fetch');
const fs = require('fs-extra');
const { sourceNodes } = require('./graphql-nodes');
const { getRootQuery } = require('./getRootQuery');

const queryBackend = (query, url) => fetch(`${url}/graphql`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    variables: {},
    query,
  }),
}).then(result => result.json())

exports.sourceNodes = sourceNodes

exports.onCreatePage = ({ page, actions }, options) => {
  const rootQuery = getRootQuery(page.componentPath);
  if (rootQuery) {
    page.context = page.context || {};
    page.context.rootQuery = rootQuery;
    actions.createPage(page);
  }

  queryBackend(`
    {
      __schema {
        types {
          kind
          name
          possibleTypes {
            name
          }
        }
      }
    }
  `, options.url).then(result => {
      // here we're filtering out any type information unrelated to unions or interfaces
      const filteredData = result.data.__schema.types.filter(
        type => type.possibleTypes !== null,
      );
      result.data.__schema.types = filteredData;
      fs.writeFile('./node_modules/gatsby-source-wagtail/fragmentTypes.json', JSON.stringify(result.data), err => {
        if (err) {
          console.error('Error writing fragmentTypes file', err);
        }
      });
    });
};

exports.onCreateWebpackConfig = ({ stage, actions, getConfig }) => {
  const config = getConfig()

  if (stage.indexOf('html') >= 0) {
    return;
  }

  const replaceRule = ruleUse => {
    if (ruleUse.loader && ruleUse.loader.indexOf(`gatsby/dist/utils/babel-loader.js`) >= 0) {
      ruleUse.loader = require.resolve(`gatsby-source-wagtail/babel-loader.js`);
    }
  }

  const traverseRule = rule => {
    if (rule.oneOf && Array.isArray(rule.oneOf)) {
      rule.oneOf.forEach(traverseRule);
    }

    if (rule.use) {
      if (Array.isArray(rule.use)) {
        rule.use.forEach(replaceRule);
      } else {
        replaceRule(rule.use);
      }
    }

  };

  config.module.rules.forEach(traverseRule)

  actions.replaceWebpackConfig(config)
};

exports.onPreExtractQueries = async ({ store, getNodes }) => {
  const program = store.getState().program
  await fs.copy(
    require.resolve(`gatsby-source-wagtail/fragments.js`),
    `${program.directory}/.cache/fragments/gatsby-source-wagtail-fragments.js`
  )
}