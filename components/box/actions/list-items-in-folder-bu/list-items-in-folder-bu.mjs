import app from "../../box.app.mjs";
import axios from "axios";

export default {
	name       : "List items in folder (BU)",
	version    : "0.0.2",
	key        : "list-items-in-folder-bu",
	description: "List items in a given folder",
	type       : "action",
	props      : {
		box           : {
			type: "app",
			app : "box",
		},
		folderId: {
			type       : "string",
			label      : "Folder ID",
			description: "Box folder ID",
		}
	},
	methods    : {},
	async run({steps, $}) {
		var apiResult = await makeApiCall($, this);
		return apiResult.data;
	},
};

async function makeApiCall($, step) {
	return await axios({
		method        : 'get',
		url           : `https://api.box.com/2.0/folders/${step.folderId}/items`,
		headers       : {
			"Authorization": `Bearer ${step.box.$auth.oauth_access_token}`,
			"Content-Type" : "application/json",
			"Accept"       : "application/json",
			"User-Agent"   : "@PipedreamHQ/pipedream v0.1",
		},
	});
}
