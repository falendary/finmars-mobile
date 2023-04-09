export default {
  async install(app, opts = {}) {
		app.config.globalProperties.$format = (number) => {
			return new Intl.NumberFormat(
				"en-EN", 
				{ 
					maximumSignificantDigits: 3
				}
			)
			.format(number)
		}
  }
}

