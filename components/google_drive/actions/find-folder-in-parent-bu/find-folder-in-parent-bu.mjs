import googleDrive from "../../google_drive.app.mjs";
import {
	toSingleLineString,
} from "../../utils.mjs";

import {GOOGLE_DRIVE_FOLDER_MIME_TYPE} from "../../constants.mjs";

export default {
	key        : "google_drive-find-folder",
	name       : "Find Folder BU",
	description: "Find a folder. [See the docs](https://developers.google.com/drive/api/v3/reference/files/create) for more information",
	version    : "0.0.1",
	type       : "action",
	props      : {
		googleDrive,
		parentId      : {
			label      : "Parent Folder ID",
			description: "Select a folder in which to place the new folder. If not specified, the folder will be placed directly in the drive's top-level folder.",
			type       : "string",
		},
		name          : {
			label      : "Name",
			description: "The name of the new folder",
			type       : "string",
		},
	},
	async run({$}) {
		const {
			parentId,
			name,
		} = this;
		let childFolder = findChildWithinParent(parentId, name);
		console.log(`Found childFolder: ${childFolder}`);
		return childFolder;
	}
}
function findChildWithinParent(parentId, childName){
	console.log(`Looking for ${childName} within ${parentId}`);
	return 'It Works!';
}
