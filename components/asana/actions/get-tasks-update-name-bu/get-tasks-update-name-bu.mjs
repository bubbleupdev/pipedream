import asana from "../../asana.app.mjs";

export default {
	name       : "Get Tasks Update Name BU",
	version    : "0.0.3",
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
		allTasks: {
			type       : "string",
			label      : "Do you want to add the tour name and year to all tasks?",
			options    : [
				"Yes",
				"No",
			],
			reloadProps: true,
		},
	},
	type       : "action",
	methods    : {},
	async additionalProps() {
		let props = {};
		if(this.allTasks === "No") {
			const values = [
				['task_list_to_update',
				 "Task(s) to update name",
				 "Comma separated list of task names to update with tour name."],
			];
			if(!values.length) {
				throw new ConfigurationError(
					"Cound not find a header row. Please either add headers and click \"Refresh fields\" or adjust the action configuration to continue.");
			}
			for(let i = 0; i < values.length; i++) {
				props[`${values[i][0]}`] = {
					type    : "string",
					label   : values[i][1],
					description: values[i][2]
				};
			}
		}
		return props;
	},
	async run({$}) {
		let updatedData
		if(this.task_list_to_update.length){
			updatedData = await updateIndividualTasksNames($, this);
		}else{
			updatedData = await updateAllTaskNames($, this);
		}
		return updatedData;
	},
};

async function updateAllTaskNames($, step){
	let allTasksArray = await getAllTasks($, step);

	for(let t = 0; t < allTasksArray.data.length; t++) {

	}
}

async function updateIndividualTasksNames($, step){
	let taskListArray = step.task_list_to_update.split(',');
	let updatedData = [];

	for(let t = 0; t < taskListArray.length; t++) {
		let taskName = taskListArray[t].trim();
		let taskData = {};
		let taskGid = await returnGidIfTaskCreated($, step, taskName);
		if(taskGid === undefined) {
			taskData.data = `${taskName} task not found after waiting 10+ seconds. ${taskName} due date not updated.`;
		} else {
			let NewTaskName = step.tour_name + " " + step.tour_year + " - " + taskListArray[t].trim();
			taskData = await updateTaskName($, step, taskGid, NewTaskName);
		}
		updatedData.push(taskData);
	}
	return updatedData;
}

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

async function checkIfAllTasksCreated($, step){

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
