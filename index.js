import URL from 'url';
import 'dotenv/config';
import requestPromise from 'request-promise';

const { JIRA_USERNAME, JIRA_API_TOKEN, JIRA_BASE_URL } = process.env;

const request = requestPromise.defaults({
  auth: {
    user: JIRA_USERNAME,
    pass: JIRA_API_TOKEN
  },
  baseUrl: JIRA_BASE_URL,
  headers: [
    { name: 'content-type', value: 'application/json' }
  ],
  json: true
});

const STORY_POINTS = 'customfield_10005';
const EPIC_LINK = 'customfield_10009';

const createImplementationTask = async issueKey => {
  const story = await request(`issue/${issueKey}`);
  if(story.fields.issuetype.name !== 'Story') {
    throw new Error(`Issue ${issueKey} is a ${story.fields.issueType.name}, expected it to be a Story.`);
  }

  const createBody = {
    fields: {
      issuetype: {
        id: 10002 // TASK
      },
      project: {
        id: story.fields.project.id
      },
      summary: story.fields.summary,
      description: `Implementation task for ${issueKey}`,
      fixVersions: story.fields.fixVersions.map(fixVersion => ({id: fixVersion.id})),
      [EPIC_LINK]: story.fields[EPIC_LINK],
      [STORY_POINTS]: story.fields[STORY_POINTS],
    }
  };

  const task = await request('issue', {
    method: 'POST',
    body: createBody
  });

  await request('issueLink', {
    method: 'POST',
    body: {
      type: {
        id: 10300 // CAUSES / IS CAUSED BY
      },
      inwardIssue: {
        id: story.id
      },
      outwardIssue: {
        id: task.id
      }
    }
  });

  return task.key;
};

const createImplementationTasks = async storyKeys => {
  for (const storyKey of storyKeys) {
    const taskKey = await createImplementationTask(storyKey);
    console.log(`Created task ${taskKey} for implementation of story ${storyKey}.`);
  }
};

createImplementationTasks(process.argv.slice(2));
