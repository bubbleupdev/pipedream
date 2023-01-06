import app from "../../box.app.mjs";
import axios from "axios";

export default {
	name       : "Create Folder BU",
	version    : "0.0.3",
	key        : "Create-folder-BU",
	description: "Create a folder. [See the docs here](https://developer.box.com/reference/post-folders/)",
	type       : "action",
	props      : {
		box           : {
			type: "app",
			app : "box",
		},
		parentFolderId: {
			type       : "string",
			label      : "New parent folder ID",
			description: "The destination folder to copy the folder to.",
		},
		newFolderName : {
			type       : "string",
			label      : "New folder Name",
			description: "An new name for the copied folder.",
		}
	},
	methods    : {},
	async run({steps, $}) {
		var apiResult = await makeApiCall($, this);
		var folderExists = apiResult.data.code === "item_name_in_use";
		if(folderExists) {
			return apiResult.data.context_info.conflicts[0];
		} else {
			return apiResult.data;
		}
	},
};

async function makeApiCall($, step) {
	return await axios({
		method        : 'post',
		url           : `https://api.box.com/2.0/folders`,
		headers       : {
			"Authorization": `Bearer ${step.box.$auth.oauth_access_token}`,
			"Content-Type" : "application/json",
			"Accept"       : "application/json",
			"User-Agent"   : "@PipedreamHQ/pipedream v0.1",
		},
		data          : {
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
