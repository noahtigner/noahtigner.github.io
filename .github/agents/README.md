# GitHub Copilot Agents

This directory contains custom agent specifications for GitHub Copilot. These agents provide specialized assistance for specific tasks in this repository.

## Available Agents

### Article Reviewer (`article-reviewer.md`)

An expert technical writing editor specialized for reviewing blog articles on this site. This agent:

- **Analyzes writing style** based on existing articles in the repository
- **Ensures consistency** in tone, tense, and voice
- **Fixes errors** including typos, grammar, punctuation, and awkward phrasing
- **Validates markdown** syntax and structure
- **Performs basic fact-checking** on technical claims
- **Calculates reading time** based on word count

#### How to Use

1. **In GitHub Copilot Chat**, reference the agent when reviewing an article:
   ```
   @workspace /agent article-reviewer Review this article: src/assets/articles/my-article.md
   ```

2. **For new articles**, ask the agent to review before publishing:
   ```
   Review my new article at src/assets/articles/new-article.md using the article-reviewer agent
   ```

3. **For targeted reviews**, ask for specific checks:
   ```
   @workspace Check tone and tense consistency in src/assets/articles/my-article.md using article-reviewer
   ```

#### What the Agent Does

✅ **Light touch editing** - fixes clear errors while preserving your voice  
✅ **Consistency checks** - ensures tone, tense, and style match your other articles  
✅ **Grammar and typos** - catches spelling, punctuation, and grammatical issues  
✅ **Markdown validation** - checks frontmatter, links, code blocks, and formatting  
✅ **Reading time calculation** - uses `wc` to calculate and update `minutesToRead`  

#### What the Agent Doesn't Do

❌ **Large rewrites** - preserves your writing style and technical approach  
❌ **Content changes** - doesn't add or remove significant content  
❌ **Style changes** - doesn't alter your voice to be more/less formal  
❌ **Deep fact-checking** - flags questionable claims but doesn't verify everything  

#### Review Philosophy

The agent follows a "light touch" approach:
- **Fix** obvious errors (typos, grammar, broken links)
- **Preserve** your unique voice and phrasing
- **Flag** larger issues that need your input
- **Maintain** consistency across articles

#### Typical Review Process

1. **Initial read** - understand the article's context
2. **Systematic review** - check tone, grammar, markdown, facts
3. **Light edits** - make minimal corrections
4. **Calculate reading time** - update if needed
5. **Summary** - report changes and flagged issues

## Adding New Agents

To add a new agent:

1. Create a new markdown file in this directory (e.g., `my-agent.md`)
2. Write the agent specification following this structure:
   - Agent description and role
   - Guidelines and constraints
   - Examples of good/bad behavior
   - Step-by-step processes
3. Update this README with usage instructions
4. Test the agent with real examples

## Notes

- Agents are written in markdown for readability
- Each agent should have a clear, focused purpose
- Include examples to illustrate expected behavior
- Keep agents updated as conventions evolve
