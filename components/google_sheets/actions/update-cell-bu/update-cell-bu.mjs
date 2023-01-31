import googleSheets from "../../google_sheets.app.mjs";

const spreadsheetProps = [
	"Event Name ",
	"Tour Marketer",
	"Rome Tour Marketing ID (TOU-000000)"
];

export default {
	key        : "update-cell-bu",
	name       : "Update Cell BU",
	description: "Update a cell in a spreadsheet",
	version    : "0.0.15",
	type       : "action",
	props      : {
		googleSheets,
		sheetId            : {
			propDefinition: [
				googleSheets,
				"sheetID",
				(c) => ({
					driveId: googleSheets.methods.getDriveId(c.drive),
				}),
			],
			description   : "The spreadsheet containing the worksheet to update",
		},
		sheetName          : {
			propDefinition: [
				googleSheets,
				"sheetName",
				(c) => ({
					sheetId: c.sheetId,
				}),
			],
		},
		sheetValues        : {
			type : "string",
			label: "Sheet values from prior step",
		},
		name               : {
			label      : "Artist Name",
			description: "Headliner",
			type       : "string",
		},
		co_headliner_1     : {
			label      : "Co-Headliner 1",
			description: "1st Co-Headliner",
			type       : "string",
		},
		co_headliner_2     : {
			label      : "Co-Headliner 2",
			description: "2nd Co-Headliner",
			type       : "string",
		},
		co_headliner_3     : {
			label      : "Co-Headliner 3",
			description: "3rd Co-Headliner",
			type       : "string",
		},
		co_headliner_4     : {
			label      : "Co-Headliner 4",
			description: "4th Co-Headliner",
			type       : "string",
		},
		year               : {
			label      : "Year",
			description: "Year of the project.",
			type       : "string",
		},
		tourMarketer       : {
			type : "string",
			label: spreadsheetProps[1],
		},
		romeTourMarketingID: {
			type    : "string",
			label   : spreadsheetProps[2],
			optional: true,
		},
	},
	async run({$}) {
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
		projectName = projectName + ' ' + this.year;

		var spreadsheetPropValues = [
			projectName,
			this.tourMarketer,
			this.romeTourMarketingID
		]
		let sheetValues = this.sheetValues;

		var sheetValueReplacements = [];
		for(let i = 0; i < spreadsheetProps?.length; i++) {
			if(spreadsheetPropValues[i] && typeof spreadsheetPropValues[i] !== 'undefined' && exists(sheetValues, spreadsheetProps[i])) {
				sheetValueReplacements.push(multidimentionalForSearchLoop(spreadsheetProps[i], sheetValues, spreadsheetProps[0]));
			}
		}

		var updatingValueAndCells = [];
		$.export("$summary", sheetValueReplacements);
		for(let i = 0; i < sheetValueReplacements?.length; i++) {
			updatingValueAndCells.push({value: spreadsheetPropValues[i], cell: sheetValueReplacements[i][1]});
			const request = {
				spreadsheetId   : this.sheetId,
				range           : `${this.sheetName}!${sheetValueReplacements[i][1]}:${sheetValueReplacements[i][1]}`,
				valueInputOption: "USER_ENTERED",
				resource        : {
					values: [
						[
							spreadsheetPropValues[i],
						],
					],
				},
			};
			//await this.googleSheets.updateSpreadsheet(request);
		}
		return "Updated: " + JSON.stringify(updatingValueAndCells);
	},
};

function concatName(projectName, coHeadliner) {
	if(coHeadliner) {
		return projectName + ' / ' + coHeadliner;
	}
	return projectName;
}

function exists(arr, search) {
	return arr.some(row => row.includes(search));
}

function multidimentionalForSearchLoop(propItem, sheetValues, existingSheetEventNameCellText) {
	let columnConversion = ["A", "B", "C", "D", "E", "F", "G", "H"];
	for(let i = 0; i < sheetValues?.length; i++) {
		for(let j = 0; j < sheetValues[i]?.length; j++) {
			if(sheetValues[i][j] === propItem) {
				let row = i + 1;
				let columnForNewValue;
				// DEPENDANT IF
				if(propItem === existingSheetEventNameCellText) {
					console.log("multidimentionalForSearchLoop > sheetValues[i][j] : '" + sheetValues[i][j] + "'");
					// Replacing same cell
					columnForNewValue = columnConversion[0];
				} else {
					console.log("multidimentionalForSearchLoop > sheetValues[i][j] : '" + sheetValues[i][j] + "'");
					// Moving one column to the right
					columnForNewValue = columnConversion[j + 1];
				}
				let cellForNewValue = columnForNewValue + row;
				console.log("multidimentionalForSearchLoop > propItem : '" + propItem + "'");
				console.log("multidimentionalForSearchLoop > cellForNewValue : '" + cellForNewValue + "'");

				return [propItem, cellForNewValue];
			}
		}
	}
}
