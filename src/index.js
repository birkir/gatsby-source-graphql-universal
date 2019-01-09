import React from 'react';
import gql from 'graphql-tag';
import ApolloClient from 'apollo-boost';
import traverse from 'traverse';
import cloneDeep from 'lodash.clonedeep';

const options = new Map();

export const getOptions = (name) => {
  if (!options.has(name)) {
    if (typeof window !== 'undefined') {
      setOptions(name, window.___graphqlUniversal[name])
    }
  }

  return options.get(name);
}

export const setOptions = (name, opts) => {
  if (!opts) {
    throw new Error('GraphQL Universal: No options "' + name + '".');
  }
  if (!opts.client && !opts.url) {
    throw new Error('GraphQL Universal: Could not get "url" for "' + name + '".');
  }
  if (!opts.typeName) {
    throw new Error('GraphQL Universal: Could not get "typeName" for "' + name + '".');
  }
  if (!opts.client) {
    opts.client = new ApolloClient({
      uri: opts.url,
      headers: opts.headers,
    });
  }
  options.set(name, opts);
}

export const getIsolatedQuery = (querySource, fieldName, typeName) => {
  let query;
  if (querySource.definitions) {
    query = querySource;
  } else if (typeof querySource === 'string') {
    query = gql(querySource);
  } else if (typeof querySource === 'object' && querySource.source) {
    query = gql(querySource.source);
  } else {
    throw new Error('Could not parse query');
  }

  const updatedQuery = cloneDeep(query);

  const updatedRoot = updatedQuery.definitions[0].selectionSet.selections
  .find(selection => selection.name && selection.name.kind === 'Name' && selection.name.value === fieldName);

  if (!updatedRoot) {
    console.warn('Failed to update query root');
    return;
  }

  updatedQuery.definitions[0].selectionSet.selections = updatedRoot.selectionSet.selections;

  traverse(updatedQuery).forEach(function (x) {
    if (this.isLeaf && this.parent && this.parent.key === 'name') {
      if (this.parent.parent && this.parent.parent.node.kind === 'NamedType') {
        if (typeof x === 'string' && x.indexOf(`${typeName}_`) === 0) {
          this.update(x.substr(typeName.length + 1));
        }
      }
    }
  });

  return updatedQuery;
}

export const withGraphql = WrappedComponent => {
  return class extends React.Component {
    
    state = {
      data: this.props.data,
    }

    graphql = (fieldName, { query, client, composeData = true, ...queryProps }) => {
      // Get options for graphql source plugin
      const options = getOptions(fieldName);

      if (!client && (!options || !options.client)) {
        if (typeof window === 'undefined') {
          console.warn('GraphQL Universal: Options cannot be passed to plugin on server');
        } else {
          console.warn('GraphQL Universal: No options found for plugin "' + fieldName + '"');
        }
        return;
      }

      const { typeName } = options;
      const apolloClient = client || options.client;

      if (query && query.source) {
        const updatedQuery = getIsolatedQuery(query, fieldName, typeName);
        
        const rootValue = (this.state.data && this.state.data[fieldName]) || {};

        const res = apolloClient.query({
          query: updatedQuery,
          fetchPolicy: 'network-only',
          ...queryProps
        });

        if (composeData) {
          res.then(res => {
            this.setState({
              data: {
                ...this.state.data,
                [fieldName]: {
                  ...rootValue,
                  ...res.data,
                },
              },
            });
          });
        }

        return res;

      } else if (query && query.kind && query.kind === 'Document') {
        return client.query({
          query,
          fetchPolicy: 'network-only',
          ...queryProps
        });
      }
    }

    render() {
      return <WrappedComponent
        {...this.props}
        graphql={this.graphql}
        data={this.state.data}
      />;
    }
  };
};