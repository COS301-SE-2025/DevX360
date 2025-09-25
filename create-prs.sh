#!/bin/bash

# --- CONFIG ---
REPO_DIR="/Users/sbudx/Documents/GitHub/DevX360"
BASE_BRANCH="main"
MAX_PRS=2
PR_LABELS="weekly,atomic"
DRY_RUN=false   # true = preview only, no pushes/PRs
INTERACTIVE=false  # true = use git add -p per file (manual hunk selection)
# ---------------

set -euo pipefail
cd "$REPO_DIR"

require() { command -v "$1" >/dev/null 2>&1 || { echo "Missing dependency: $1"; exit 1; }; }
require git
require gh

git fetch origin
git checkout "$BASE_BRANCH"
git pull --ff-only origin "$BASE_BRANCH"

# Collect tracked/untracked modified files
mapfile -t FILES < <(git status --porcelain | awk '/^( M|M |A |\?\?)/{print $2}')
[ ${#FILES[@]} -gt 0 ] || { echo "No changes to commit."; exit 0; }

TIMESTAMP=$(date +%Y-%m-%d)
BRANCH_PREFIX="weekly/${TIMESTAMP}"
BRANCHES=()
COUNT=0

# Helper: guess type from path
guess_type() {
  case "$1" in
    api/*|services/*|"Data Collection"/*) echo "feat";;
    devx360-react/*) echo "test";;
    mcp-*|mcp/*) echo "chore";;
    *) echo "chore";;
  esac
}

# Helper: derive scope from dirname
scope_from() {
  local scope; scope=$(dirname "$1" | sed 's#^\./##' | tr '/' '-') ; echo "${scope:-root}"
}

# Helper: short summary from first added line
summary_from() {
  local f="$1"
  git diff -- "$f" | awk '
    $0 ~ /^\+\+/ {next}      # skip diff header
    $0 ~ /^\+/ {print substr($0,2); exit}
  ' | sed 's/^[[:space:]]*//; s/[[:space:]]*$//' | cut -c1-72
}

# Create up to MAX_PRS branches, assign files evenly, commit one file per commit
TOTAL=${#FILES[@]}
[ $MAX_PRS -gt 0 ] || MAX_PRS=1
[ $MAX_PRS -le $TOTAL ] || MAX_PRS=$TOTAL
PER_BUCKET=$(( (TOTAL + MAX_PRS - 1) / MAX_PRS ))

start=0
for i in $(seq 1 $MAX_PRS); do
  end=$(( start + PER_BUCKET - 1 ))
  [ $end -ge $((TOTAL-1)) ] && end=$((TOTAL-1))
  [ $start -le $end ] || break

  BRANCH="${BRANCH_PREFIX}-${i}"
  echo "Creating branch: $BRANCH"
  git checkout -B "$BRANCH" "origin/$BASE_BRANCH"

  for idx in $(seq $start $end); do
    f="${FILES[$idx]}"
    [ -n "${f:-}" ] || continue

    if $INTERACTIVE; then git add -p -- "$f" || true
    else git add -- "$f"
    fi

    type=$(guess_type "$f")
    scope=$(scope_from "$f")
    summary=$(summary_from "$f")
    subject="${type}(${scope}): ${summary:-update ${f}}"

    if $DRY_RUN; then
      echo "[DRY_RUN] git commit -m \"$subject\" -- \"$f\""
      git reset -- "$f" || true
    else
      git commit -m "$subject" -- "$f" || true
    fi
    COUNT=$((COUNT+1))
  done

  if $DRY_RUN; then
    echo "[DRY_RUN] skip push $BRANCH"
  else
    git push -u origin "$BRANCH" || true
  fi

  BRANCHES+=("$BRANCH")
  start=$(( end + 1 ))
  [ $start -ge $TOTAL ] && break
done

# Open up to MAX_PRS PRs (skip empty)
OPENED=0
for BR in "${BRANCHES[@]}"; do
  ahead=$(git rev-list --left-right --count "origin/$BASE_BRANCH...$BR" | awk '{print $2}')
  [ "${ahead:-0}" -gt 0 ] || { echo "No new commits on $BR, skip PR."; continue; }

  title="Weekly atomic commits – ${BR##*/}"
  body="Auto-created atomic commits (one per file). Labels: ${PR_LABELS}."
  if $DRY_RUN; then
    echo "[DRY_RUN] gh pr create --base $BASE_BRANCH --head $BR --title \"$title\" --body \"$body\" --label \"$PR_LABELS\""
  else
    gh pr create --base "$BASE_BRANCH" --head "$BR" --title "$title" --body "$body" --label "$PR_LABELS"
  fi

  OPENED=$((OPENED+1))
  [ $OPENED -ge $MAX_PRS ] && break
done

echo "Done. Created $COUNT commit(s) across ${#BRANCHES[@]} branch(es)."