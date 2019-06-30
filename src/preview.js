import React from 'react'
import qs from "querystring";
import { cloneDeep, merge } from "lodash";
import { ApolloClient } from "apollo-client";
import { InMemoryCache, IntrospectionFragmentMatcher } from "apollo-cache-inmemory";
import { split } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";
import { throwServerError } from "apollo-link-http-common";
import { print } from "graphql/language/printer"

import { getIsolatedQuery } from './index'
import introspectionQueryResultData from './fragmentTypes.json'


const generatePreviewQuery = (query, contentType, token, fragments, subscribe = false) => {
  // The preview args nessacery for preview backend to find the right model.
  query = cloneDeep(query);
  const previewArgs = [
    {
      kind: "Argument",
      name: {
        kind: "Name",
        value: "contentType"
      },
      value: {
        block: false,
        kind: "StringValue",
        value: contentType
      }
    },
    {
      kind: "Argument",
      name: {
        kind: "Name",
        value: "token"
      },
      value: {
        block: false,
        kind: "StringValue",
        value: token
      }
    }
  ];

  // Rename query for debugging reasons
  console.log(query)
  const queryDef = query.definitions[0];
  queryDef.arguments = []
  queryDef.variableDefinitions = []

  if (queryDef.name) {
    queryDef.name.value = "Preview" + queryDef.name.value;
  } else {
    queryDef.name = {
      kind: "Name",
      value: "PreviewQuery"
    };
  }

  /*
      Iterate over fields on query and add preview args if it's a page.
      We store them as a var because if the query is a subscription we need to remove all
      non-page selections so we override the whole array with just the pages.
    */
  const pageSelections = queryDef.selectionSet.selections.filter(selection => {
    return selection.name.value.toLowerCase() === "page";
  });
  pageSelections.map(selection => (selection.arguments = previewArgs));

  // Change query to subcription of requested
  if (subscribe) {
    queryDef.operation = "subscription";
    queryDef.selectionSet.selections = pageSelections;
  }

  return `    
    ${fragments}
    ${print(query)}
  `;
};

export const decodePreviewUrl = () => {
  if (typeof window !== "undefined") {
    return qs.parse(window.location.search.slice(1));
  }
};

const PreviewProvider = (query, fragments = '', onNext) => {
  // Extract query from wagtail schema
  const isolatedQuery = getIsolatedQuery(query, "wagtail", "wagtail");
  const { content_type, token } = decodePreviewUrl();

  if (content_type && token) {
    const previewSubscription = generatePreviewQuery(
      isolatedQuery,
      content_type,
      token,
      fragments,
      true
    );
    const previewQuery = generatePreviewQuery(
      isolatedQuery,
      content_type,
      token,
      fragments,
      false
    );

    // Create an http link:
    const httpLink = new HttpLink({
      uri: "http://localhost:8000/graphql"
    });

    // Create a WebSocket link:
    const wsLink = new WebSocketLink({
      uri: `ws://localhost:8000/subscriptions`,
      options: {
        reconnect: true
      }
    });

    // using the ability to split links, you can send data to each link
    // depending on what kind of operation is being sent
    const link = split(
      // split based on operation type
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        );
      },
      wsLink,
      httpLink
    );

    // Loading fragments
    const fragmentMatcher = new IntrospectionFragmentMatcher({
      introspectionQueryResultData
    });

    // Create actual client that makes requests
    const cache = new InMemoryCache({ fragmentMatcher });
    const client = new ApolloClient({ link, cache });

    // Get first version of preview to render the template
    client
      .query({ query: getIsolatedQuery(previewQuery) })
      .then(onNext)
      .catch(err => console.log(err));

    // Listen to any changes to update the page
    client
      .subscribe({
        query: getIsolatedQuery(previewSubscription),
        variables: {}
      })
      .subscribe(
        response => onNext(response),
        error => console.log(error),
        complete => console.log(complete)
      );
  }
};

export const withPreview = (WrappedComponent, pageQuery, fragments = '') => {
  // ...and returns another component...
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        wagtail: cloneDeep((props.data) ? props.data.wagtail : {})
      };
      PreviewProvider(pageQuery, fragments, res => {
        this.setState({
          wagtail: merge({}, this.state.wagtail, res.data)
        });
      });
    }

    render() {
      const data = merge({}, this.props.data, this.state);
      if (data.wagtail.page) {
        return <WrappedComponent {...this.props} data={data} />;
      } else {
        return null;
      }
    }
  };
};

export default withPreview