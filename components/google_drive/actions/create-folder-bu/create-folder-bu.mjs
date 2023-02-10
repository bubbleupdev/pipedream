import googleDrive from "../../google_drive.app.mjs";
import { GOOGLE_DRIVE_FOLDER_MIME_TYPE } from "../../constants.mjs";

export default {
  key: "google_drive-create-folder",
  name: "Create Folder BU",
  description: "Create a new empty folder. [See the docs](https://developers.google.com/drive/api/v3/reference/files/create) for more information",
  version: "0.0.38",
  type: "action",
  props: {
    googleDrive,
    drive: {
      propDefinition: [
        googleDrive,
        "watchedDrive",
      ]
    },
    parentId: {
      label      : "Parent Folder ID",
      description: "Select a folder in which to place the new folder. If not specified, the folder will be placed directly in the drive's top-level folder.",
      type       : "string",
    },
    name          : {
      label      : "Name",
      description: "Headliner or Folder Name",
      type       : "string",
    },
    co_headliner_1: {
      label      : "Co-Headliner 1",
      description: "1st Co-Headliner",
      type       : "string",
      optional: true,
    },
    co_headliner_2: {
      label      : "Co-Headliner 2",
      description: "2nd Co-Headliner",
      type       : "string",
      optional: true,
    },
    co_headliner_3: {
      label      : "Co-Headliner 3",
      description: "3rd Co-Headliner",
      type       : "string",
      optional: true,
    },
    co_headliner_4: {
      label      : "Co-Headliner 4",
      description: "4th Co-Headliner",
      type       : "string",
      optional: true,
    },
    year: {
      label      : "Year",
      description: "Year of the project.",
      type       : "string",
      optional: true,
    },
    createIfExists: {
      type: "boolean",
      label: "Create If Exists?",
      description: "If the folder already exists and is not in the trash, should we create it? This option defaults to 'true' for\n        backwards compatibility and to be consistent with default Google Drive behavior.",
      default: true,
    },
  },
  async run({ $ }) {
    const {
      parentId,
      name,
      createIfExists,
      year
    } = this;

    var projectName = name;
    var coHeadliners = [
      this.co_headliner_1,
      this.co_headliner_2,
      this.co_headliner_3,
      this.co_headliner_4,
    ]
    for(let i = 0; i < coHeadliners.length; i++) {
      projectName = concatName(projectName, coHeadliners[i]);
    }
    if(year) {
      projectName = projectName + ' ' + year;
    }

    let folder;
    if (createIfExists === false) {//checking "false" because if this optional prop may not be given
      let folders = await findChildWithinParent(parentId, projectName, this.drive, this.googleDrive);
      for (let f of folders) {
        //console.log(`Folder name checked: ${f.name}`);
        if (f.name === projectName) {
          folder = f;
          //console.log(`Folder name found: ${f.name}`);
          break;
        }
      }
      if (folder) {
        $.export("$summary", "Found existing folder, therefore not creating folder. Returning found folder.");
        return folder;
      }
    }
    console.log(`projectName formed as: "${projectName}"`)
    const resp = await this.googleDrive.createFolder({name,parentId});
    $.export("$summary", "Successfully created a new folder, '" + resp.name + "'");
    return resp;
  },
};

function concatName(projectName, coHeadliner) {
  if(coHeadliner) {
    return projectName + ' | ' + coHeadliner;
  }
  return projectName;
}

async function findChildWithinParent(parentId, childName, drive, googleDrive) {
  console.log(`Looking for ${childName} within ${parentId}`);
  let query = await makeQuery(parentId,childName);
  const getlist = await getListFiles(drive, {q: query,});
  safetyBug(getlist)
  return (await googleDrive.listFilesInPage(null, getlist)).files;
}

async function makeQuery(parentId, childName){
  let nameIncludesDoubleQuote = childName.includes('"');
  let nameIncludesSingleQuote = childName.includes("'");

  if(nameIncludesDoubleQuote && nameIncludesSingleQuote) {
    let adjustedChildName = childName.replace(/"/g, "'");
    return `"${parentId}" in parents and trashed=false and mimeType = "application/vnd.google-apps.folder" and name = "${adjustedChildName}"`;
  } else if(nameIncludesDoubleQuote) {
    return `'${parentId}' in parents and trashed=false and mimeType = 'application/vnd.google-apps.folder' and name = '${childName}'`;
  } else {
    return `"${parentId}" in parents and trashed=false and mimeType = "application/vnd.google-apps.folder" and name = "${childName}"`;
  }
}

async function getListFiles(drive, baseOpts = {}) {
  // Use default options (e.g., `corpora=drive`) for `files.list` if `drive` is
  // empty or is "My Drive". Otherwise, use the "drive" corpus and include
  // `supportsAllDrives` param.
  const opts = {
        ...baseOpts,
        corpora                  : "drive",
        driveId                  : drive,
        includeItemsFromAllDrives: true,
        supportsAllDrives        : true,
      };
  return await opts;
}

function safetyBug(getlist) {
  for(let f of Object.keys(getlist)) {
    console.log(`getlist items - "${f}": ${getlist[f]}`);
  }
}
