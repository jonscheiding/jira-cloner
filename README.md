# JIRA Story-to-Task cloner

This silly project implements a Node app that will use the JIRA API to create a Task based on a Story.  

### Background
Our JIRA process involves creating implementation tasks for stories.  This script makes that easy by getting the data about the story, creating a new task with the relevant fields pre-populated from the story data, and linking the task back to the story.  This is sort of a goofy process, but hey, it was kind of fun to write this script.

## SETUP

1. Create an API token.  You can do this at https://id.atlassian.com/manage/api-tokens.  If you need more detailed instructions, Atlassian has some [here](https://confluence.atlassian.com/cloud/api-tokens-938839638.html).

1. Create a file in the root directory of this project named `.env`, with the following contents:
    ```term
    JIRA_USERNAME=your.jira.username@domain.com
    JIRA_API_TOKEN=your_api_token
    JIRA_BASE_URL=https://your-jira-url.atlassian.net/
    ```

1. Run `yarn install`.

## USAGE

```term
$ yarn start ISSUEKEY-1 ISSUEKEY-2 ISSUEKEY-3
Created task ISSUEKEY-11 for implementation of story ISSUEKEY-1.
Created task ISSUEKEY-12 for implementation of story ISSUEKEY-2.
Created task ISSUEKEY-13 for implementation of story ISSUEKEY-3.
```
