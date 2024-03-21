export const reportGroup = ({
															report,
															sum_field,
															colorsCat,
															type,
															fieldsToGroup
														}) => {
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
		'#AB7967'
	]

	if (!report.items.length) {
		return {}
	}

	let items = injectIntoItemsV2(report.items, report, 'balance-report')

	let res = items.reduce((result, item) => {
		fieldsToGroup.forEach((group) => {
			let valToGroup = item[group.key]

			if (!valToGroup) {
				if (item.item_type == 2) valToGroup = 'Cash'
				if (item.item_type == 5) valToGroup = 'Other!'
				if (valToGroup === undefined) valToGroup = 'Undefined'
				if (valToGroup === null) valToGroup = 'Null'
			}

			if (!result[group.key]) {

				let verbose_name = group.name

				if (group.name.indexOf('.')) {
					var pieces = group.name.split('.')

					// console.log('pieces', pieces);

					if (pieces.length >= 3) {
						verbose_name = pieces[1] // need middle of it
					} else {
						verbose_name = pieces[0]
					}

				}

				result[group.key] = {
					name: group.name,
					verbose_name: verbose_name,
					layout_name: group.layout_name,
					subcats: {},
					[sum_field]: 0
				}
			}

			if (!result[group.key].subcats[valToGroup]) {
				result[group.key].subcats[valToGroup] = {
					name: valToGroup,
					items: [],
					[sum_field]: 0
				}
			}

			result[group.key].subcats[valToGroup].items.push({
				id: item.id,
				name: item.name,
				item_type: item.item_type,
				user_code: item.user_code,
				[sum_field]: item[sum_field],
				position_size: item.position_size,
				change: {
					value: item.gross_cost_price,
					percent: Math.round(item.daily_price_change * 10000) / 100
				}
			})

			result[group.key][sum_field] += item[sum_field]
			result[group.key].subcats[valToGroup][sum_field] += item[sum_field]
		})

		return result
	}, {})

	// report.items.forEach((item) => {
	// 	// Currency
	// 	_cats.currency[sum_field] += item[sum_field]

	// 	let newItem = {
	// 		id: item.id,
	// 		name: item.name,
	// 		item_type: item.item_type,
	// 		user_code: item.user_code,
	// 		[sum_field]: item[sum_field],
	// 		position_size: item.position_size,
	// 		change: {
	// 			value: item.gross_cost_price,
	// 			percent: Math.round(item.daily_price_change * 10000) / 100,
	// 		},
	// 	}

	// 	if (item.item_type == 2) {
	// 		let key = report.item_currencies.find(
	// 			(o) => o.id == item.currency
	// 		)?.short_name

	// 		if (!_cats.currency.items[key]) {
	// 			_cats.currency.items[key] = {
	// 				items: [],
	// 				[sum_field]: 0,
	// 			}
	// 		}

	// 		_cats.currency.items[key][sum_field] += item[sum_field]
	// 		_cats.currency.items[key].items.push(newItem)
	// 	}

	// 	if (item.item_type == 1) {
	// 		let instr_obj = report.item_instruments.find(
	// 			(o) => o.id == item.instrument
	// 		)

	// 		let key = report.item_currencies.find(
	// 			(o) => o.id == instr_obj.pricing_currency
	// 		)?.short_name

	// 		if (!_cats.currency.items[key]) {
	// 			_cats.currency.items[key] = {
	// 				items: [],
	// 				[sum_field]: 0,
	// 			}
	// 		}

	// 		_cats.currency.items[key][sum_field] += item[sum_field]
	// 		_cats.currency.items[key].items.push(newItem)
	// 	}
	// 	// Asset types
	// 	_cats.asset_types[sum_field] += item[sum_field]

	// 	if (!_cats.asset_types.items[item.custom_fields[0].value]) {
	// 		_cats.asset_types.items[item.custom_fields[0].value] = {
	// 			items: [],
	// 			[sum_field]: 0,
	// 		}
	// 	}

	// 	_cats.asset_types.items[item.custom_fields[0].value][sum_field] +=
	// 		item[sum_field]

	// 	_cats.asset_types.items[item.custom_fields[0].value].items.push(newItem)
	// })

	// for (let prop in _cats) {
	// 	let colorKey = 0

	// 	categories[prop][sum_field] = _cats[prop][sum_field]
	// 	categories[prop].items = []

	// 	for (let instr in _cats[prop].items) {
	// 		categories[prop].items.push({
	// 			..._cats[prop].items[instr],
	// 			name: instr,
	// 			items: _cats[prop].items[instr].items.sort((a, b) => {
	// 				return b[sum_field] - a[sum_field]
	// 			}),
	// 		})

	// 		colorsCat[instr] = colors[colorKey]
	// 		++colorKey
	// 	}
	// 	categories[prop].items = categories[prop].items
	// 		.filter((o) => o[sum_field] != 0)
	// 		.sort((a, b) => b[sum_field] - a[sum_field])
	// }
	// console.log('res:', res)

	for (let prop in res) {
		let colorKey = 0

		res[prop].subcats = Object.values(res[prop].subcats)

		res[prop].subcats.forEach((subcat) => {
			colorsCat[prop + subcat.name] = colors[colorKey]
			++colorKey
		})

		res[prop].subcats = res[prop].subcats
			.sort((a, b) => b[sum_field] - a[sum_field])
			.filter((o) => o[sum_field] != 0)

		if (!res[prop].subcats.length) delete res[prop]
	}

	// console.log('reportGroup.res', res)

	return res
}

export const reportGroupPL = ({
																report,
																sum_field,
																colorsCat,
																type,
																fieldsToGroup
															}) => {
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
		'#AB7967'
	]

	if (!report.items.length) {
		return {}
	}

	let items = injectIntoItemsV2(report.items, report, 'pl-report')
	// console.log('items:', items)

	let res = items.reduce((result, item) => {
		fieldsToGroup.forEach((group) => {
			let valToGroup = item[group.key]

			if (!valToGroup) {
				if (item.item_type == 2) valToGroup = 'Cash'
				if (item.item_type == 5) valToGroup = 'Other!'
				if (valToGroup === undefined) valToGroup = 'Undefined'
				if (valToGroup === null) valToGroup = 'Null'
			}
			if (!result[group.key]) {
				result[group.key] = {
					name: group.layout_name || group.name,
					subcats: {},
					[sum_field]: 0
				}
			}

			if (!result[group.key].subcats[valToGroup]) {
				result[group.key].subcats[valToGroup] = {
					name: valToGroup,
					items: [],
					[sum_field]: 0
				}
			}

			let existingInstr = result[group.key].subcats[valToGroup].items.find(
				(o) => o.user_code == item.user_code
			)

			// IF not found same elem with different item_group_code
			if (!existingInstr) {
				result[group.key].subcats[valToGroup].items.push({
					id: item.id,
					name: item.name,
					item_type: item.item_type,
					user_code: item.user_code,
					[sum_field]: item[sum_field],
					position_size: item.position_size,
					change: {
						value: 0
					}
				})
			} else {
				existingInstr[sum_field] += item[sum_field]
				// console.log('item.item_group_code:', item.item_group_code)

				if (item.item_group_code == 'OPENED')
					existingInstr.change.value += item[sum_field]
			}

			result[group.key][sum_field] += item[sum_field]
			result[group.key].subcats[valToGroup][sum_field] += item[sum_field]
		})

		return result
	}, {})

	for (let prop in res) {
		let colorKey = 0

		res[prop].subcats = Object.values(res[prop].subcats)

		res[prop].subcats.forEach((subcat) => {
			colorsCat[prop + subcat.name] = colors[colorKey]
			++colorKey
		})

		res[prop].subcats = res[prop].subcats
			.sort((a, b) => b[sum_field] - a[sum_field])
			.filter((o) => o[sum_field] != 0)

		if (!res[prop].subcats.length) delete res[prop]
	}

	return res
}

var unwrapRelationsAsFlatDicts = function(items) {
	var result = {}

	for (const item of items) {
		var result_item = Object.assign({}, item)

		if (item.hasOwnProperty('attributes')) {
			var resultKey = 'attributes'
			var localResultKey

			item.attributes.forEach(function(attribute) {
				// localResultKey = resultKey + '.' + attribute.attribute_type;
				localResultKey =
					resultKey + '.' + attribute.attribute_type_object.user_code
				// TODO IDK what to right now
				// TODO Important, refactor later, support of multiple attribute types of different configuration is possible
				// user_code pattern here [configuration_code].[content_type]:[user_code]
				// localResultKey = resultKey + '.' + attribute.attribute_type_object.user_code.split(':')[2];

				result_item[localResultKey] = null

				if (attribute.attribute_type_object.value_type === 10) {
					result_item[localResultKey] = attribute.value_string
				}

				if (attribute.attribute_type_object.value_type === 20) {
					result_item[localResultKey] = attribute.value_float
				}

				if (attribute.attribute_type_object.value_type === 30) {
					if (attribute.classifier_object) {
						result_item[localResultKey] = attribute.classifier_object.name
					}
				}

				if (attribute.attribute_type_object.value_type === 40) {
					result_item[localResultKey] = attribute.value_date
				}
			})
		}

		result[item.id] = result_item
	}

	return result
}

var joinFlatRelationToItem = function(item, key, relation) {
	// // console.log('joinFlatRelationToItem.key', key)
	// // console.log('joinFlatRelationToItem.item', item[key])

	if (relation) {
		Object.keys(relation).forEach(function(relation_key) {
			item[key + '.' + relation_key] = relation[relation_key]
		})
	}

	return item
}

function injectIntoItemsV2(items, reportOptions, entityType) {
	// reportOptions.item_instruments

	var instruments_as_dict = unwrapRelationsAsFlatDicts(
		reportOptions.item_instruments
	)
	var accounts_as_dict = unwrapRelationsAsFlatDicts(reportOptions.item_accounts)
	var currencies_as_dict = unwrapRelationsAsFlatDicts(
		reportOptions.item_currencies
	)
	var portfolios_as_dict = unwrapRelationsAsFlatDicts(
		reportOptions.item_portfolios
	)
	var instrument_types_as_dict = unwrapRelationsAsFlatDicts(
		reportOptions.item_instrument_types
	)
	var account_types_as_dict = unwrapRelationsAsFlatDicts(
		reportOptions.item_account_types
	)

	// console.log('portfolios_as_dict', portfolios_as_dict)

	var counterparties_as_dict = null
	if (reportOptions.item_counterparties) {
		counterparties_as_dict = unwrapRelationsAsFlatDicts(
			reportOptions.item_counterparties
		)
	}
	var responsibles_as_dict = null
	if (reportOptions.item_counterparties) {
		responsibles_as_dict = unwrapRelationsAsFlatDicts(
			reportOptions.item_responsibles
		)
	}
	var strategies1_as_dict = unwrapRelationsAsFlatDicts(
		reportOptions.item_strategies1
	)
	var strategies2_as_dict = unwrapRelationsAsFlatDicts(
		reportOptions.item_strategies2
	)
	var strategies3_as_dict = unwrapRelationsAsFlatDicts(
		reportOptions.item_strategies3
	)
	var transaction_classes_as_dict = null

	if (reportOptions.item_transaction_classes) {
		transaction_classes_as_dict = unwrapRelationsAsFlatDicts(
			reportOptions.item_transaction_classes
		)
	}

	items.forEach(function(item) {
		if (item.instrument) {
			joinFlatRelationToItem(
				item,
				'instrument',
				instruments_as_dict[item.instrument]
			)
			joinFlatRelationToItem(
				item,
				'instrument.instrument_type',
				instrument_types_as_dict[item['instrument.instrument_type']]
			)
		}

		if (item.allocation) {
			joinFlatRelationToItem(
				item,
				'allocation',
				instruments_as_dict[item.allocation]
			)
			joinFlatRelationToItem(
				item,
				'allocation.instrument_type',
				instrument_types_as_dict[item['allocation.instrument_type']]
			)
		}

		if (item.allocation_pl) {
			joinFlatRelationToItem(
				item,
				'allocation_pl',
				instruments_as_dict[item.allocation_pl]
			)
			joinFlatRelationToItem(
				item,
				'allocation_pl.instrument_type',
				instrument_types_as_dict[item['allocation_pl.instrument_type']]
			)
		}

		if (item.allocation_balance) {
			joinFlatRelationToItem(
				item,
				'allocation_balance',
				instruments_as_dict[item.allocation_balance]
			)
			joinFlatRelationToItem(
				item,
				'allocation_balance.instrument_type',
				instrument_types_as_dict[item['allocation_balance.instrument_type']]
			)
		}

		if (item.linked_instrument) {
			joinFlatRelationToItem(
				item,
				'linked_instrument',
				instruments_as_dict[item.linked_instrument]
			)
			joinFlatRelationToItem(
				item,
				'linked_instrument.instrument_type',
				instrument_types_as_dict[item['linked_instrument.instrument_type']]
			)
		}

		if (item['instrument.pricing_currency']) {
			joinFlatRelationToItem(
				item,
				'instrument.pricing_currency',
				currencies_as_dict[item['instrument.pricing_currency']]
			)
		}

		if (item['instrument.accrued_currency']) {
			joinFlatRelationToItem(
				item,
				'instrument.accrued_currency',
				currencies_as_dict[item['instrument.accrued_currency']]
			)
		}

		if (item['instrument.pricing_currency']) {
			joinFlatRelationToItem(
				item,
				'instrument.pricing_currency',
				currencies_as_dict[item['instrument.pricing_currency']]
			)
		}

		if (item['instrument.accrued_currency']) {
			joinFlatRelationToItem(
				item,
				'instrument.accrued_currency',
				currencies_as_dict[item['instrument.accrued_currency']]
			)
		}

		// Accounts

		if (item.account) {
			joinFlatRelationToItem(item, 'account', accounts_as_dict[item.account])

			if (item['account.type']) {
				joinFlatRelationToItem(
					item,
					'account.type',
					account_types_as_dict[item['account.type']]
				)
			}
		}

		if (item.account_cash) {
			joinFlatRelationToItem(
				item,
				'account_cash',
				accounts_as_dict[item.account_cash]
			)

			if (item['account_cash.type']) {
				joinFlatRelationToItem(
					item,
					'account_cash.type',
					account_types_as_dict[item['account_cash.type']]
				)
			}
		}

		if (item.account_interim) {
			joinFlatRelationToItem(
				item,
				'account_interim',
				accounts_as_dict[item.account_interim]
			)

			if (item['account_interim.type']) {
				joinFlatRelationToItem(
					item,
					'account_interim.type',
					account_types_as_dict[item['account_interim.type']]
				)
			}
		}

		if (item.account_position) {
			joinFlatRelationToItem(
				item,
				'account_position',
				accounts_as_dict[item.account_position]
			)
			if (item['account_position.type']) {
				joinFlatRelationToItem(
					item,
					'account_position.type',
					account_types_as_dict[item['account_position.type']]
				)
			}
		}

		// Currencies

		if (item.currency) {
			joinFlatRelationToItem(
				item,
				'currency',
				currencies_as_dict[item.currency]
			)
		}

		if (item.transaction_currency) {
			joinFlatRelationToItem(
				item,
				'transaction_currency',
				currencies_as_dict[item.transaction_currency]
			)
		}

		if (item.settlement_currency) {
			joinFlatRelationToItem(
				item,
				'settlement_currency',
				currencies_as_dict[item.settlement_currency]
			)
		}

		if (item.accrued_currency) {
			joinFlatRelationToItem(
				item,
				'accrued_currency',
				currencies_as_dict[item.accrued_currency]
			)
		}

		if (item.pricing_currency) {
			joinFlatRelationToItem(
				item,
				'pricing_currency',
				currencies_as_dict[item.pricing_currency]
			)
		}

		if (item.exposure_currency) {
			joinFlatRelationToItem(
				item,
				'exposure_currency',
				currencies_as_dict[item.exposure_currency]
			)
		}

		// entry (in transaction report)

		if (item.entry_account) {
			joinFlatRelationToItem(
				item,
				'entry_account',
				accounts_as_dict[item.entry_account]
			)
		}

		if (item.entry_strategy) {
			joinFlatRelationToItem(
				item,
				'entry_strategy',
				strategies1_as_dict[item.entry_strategy]
			)
		}

		if (item.entry_currency) {
			joinFlatRelationToItem(
				item,
				'entry_currency',
				currencies_as_dict[item.entry_currency]
			)
		}

		if (item.entry_instrument) {
			joinFlatRelationToItem(
				item,
				'entry_instrument',
				instruments_as_dict[item.entry_instrument]
			)
		}

		// Other

		if (item.transaction_class && transaction_classes_as_dict) {
			joinFlatRelationToItem(
				item,
				'transaction_class',
				transaction_classes_as_dict[item.transaction_class]
			)
		}

		if (item.counterparty && counterparties_as_dict) {
			joinFlatRelationToItem(
				item,
				'counterparty',
				counterparties_as_dict[item.counterparty]
			)
		}

		if (item.responsible && responsibles_as_dict) {
			joinFlatRelationToItem(
				item,
				'responsible',
				responsibles_as_dict[item.responsible]
			)
		}

		if (item.portfolio) {
			joinFlatRelationToItem(
				item,
				'portfolio',
				portfolios_as_dict[item.portfolio]
			)
		}

		if (item.strategy1) {
			joinFlatRelationToItem(
				item,
				'strategy1',
				strategies1_as_dict[item.strategy1]
			)
		}

		if (item.strategy1_cash) {
			joinFlatRelationToItem(
				item,
				'strategy1_cash',
				strategies1_as_dict[item.strategy1_cash]
			)
		}

		if (item.strategy1_position) {
			joinFlatRelationToItem(
				item,
				'strategy1_position',
				strategies1_as_dict[item.strategy1_position]
			)
		}

		if (item.strategy2) {
			joinFlatRelationToItem(
				item,
				'strategy2',
				strategies2_as_dict[item.strategy2]
			)
		}

		if (item.strategy2_cash) {
			joinFlatRelationToItem(
				item,
				'strategy2_cash',
				strategies2_as_dict[item.strategy2_cash]
			)
		}

		if (item.strategy2_position) {
			joinFlatRelationToItem(
				item,
				'strategy2_position',
				strategies2_as_dict[item.strategy2_position]
			)
		}

		if (item.strategy3) {
			joinFlatRelationToItem(
				item,
				'strategy3',
				strategies3_as_dict[item.strategy3]
			)
		}

		if (item.strategy3_cash) {
			joinFlatRelationToItem(
				item,
				'strategy3_cash',
				strategies3_as_dict[item.strategy3_cash]
			)
		}

		if (item.strategy3_position) {
			joinFlatRelationToItem(
				item,
				'strategy3_position',
				strategies3_as_dict[item.strategy3_position]
			)
		}

		if (item.custom_fields) {
			item.custom_fields.forEach(function(localCustomField) {
				item['custom_fields.' + localCustomField.user_code] =
					localCustomField.value
			})
		}

		//console.error('item', item);

		if (reportOptions && entityType === 'balance-report') {
			item.date = reportOptions.report_date
		} else if (reportOptions && entityType === 'pl-report') {
			item.pl_first_date = reportOptions.pl_first_date
			item.report_date = reportOptions.report_date
		}
	})

	// // console.log('INJECTED', items);

	return items
}
