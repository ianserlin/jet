#!/bin/bash
CIDIR=../app;
SIDIR=../resources;

RELEASE_DIR=../release;
CODIR=$RELEASE_DIR/app;
SODIR=$RELEASE_DIR/resources;

echo $CODIR;

rm -rf $RELEASE_DIR; mkdir $RELEASE_DIR; mkdir $CODIR; mkdir $SODIR;

# CLIENT

# config
mkdir $CODIR/config;
cp $CIDIR/config/* $CODIR/config;

# stylesheets
mkdir $CODIR/stylesheets;
cp $CIDIR/stylesheets/* $CODIR/stylesheets;

# js libs
mkdir $CODIR/lib
cat $CIDIR/lib/jquery.js $CIDIR/lib/* > merge.js;
uglifyjs -o $CODIR/lib/lib.js merge.js;
rm merge.js;

# jet
cp $CIDIR/app.js $CODIR/app.js;
uglifyjs -o $CODIR/app.js $CODIR/app.js;

# images
mkdir $CODIR/images;
cp $CIDIR/images/* $CODIR/images;

# html
cp $CIDIR/index.html $CODIR/index.html;

# SERVER

# stylesheets
mkdir $SODIR/stylesheets;
cp $SIDIR/stylesheets/* $SODIR/stylesheets;

# images
mkdir $SODIR/images;
cp $SIDIR/images/* $SODIR/images;

# templates
mkdir $SODIR/templates;
cp $SIDIR/templates/* $SODIR/templates;

# config

