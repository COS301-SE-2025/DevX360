# 🧪 Test Your MCP Integration in Claude Desktop

## Quick Test Commands

Try these exact commands in Claude Desktop to verify your MCP is working:

### 1. **Basic Tool Test**
```
What tools do you have available?
```
**Expected**: You should see `analyze_dora_metrics`, `get_repository_insights`, `analyze_repository`, and `get_ai_analysis`

### 2. **DORA Metrics Test**
```
Analyze the DORA metrics for https://github.com/facebook/react
```
**Expected**: Detailed analysis with deployment frequency, lead time, MTTR, change failure rate

### 3. **Repository Insights Test**
```
Get repository insights for https://github.com/microsoft/vscode
```
**Expected**: Repository information including contributors, languages, statistics

### 4. **Repository Analysis Test**
```
Perform a deep analysis of https://github.com/nodejs/node
```
**Expected**: Code structure analysis, DORA indicators, improvement opportunities

## 🔍 What to Look For

### ✅ **Success Indicators:**
- Claude responds with detailed analysis
- You see structured data (metrics, trends, insights)
- No error messages about missing tools
- Response includes your custom formatting (emojis, structured text)

### ❌ **Failure Indicators:**
- "I don't have access to that tool"
- "I can't analyze repositories"
- Generic responses without detailed metrics
- Error messages about tool availability

## 🚨 Troubleshooting

### If Tools Don't Work:
1. **Restart Claude Desktop** completely
2. **Check configuration**: `cat ~/Library/Application\ Support/Claude/config.json`
3. **Verify server path**: Make sure `/Users/sbudx/Documents/GitHub/DevX360/mcp-server.js` exists
4. **Run monitor**: Use `node monitor-mcp-usage.js` to see if MCP processes start

### If You See Errors:
- GitHub API warnings are normal (deprecation notices)
- Timeouts are normal for large repositories
- The tools are working if you get structured responses

## 📊 Expected Output Format

When working correctly, you should see responses like:

```
📊 **DORA Analysis for react**

🚀 **Deployment Frequency:**
   • Total: 150 deployments
   • Weekly Trend: 📈 Increasing
   • Freq: 2.1/day | 14.7/week | 64.2/month

⏱️ **Lead Time for Changes:**
   • Average: 3.2 days
   • Trend: ➡️ Stable
   • PRs Analyzed: 45

💡 **AI Insights:**
   ✅ Good deployment frequency - maintaining regular releases
   🚀 Excellent lead time - efficient development process
```

---

**🎯 Bottom Line**: If you get detailed, structured responses with metrics and insights, your MCP is working perfectly!