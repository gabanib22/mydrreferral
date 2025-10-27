#!/bin/bash

# Test RDS Connection Script
# This script tests the RDS connection from different angles

echo "🔍 Testing RDS Connection..."

# Extract connection details
CONNECTION_STRING="$1"
HOST=$(echo "$CONNECTION_STRING" | grep -o 'Host=[^;]*' | cut -d'=' -f2)
PORT=$(echo "$CONNECTION_STRING" | grep -o 'Port=[^;]*' | cut -d'=' -f2)
DATABASE=$(echo "$CONNECTION_STRING" | grep -o 'Database=[^;]*' | cut -d'=' -f2)
USERNAME=$(echo "$CONNECTION_STRING" | grep -o 'Username=[^;]*' | cut -d'=' -f2)
PASSWORD=$(echo "$CONNECTION_STRING" | grep -o 'Password=[^;]*' | cut -d'=' -f2)

echo "Host: $HOST"
echo "Port: $PORT"
echo "Database: $DATABASE"
echo "Username: $USERNAME"

# Test 1: DNS Resolution
echo "🔍 Testing DNS resolution..."
nslookup "$HOST" || echo "DNS resolution failed"

# Test 2: Port connectivity
echo "🔍 Testing port connectivity..."
timeout 10 bash -c "echo > /dev/tcp/$HOST/$PORT" && echo "✅ Port $PORT is accessible" || echo "❌ Port $PORT is not accessible"

# Test 3: Telnet test
echo "🔍 Testing with telnet..."
timeout 10 telnet "$HOST" "$PORT" || echo "Telnet test failed"

# Test 4: PostgreSQL client test
echo "🔍 Testing with PostgreSQL client..."
export PGPASSWORD="$PASSWORD"
timeout 30 psql -h "$HOST" -p "$PORT" -U "$USERNAME" -d "$DATABASE" -c "SELECT 1;" || echo "PostgreSQL client test failed"

echo "🔍 Connection test completed"
