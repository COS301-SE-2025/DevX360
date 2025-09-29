# DevX360 API AWS Deployment Guide

This guide explains how to deploy the DevX360 API to AWS Lambda using SAM (Serverless Application Model).

## Prerequisites

1. **AWS CLI** installed and configured
2. **SAM CLI** installed
3. **Node.js 20.x** installed
4. **AWS Account** with appropriate permissions

## Step 1: Install Dependencies

```bash
cd DevX360/backend
npm install
```

## Step 2: Set Up AWS Secrets

Store your environment variables in AWS Systems Manager Parameter Store:

```bash
# MongoDB URI
aws ssm put-parameter \
  --name "/devx360/api/MONGODB_URI" \
  --value "mongodb+srv://username:password@cluster.mongodb.net/devx360" \
  --type "String"

# JWT Secret
aws ssm put-parameter \
  --name "/devx360/api/JWT_SECRET" \
  --value "your-super-secret-jwt-key" \
  --type "SecureString"

# OpenAI API Key
aws ssm put-parameter \
  --name "/devx360/api/OPENAI_API_KEY" \
  --value "sk-your-openai-api-key" \
  --type "SecureString"

# GitHub Tokens
aws ssm put-parameter \
  --name "/devx360/api/GITHUB_TOKEN_1" \
  --value "ghp_your-github-token-1" \
  --type "SecureString"

aws ssm put-parameter \
  --name "/devx360/api/GITHUB_TOKEN_2" \
  --value "ghp_your-github-token-2" \
  --type "SecureString"

# MCP API Token
aws ssm put-parameter \
  --name "/devx360/api/MCP_API_TOKEN" \
  --value "your-mcp-api-token" \
  --type "SecureString"
```

## Step 3: Build and Deploy

```bash
cd DevX360/backend/api

# Build the application
sam build

# Deploy (first time - guided)
sam deploy --guided

# Subsequent deployments
sam deploy
```

## Step 4: Test the Deployment

After deployment, you'll get an API Gateway URL. Test it:

```bash
# Health check
curl https://your-api-id.execute-api.af-south-1.amazonaws.com/dev/health

# Test API endpoint
curl https://your-api-id.execute-api.af-south-1.amazonaws.com/dev/api/health
```

## Step 5: Monitor and Debug

```bash
# View logs
sam logs -n ApiFunction --stack-name devx360-api --tail

# Local testing
sam local start-api
```

## Environment Variables

The following environment variables are automatically loaded from SSM Parameter Store:

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `OPENAI_API_KEY` - OpenAI API key
- `GITHUB_TOKEN_1` - Primary GitHub token
- `GITHUB_TOKEN_2` - Secondary GitHub token
- `MCP_API_TOKEN` - MCP API token

## Free Tier Considerations

- **Lambda**: 1M requests + 400k GB-s per month (always free)
- **API Gateway**: 1M requests/month for first 12 months
- **SSM Parameter Store**: Standard tier free
- **CloudWatch Logs**: 5GB free per month

## Troubleshooting

### Common Issues

1. **CORS Errors**: Update the `AllowOrigins` in `template.yaml`
2. **Timeout Errors**: Increase `Timeout` in the SAM template
3. **Memory Issues**: Increase `MemorySize` in the SAM template
4. **Import Errors**: Ensure all dependencies are in `package.json`

### Useful Commands

```bash
# Delete the stack
aws cloudformation delete-stack --stack-name devx360-api

# List stacks
aws cloudformation list-stacks

# Get stack outputs
aws cloudformation describe-stacks --stack-name devx360-api
```

## Cost Optimization

- Use HTTP API instead of REST API (cheaper)
- Set appropriate memory and timeout values
- Monitor usage with AWS Cost Explorer
- Set up billing alerts

## Security Best Practices

- Use SSM Parameter Store for secrets
- Enable API Gateway request validation
- Use IAM roles with minimal permissions
- Enable CloudTrail for audit logging