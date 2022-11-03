import asana from "../../asana.app.mjs";

export default {
	name       : "Update Tasks With Custom Fields",
	version    : "0.0.1",
	key        : "update-tasks-with-custom-fields",
	description: "",
	props      : {
		asana,
		all_project_tasks_data: {
			label      : "All Project Tasks Data",
			description: "Use 'Get All Tasks In Project BU' step prior to this and add the return value. Example: {{steps.get_all_tasks_in_project_bu.$return_value}}",
			type       : "string",
		},
		marketing_brief_link: {
			label      : "Link to the Marketing Brief",
			type       : "string",
		},
		tour_assets_link: {
			label      : "Link to the Tour Assets folder",
			type       : "string",
		},
	},
	type       : "action",
	methods    : {},
	async run({$}) {
		let tasksToUpdate = this.all_project_tasks_data;
		return await addCustomFieldData($, this, tasksToUpdate);
	},
};
async function addCustomFieldData($, step, tasksToUpdate){
	let updatedData = [];
	for(let t = 0; t < tasksToUpdate.length; t++) {
		let taskData = {};
		taskData = await updateTaskCustomField($, step, tasksToUpdate[t].gid);
		updatedData.push(taskData.name);
	}

	return updatedData;
}
async function updateTaskCustomField($, step, taskGid){
	// Any new Custom Fields need to be added to Asana first. The Custom Field ID doesn't change from task to task.
	// The Custom Field ID is in the text area attributes in Asana or you can do a post request on any task.
	const response = await step.asana._makeRequest(`tasks/${taskGid}`, {
		method: "put",
		data  : {
			data: {
				custom_fields: {
					"1203162503620378": step.marketing_brief_link,
					"1203162503620405": step.tour_assets_link,
				},
			},
		},
	}, $);
	return response;
}
