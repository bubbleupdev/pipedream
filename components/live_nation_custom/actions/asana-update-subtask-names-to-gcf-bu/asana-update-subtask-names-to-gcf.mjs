module.exports = defineComponent({
	name   : "Asana Update Subtask Names To GCF",
	version: "0.0.1",
	key    : "asana-update-subtask-names-to-gcf-bu",
	props: {
		google_cloud: {
			type: "app",
			app : "google_cloud",
		},
		gcf_trigger : {
			label: "GCF http trigger url",
			type : "string",
		},
		tour_name_year: {
			label: "Tour Name and Year",
			type : "string",
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
		const key = JSON.parse(this.google_cloud.$auth.key_json)
		const {JWT} = require('google-auth-library');

		async function main(step) {
		  const url = step.gcf_trigger;
		  console.log(url);
		  const client = new JWT({
		    email: key.client_email,
		    key: key.private_key,
		  });
		  const token = await client.fetchIdToken(url);
		  const headers = new Map([
		    ['Authorization', `Bearer ${token}`],
		    ['Content-Type', `application/json`]
		  ]);
		  let payload = {"tour_name_year": step.tour_name_year};
		  payload.all_project_tasks_data = step.all_project_tasks_data;
		  console.log(payload);
		  client.request({url,headers,method: 'POST',data: payload});
		  return `Triggered ${step.gcf_trigger}`
		}
		return await main(this);
	},
})
