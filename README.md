# DevX360 User Manual

## 0. How the System Works 

![DevX360 Graphical Model](./Assets/DevX360 Graphical Model.png)

When you log into DevX360, you begin on the dashboard in your web browser. This dashboard is your main control panel, where you can view metrics, manage your team, and request AI feedback. Every action you take is sent to the DevX360 service running in the cloud.

The cloud service acts like a messenger. If your request is about team details or stored information, it retrieves the data from the secure database. If it’s about repositories and commits, it connects to GitHub to fetch the latest activity. Alongside this, DevX360 has an AI assistant that analyses the data coming from GitHub and your stored metrics, then provides recommendations on how your team can improve.

From the user’s perspective, this all happens seamlessly: you press a button, and the results appear on your screen. Behind the scenes, however, several parts are working together—the dashboard, the cloud service, the database, GitHub, and the AI—to make sure you always have accurate and useful insights.


When you log into DevX360, you begin on the dashboard in your web browser. This dashboard is your main control panel, where you can view metrics, manage your team, and request AI feedback. Every action you take is sent to the DevX360 service running in the cloud.

The cloud service acts like a messenger. If your request is about team details or stored information, it retrieves the data from the secure database. If it’s about repositories and commits, it connects to GitHub to fetch the latest activity. Alongside this, DevX360 has an AI assistant that analyses the data coming from GitHub and your stored metrics, then provides recommendations on how your team can improve.

From the user’s perspective, this all happens seamlessly: you press a button, and the results appear on your screen. Behind the scenes, however, several parts are working together—the dashboard, the cloud service, the database, GitHub, and the AI—to make sure you always have accurate and useful insights.

## 1. Getting Started

### 1.1 Prerequisites Before Running the App

Before launching the DevX360 app:

1. **Start the API**  
   - Follow the setup instructions in the official README:
     👉 [API Setup Guide](https://github.com/COS301-SE-2025/DevX360/tree/feature/ai-analysis#) Found in the "Installation" section of the README

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
### 1.2 Landing Page
<img width="1876" height="888" alt="Screenshot 2025-08-20 002547" src="https://github.com/user-attachments/assets/35d34e70-7a0e-4504-8a9d-827167e403d7" />
1. Click "Register" if don't have an account
2. Enter your details (name, email, role etc..)
3. It is HIGHLY recommended you sign up using your github
4. If you do have a an account Click "Sign In"


### 1.3 Registration
![Screenshot 2025-06-26 215029](https://github.com/user-attachments/assets/979c9f9a-d589-4052-b447-f07ca794d3cd)

1. Click "Sign Up" on the login page or If you clicked "Register" on the Landing Page
2. Enter your details (name, email, role)
3. Verify your email address
4. Log in with your credentials

### 1.3 Login
![Screenshot 2025-06-26 215002](https://github.com/user-attachments/assets/6762dffc-99dc-417a-8376-6258740005da)

1. Enter email and password
2. Press Sign in


---

## 2. Overview
<img width="1891" height="890" alt="image" src="https://github.com/user-attachments/assets/851f5717-a88b-4371-b00a-302b1521ec02" />

### 2.1 Navigation
1. **Sidebar Menu**: Access different sections
2. **User Profile**: View/update your details
3. **Theme Toggle**: Switch between light/dark mode
4. **Dashboard**: Showing your teams Metrics

### 2.2 Key Metrics
- Deployment Frequency
- Lead Time for Changes
- Change Failure Rate
- Mean Time to Recovery

---
## 3. Profile
<img width="1892" height="890" alt="image" src="https://github.com/user-attachments/assets/0ec2daa6-6b37-4522-bbb9-490d5f6e4469" />

### 3.1 Edit Profile
<img width="1125" height="491" alt="image" src="https://github.com/user-attachments/assets/b84faf5b-abc6-4681-9560-fb897f033b88" />
1. Click "Edit Profile"
2. Edit your name or email
3. Click "save changes"

### 3.1 Edit Profile Picture
1. Click "Edit" by profile picture
2. Choose the picture you want to upload

---
## 4. Team Management
<img width="1911" height="887" alt="image" src="https://github.com/user-attachments/assets/9c36f1b2-afb9-4637-88ef-49a98eda818c" />

### 4.1 Creating a Team

1. Navigate to Team section
2. Click "Create New Team"
<img width="1687" height="797" alt="image" src="https://github.com/user-attachments/assets/d89b80de-c9d4-4899-9d58-e47224e641f6" />

3. Enter team name, password and GitHub repo URL
4. Click "Create Team"

### 4.2 Joining a Team
Click "Join team"
<img width="1521" height="622" alt="image" src="https://github.com/user-attachments/assets/b1af19dc-f252-466a-b233-c9518f6caeec" />


1. Get team name and password from your manager
2. Search for the team
3. Enter password when prompted

---

## 4. Metrics Dashboard
<img width="1875" height="887" alt="image" src="https://github.com/user-attachments/assets/898d9421-2a1d-4ebb-87f4-4aedd28fd9ab" />

### 4.0 Deployment trend and top contributors
<img width="1633" height="365" alt="image" src="https://github.com/user-attachments/assets/7ba402b5-df4c-4a0b-852a-421dc14808b2" />

### 4.1 Understanding DORA Metrics
- **Deployment Frequency**: How often your team deploys code
- **Lead Time**: Time from commit to production
- **Change Failure Rate**: Percentage of failed deployments
- **MTTR**: How quickly you recover from failures



### 4.2 RBAC(Role Based Access Control
#### 4.2 Team Creator
if you create the team that means you have higher access than other members of a team, you are technically the "Team Manager"
<img width="1612" height="545" alt="image" src="https://github.com/user-attachments/assets/4b97c376-8608-4062-9930-7a08f047a0ef" />

You may Veiw the statistics of memebrs in the team because you have "Creator Access"
<img width="829" height="774" alt="image" src="https://github.com/user-attachments/assets/c9d18dd6-e743-440d-b555-81ea2c9f2a47" />

#### if you are not the "Creator" of a team then you have "Member access"
<img width="1636" height="256" alt="image" src="https://github.com/user-attachments/assets/a8136461-bb30-47e7-84a5-ac548a75cc7f" />



---

## 5. AI Analysis
<img width="1632" height="805" alt="image" src="https://github.com/user-attachments/assets/bd234151-ed6f-49ad-b4f7-ba117cef7b66" />


### 5.1 Requesting Analysis
1. Navigate to Metrics dashboard
2. Wait for processing (typically 0-30 seconds)
3. View results in the AI Feedback section

### 5.2 Understanding Suggestions
AI provides recommendations on:
- Code quality improvements
- Process optimizations
- Team workflow suggestions

---
## 6. Help Menu
Click on the Question mark on right botton corner
<img width="77" height="80" alt="image" src="https://github.com/user-attachments/assets/beb845ea-e596-442d-9b3b-eeed4fe237e0" />

### Shows you a variety of Help Navigations that may help you
<img width="1898" height="892" alt="image" src="https://github.com/user-attachments/assets/711c3d80-f25d-4264-b2e0-9c50c035ac63" />


---

## 7. Troubleshooting

### Common Issues
**Problem**: Can't see team metrics  
**Solution**: Ensure you're added to the team and have correct permissions

**Problem**: GitHub repo not connecting  
**Solution**: Check repository URL and ensure proper access rights

**Problem**: AI analysis taking too long  
**Solution**: Larger repos may take more time. Check back in 10 minutes.

**Problem**: Can not see member stats 
**Solution**: Memeber did not sign in using Github
