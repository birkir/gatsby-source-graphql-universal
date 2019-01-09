import React from 'react';
import { DocumentNode } from 'graphql';
import { ApolloClient, QueryOptions } from 'apollo-boost';

type IsolatedQueryInput = string | { source: string; id: string } | DocumentNode;

interface QueryParameters extends QueryOptions {
  query: IsolatedQueryInput;

  /**
   * Apollo client to use for the query (optional)
   * @override
   */
  client?: ApolloClient<any>;
  
  /**
   * List of additional fragments to include in query (optional)
   * @default []
   */
  fragments: IsolatedQueryInput[]; 

  /**
   * If enabled, the result of the query will automatically
   * merge with last data props.
   * @default true
   */
  composeData: boolean; 
}

export declare type WithGraphQLClient<P> = P & {
  graphql(fieldName, QueryParameters)
};

export function getOptions(name: string): any;
export function setOptions(name: string, options: any): void;
export function getIsolatedQuery(query: IsolatedQueryInput, fieldName: string, typeName: string): DocumentNode
export function withGraphql<TProps, TResult = any>(WrappedComponent: React.ComponentType<WithGraphQLClient<TProps>>): React.ComponentClass<TProps>;
