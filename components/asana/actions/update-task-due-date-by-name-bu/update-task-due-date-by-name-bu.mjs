import asana from "../../asana.app.mjs";

export default {
	name       : "Update Task Due Date By Name BU",
	version    : "0.0.2",
	key        : "update-task-due-date-by-name-bu",
	description: "Custom built to update tasks returned from get_all_project_tasks step",
	props      : {
      asana,
      name                      : {
          label      : "Name",
          description: "Name of the task.",
          type       : "string",
      },
      due_on                    : {
          label      : "Due On",
          description: "Due date from from submission.",
          type       : "string",
      },
      get_all_project_tasks_data: {
          label      : "Data from get_all_project_tasks step",
          description: "Example: {{steps.get_all_tasks_in_project_bu.$return_value}}",
          type       : "string",
      },
	},
	type       : "action",
	methods    : {},
	async run({$}) {
		const taskGid = getTaskGid(this, $);
        const formattedDueDate = formatDueDate(this.due_on);
		const response = await this.asana._makeRequest(`tasks/${taskGid}`, {
			method: "put",
			data  : {
				data: {
					due_on: formattedDueDate,
				},
			},
		}, $);

		return response;
	},
};

function formatDueDate(dueOn){
  // given "Feb 01, 2023"
  // output should be YYYY-MM-DD
  var d = new Date(dueOn),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if(month.length < 2)
    month = '0' + month;
  if(day.length < 2)
    day = '0' + day;

  return [year,month,day].join('-');
}

function getTaskGid(step, $) {
	for(let t = 0; t < step.get_all_project_tasks_data.length; t++) {
		if(step.name === step.get_all_project_tasks_data[t].name) {
			return step.get_all_project_tasks_data[t].gid;
		}
	}
	return "";
}
