#!/bin/bash
#
# You should pass this bash script two parameters, 
# the first is the name of the repo to push to, the second 
# is the tag.
#
set -e

echo "Running Go Build"
go get; cd cmd/web; go get; cd ../..
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o web cmd/web/main.go

cd frontend; yarn install; yarn build; cd ..

mkdir -p public
cp -R frontend/build/* public/

TIMESTAMP=`date +%s`
docker build --no-cache . -f Dockerfile -t $1:$2

rm web
