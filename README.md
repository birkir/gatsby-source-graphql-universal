# gatsby-source-wagtail

> NOTE: This is an universal version of the official `gatsby-source-graphql` source plugin. It modifies the babel plugins to skip the removal of graphql queries so they can be re-used.

## How to use

The plugin provides higher order component as well as direct manipulation tools for custom operations

[See TypeScript definitions for more details](/index.d.ts)


### Higher-Order Component

There is a higher order component to wrap components to get access to graphql queries in the browser.

```jsx
import { graphql } from 'gatsby';
import { withGraphql } from 'gatsby-source-wagtail';

export const fooFragment = graphql`
  fragment Planet on ...SWAPI_Planet {
    id
    title
  }
`

export const query = graphql`
  query {
    swapi {
      ...
    }
  }
`;

export const Demo = withGraphql(
  ({ data, graphql }) => {
    const onClick = () => graphql('swapi', {
      query,
      fragments: [fooFragment],
      fetchPolicy: 'network-only',
      variables: { page: 3 }
    });

    return (
      <button onClick={onClick}>Reload</button>
    );
  }
);
```

#### Props

 - **`data`**: Same as data from gatsby, but when `graphql()` (below) is called, it will be overwritten with new data when `composeData` prop is set to true.

 - **`graphql(fieldName, options): Promise`**
   - **`fieldName`**: the same fieldName as provided in gatsby-config.js
   - **`options.query`**: the query variable defined above the component
   - **`options.fragments`**: list of fragments to inject into the query
   - **`options.composeData`**: _(default: true)_  will overwrite component gatsby data with composed data from the browser when true
   - **`...options`** optional parameters to pass to `ApolloClient.query` (sets fetchPolicy to 'network-only' by default)


### getIsolatedQuery

The following code will now result in an object that has the original graphql query source accessible where you are free to do anything with it.

```js
const query = graphql\`...\`;
```

```json
{
  "id": "1234567",
  "source": "{ \"swapi\": { ... } }"
}
```

You can get isolated query to your graphql endpoint by re-using the composing function:

```js
import { graphql } from 'gatsby';
import { getIsolatedQuery } from 'gatsby-source-wagtail';

const query = gatsby`
  query {
    siteMetadata {
      title
    }
    swapi {
      allPersons {
        ... on SWAPI_Person {
          id
        }
      }
    }
  }
`;

const onlySwapi = getIsolatedQuery(query, 'swapi', 'SWAPI');

// Output:
//
// query {
//   allPersons {
//     ... on Person {
//       id
//     }
//   }
// }
```



---

---

### gatsby-source-graphql (previous documentation)

Plugin for connecting arbitrary GraphQL APIs to Gatsby GraphQL. Remote schemas are stitched together by adding a type that wraps the remote schema 
Query type and putting it under field of Gatsby GraphQL Query.

- [Example website](https://using-gatsby-source-graphql.netlify.com/)
- [Example website source](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-gatsby-source-graphql)


## Install

`npm install --save gatsby-source-wagtail`

## How to use

First, you need a way to pass environment variables to the build process, so secrets and other secured data aren't committed to source control. We 
recommend using [`dotenv`][dotenv] which will then expose environment variables. [Read more about dotenv and using environment variables 
here][envvars]. Then we can _use_ these environment variables and configure our plugin.

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    // Simple config, passing URL
    {
      resolve: "gatsby-source-wagtail",
      options: {
        // This type will contain remote schema Query type
        typeName: "SWAPI",
        // This is field under which it's accessible
        fieldName: "swapi",
        // Url to query from
        url: "https://api.graphcms.com/simple/v1/swapi",
      },
    },
    // Passing paramaters (passed to apollo-link)
    {
      resolve: "gatsby-source-wagtail",
      options: {
        typeName: "GitHub",
        fieldName: "github",
        // Url to query from
        url: "https://api.github.com/graphql",
        // HTTP headers
        headers: {
          // Learn about environment variables: https://gatsby.app/env-vars
          Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
        },
        // Additional options to pass to node-fetch
        fetchOptions: {},
      },
    },
    // Creating arbitrary Apollo Link (for advanced situations)
    {
      resolve: "gatsby-source-wagtail",
      options: {
        typeName: "GitHub",
        fieldName: "github",
        // Create Apollo Link manually. Can return a Promise.
        createLink: (pluginOptions) => {
          return createHttpLink({
            uri: 'https://api.github.com/graphql',
            headers: {
              'Authorization': `bearer ${process.env.GITHUB_TOKEN}`,
            },
            fetch,
          })
      },
    },
  ],
}
```

## How to Query

```graphql
{
  # Field name parameter defines how you can access third party api
  swapi {
    allSpecies {
      name
    }
  }
  github {
    viewer {
      email
    }
  }
}
```

## Schema definitions

By default schema is introspected from the remote schema. Schema is cached in `.cache` in this case and refreshing the schema requires deleting the 
cache.

To control schema consumption, you can alternatively construct schema definition by passing `createSchema` callback. This way you could, for 
example, read schema SDL or introspection JSON. When `createSchema` callback is used, schema isn't cached. `createSchema` can return a Promise to 
GraphQLSchema instance or GraphQLSchema instance.

```js
const fs = require("fs")
const { buildSchema, buildClientSchema } = require("graphql")

module.exports = {
  plugins: [
    {
      resolve: "gatsby-source-wagtail",
      options: {
        typeName: "SWAPI",
        fieldName: "swapi",
        url: "https://api.graphcms.com/simple/v1/swapi",

        createSchema: async () => {
          const json = JSON.parse(
            fs.readFileSync(`${__dirname}/introspection.json`)
          )
          return buildClientSchema(json.data)
        },
      },
    },
    {
      resolve: "gatsby-source-wagtail",
      options: {
        typeName: "SWAPI",
        fieldName: "swapi",
        url: "https://api.graphcms.com/simple/v1/swapi",

        createSchema: async () => {
          const sdl = fs.readFileSync(`${__dirname}/schema.sdl`).toString()
          return buildSchema(sdl)
        },
      },
    },
  ],
}
```

# Refetching data

By default, `gatsby-source-wagtail` will only refetch the data once the server is restarted. It's also possible to configure the plugin to 
periodically refetch the data. The option is called `refetchInterval` and specifies the timeout in seconds.

```js
module.exports = {
  plugins: [
    // Simple config, passing URL
    {
      resolve: "gatsby-source-wagtail",
      options: {
        // This type will contain remote schema Query type
        typeName: "SWAPI",
        // This is field under which it's accessible
        fieldName: "swapi",
        // Url to query from
        url: "https://api.graphcms.com/simple/v1/swapi",

        // refetch interval in seconds
        refetchInterval: 60,
      },
    },
  ],
}
```

[dotenv]: https://github.com/motdotla/dotenv
[envvars]: https://gatsby.app/env-vars

