import Team from "../models/Team.js";

export const authorizeTeamAccess = async (req, res, next) => {
  try {
    // Support lookup by teamId or by team name from route param
    const teamId = req.params.teamId || req.params.id || req.body.teamId || req.query.teamId;
    const teamName = req.params.name;

    let team = null;
    if (teamId) {
      team = await Team.findById(teamId);
    } else if (teamName) {
      team = await Team.findOne({ name: teamName });
    }
    if (!teamId && !teamName) return res.status(400).json({ message: "Team identifier required" });
    if (!team) return res.status(404).json({ message: "Team not found" });

    req.team = team;

    const userId = req.user.userId;

    if (req.user.role === "admin") {
      req.user.teamRole = "admin";
      return next();
    }
    
    if (team.creator.toString() === userId) {
      req.user.teamRole = "creator"; // team manager
    } else if (team.members.some(memberId => memberId.toString() === userId)) {
      req.user.teamRole = "member"; // joined member
    } else {
      return res.status(403).json({ message: "Access denied: not a team member" });
    }

    next();
  } catch (err) {
    console.error("Team RBAC error:", err);
    res.status(500).json({ message: "Authorization failed" });
  }
};
