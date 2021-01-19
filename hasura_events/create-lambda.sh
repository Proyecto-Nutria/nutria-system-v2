#!/bin/sh

cd ../aws_lambdas

# Rename the lambda function to index
mv $1.js index.js

# zip only the necessary elements for the lambda
zip -r $1.zip ./config ./models ./template ./package.json ./package-lock.json index.js

# Return the file to its origina name
mv index.json $1.js

# Move the zip file to its destination folder
mv $1.zip ../hasura_events/