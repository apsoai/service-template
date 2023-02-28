#!/usr/bin/env bash


startTime=$(date +%s)


currentDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
rootDir=$(dirname "${currentDir}")
. "${currentDir}/common.sh"

SCHEMA_WILDCARD="${currentDir}/provision/*-schema.sh"
for filename in ${SCHEMA_WILDCARD}; do
    echo $filename
    run $filename
done
