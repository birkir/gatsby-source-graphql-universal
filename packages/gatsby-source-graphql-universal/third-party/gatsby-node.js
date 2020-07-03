"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

// mirror off gatsby-source-graphql
// sigh...
const uuidv4 = require(`uuid/v4`);

const _require = require(`gatsby/graphql`),
      buildSchema = _require.buildSchema,
      printSchema = _require.printSchema;

const _require2 = require(`graphql-tools`),
      wrapSchema = _require2.wrapSchema,
      introspectSchema = _require2.introspectSchema,
      RenameTypes = _require2.RenameTypes;

const _require3 = require(`apollo-link-http`),
      createHttpLink = _require3.createHttpLink;

const nodeFetch = require(`node-fetch`);

const invariant = require(`invariant`);

const _require4 = require(`gatsby-source-graphql/batching/dataloader-link`),
      createDataloaderLink = _require4.createDataloaderLink;

const _require5 = require(`gatsby-source-graphql/transforms`),
      NamespaceUnderFieldTransform = _require5.NamespaceUnderFieldTransform,
      StripNonQueryTransform = _require5.StripNonQueryTransform;

const _require6 = require(`@graphql-tools/links`),
      linkToExecutor = _require6.linkToExecutor;

exports.sourceNodes = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2.default)(function* ({
    actions,
    createNodeId,
    cache,
    createContentDigest
  }, options) {
    const addThirdPartySchema = actions.addThirdPartySchema,
          createNode = actions.createNode;
    const url = options.url,
          typeName = options.typeName,
          fieldName = options.fieldName,
          _options$headers = options.headers,
          headers = _options$headers === void 0 ? {} : _options$headers,
          _options$fetch = options.fetch,
          fetch = _options$fetch === void 0 ? nodeFetch : _options$fetch,
          _options$fetchOptions = options.fetchOptions,
          fetchOptions = _options$fetchOptions === void 0 ? {} : _options$fetchOptions,
          createLink = options.createLink,
          createSchema = options.createSchema,
          refetchInterval = options.refetchInterval,
          _options$batch = options.batch,
          batch = _options$batch === void 0 ? false : _options$batch;
    invariant(typeName && typeName.length > 0, `gatsby-source-graphql requires option \`typeName\` to be specified`);
    invariant(fieldName && fieldName.length > 0, `gatsby-source-graphql requires option \`fieldName\` to be specified`);
    invariant(url && url.length > 0 || createLink, `gatsby-source-graphql requires either option \`url\` or \`createLink\` callback`);
    let link;

    if (createLink) {
      link = yield createLink(options);
    } else {
      const options = {
        uri: url,
        fetch,
        fetchOptions,
        headers: typeof headers === `function` ? yield headers() : headers
      };
      link = batch ? createDataloaderLink(options) : createHttpLink(options);
    }

    let introspectionSchema;

    if (createSchema) {
      introspectionSchema = yield createSchema(options);
    } else {
      const cacheKey = `gatsby-source-graphql-schema-${typeName}-${fieldName}`;
      let sdl = yield cache.get(cacheKey);

      if (!sdl) {
        introspectionSchema = yield introspectSchema(linkToExecutor(link));
        sdl = printSchema(introspectionSchema);
      } else {
        introspectionSchema = buildSchema(sdl);
      }

      yield cache.set(cacheKey, sdl);
    }

    const nodeId = createNodeId(`gatsby-source-graphql-${typeName}`);
    const node = createSchemaNode({
      id: nodeId,
      typeName,
      fieldName,
      createContentDigest
    });
    createNode(node);

    const resolver = (parent, args, context) => {
      context.nodeModel.createPageDependency({
        path: context.path,
        nodeId: nodeId
      });
      return {};
    };

    const schema = wrapSchema({
      schema: introspectionSchema,
      link,
      executor: linkToExecutor(link)
    }, [new StripNonQueryTransform(), new RenameTypes(name => `${typeName}_${name}`), new NamespaceUnderFieldTransform({
      typeName,
      fieldName,
      resolver
    })]);
    addThirdPartySchema({
      schema
    });

    if (process.env.NODE_ENV !== `production`) {
      if (refetchInterval) {
        const msRefetchInterval = refetchInterval * 1000;

        const refetcher = () => {
          createNode(createSchemaNode({
            id: nodeId,
            typeName,
            fieldName,
            createContentDigest
          }));
          setTimeout(refetcher, msRefetchInterval);
        };

        setTimeout(refetcher, msRefetchInterval);
      }
    }
  });

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

function createSchemaNode({
  id,
  typeName,
  fieldName,
  createContentDigest
}) {
  const nodeContent = uuidv4();
  const nodeContentDigest = createContentDigest(nodeContent);
  return {
    id,
    typeName: typeName,
    fieldName: fieldName,
    parent: null,
    children: [],
    internal: {
      type: `GraphQLSource_${typeName}`,
      contentDigest: nodeContentDigest,
      ignoreType: true
    }
  };
}