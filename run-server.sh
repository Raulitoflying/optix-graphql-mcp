#!/bin/bash

# Optix MCP Server Wrapper Script
# This script sets the required environment variables and runs the server

export ENDPOINT="https://api.optixapp.com/graphql"
export HEADERS='{"Authorization":"Bearer 71d449023f72cfca1887fa2809e99d6b61672337o"}'
export ALLOW_MUTATIONS="true"

# Run the server
exec node dist/index.js "$@"
