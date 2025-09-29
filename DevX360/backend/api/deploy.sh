#!/bin/bash

echo "🚀 DevX360 API AWS Deployment Script"
echo "====================================="

# Check if AWS CLI is configured
echo "🔍 Checking AWS configuration..."
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS credentials are invalid or expired"
    echo ""
    echo "📋 To get new AWS credentials:"
    echo "1. Go to AWS Console: https://aws.amazon.com/console/"
    echo "2. Sign in to your account"
    echo "3. Go to IAM → Users → Your User → Security Credentials"
    echo "4. Create Access Key"
    echo "5. Run: aws configure"
    echo ""
    echo "Or if you have new credentials, run:"
    echo "aws configure set aws_access_key_id YOUR_ACCESS_KEY"
    echo "aws configure set aws_secret_access_key YOUR_SECRET_KEY"
    echo "aws configure set region af-south-1"
    echo ""
    exit 1
fi

echo "✅ AWS credentials are valid"

# Get AWS account info
echo "📊 AWS Account Info:"
aws sts get-caller-identity

echo ""
echo "🔐 Setting up secrets..."

# Set up secrets with placeholder values
aws ssm put-parameter --name "/devx360/api/MONGODB_URI" --value "mongodb+srv://devx360:password123@cluster0.mongodb.net/devx360" --type "String" --overwrite
aws ssm put-parameter --name "/devx360/api/JWT_SECRET" --value "devx360-super-secret-jwt-key-$(date +%s)" --type "SecureString" --overwrite
aws ssm put-parameter --name "/devx360/api/OPENAI_API_KEY" --value "sk-placeholder-openai-key" --type "SecureString" --overwrite
aws ssm put-parameter --name "/devx360/api/GITHUB_TOKEN_1" --value "ghp-placeholder-github-token" --type "SecureString" --overwrite
aws ssm put-parameter --name "/devx360/api/GITHUB_TOKEN_2" --value "ghp-placeholder-github-token-2" --type "SecureString" --overwrite
aws ssm put-parameter --name "/devx360/api/MCP_API_TOKEN" --value "mcp-placeholder-token" --type "SecureString" --overwrite

echo "✅ Secrets configured (with placeholder values)"

echo ""
echo "🏗️ Building SAM application..."
sam build

echo ""
echo "🚀 Deploying to AWS..."
sam deploy --guided --stack-name devx360-api

echo ""
echo "🎉 Deployment complete!"
echo "📝 Update your secrets in AWS SSM Parameter Store with real values"
echo "🔗 Your API will be available at the URL shown above"