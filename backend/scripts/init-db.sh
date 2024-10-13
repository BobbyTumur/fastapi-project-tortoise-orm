#!/bin/bash
echo "Creating database and setting permission..."
mysql -u root -p${MYSQL_ROOT_PASSWORD} <<EOF
CREATE DATABASE IF NOT EXISTS ${MYSQL_DB};
GRANT ALL PRIVILEGES ON ${MYSQL_DB}.* TO '${MYSQL_USER}'@'%';
FLUSH PRIVILEGES;
EOF

echo "Database ${MYSQL_DB} and user ${MYSQL_USER} initialized."
