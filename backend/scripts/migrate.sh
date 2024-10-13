#!/bin/bash

# Initialize aerich if migrations have not been initialized
if [ ! -d "migrations" ]; then
    echo "Initializing Aerich migrations..."
    aerich init -t app.core.config.tortoise_orm
    aerich init-db
fi

# Run migrations (this generates the migration files)
echo "Running Aerich migrations..."
aerich migrate

# Apply migrations (this updates the database)
echo "Applying migrations..."
aerich upgrade
