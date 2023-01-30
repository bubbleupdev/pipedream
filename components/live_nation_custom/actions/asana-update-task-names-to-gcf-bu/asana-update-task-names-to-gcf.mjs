module.exports = defineComponent({
	name   : "Asana Update Task Names To GCF",
	version: "0.0.5",
	key    : "asana-update-task-names-to-gcf-bu",
	props  : {
		google_cloud          : {
			type: "app",
			app : "google_cloud",
		},
		gcf_trigger           : {
			label: "GCF http trigger url",
			type : "string",
		},
		tour_name_year        : {
			label: "Tour Name and Year",
			type : "string",
		},
		name                  : {
			label      : "Artist Name",
			description: "Headliner",
			type       : "string",
		},
		co_headliner_1        : {
			label      : "Co-Headliner 1",
			description: "1st Co-Headliner",
			type       : "string",
		},
		co_headliner_2        : {
			label      : "Co-Headliner 2",
			description: "2nd Co-Headliner",
			type       : "string",
		},
		co_headliner_3        : {
			label      : "Co-Headliner 3",
			description: "3rd Co-Headliner",
			type       : "string",
		},
		co_headliner_4        : {
			label      : "Co-Headliner 4",
			description: "4th Co-Headliner",
			type       : "string",
		},
		year                  : {
			label      : "Year",
			description: "Year of the project.",
			type       : "string",
		},
		all_project_tasks_data: {
			label      : "All Project Tasks Data",
			description: "Use 'Get All Tasks In Project BU' step prior to this and add the return value. Example: {{steps.get_all_tasks_in_project_bu.$return_value}}",
			type       : "string",
		},
	},
	type   : "action",
	methods: {},
	async run({steps, $}) {
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

		const key = JSON.parse(this.google_cloud.$auth.key_json)
		const {JWT} = require('google-auth-library');

		async function main(step) {
			const url = step.gcf_trigger;
			console.log(url);
			const client = new JWT({
				email: key.client_email,
				key  : key.private_key,
			});
			const token = await client.fetchIdToken(url);
			const headers = new Map([
				['Authorization', `Bearer ${token}`],
				['Content-Type', `application/json`]
			]);
			let payload = {"tour_name_year": step.tour_name_year};
			payload.all_project_tasks_data = step.all_project_tasks_data;
			console.log(payload);
			client.request({url, headers, method: 'POST', data: payload});
			return `Triggered ${step.gcf_trigger}`
		}

		return await main(this);
	},
})

function concatName(projectName, coHeadliner) {
	if(coHeadliner) {
		return projectName + ' / ' + coHeadliner;
	}
	return projectName;
}
