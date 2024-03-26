module.exports = defineComponent({
	name   : "Call GCF With Auth",
	version: "0.0.6",
	key    : "call-gcf-with-auth",
	props: {
		google_cloud: {
			type: "app",
			app : "google_cloud",
		},
		gcf_trigger: {
			label: "GCF http trigger url",
			type : "string",
		},
		data   : {
			label: "JSON data to send to GCF",
			type : "string",
		},
	},
	type   : "action",
	methods: {},
	async run({steps, $}) {
		const key = JSON.parse(this.google_cloud.$auth.key_json)
		return await main(this, key)
	},
})

async function main(step, key) {
	const {JWT} = require('google-auth-library');
	const url = step.gcf_trigger;
	const client = new JWT({
		email: key.client_email,
		key  : key.private_key,
	});
	const token = await client.fetchIdToken(url);
	const headers = new Map([
		[
			'Authorization',
			`Bearer ${token}`
		],
		[
			'Content-Type',
			`application/json`
		]
	]);
	const payload = step.data;
	const res = await client.request({url, headers, method: 'POST', data: payload});
	return res.data
}
