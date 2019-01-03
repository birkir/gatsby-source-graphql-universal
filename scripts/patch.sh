#!/bin/sh
rm -rf ./tmp
mkdir ./tmp
if [ -d "./tmp" ]; then
  echo "Already have directory ./tmp"
else
  git clone --depth 1 https://github.com/gatsbyjs/gatsby.git ./tmp/gatsby
fi

# Apply patches
cd ./tmp/gatsby
git apply ../../patches/babel-plugin-remove-graphql-queries.patch -v
git apply ../../patches/babel-loader.patch -v
cd -

git checkout -b feature/upstream-merge
cp ./tmp/gatsby/packages/babel-plugin-remove-graphql-queries/src/index.js ../src/babel-plugin-remove-graphql-queries.js
cp ./tmp/gatsby/packages/gatsby/src/utils/babel-loader.js ../src/babel-loader.js

echo "Review changes and push. Otherwise:"
echo "  git checkout master"
echo "  git branch -D feature/upstream-merge"
echo ""

rm -rf ./tmp
