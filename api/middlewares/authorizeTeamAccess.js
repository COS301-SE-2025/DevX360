import Team from "../models/Team.js";

export const authorizeTeamAccess = async (req, res, next) => {
  try {
    const teamId = req.params.id || req.body.teamId || req.query.teamId;
    if (!teamId) return res.status(400).json({ message: "Team ID required" });

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    req.team = team;

    const userId = req.user.userId;

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
