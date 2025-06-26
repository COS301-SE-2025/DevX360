# DevX360 User Manual

## 1. Getting Started

### 1.1 Prerequisites Before Running the App

Before launching the DevX360 app:

1. **Start the API**  
   - Follow the setup instructions in the official README:  
     👉 [API Setup Guide](https://github.com/COS301-SE-2025/DevX360/blob/feature/api/README.md)

2. **Run the Frontend App**
   - Navigate to the `devx360-react/src` folder:
     ```bash
     cd devx360-react/src
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Start the development server:
     ```bash
     npm start
     ```
### 1.2 Registration
![Screenshot 2025-06-26 215029](https://github.com/user-attachments/assets/979c9f9a-d589-4052-b447-f07ca794d3cd)

1. Click "Sign Up" on the login page
2. Enter your details (name, email, role)
3. Verify your email address
4. Log in with your credentials

### 1.3 Login
![Screenshot 2025-06-26 215002](https://github.com/user-attachments/assets/6762dffc-99dc-417a-8376-6258740005da)

1. Enter email and password
2. Press Sign in


---

## 2. Dashboard Overview

### 2.1 Navigation
1. **Sidebar Menu**: Access different sections
2. **User Profile**: View/update your details
3. **Theme Toggle**: Switch between light/dark mode

### 2.2 Key Metrics
- Deployment Frequency
- Lead Time for Changes
- Change Failure Rate
- Mean Time to Recovery

---

## 3. Team Management
![Screenshot 2025-06-26 215317](https://github.com/user-attachments/assets/4c942f39-6615-4d09-918e-fd031e223071)

### 3.1 Creating a Team
1. Navigate to Team section
2. Click "Create New Team"
3. Enter team name, password and GitHub repo URL
4. Click "Create Team"

### 3.2 Joining a Team
![image](https://github.com/user-attachments/assets/f3cd5380-4f59-40e4-8e3c-3e30f96dc7c2)

1. Get team name and password from your manager
2. Search for the team
3. Enter password when prompted

---

## 4. Metrics Interpretation
![Screenshot 2025-06-26 215540](https://github.com/user-attachments/assets/5a9174fc-ac9e-4f35-9926-d2125513d909)


### 4.1 Understanding DORA Metrics
- **Deployment Frequency**: How often your team deploys code
- **Lead Time**: Time from commit to production
- **Change Failure Rate**: Percentage of failed deployments
- **MTTR**: How quickly you recover from failures

### 4.2 Benchmarking
Compare your metrics against industry standards:
- Elite: >1 deploy/day, <1 day lead time
- High: 1 deploy/week, 1-7 days lead time
- Medium: 1 deploy/month, 1-6 months lead time
- Low: <1 deploy/month, >6 months lead time

---

## 5. AI Analysis
![Screenshot 2025-06-26 215654](https://github.com/user-attachments/assets/ec928b57-2945-4bc7-b68a-7062dfd20430)

### 5.1 Requesting Analysis
1. Navigate to Metrics dashboard
2. Wait for processing (typically 2-5 minutes)
3. View results in the AI Feedback section

### 5.2 Understanding Suggestions
AI provides recommendations on:
- Code quality improvements
- Process optimizations
- Team workflow suggestions

---

## 6. Troubleshooting

### Common Issues
**Problem**: Can't see team metrics  
**Solution**: Ensure you're added to the team and have correct permissions

**Problem**: GitHub repo not connecting  
**Solution**: Check repository URL and ensure proper access rights

**Problem**: AI analysis taking too long  
**Solution**: Larger repos may take more time. Check back in 10 minutes.

