let timeList = {}
let modules = {
	app: [
		'color: #5c4800;background: #ceb55a; padding: 3px 10px;border-radius: 4px;font-size: 13px;',
		'APP',
		'color: #ceb55a;',
	],
	api: [
		'background: #a43e17; padding: 3px 10px;border-radius: 4px;font-size: 13px;',
		'API',
		'color: #F05A22;',
	],
}
export default {
	debug(desc, val) {
		console.log(
			'%cDEBUG%c %s',
			'background: #1463ee; padding: 3px 10px;border-radius: 4px;font-size: 13px;',
			'color: #fff;',
			desc,
			val
		)
	},
	time(key) {
		timeList[key] = Date.now()
	},
	timeLog(key) {
		console.log(
			'⌛%cTime%c %s',
			'color: #5c4800;background: #ceb55a; padding: 3px 10px;border-radius: 4px;font-size: 13px;',
			'color: #ceb55a;width: 100%;display: block;',
			key
		)
		console.timeLog(key)
	},
	timeEnd({ key, place = 'app', text }) {
		if (!modules[place]) place = 'app'

		console.log(
			'%c%s%c⌛[%s]⌛ %s',
			...modules[place],
			Date.now() - timeList[key] + 'ms',
			text || key
		)

		delete timeList[key]
	},
}
