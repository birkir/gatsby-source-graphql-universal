#!/bin/sh

mkdir -p ./tmp

# git clone --depth 1 https://github.com/gatsbyjs/gatsby.git ./tmp/gatsby

cd ./tmp/gatsby; git pull; cd -;

git diff --no-index ./tmp/gatsby/packages/babel-plugin-remove-graphql-queries/src/index.js ../src/babel-plugin-remove-graphql-queries.js > ./tmp/babel-plugin-remove-graphql-queries.patch
sed -i -e 's/.\/tmp\/gatsby\/packages\/babel-plugin-remove-graphql-queries\/src\/index.js/..\/src\/babel-plugin-remove-graphql-queries.js/g' ./tmp/babel-plugin-remove-graphql-queries.patch
