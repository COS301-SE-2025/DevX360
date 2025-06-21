
### README: Project Genesis - Context for Cursor AI

This `README` file provides a comprehensive overview of **'Project Genesis'**, our development team, current sprint goals, and my specific responsibilities as a key backend engineer. The purpose of this document is to furnish you with all necessary context to offer expert-level technical guidance and strategic advice on my assigned tasks.

---

#### 1. Project Overview: 'Project Genesis'

**'Project Genesis'** is an ambitious initiative focused on developing a robust system for **DORA (DevOps Research and Assessment) metrics and code quality analysis**. Our goal is to provide deep insights into software development performance and code health.

*   **Team Composition:** We are a small, agile team comprising:
    *   Sipho Sehlapelo: Project Manager, UI Engineer, and Designer. Also serves as Product Manager in SCRUM.
    *   Kelsey Hamann: Integration Engineer, and partially a Data Engineer, Testing Engineer, and Architect.
    *   **Sibusiso Mngomezulu (Me): Data Engineer and Services Engineer on the backend team.**
    *   David Musa-Aisien: Documentation Specialist, Testing Engineer, and partially an Architect and DevOps Engineer. Also serves as Scrum Master.

*   **Development Methodology:** We operate under an **Agile development process using the SCRUM methodology**. Major decisions are made collectively during in-person team meetings. David, as our Scrum Master, is responsible for removing blockers during sprint execution.

---

#### 2. Current Sprint Context: Sprint 2

We are currently in **Sprint 2**, which has a **4-week duration**.

*   **Sprint Goal:** To **'Complete at least eight total use cases (the original three plus five new ones), finalize CI/CD, and refine requirements'**.
*   **Key Deliverables for Sprint 2:**
    *   **'Implementation of the five additional use cases'**.
    *   **'CI/CD pipeline fully configured and running (build, test and deploy)'**.
    *   'Revised and detailed functional/non-functional requirements document'.
    *   'Technology decision log shared with the client'.
*   **Success Criteria for Sprint 2:**
    *   **'All eight use cases (the original three plus the five newly prioritized) execute end-to-end without errors'**.
    *   **'Each use case has an associated acceptance test that passes in the CI/CD pipeline'**.
    *   'The client has reviewed and signed off on the key technology decisions'.
*   **Possible Difficulties for Sprint 2:**
    *   **'Time frame: There is restrictive time frame for the amount of required progress. Careful allocation of resources and prioritization of use cases will be observed'**.

---

#### 3. My Role: Sibusiso Mngomezulu - Data Engineer & Services Engineer

As **Sibusiso Mngomezulu**, my contributions to 'Project Genesis' are on the backend team, specifically as a **Data Engineer** and a **Services Engineer**.

*   **Data Engineer Responsibilities:** My primary role as a Data Engineer is to **'handle the scraping and management of information from repositories and databases'**. In Sprint 1, we already included 'Pull data from GitHub via Octokit', providing some foundational work.
*   **Services Engineer Responsibilities:** As a Services Engineer, I am responsible for **'developing the core functionality of the backend based on information received through the handling of GIT repositories'**. Furthermore, I am **'responsible for processing this information and feeding it back to and working with integration engineers'**, primarily Kelsey Hamann, our Integration Engineer.

---

#### 4. My Sprint 2 Tasks: Prioritised Use Cases

For Sprint 2, my team's critical deliverable is the **'Implementation of the five additional use cases'**. These use cases are listed below, ranked by their estimated backend implementation difficulty (easiest to hardest), and are crucial for the sprint goal of 'Complete at least eight total use cases'.

1.  **Retrieve repository information using link to repository.**
    *   *My Role Relevance:* Directly aligns with my Data Engineer responsibility for 'handling the scraping and management of information from repositories'.
2.  **The system should be able to display basic repository information using retrieved data: usernames of contributors, number of contributors, languages etc.**
    *   *My Role Relevance:* Once data is retrieved, my Services Engineer role is 'responsible for processing this information and feeding it back to... integration engineers'. This involves parsing and preparing basic data for API exposure.
3.  **Implement a basic repository dashboard: A working dashboard showing DORA data.**
    *   *My Role Relevance:* This involves 'retrieving data for DORA metrics and calculating: Improved Change Failure Rate calculation' for Sprint 2. As Data Engineer, I manage the information source; as Services Engineer, I 'develop the core functionality of the backend' for these calculations and dashboard data preparation.
4.  **Generate a basic report using contributor and DORA information.**
    *   *My Role Relevance:* This builds upon the previous two use cases. My Services Engineer role dictates developing the backend functionality to aggregate, summarise, and format this combined data into a report.
5.  **Use AI to analyse repository DORA metrics and code quality and give feedback on DORA metrics.**
    *   *My Role Relevance:* This is the most complex, requiring backend development (Services Engineer) to integrate AI for analysis beyond standard data processing. It also involves sourcing data (Data Engineer) for 'code quality' metrics, which aren't explicitly defined yet.

---

#### 5. My Query to You, Cursor: Expert Technical & Strategic Guidance

**Considering my specific roles (Data Engineer, Services Engineer), the ambitious Sprint 2 goals, the prioritised use cases, and our team's agile framework, please provide expert-level technical guidance and strategic advice on how I can efficiently implement these tasks.** I have strong foundational programming skills but need nuanced, context-aware advice.

**Specifically, I am looking for:**

*   **For Use Cases 1 & 2 (Repository Data Retrieval & Basic Display):**
    *   Best practices for robust and efficient GitHub API interaction (e.g., handling rate limiting, pagination) relevant to my Data Engineer role.
    *   Optimal backend data structures for storing and preparing this basic repository information for subsequent use and seamless API exposure.
*   **For Use Case 3 (DORA Dashboard Implementation):**
    *   Recommended architectural patterns or design principles for a backend service dedicated to calculating DORA metrics, ensuring scalability and maintainability.
    *   Guidance on calculating complex DORA metrics like 'Improved Change Failure Rate' from raw repository data, including necessary data points and potential implementation pitfalls.
    *   Strategies for making this calculated DORA data readily consumable by Kelsey Hamann (Integration Engineer) for the API layer and Sipho Sehlapelo (UI Engineer) for the frontend dashboard.
*   **For Use Case 4 (Report Generation):**
    *   Backend design considerations for generating structured reports (e.g., format choices, templating engines, and strategies for asynchronous generation if reports become large).
    *   Efficient methods to aggregate and summarise data from existing DORA and contributor information for report generation.
*   **For Use Case 5 (AI Analysis of DORA & Code Quality):**
    *   Initial technical approaches for integrating AI capabilities into our backend for DORA and 'code quality' analysis (e.g., leveraging third-party AI APIs, open-source models, crucial data preparation steps for AI consumption).
    *   Given the **'restrictive time frame'**, what are the most pragmatic initial steps or proof-of-concept ideas for this complex use case?
*   **General Backend Development & Testing (Applicable to All Use Cases):**
    *   Best practices for ensuring that my backend implementations support the Sprint 2 success criteria of **'All eight use cases... execute end-to-end without errors'** and **'Each use case has an associated acceptance test that passes in the CI/CD pipeline'**. This should consider unit testing, integration testing, and how my work aligns with David Musa-Aisien's role as Testing Engineer and DevOps Engineer.
    *   How to ensure modularity and loose coupling in my backend code, aligning with Kelsey's and David's partial Architect roles.
    *   Guidance on adhering to our custom Git flow branching strategy (e.g., `feature` branches for decoupled modules).

**Please provide clear, actionable steps and considerations, structured logically to address each aspect of my query.**

---
**End of README Context for Cursor AI.**
***