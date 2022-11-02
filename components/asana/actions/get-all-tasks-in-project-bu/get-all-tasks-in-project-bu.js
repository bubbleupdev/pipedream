import asana from "../../asana.app.mjs";

export default {
	name       : "Get All Tasks In Project BU",
	version    : "0.0.1",
	key        : "get-all-tasks-in-project-bu",
	description: "",
	props      : {
		asana,
		project_gid: {
			label      : "Project gid",
			description: "gid of the project.",
			type       : "string",
		},
		number_of_tasks_in_project: {
			label      : "Expected number of tasks in given project",
			description: "Checking that all tasks are created and storing values for another step",
			type       : "string",
		}
	},
	type       : "action",
	methods    : {},
	async run({$}) {
		return await returnAllTasks($, this);
	},
};

async function returnAllTasks($, step) {
	return await new Promise(resolve => {
		let checkForTaskCreated = setInterval(async function() {
			let trys = 1;
			let allTasksArray = await getAllTasks($, step);
			if(allTasksArray.data.length === step.number_of_tasks_in_project){
				clearInterval(checkForTaskCreated);
				resolve(allTasksArray.data);
			}
			if(trys >= 3) {
				clearInterval(checkForTaskCreated);
				resolve(allTasksArray.data);
			}
			trys++;
		}, 3000);
	})
}

async function getAllTasks($, step) {
	return await step.asana._makeRequest(`projects/${step.project_gid}/tasks`, {
		method: "get",
		data  : {},
	}, $);
}
