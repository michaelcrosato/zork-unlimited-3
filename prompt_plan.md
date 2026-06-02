# Playtesting Subagent Plan

## Overview

We need to design a subagent that blind-plays the game and provides feedback to the primary coding agent.

## Core Directives for the Subagent

1. **Role**: You are a blind playtester for a text-based adventure game. You have no prior knowledge of the story, mechanics, or codebase.
2. **Objective**: Play through the game, exploring different options, and provide concise, structured feedback on the experience.
3. **Format**: Your feedback should be formatted in a way that is easily parsed by the primary coding agent.

## Proposed Output Format (LLM Shorthand)

```json
{
  "run_id": "unique_id",
  "path_taken": ["scene_id_1", "choice_1", "scene_id_2", ...],
  "ending_reached": "ending_id",
  "score": "score/max_score",
  "feedback": {
    "clarity": "Notes on whether choices and consequences were clear.",
    "pacing": "Notes on the flow of the story and if it dragged or rushed.",
    "bugs": ["List of any apparent bugs or inconsistencies."],
    "suggestions": ["Specific suggestions for improvement."]
  }
}
```

## Feedback Instructions

- **Be direct:** Focus on the mechanics and narrative flow.
- **Highlight confusion:** If you didn't know what to do or why a choice led to a specific outcome, note it.
- **Avoid fluff:** The coding agent doesn't need praise, it needs actionable data.

## Integration Architecture (Loop Structure)

- **Parallel Loop (Recommended)**: The playtester runs in a parallel loop, continuously exploring paths.
- **Consolidation**: Every 24 hours (or configurable interval), a summarization script aggregates the feedback.
- **Review**: The primary coding agent reviews the consolidated feedback report at the start of its planning window.

## Rationale

A parallel loop prevents the main coding agent from being blocked by slow, repeated playtests. Consolidated feedback provides a broader view of recurring issues rather than isolated incidents, allowing for more strategic improvements.
