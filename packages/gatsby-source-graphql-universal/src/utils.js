const { prepareOptions } = require(`gatsby/dist/utils/babel-loader-helpers`)

exports.prepareOptions = (babel, options = {}, resolve = require.resolve) => {
  const items = prepareOptions(babel, options, resolve)

  if (items.length > 2) {
    items[3].splice(
      0,
      1,
      babel.createConfigItem([require.resolve('@prismicio/gatsby-source-graphql-universal/babel-plugin-remove-graphql-queries.js')], {
        type: 'plugin',
      })
    )
  }

  return items
}