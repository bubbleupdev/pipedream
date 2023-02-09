import app from "../../box.app.mjs";
import axios from "axios";

export default {
	name       : "Create Folder BU",
	version    : "0.0.5",
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
		},
		name          : {
			label      : "Artist Name",
			description: "Headliner",
			type       : "string",
		},
		co_headliner_1: {
			label      : "Co-Headliner 1",
			description: "1st Co-Headliner",
			type       : "string",
		},
		co_headliner_2: {
			label      : "Co-Headliner 2",
			description: "2nd Co-Headliner",
			type       : "string",
		},
		co_headliner_3: {
			label      : "Co-Headliner 3",
			description: "3rd Co-Headliner",
			type       : "string",
		},
		co_headliner_4: {
			label      : "Co-Headliner 4",
			description: "4th Co-Headliner",
			type       : "string",
		},
	},
	methods    : {},
	async run({steps, $}) {
		let projectName = this.name;
		let coHeadliners = [
			this.co_headliner_1,
			this.co_headliner_2,
			this.co_headliner_3,
			this.co_headliner_4,
		]
		for(let i = 0; i < coHeadliners.length; i++) {
			projectName = concatName(projectName, coHeadliners[i]);
		}

		var apiResult = await makeApiCall($, this, projectName);
		var folderExists = apiResult.data.code === "item_name_in_use";
		if(folderExists) {
			return apiResult.data.context_info.conflicts[0];
		} else {
			return apiResult.data;
		}
	},
};

function concatName(projectName, coHeadliner) {
	if(coHeadliner) {
		return projectName + ' / ' + coHeadliner;
	}
	return projectName;
}

async function makeApiCall($, step, projectName) {
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
			name  : `${projectName}`
		},
		validateStatus: function(status) {
			return status >= 200 || status == 409; // 409 means folder name already exists
		},
	})
}
