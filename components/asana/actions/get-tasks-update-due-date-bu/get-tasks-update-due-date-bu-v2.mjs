import asana from "../../asana.app.mjs";

export default {
	name       : "Get Tasks Update Due Date BU",
	version    : "0.0.1",
	key        : "get-tasks-update-due-date-bu",
	description: "",
	props      : {
		asana,
		project_gid      : {
			label      : "Project gid",
			description: "gid of the project.",
			type       : "string",
		},
		announce_due_on  : {
			label      : "Announcement Due Date",
			description: "Due date from from submission.",
			type       : "string",
		},
		on_sale_due_on   : {
			label      : "On Sale Due Date",
			description: "Due date from from submission.",
			type       : "string",
		},
		first_show_due_on: {
			label      : "First Show Due Date",
			description: "Due date from from submission.",
			type       : "string",
		},
	},
	type       : "action",
	methods    : {},
	async run({$}) {
		const announceDueDate = formatDueDate(this.announce_due_on);
		const onSaleDueDate = formatDueDate(this.on_sale_due_on);
		const firstShowDueDate = formatDueDate(this.first_show_due_on);

		const tasksToBeUpdated = [
			["Announce", announceDueDate],
			["Onsale", onSaleDueDate],
			["First Show", firstShowDueDate],
			["PR - Tour Announce", announceDueDate],
			["Email Support", announceDueDate],
			["Social Support - Tour Announce", announceDueDate],
			["LN Website Carousel", announceDueDate],
			["LN Newsletter", announceDueDate],
		];
		let updatedData = [];

		for(let t = 0; t < tasksToBeUpdated.length; t++) {
			let taskData = {};
			let taskGid = await returnGidIfTaskCreated($, this, tasksToBeUpdated[t][0]);
			if(taskGid === undefined) {
				taskData.data = `${tasksToBeUpdated[t][0]} task not found after waiting 10+ seconds. ${tasksToBeUpdated[t][0]} due date not updated.`;
			} else {
				taskData = await updateTaskDueDate($, this, taskGid, tasksToBeUpdated[t][1]);
			}
			updatedData.push(taskData);
		}
		return updatedData;
	},
};

async function updateTaskDueDate($, step, taskGid, formattedDueDate) {
	const response = await step.asana._makeRequest(`tasks/${taskGid}`, {
		method: "put",
		data  : {
			data: {
				due_on: formattedDueDate,
			},
		},
	}, $);
	return response;
}

async function returnGidIfTaskCreated($, step, taskName) {
	return await new Promise(resolve => {
		let checkForTaskCreated = setInterval(async function() {
			let trys = 1;
			let allTasksArray = await getAllTasks($, step);
			let taskGid = "";
			for(let t = 0; t < allTasksArray.data.length; t++) {
				if(taskName === allTasksArray.data[t].name) {
					taskGid = allTasksArray.data[t].gid;
					clearInterval(checkForTaskCreated);
					resolve(taskGid);
					break;
				}
			}
			if(taskGid === "") {
				if(trys >= 3) {
					clearInterval(checkForTaskCreated);
					resolve(taskGid);
				}
				trys++;
			}
		}, 3000);
	})
}

async function getAllTasks($, step) {
	return await step.asana._makeRequest(`projects/${step.project_gid}/tasks`, {
		method: "get",
		data  : {},
	}, $);
}

function formatDueDate(dueOn) {
	// given "Feb 01, 2023"
	// output should be YYYY-MM-DD
	var d = new Date(dueOn),
		month = '' + (d.getMonth() + 1),
		day = '' + d.getDate(),
		year = d.getFullYear();
	if(month.length < 2) {
		month = '0' + month;
	}
	if(day.length < 2) {
		day = '0' + day;
	}
	return [
		year,
		month,
		day
	].join('-');
}
