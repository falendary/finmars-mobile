export default {
	async install(app, opts = {}) {
		app.config.globalProperties.$roundToTwo = (num) => {

			return +(Math.round(num + 'e+2') + 'e-2')

		}
	},
}
