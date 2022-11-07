module.exports = defineComponent({
	name   : "Call GCF With Auth",
	version: "0.0.1",
	key    : "call-gcf-with-auth",
	props: {
		google_cloud: {
			type: "app",
			app : "google_cloud",
		}
	},
	type   : "action",
	methods: {},
	async run({steps, $}) {
		const key = JSON.parse(this.google_cloud.$auth.key_json)
		const {JWT} = require('google-auth-library');

		async function main() {
			const url = `https://us-central1-live-nation-358920.cloudfunctions.net/asana-add-custom-field-data-to-tasks`;
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
			const payload = {"task_ids": ["1203247329009629"], "custom_fields": {"1203162503620378": "marketing brief link"}}
			const res = await client.request({
				url, headers, method: 'POST',
				data                : JSON.stringify(payload)
			});
			console.log(res.data);
		}

		return await main()
	},

})
