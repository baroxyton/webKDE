#!/bin/bash
#usage: 
inputfile=$1;
echo $inputfile > /dev/stderr;
parsed=$(cat $inputfile|jq -R -s '.');
echo -n "\"$(basename $inputfile)\":{\"meta\":{\"changeDate\":0,\"owner\":\"root\",\"permission\":[7,5,5],\"type\":\"file\"},\"content\":$parsed},"
