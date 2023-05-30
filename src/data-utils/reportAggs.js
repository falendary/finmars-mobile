export const reportGroup = ({ report, sum_field, colorsCat, type }) => {
	let colors = [
		'#577590CC',
		'#43AA8BCC',
		'#F9AB4B',
		'#FA6769',
		'#F9C74F',
		'#979BFF',
		'#D9ED92',
		'#C8D7F9',
		'#96B5B4',
		'#AB7967',
		'#577590CC',
		'#43AA8BCC',
		'#F9AB4B',
		'#FA6769',
		'#F9C74F',
		'#979BFF',
		'#D9ED92',
		'#C8D7F9',
		'#96B5B4',
		'#AB7967',
		'#577590CC',
		'#43AA8BCC',
		'#F9AB4B',
		'#FA6769',
		'#F9C74F',
		'#979BFF',
		'#D9ED92',
		'#C8D7F9',
		'#96B5B4',
		'#AB7967',
		'#577590CC',
		'#43AA8BCC',
		'#F9AB4B',
		'#FA6769',
		'#F9C74F',
		'#979BFF',
		'#D9ED92',
		'#C8D7F9',
		'#96B5B4',
		'#AB7967',
	]
	let _cats = {
		asset_types: {
			[sum_field]: 0,
			name: 'Asset type',
			items: {},
		},
		currency: {
			[sum_field]: 0,
			name: 'Currency',
			items: {},
		},
	}
	let categories = {
		asset_types: {
			name: 'Asset type',
			[sum_field]: 0,
			items: [],
		},
		currency: {
			name: 'Currency',
			[sum_field]: 0,
			items: [],
		},
	}

	report.items.forEach((item) => {
		// Currency
		_cats.currency[sum_field] += item[sum_field]

		let newItem = {
			id: item.id,
			name: item.name,
			item_type: item.item_type,
			user_code: item.user_code,
			[sum_field]: item[sum_field],
			position_size: item.position_size,
			change: {
				value: item.gross_cost_price,
				percent: Math.round(item.daily_price_change * 10000) / 100,
			},
		}

		if (item.item_type == 2) {
			let key = report.item_currencies.find(
				(o) => o.id == item.currency
			)?.short_name

			if (!_cats.currency.items[key]) {
				_cats.currency.items[key] = {
					items: [],
					[sum_field]: 0,
				}
			}

			_cats.currency.items[key][sum_field] += item[sum_field]
			_cats.currency.items[key].items.push(newItem)
		}

		if (item.item_type == 1) {
			let instr_obj = report.item_instruments.find(
				(o) => o.id == item.instrument
			)

			let key = report.item_currencies.find(
				(o) => o.id == instr_obj.pricing_currency
			)?.short_name

			if (!_cats.currency.items[key]) {
				_cats.currency.items[key] = {
					items: [],
					[sum_field]: 0,
				}
			}

			_cats.currency.items[key][sum_field] += item[sum_field]
			_cats.currency.items[key].items.push(newItem)
		}
		// Asset types
		_cats.asset_types[sum_field] += item[sum_field]

		if (!_cats.asset_types.items[item.custom_fields[0].value]) {
			_cats.asset_types.items[item.custom_fields[0].value] = {
				items: [],
				[sum_field]: 0,
			}
		}

		_cats.asset_types.items[item.custom_fields[0].value][sum_field] +=
			item[sum_field]

		_cats.asset_types.items[item.custom_fields[0].value].items.push(newItem)
	})

	for (let prop in _cats) {
		let colorKey = 0

		categories[prop][sum_field] = _cats[prop][sum_field]
		categories[prop].items = []

		for (let instr in _cats[prop].items) {
			categories[prop].items.push({
				..._cats[prop].items[instr],
				name: instr,
				items: _cats[prop].items[instr].items.sort((a, b) => {
					return b[sum_field] - a[sum_field]
				}),
			})

			colorsCat[instr] = colors[colorKey]
			++colorKey
		}
		categories[prop].items = categories[prop].items
			.filter((o) => o[sum_field] != 0)
			.sort((a, b) => b[sum_field] - a[sum_field])
	}

	return categories
}

export const reportGroupPL = ({ report, sum_field, colorsCat, type }) => {
	let colors = [
		'#577590CC',
		'#43AA8BCC',
		'#F9AB4B',
		'#FA6769',
		'#F9C74F',
		'#979BFF',
		'#D9ED92',
		'#C8D7F9',
		'#96B5B4',
		'#AB7967',
		'#577590CC',
		'#43AA8BCC',
		'#F9AB4B',
		'#FA6769',
		'#F9C74F',
		'#979BFF',
		'#D9ED92',
		'#C8D7F9',
		'#96B5B4',
		'#AB7967',
		'#577590CC',
		'#43AA8BCC',
		'#F9AB4B',
		'#FA6769',
		'#F9C74F',
		'#979BFF',
		'#D9ED92',
		'#C8D7F9',
		'#96B5B4',
		'#AB7967',
		'#577590CC',
		'#43AA8BCC',
		'#F9AB4B',
		'#FA6769',
		'#F9C74F',
		'#979BFF',
		'#D9ED92',
		'#C8D7F9',
		'#96B5B4',
		'#AB7967',
	]
	let _cats = {
		asset_types: {
			[sum_field]: 0,
			name: 'Asset type',
			items: {},
		},
		currency: {
			[sum_field]: 0,
			name: 'Currency',
			items: {},
		},
	}
	let categories = {
		asset_types: {
			name: 'Asset type',
			[sum_field]: 0,
			items: [],
		},
		currency: {
			name: 'Currency',
			[sum_field]: 0,
			items: [],
		},
	}

	if (!report.items.length) {
		return {}
	}

	report.items.forEach((item) => {
		// Currency
		_cats.currency[sum_field] += item[sum_field]

		let instrs = report.items.filter(
			(o) => o.user_code == item.user_code && o.item_group_code != 'OPENED'
		)
		if (item.item_group_code == 'OPENED' && instrs.length != 0) return false

		let newItem = {
			id: item.id,
			name: item.name,
			item_type: item.item_type,
			user_code: item.user_code,
			[sum_field]: item[sum_field],
			position_size: item.position_size,
			change: {
				value: 0,
			},
		}

		if (item.item_group_code == 'CLOSED') {
			let instrs = report.items.filter(
				(o) => o.user_code == item.user_code && o.item_group_code == 'OPENED'
			)

			if (instrs) {
				instrs.forEach((item) => {
					newItem.total += item.total
					newItem.change.value += item.total
				})
			}
		}

		if (item.item_type == 2) {
			let key = report.item_currencies.find(
				(o) => o.id == item.currency
			)?.short_name

			if (!_cats.currency.items[key]) {
				_cats.currency.items[key] = {
					items: [],
					[sum_field]: 0,
				}
			}

			_cats.currency.items[key][sum_field] += item[sum_field]
			_cats.currency.items[key].items.push(newItem)
		}

		if (item.item_type == 1) {
			let instr_obj = report.item_instruments.find(
				(o) => o.id == item.instrument
			)

			let key = report.item_currencies.find(
				(o) => o.id == instr_obj.pricing_currency
			)?.short_name

			if (!_cats.currency.items[key]) {
				_cats.currency.items[key] = {
					items: [],
					[sum_field]: 0,
				}
			}

			_cats.currency.items[key][sum_field] += item[sum_field]
			_cats.currency.items[key].items.push(newItem)
		}
		if (!item.custom_fields?.length) {
			return false
		}
		// Asset types
		_cats.asset_types[sum_field] += item[sum_field]

		if (!_cats.asset_types.items[item.custom_fields[0].value]) {
			_cats.asset_types.items[item.custom_fields[0].value] = {
				items: [],
				[sum_field]: 0,
			}
		}

		_cats.asset_types.items[item.custom_fields[0].value][sum_field] +=
			item[sum_field]

		_cats.asset_types.items[item.custom_fields[0].value].items.push(newItem)
	})

	for (let prop in _cats) {
		let colorKey = 0

		if (!Object.keys(_cats[prop].items).length) {
			delete categories[prop]

			continue
		}

		categories[prop][sum_field] = _cats[prop][sum_field]
		categories[prop].items = []

		for (let instr in _cats[prop].items) {
			categories[prop].items.push({
				..._cats[prop].items[instr],
				name: instr,
				items: _cats[prop].items[instr].items.sort((a, b) => {
					return b[sum_field] - a[sum_field]
				}),
			})

			colorsCat[instr] = colors[colorKey]
			++colorKey
		}
		categories[prop].items = categories[prop].items
			.filter((o) => o[sum_field] != 0)
			.sort((a, b) => b[sum_field] - a[sum_field])
	}

	return categories
}
