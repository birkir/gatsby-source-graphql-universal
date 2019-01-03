#!/bin/sh

mkdir -p ./tmp

if [ -d "./tmp/gatsby/.git" ]; then
  # cd ./tmp/gatsby; git pull; cd -;
  echo "Already have git directory in ./tmp/gatsby"
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
cp ./tmp/gatsby/packages/gatsby-source-graphql/src/gatsby-node.js ./src/gatsby-node.js
cp ./tmp/gatsby/packages/gatsby-source-graphql/src/transforms.js ./src/transforms.js

echo "Review changes and push. Otherwise:"
echo "  git checkout master"
echo "  git branch -D feature/upstream-merge"
echo ""
