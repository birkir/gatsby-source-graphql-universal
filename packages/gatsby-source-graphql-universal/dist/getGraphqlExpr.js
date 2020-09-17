"use strict";

module.exports = function getGraphqlExpr(t, queryHash, source) {
  return t.objectExpression([t.objectProperty(t.identifier('id'), t.stringLiteral(queryHash)), t.objectProperty(t.identifier('source'), t.stringLiteral(source)), t.objectMethod('method', t.identifier('toString'), [], t.blockStatement([t.returnStatement(t.memberExpression(t.identifier('this'), t.identifier('id')))]))]);
};