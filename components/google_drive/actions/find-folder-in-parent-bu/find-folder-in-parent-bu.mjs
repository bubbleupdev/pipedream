import googleDrive from "../../google_drive.app.mjs";
import {
	toSingleLineString,
} from "../../utils.mjs";

import {GOOGLE_DRIVE_FOLDER_MIME_TYPE} from "../../constants.mjs";

export default {
	key        : "google_drive-find-folder",
	name       : "Find Folder BU",
	description: "Find a folder. [See the docs](https://developers.google.com/drive/api/v3/reference/files/create) for more information",
	version    : "0.0.6",
	type       : "action",
	props      : {
		googleDrive,
		drive: {
			propDefinition: [
				googleDrive,
				"watchedDrive",
			],
			optional      : true,
		},
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
		let childFolder = await findChildWithinParent(parentId, name,this.drive,this.googleDrive);
		console.log(`Found childFolder: ${childFolder}`);
		return childFolder;
	}
}

async function findChildWithinParent(parentId, childName, drive, googleDrive)
{
	console.log(`Looking for ${childName} within ${parentId}`);
	const query = `"${parentId}" in parents and trashed=false and mimeType = "application/vnd.google-apps.folder" and name = "${childName}"`;
	const getlist = getListFiles(drive, {q: query,});
	safetyBug(getlist)
	let folders = (await googleDrive.listFilesInPage(null, getlist)).files;
	return folders;
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

function safetyBug(getlist){
	for(let f of Object.keys(getlist)) {
		console.log(`getlist: ${f} - ${getlist[f]}`);
	}
}
