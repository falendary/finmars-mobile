<template>
	<ion-page>
		<ion-content>
			<ion-refresher slot="fixed" @ionRefresh="refresh($event)">
				<ion-refresher-content />
			</ion-refresher>

			<div class="header flex sb aic">
				<div v-if="activePortfolioName">{{ activePortfolioName }}</div>
				<IonSkeletonText
					v-else
					:animated="true"
					style="height: 24px; width: 80px"
				/>

				<div class="header_info">
					{{ dayjs(store.settings.pnl.date_from).format('DD MMM YYYY') }}
					->
					{{ dayjs(store.settings.pnl.date_to).format('DD MMM YYYY') }}
				</div>
			</div>

			<HistoryChartComp
				type="pl"
				:date_from="store.settings.pnl.date_from"
				:date_to="store.settings.pnl.date_to"
				:currency="store.settings.pnl.currency"
				@portfolioChange="init($event)"
			/>

			<IndicatorsComp
				:portfolio_id="activePortfolio"
				:currency="store.settings.pnl.currency"
				:date="store.settings.pnl.date_to"
			/>
		</ion-content>
	</ion-page>
</template>

<script setup>
	import dayjs from 'dayjs'
	import {
		IonCheckbox,
		IonSkeletonText,
		IonRefresher,
		IonRefresherContent,
	} from '@ionic/vue'
	import { onMounted, ref, reactive, watch, computed } from 'vue'

	import IndicatorsComp from '@/components/Indicators.vue'
	import HistoryChartComp from '@/components/HistoryChart.vue'
	import TransactionList from '@/components/TransactionList.vue'

	import useApi from '@/composables/useApi'
	import useMiniStore from '@/composables/useMiniStore'
	import { reportGroup } from '@/data-utils/reportAggs'

	const store = useMiniStore()
	// console.log('store:', store)

	let portfolioUserCode = 'Model'

	const transactionsOpts = reactive({
		end_date: store.settings.balance.date,
		begin_date: '0001-01-01',
		portfolios: portfolioUserCode,
		filter_entry_user_code: null,
	})

	let isChartView = ref(true)
	let detailSubcat = ref({})
	let categories = ref({})

	let colorsCat = {}

	init()

	async function refresh(event) {
		await init()

		if (event) event.target.complete()
	}

	watch(store.settings.pnl, () => {
		init()
	})

	async function init(tab) {
		// if (tab == portfolioUserCode) return false
		// if (tab) portfolioUserCode = tab

		detailSubcat.value = {}
		transactionsOpts.end_date = store.settings.balance.date
		transactionsOpts.portfolios = portfolioUserCode
		transactionsOpts.filter_entry_user_code = null

		let report = await fetchReport()
		console.log('pl-report:', report)

		categories.value = reportGroup({
			report,
			sum_field: 'total',
			colorsCat,
		})
	}
	async function fetchReport() {
		let res = await useApi('pnlReport.post', {
			body: {
				account_mode: 0,
				accounts: [],
				accounts_cash: [],
				accounts_position: [],
				allocation_detailing: true,
				allocation_mode: 1,
				approach_multiplier: 0.5,
				calculationGroup: 'portfolio',
				complex_transaction_statuses_filter: 'booked',
				cost_method: 1,
				custom_fields_to_calculate: 'Asset Types',
				date_field: 'accounting_date',
				depth_level: 'base_transaction',
				expression_iterations_count: 1,
				filters: [],
				pl_first_date: '2021-06-08',
				pl_include_zero: false,
				portfolio_mode: 1,
				portfolios: [2],
				pricing_policy: 1,
				report_currency: 2,
				report_date: '2023-05-10',
				report_type: 1,
				show_balance_exposure_details: false,
				show_transaction_details: false,
				strategies1: [],
				strategies2: [],
				strategies3: [],
				strategy1_mode: 0,
				strategy2_mode: 0,
				strategy3_mode: 0,
				table_font_size: 'small',
				transaction_classes: [],
				task_id: null,
			},
		})

		return res
	}
</script>

<style lang="scss" scoped>
	.header {
		color: #747474;
		padding: 0 15px;
		font-weight: 500;
		font-size: 20px;
		margin-bottom: 15px;
	}
	.header_info {
		font-size: 16px;
	}
</style>
