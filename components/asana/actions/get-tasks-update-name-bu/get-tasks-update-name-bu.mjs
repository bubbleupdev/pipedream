import asana from "../../asana.app.mjs";

export default {
	name       : "Get Tasks Update Name BU",
	version    : "0.0.6",
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
		all_project_tasks_data:{
			label      : "All Project Tasks Data",
			description: "Use 'Get All Tasks In Project BU' step prior to this and add the return value. Example: {{steps.get_all_tasks_in_project_bu.$return_value}}",
			type       : "string",
		},
		allTasks: {
			type       : "string",
			label      : "Do you want to add the tour name and year to all tasks?",
			options    : [
				"Yes",
				"No",
			],
			default: "Yes",
			reloadProps: true,
		},
	},
	type       : "action",
	methods    : {},
	async additionalProps() {
		let props = {};
		let values;
		if(this.allTasks === "No") {
			values = [
				[
					'task_list_to_update',
					"Task(s) to update name",
					"Comma separated list of task names to update with tour name."
				],
			];
			for(let i = 0; i < values.length; i++) {
				props[`${values[i][0]}`] = {
					type       : "string",
					label      : values[i][1],
					description: values[i][2]
				};
			}
		}
		return props;
	},
	async run({$}) {
		let tasksToUpdate;
		if(typeof this.task_list_to_update != 'undefined'){
			tasksToUpdate = await getIndividualTasks($, this);
		}else{
			tasksToUpdate = this.all_project_tasks_data;
		}
		return await updateTaskNames($, this, tasksToUpdate);
	},
};

async function getIndividualTasks($, step){
	let taskListArray = step.task_list_to_update.split(',');
	let allTasksArray = step.all_project_tasks_data;
	let tasksToUpdate = [];
	for(let i = 0; i < taskListArray.length; i++) {
		let taskName = taskListArray[i].trim();
		for(let t = 0; t < allTasksArray.length; t++) {
			if(taskName === allTasksArray[t].name) {
				tasksToUpdate.push(allTasksArray[t])
				break;
			}
		}
	}
	return tasksToUpdate;
}

async function updateTaskNames($, step, tasksToUpdate){
	let updatedData = [];

	for(let t = 0; t < tasksToUpdate.length; t++) {
		let taskName = tasksToUpdate[t].name.replace("["+step.tour_year+"]","").replace(step.tour_year, "").trim();
		let taskData = {};
		let NewTaskName = step.tour_name + " " + step.tour_year + " - " + taskName;

		taskData = await updateTaskName($, step, tasksToUpdate[t].gid, NewTaskName);
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
