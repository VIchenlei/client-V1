#!/bin/sh


# convert the sass
sass --watch ./sass ./css &

# convert the riot tag
riot --type es6 -w ./tags ./dist &

# ip=`awk '/inet / && $2 != "127.0.0.1"{print $2}' <(ifconfig)`
# node webpack-dev-server.js --port 9090 --inline --host $ip --content-base static/dist/