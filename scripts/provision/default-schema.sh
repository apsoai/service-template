#!/usr/bin/env bash

startTime=$(date +%s)

currentDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
rootDir=$(dirname "${currentDir}")
. "${currentDir}/../common.sh"
. "${currentDir}/db.sh"

DATABASE="apso"
SCHEMA="apso"
USER="apso"
PASSWORD="password"

HOSTNAME="127.0.0.1"
PORT="54322"
ROOT_USERNAME="root"
ROOT_PASSWORD="root"
ROOT_DATABASE="postgres"

info "SET DATABASE ${DATABASE}"

resetDatabase $DATABASE $HOSTNAME $PORT $ROOT_USERNAME $ROOT_PASSWORD $ROOT_DATABASE
createDatabaseUser $USER $PASSWORD $DATABASE $HOSTNAME $PORT $ROOT_USERNAME $ROOT_PASSWORD $ROOT_DATABASE
createDatabaseSchema $USER $DATABASE $SCHEMA $HOSTNAME $PORT $ROOT_USERNAME $ROOT_PASSWORD $ROOT_DATABASE