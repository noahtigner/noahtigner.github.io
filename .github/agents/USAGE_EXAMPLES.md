# Article Reviewer Agent - Usage Examples

This document provides practical examples of how to use the article-reviewer agent with GitHub Copilot.

## Prerequisites

- GitHub Copilot installed and configured
- Access to GitHub Copilot Chat
- This repository open in your editor (VS Code, etc.)

## Basic Usage

### Review an Entire Article

```
@workspace Review src/assets/articles/my-new-article.md using the article-reviewer agent
```

The agent will:
1. Read through the entire article
2. Check tone, tense, grammar, and markdown
3. Calculate reading time
4. Make light edits for obvious errors
5. Flag any issues that need your attention
6. Provide a summary of changes

### Quick Grammar Check

```
@workspace Check for typos and grammar issues in src/assets/articles/my-article.md
```

### Verify Markdown Syntax

```
@workspace Validate the markdown syntax in src/assets/articles/my-article.md
```

### Update Reading Time

```
@workspace Calculate and update the reading time for src/assets/articles/my-article.md
```

## Advanced Usage

### Review Multiple Articles

```
@workspace Review all articles in src/assets/articles/ for consistency
```

### Check Tone Consistency

```
@workspace Compare the tone of src/assets/articles/new-article.md with existing articles
```

### Validate External Links

```
@workspace Check that all external links in src/assets/articles/my-article.md are valid
```

## Expected Output

When you use the agent, expect responses like:

```
I've reviewed your article. Here's what I found:

✅ Changes Made:
- Fixed 3 typos
- Corrected 2 punctuation issues
- Updated reading time from 8 to 9 minutes
- Fixed one broken markdown link

⚠️ Issues Flagged:
- Line 45: Technical claim about React 19 might need verification
- Tone shifts from first-person to third-person in section 3

📊 Article Stats:
- Word count: 1,842 words
- Reading time: 9 minutes (updated)
- Links checked: 15 external, 3 internal
```

## Tips for Best Results

1. **Be Specific**: Tell the agent exactly what you want reviewed
2. **One Article at a Time**: For detailed reviews, focus on one article
3. **Review Before Publishing**: Use the agent as a pre-publish checklist
4. **Iterate**: If the agent flags issues, fix them and review again
5. **Trust But Verify**: The agent is helpful but not infallible

## Common Scenarios

### Scenario 1: New Article Pre-Publish

```
I've just finished writing a new article about React Server Components.
Please review src/assets/articles/react-server-components.md using the
article-reviewer agent and let me know if it's ready to publish.
```

### Scenario 2: Update Existing Article

```
I've made significant updates to src/assets/articles/database-internals-chapter-2.md.
Please check that the tone remains consistent and update the reading time.
```

### Scenario 3: Batch Consistency Check

```
I want to ensure all my articles have consistent formatting. Please review
the markdown syntax across all articles in src/assets/articles/ and flag
any inconsistencies.
```

## What to Do With Flagged Issues

When the agent flags an issue:

1. **Review the Context**: Read the surrounding text
2. **Make a Decision**: Keep, edit, or remove
3. **Apply Changes**: Edit the file directly
4. **Re-review if Needed**: Ask the agent to check again

## Limitations

The agent:
- ❌ Cannot edit files directly (you must make changes)
- ❌ May not catch all technical inaccuracies
- ❌ Cannot verify all external links are current
- ❌ Cannot run the site to verify changes visually
- ✅ Provides guidance and catches most common issues

## Troubleshooting

**Agent isn't finding issues I know exist:**
- Be more specific in your request
- Point out the specific section or line

**Agent is suggesting changes I disagree with:**
- Remember, it's just suggestions - you're the author
- The agent aims for consistency, but your judgment is final

**Reading time seems off:**
- The agent uses 200 WPM as a baseline
- You can adjust manually if the content is particularly dense or light

## Getting Help

If you have questions about using the agent:
1. Check this document first
2. Read the agent specification in `article-reviewer.md`
3. Experiment with different prompts
4. Adjust the agent spec if needed for your evolving style

---

Remember: The article-reviewer agent is a tool to help maintain consistency and quality, but you're always the final decision-maker for your content!
