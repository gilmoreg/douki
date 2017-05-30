#!/bin/bash
set -e # Abort script at first error
set -u # Disallow unset variables

# Only run when not part of a pull request and on the master branch
if [ $TRAVIS_PULL_REQUEST != "false" -o $TRAVIS_BRANCH != "master" ]
then
    echo "Skipping deployment on branch=$TRAVIS_BRANCH, PR=$TRAVIS_PULL_REQUEST"
    exit 0;
fi

# Deploy
now -C --docker -p -t $NOW_API_KEY

# List deployments for ease of finding new URL
now -t $NOW_API_KEY -C list
exit 0;
