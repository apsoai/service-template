#!/usr/bin/env bash

startTime=$(date +%s)

currentDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
rootDir=$(dirname "${currentDir}")
. "${currentDir}/../common.sh"
. "${currentDir}/db.sh"

# DATABASE="apso"
# SCHEMA="apso_test"
# USER="apso"
# PASSWORD="password"

DATABASE="squeazee"
SCHEMA="squeazee"
USER="squeazee"
PASSWORD="T!GA_dollar_sign"

HOSTNAME="spiu1me27pxqfi.cchzuw1waemu.us-west-2.rds.amazonaws.com"
PORT="5432"
ROOT_USERNAME="squeazee"
ROOT_PASSWORD="cTWthnoCjj8gnEoAUYtca9rp"
ROOT_DATABASE="squeazee"

# info "SET DATABASE ${DATABASE}"

# resetDatabase $DATABASE $HOSTNAME $PORT $ROOT_USERNAME $ROOT_PASSWORD $ROOT_DATABASE
# createDatabaseUser $USER $PASSWORD $DATABASE $HOSTNAME $PORT $ROOT_USERNAME $ROOT_PASSWORD $ROOT_DATABASE
# createDatabaseSchema $USER $DATABASE $SCHEMA $HOSTNAME $PORT $ROOT_USERNAME $ROOT_PASSWORD $ROOT_DATABASE