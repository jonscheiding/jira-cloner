import URL from 'url';
import 'dotenv/config';
import requestPromise from 'request-promise';

const { JIRA_USERNAME, JIRA_API_TOKEN, JIRA_BASE_URL } = process.env;
const STORY_POINTS_FIELD = 'customfield_10005';
const EPIC_LINK_FIELD = 'customfield_10009';
const TASK_ISSUETYPE_ID = 10002;
const CAUSES_LINK_TYPE_ID = 10300;

const request = requestPromise.defaults({
  auth: {
    user: JIRA_USERNAME,
    pass: JIRA_API_TOKEN
  },
  baseUrl: URL.resolve(JIRA_BASE_URL, '/rest/api/2/').toString(),
  json: true
});

const createImplementationTaskForStory = async issueKey => {
  const story = await request(`issue/${issueKey}`);
  switch(story.fields.issuetype.name) {
    case 'Story':
    case 'Bug':
      break;
    default:
      throw new Error(`Issue ${issueKey} is a ${story.fields.issueType.name}, expected it to be a Story or a Bug.`);
  }

  const createTaskRequestBody = {
    fields: {
      issuetype: {
        id: TASK_ISSUETYPE_ID
      },
      project: {
        id: story.fields.project.id
      },
      summary: story.fields.summary,
      description: `Implementation task for ${issueKey}`,
      fixVersions: story.fields.fixVersions.map(fixVersion => ({id: fixVersion.id})),
      [EPIC_LINK_FIELD]: story.fields[EPIC_LINK_FIELD],
      [STORY_POINTS_FIELD]: story.fields[STORY_POINTS_FIELD],
    }
  };

  const createdTask = await request('issue', 
    { method: 'POST', body: createTaskRequestBody });

  const createIssueLinkRequestBody = {
    inwardIssue: { id: story.id },
    type: { id: CAUSES_LINK_TYPE_ID },
    outwardIssue: { id: createdTask.id }  
  };

  await request('issueLink', 
    { method: 'POST', body: createIssueLinkRequestBody });

  return createdTask.key;
};

const createImplementationTasksForStories = async storyKeys => {
  for (const storyKey of storyKeys) {
    const taskKey = await createImplementationTaskForStory(storyKey);
    console.log(`Created task ${taskKey} for implementation of story ${storyKey}.`);
  }
};

createImplementationTasksForStories(process.argv.slice(2));
