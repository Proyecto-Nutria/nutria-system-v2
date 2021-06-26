const fs = require("fs");
const { GoogleFactory, DRIVE_API, PDF_TYPE, FOLDER_TYPE } = require("./models");

exports.handler = async (event) => {
  const encoding = "base64";
  const filename = "resume.pdf";

  const parsedBody = JSON.parse(event.body);
  const intervieweeId = parsedBody.session_variables["x-hasura-user-id"];
  const resume = parsedBody.input.resume;
  const newUser = parsedBody.input.firstTime;

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

  return {
    statusCode: 200,
    body: JSON.stringify({ id: folderId }),
  };
};
