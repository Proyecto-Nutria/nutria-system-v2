#!/bin/sh

if [ $# -eq 0 ]; then
    echo "Error: No arguments provided"
    exit 1
fi

cd ../aws_lambdas

if [ ! -d "./node_modules" ]; then
    echo "Error: You need to install node modules"
    exit 1
fi

# Rename the lambda function to index
echo "Renaming $1 to index.js"
mv $1.js index.js

# zip only the necessary elements for the lambda
echo "Zipping the content of the lambda"
zip -r $1.zip ./config ./models ./node_modules ./template ./package.json ./package-lock.json index.js

# Return the file to its origina name
echo "Returing index.js to $1"
mv index.js $1.js

# Move the zip file to its destination folder
mv $1.zip ../hasura_events/
