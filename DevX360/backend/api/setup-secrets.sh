#!/bin/bash

echo "🔐 Setting up AWS SSM Parameters for DevX360 API..."

# MongoDB URI (replace with your actual MongoDB connection string)
echo "Setting MongoDB URI..."
aws ssm put-parameter \
  --name "/devx360/api/MONGODB_URI" \
  --value "mongodb+srv://devx360:password123@cluster0.mongodb.net/devx360?retryWrites=true&w=majority" \
  --type "String" \
  --overwrite

# JWT Secret (generate a random secret)
echo "Setting JWT Secret..."
aws ssm put-parameter \
  --name "/devx360/api/JWT_SECRET" \
  --value "devx360-super-secret-jwt-key-$(date +%s)" \
  --type "SecureString" \
  --overwrite

# OpenAI API Key (replace with your actual key)
echo "Setting OpenAI API Key..."
aws ssm put-parameter \
  --name "/devx360/api/OPENAI_API_KEY" \
  --value "sk-your-openai-api-key-here" \
  --type "SecureString" \
  --overwrite

# GitHub Tokens (replace with your actual tokens)
echo "Setting GitHub Token 1..."
aws ssm put-parameter \
  --name "/devx360/api/GITHUB_TOKEN_1" \
  --value "ghp_your-github-token-1-here" \
  --type "SecureString" \
  --overwrite

echo "Setting GitHub Token 2..."
aws ssm put-parameter \
  --name "/devx360/api/GITHUB_TOKEN_2" \
  --value "ghp_your-github-token-2-here" \
  --type "SecureString" \
  --overwrite

# MCP API Token
echo "Setting MCP API Token..."
aws ssm put-parameter \
  --name "/devx360/api/MCP_API_TOKEN" \
  --value "mcp-your-api-token-here" \
  --type "SecureString" \
  --overwrite

echo "✅ All secrets configured!"
echo "📝 Note: Update the values above with your actual API keys"