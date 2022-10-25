import app from "../../box.app.mjs";
import axios from "axios";

export default {
  name: "Copy Folder BU",
  version: "0.0.1",
  key: "copy-folder-bu",
  description: "Copy a folder. [See the docs here](https://developer.box.com/reference/post-folders-id-copy/)",
  type: "action",
  props: {
    box: {
      type: "app",
      app : "box",
    },
    templateFolderId: {
      type: "string",
      label: "Template folder ID",
      description: "The unique identifier of the folder to copy.",
    },
    parentFolderId: {
      type: "string",
      label: "New parent folder ID",
      description: "The destination folder to copy the folder to.",
    },
    newFolderName: {
      type: "string",
      label: "New folder Name",
      description: "An new name for the copied folder.",
    }
  },
  methods: {},
  async run({steps, $}) {
    var apiResult = await makeApiCall($, this);
    var folderExists = apiResult.data.code === "item_name_in_use";
    if(folderExists){
      return apiResult.data.context_info.conflicts;
    }else{
      return apiResult.data;
    }
  },

};

async function makeApiCall($,step){
  return await axios({
    method : 'post',
    url    : `https://api.box.com/2.0/folders/${step.templateFolderId}/copy`,
    headers: {
      "Authorization": `Bearer ${step.box.$auth.oauth_access_token}`,
      "Content-Type" : "application/json",
      "Accept"       : "application/json",
      "User-Agent"   : "@PipedreamHQ/pipedream v0.1",
    },
    data   : {
      parent: {
        id: `${step.parentFolderId}`
      },
      name  : `${step.newFolderName}`
    },
    validateStatus: function(status) {
      return status >= 200 || status == 409; // 409 means folder name already exists
    },
  })
}
