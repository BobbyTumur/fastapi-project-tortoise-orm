#! /usr/bin/env bash

set -e
set -x

cd backend
python3 -c "import app.main; import json; print(json.dumps(app.main.app.openapi()))" > ../openapi.json
cd ..
python3 scripts/upload_json_cleaner.py
mv openapi.json upload/
cd upload
npm run generate-client
npx biome format --write ./src/client