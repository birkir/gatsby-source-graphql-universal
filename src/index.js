import React from 'react';
import gql from 'graphql-tag';
import ApolloClient from 'apollo-boost';
import traverse from 'traverse';
import cloneDeep from 'lodash.clonedeep';
import { StaticQuery } from 'gatsby';
import PropTypes from 'prop-types';

// Allow string OR patched queries format
StaticQuery.propTypes.query = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.shape({
    id: PropTypes.string.isRequired,
    source: PropTypes.string.isRequired,
  })
]).isRequired;

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

const getQuery = query => {
  if (typeof query === 'object' && query.definitions) {
    return query;
  } else if (typeof query === 'string') {
    return gql(query);
  } else if (typeof query === 'object' && query.source) {
    return gql(query.source);
  } else {
    throw new Error('Could not parse query: ' + query);
  }
}

export const getIsolatedQuery = (querySource, fieldName, typeName) => {

  const query = getQuery(querySource);
  const updatedQuery = cloneDeep(query);

  const updatedRoot = updatedQuery.definitions[0].selectionSet.selections
  .find(selection => selection.name && selection.name.kind === 'Name' && selection.name.value === fieldName);

  if (updatedRoot) {
    updatedQuery.definitions[0].selectionSet.selections = updatedRoot.selectionSet.selections;
  } else if (fieldName) {
    console.warn('Failed to update query root');
    return;
  }

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

    graphql = (fieldName, { query, client, fragments = [], composeData = true, ...queryProps }) => {
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

      const updatedQuery = getIsolatedQuery(query, fieldName, typeName);
      
      updatedQuery.definitions = updatedQuery.definitions.concat(
        ...fragments.map(fragment => getIsolatedQuery(fragment, null, typeName).definitions)
      );

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