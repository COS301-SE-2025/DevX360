import User from "../models/User.js";
import { Octokit } from "octokit";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN_1 });

/**
 * Refresh GitHub usernames for all users who have a GitHub ID
 */
export async function refreshGithubUsernames() {
  const users = await User.find({ githubId: { $exists: true, $ne: null } });

  for (const user of users) {
    try {
      const { data } = await octokit.request(`GET /user/${user.githubId}`);

      if (data?.login && data.login !== user.githubUsername) {
        console.log(`Updating: ${user.githubUsername} to ${data.login}`);
        user.githubUsername = data.login;
        await user.save();
      }
    } catch (error) {
      console.error(`Failed to update user ${user.githubId}:`, error.message);
    }
  }

  console.log(`GitHub username sync complete (${users.length} users scanned).`);
}
