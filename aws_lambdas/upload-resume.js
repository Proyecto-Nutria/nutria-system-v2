const request = require("request-promise");
const fs = require("fs");

const { GoogleFactory, DRIVE_API, PDF_TYPE, FOLDER_TYPE } = require("./models");

exports.handler = async (event) => {
  const encoding = "base64";
  const filename = "resume.pdf";

  const parsedBody = JSON.parse(event.body);
  const intervieweeId = parsedBody.session_variables["x-hasura-user-id"];
  const resume = parsedBody.input.resume;
  const newUser = parsedBody.input.firstTime;
  const school = parsedBody.input.school;

  const user_role = parsedBody.session_variables["x-hasura-role"];
  const user_id = parsedBody.session_variables["x-hasura-user-id"];

  const adminSecret = process.env.ACCESS_KEY;
  const url = process.env.HASURA_URL;

  const fileBuffer = Buffer.from(resume, encoding);
  const path = `/tmp/${filename}`;

  try {
    fs.writeFileSync(path, fileBuffer, encoding);
  } catch (_error) {
    return { statusCode: 422 };
  }

  const driveAPI = new GoogleFactory(DRIVE_API);
  let folderId = "";
  if (newUser) {
    folderId = await driveAPI.createResource(intervieweeId, FOLDER_TYPE);
  } else {
    folderId = await driveAPI.getResourceId(FOLDER_TYPE, intervieweeId);
  }

  const readStream = fs.createReadStream(path);
  await driveAPI.createResource(filename, PDF_TYPE, folderId, readStream);

  const newUserMutation = `mutation createInterviewee($information: interviewees_insert_input!) {
    insert_interviewees_one(object: $information) {
      school
    }
  }`;
  const updateUserMutation = `mutation updateInterviewee($school: interviewee_school_enum!) {
    update_interviewees(where: {}, _set: { school: $school }) {
      returning {
        school
      }
    }
  }`;

  const userHeader = {
    "content-type": "application/json",
    "x-hasura-admin-secret": adminSecret,
    "x-hasura-role": user_role,
    "x-hasura-user-id": user_id,
  };

  const newUserOptions = {
    headers: userHeader,
    url: url,
    body: JSON.stringify({
      query: newUserMutation,
      variables: {
        information: {
          folder: folderId,
          school: school,
        },
      },
    }),
  };
  const updateUserOptions = {
    headers: userHeader,
    url: url,
    body: JSON.stringify({
      query: updateUserMutation,
      variables: {
        school: school,
      },
    }),
  };

  const options = newUser ? newUserOptions : updateUserOptions;

  await request.post(options, (error, _response, _body) => {
    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ result: 500 }),
      };
    }
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ result: 200 }),
  };
};
