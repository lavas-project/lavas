#!/bin/sh

rm -rf ./dist
mkdir dist

cp -R package.json LICENSE README.md bin dist

./node_modules/.bin/babel lib -d dist/lib

echo build succeeded.
