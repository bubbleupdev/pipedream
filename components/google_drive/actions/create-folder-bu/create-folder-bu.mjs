import googleDrive from "../../google_drive.app.mjs";
import {
  getListFilesOpts,
  toSingleLineString,
} from "../../utils.mjs";

import { GOOGLE_DRIVE_FOLDER_MIME_TYPE } from "../../constants.mjs";

export default {
  key: "google_drive-create-folder",
  name: "Create Folder BU",
  description: "Create a new empty folder. [See the docs](https://developers.google.com/drive/api/v3/reference/files/create) for more information",
  version: "0.0.16",
  type: "action",
  props: {
    googleDrive,
    drive: {
      propDefinition: [
        googleDrive,
        "watchedDrive",
      ],
      optional: true,
    },
    parentId: {
      propDefinition: [
        googleDrive,
        "folderId",
        (c) => ({
          drive: c.drive,
        }),
      ],
      description:
        "Select a folder in which to place the new folder. If not specified, the folder will be placed directly in the drive's top-level folder.",
      optional: true,
    },
    name: {
      propDefinition: [
        googleDrive,
        "fileName",
      ],
      label: "Name",
      description: "The name of the new folder",
      optional: true,
    },
    createIfExists: {
      type: "boolean",
      label: "Create If Exists?",
      description: toSingleLineString(`
        If the folder already exists and is not in the trash, should we create it? This option defaults to 'true' for
        backwards compatibility and to be consistent with default Google Drive behavior. 
      `),
      optional: true,
      default: true,
    },
  },
  async run({ $ }) {
    const {
      parentId,
      name,
      createIfExists,
    } = this;
    let folder;
    if (createIfExists == false) {//checking "false" because if this optional prop may not be given
      let nameIncludesDoubleQuote = name.includes('"');
      let nameIncludesSingleQuote = name.includes("'");
      var folders;
      if(nameIncludesDoubleQuote && nameIncludesSingleQuote){
        let adjustedName = name.replace(/"/g, "'");
        folders = (await this.googleDrive.listFilesInPage(null, getListFilesOpts(this.parentId,{q: `mimeType = "${GOOGLE_DRIVE_FOLDER_MIME_TYPE}" and name contains "${adjustedName}" and trashed=false`.trim(),}))).files;
      } else if(nameIncludesDoubleQuote){
        folders = (await this.googleDrive.listFilesInPage(null, getListFilesOpts(this.parentId, {q: `mimeType = '${GOOGLE_DRIVE_FOLDER_MIME_TYPE}' and name contains '${name}' and trashed=false`.trim(),}))).files;
      } else {
        folders = (await this.googleDrive.listFilesInPage(null, getListFilesOpts(this.parentId,{q: `mimeType = "${GOOGLE_DRIVE_FOLDER_MIME_TYPE}" and name contains "${name}" and trashed=false`.trim(),}))).files;
      }
      for (let f of folders) {
        if (f.name == name) {
          folder = f;
          break;
        }
      }
      if (folder) {
        $.export("$summary", "Found existing folder, therefore not creating folder. Returning found folder.");
        const folderDetails = await this.parentId.getFile(folder.id);

        return folderDetails;
      }
    }
    const resp = await this.googleDrive.createFolder({
      name,
      parentId,
    });
    $.export("$summary", "Successfully created a new folder, '" + resp.name + "'");
    return resp;
  },
};
