import asana from "../../asana.app.mjs";

export default {
	name       : "Get Tasks Update Name BU",
	version    : "0.0.2",
	key        : "get-tasks-update-name-bu",
	description: "",
	props      : {
		asana,
		project_gid      : {
			label      : "Project gid",
			description: "gid of the project.",
			type       : "string",
		},
		tour_name: {
			label      : "Tour name",
			description: "Add the path for the tour name variable",
			type       : "string",
		},
		tour_year: {
			label      : "Tour year",
			description: "Add the path for the tour year variable",
			type       : "string",
		},
		task_list_to_update  : {
			label      : "Task(s) to update name",
			description: "Comma separated list of task names to update with tour name.",
			type       : "string",
		},
	},
	type       : "action",
	methods    : {},
	async run({$}) {
		let taskListArray = this.task_list_to_update.split(',');
		let updatedData = [];

		for(let t = 0; t < taskListArray.length; t++) {
			let taskName = taskListArray[t].trim();
			let taskData = {};
			let taskGid = await returnGidIfTaskCreated($, this, taskName);
			if(taskGid === undefined) {
				taskData.data = `${taskName} task not found after waiting 10+ seconds. ${taskName} due date not updated.`;
			} else {
				let NewTaskName = this.tour_name + " " + this.tour_year + " " + taskListArray[t].trim();
				taskData = await updateTaskName($, this, taskGid, NewTaskName);
			}
			updatedData.push(taskData);
		}
		return updatedData;
	},
};

async function updateTaskName($, step, taskGid, taskName) {
	const response = await step.asana._makeRequest(`tasks/${taskGid}`, {
		method: "put",
		data  : {
			data: {
				name: taskName,
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
