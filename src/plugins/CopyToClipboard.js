export default {
	async install(app, opts = {}) {
		app.config.globalProperties.$copyToClipboard = async (text) => {

			try {
				await navigator.clipboard.writeText(text);
				// console.log('Text copied to clipboard');
				// Optionally, show a success message to the user
			} catch (err) {
				console.error('Failed to copy text: ', err);
				// Optionally, handle errors (e.g., show an error message)
			}

		}
	},
}
