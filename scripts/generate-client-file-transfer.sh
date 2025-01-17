#! /usr/bin/env bash

set -e
set -x

cd backend
python3 -c "import app.main; import json; print(json.dumps(app.main.app.openapi()))" > ../openapi.json
cd ..
python3 scripts/file_transfer_json_cleaner.py
mv openapi.json transfer/
cd transfer
npm run generate-client
npx biome format --write ./src/client