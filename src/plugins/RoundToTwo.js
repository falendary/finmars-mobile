export default {
	async install(app, opts = {}) {
		app.config.globalProperties.$roundToTwo = (num) => {

			return parseFloat(num).toFixed(2);

		}
	},
}
