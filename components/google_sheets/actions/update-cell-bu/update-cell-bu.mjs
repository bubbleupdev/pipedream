import googleSheets from "../../google_sheets.app.mjs";

const spreadsheetProps = [
  "Talent Buyer",
  "Tour Director",
  "Tour Marketer",
  "Ticketing Director",
  "Rome Tour Booking ID (TOU-000000)"
];

export default {
  key        : "update-cell-bu",
  name       : "Update Cell BU",
  description: "Update a cell in a spreadsheet",
  version    : "0.0.1",
  type       : "action",
  props      : {
    googleSheets,
    sheetId  : {
      propDefinition: [
        googleSheets,
        "sheetID",
        (c) => ({
          driveId: googleSheets.methods.getDriveId(c.drive),
        }),
      ],
      description   : "The spreadsheet containing the worksheet to update",
    },
    sheetName: {
      propDefinition: [
        googleSheets,
        "sheetName",
        (c) => ({
          sheetId: c.sheetId,
        }),
      ],
    },
    sheetValues: {
      type    : "string",
      label   : "Sheet values from prior step",
    },
    talentBuyer      : {
      type    : "string",
      label   : spreadsheetProps[0],
      optional: true,
    },
    tourDirector     : {
      type    : "string",
      label   : spreadsheetProps[1],
      optional: true,
    },
    tourMarketer     : {
      type    : "string",
      label   : spreadsheetProps[2],
      optional: true,
    },
    ticketingDirector: {
      type    : "string",
      label   : spreadsheetProps[3],
      optional: true,
    },
    romeTourBookingID: {
      type    : "string",
      label   : spreadsheetProps[4],
      optional: true,
    },
  },
  async run({$}) {
    var spreadsheetPropValues = [
        this.talentBuyer,
        this.tourDirector,
        this.tourMarketer,
        this.ticketingDirector,
        this.romeTourBookingID,
    ]
    let sheetValues = this.sheetValues;
    var values = [];
    var columnConversion = [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H"
    ];

    function exists(arr, search) {
      return arr.some(row => row.includes(search));
    }

    function multidimentionalForSearchLoop(propItem) {
      for(let i = 0; i < sheetValues?.length; i++) {
        for(let j = 0; j < sheetValues[i]?.length; j++) {
          if(sheetValues[i][j] === propItem) {
            let row = i + 1;
            let oneColumnToTheRight = columnConversion[j + 1];
            let cellForNewValue = oneColumnToTheRight + row;
            values.push([
              propItem,
              cellForNewValue
            ]);
          }
        }
      }
    }

    for(let i = 0; i < spreadsheetProps?.length; i++) {
      if(exists(sheetValues, spreadsheetProps[i])) {
        multidimentionalForSearchLoop(spreadsheetProps[i]);
      }
    }
    var updatingValueAndCells = [];
    $.export("$summary", values);
    for(let i = 0; i < values?.length; i++) {
      updatingValueAndCells.push({value: spreadsheetPropValues[i], cell: values[i][1]});
      const request = {
        spreadsheetId   : this.sheetId,
        range           : `${this.sheetName}!${values[i][1]}:${values[i][1]}`,
        valueInputOption: "USER_ENTERED",
        resource        : {
          values: [
            [
              spreadsheetPropValues[i],
            ],
          ],
        },
      };
      await this.googleSheets.updateSpreadsheet(request);
    }
    return "Updated: " + JSON.stringify(updatingValueAndCells);
  },
};
