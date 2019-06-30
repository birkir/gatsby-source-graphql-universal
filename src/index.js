import React from 'react';
import gql from 'graphql-tag';
import ApolloClient from 'apollo-boost';
import traverse from 'traverse';
import cloneDeep from 'lodash.clonedeep';
import { StaticQuery } from 'gatsby';
import PropTypes from 'prop-types';
export { withPreview, decodePreviewUrl } from "./preview"

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
      setOptions(name, window.___wagtail[name])
    }
  }

  return options.get(name);
}

export const setOptions = (name, opts) => {
  if (!opts) {
    throw new Error('Wagtail: No options "' + name + '".');
  }
  if (!opts.client && !opts.url) {
    throw new Error('Wagtail: Could not get "url" for "' + name + '".');
  }
  if (!opts.typeName) {
    throw new Error('Wagtail: Could not get "typeName" for "' + name + '".');
  }
  if (!opts.client) {
    opts.client = new ApolloClient({
      uri: opts.url,
      headers: opts.headers,
    });
  }
  options.set(name, opts);
}

export const getQuery = query => {
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