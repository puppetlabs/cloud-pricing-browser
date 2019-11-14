#!/bin/bash

set -e

go get
go run cloud_pricing.go --no-cache

./build.sh $1 $2
