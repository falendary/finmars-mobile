import formbricks from '@formbricks/js'

async function timeout(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

async function initFormbricks(user) {

	if (typeof window !== 'undefined') {

		console.log('initFormbricks', user)

		try {

			await formbricks.init({
				environmentId: 'clnr8525g0009ld01nrnhv5bx',
				apiHost: 'https://survey.finmars.com',
				debug: true // remove when in production
			})

			await formbricks.setUserId(user.id)
			await formbricks.setEmail(user.email)

		} catch (error) {
			console.error('Could not init formbricks', error)
		}

		// Seems it not working
		// await formbricks.setAttribute('email', user.email)
		// await timeout(100)
		// await formbricks.setAttribute('username', user.username)
		// await timeout(100)
		// await formbricks.setAttribute('host', window.location.href)
		// await timeout(100)
		// await formbricks.setAttribute('first_name', user.first_name)
		// await timeout(100)
		// await formbricks.setAttribute('last_name', user.last_name)
		// await timeout(100)
		// await formbricks.setAttribute('is_mobile', true)
		await formbricks.registerRouteChange()

	}


}

export default initFormbricks
