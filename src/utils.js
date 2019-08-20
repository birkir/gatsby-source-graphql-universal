const { prepareOptions } = require(`gatsby/dist/utils/babel-loader-helpers`)

exports.prepareOptions = (babel, options) => {
  const items = prepareOptions(babel, options)
  
  if (items.length > 2) {
    items[3].splice(
      0,
      1,
      babel.createConfigItem([require.resolve('gatsby-source-wagtail/babel-plugin-remove-graphql-queries.js')], {
        type: 'plugin',
      })
    )
  }

  return items
}
