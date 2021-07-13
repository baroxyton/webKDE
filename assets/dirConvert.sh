#!/bin/bash
#usage: find  /usr/share/icons/breeze-dark/apps/48/ -type f,l  -exec  /tmp/generator.sh {} \; > apps.json
inputfile=$1;
echo $inputfile > /dev/stderr;
parsed=$(cat $inputfile|jq -R -s '.');
echo -n "\"$(basename $inputfile)\":{\"meta\":{\"changeDate\":0,\"owner\":\"root\",\"permission\":[7,5,5],\"type\":\"file\"},\"content\":$parsed},"
