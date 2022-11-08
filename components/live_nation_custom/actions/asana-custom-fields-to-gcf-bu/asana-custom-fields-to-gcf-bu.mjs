module.exports = defineComponent({
	name   : "Asana Custom Fields To GCF",
	version: "0.0.1",
	key    : "asana-custom-fields-to-gcf",
	props: {
		google_cloud: {
			type: "app",
			app : "google_cloud",
		},
		task_ids    : {
			label: "task IDs from prior step",
			type : "string",
		},
		gcf_trigger : {
			label: "GCF http trigger url",
			type : "string",
		},
		data_object : {
			label: "JSON data to send to GCF",
			type : "object",
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
		  let payload = {"task_ids": step.task_ids};
		  payload.custom_fields = step.data_object;
		  console.log(payload);
		  client.request({url,headers,method: 'POST',data: payload});
		  return `Triggered ${step.gcf_trigger}`
		}
		return await main(this);
	},
})
