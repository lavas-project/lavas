#!/bin/bash


rm -rf ./dist
mkdir dist

cp -R package.json LICENSE README.md bin dist

babel lib -d dist/lib
