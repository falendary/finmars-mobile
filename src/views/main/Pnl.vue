<template>
	<ion-page>
		<ion-content>
			<ion-refresher slot="fixed" @ionRefresh="refresh($event)">
				<ion-refresher-content />
			</ion-refresher>

			<div class="header flex sb aic">
				<div v-if="portfolio">{{ portfolio.name }}</div>
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
			/>

			<IndicatorsComp
				:portfolio_id="portfolio?.user_code"
				:currency="store.settings.pnl.currency"
				:date="store.settings.pnl.date_to"
				@refresher="indicatorsRefresher = $event"
			/>

			<swiper
				v-if="categories.asset_types"
				:pagination="true"
				:modules="[Pagination]"
				class="balance_swiper aic"
				:loop="true"
			>
				<swiper-slide v-for="(item, cat) in categories">
					<div class="balance_block">
						<div class="bb_header_line flex sb aic">
							<div class="bb_header">{{ item.name }}</div>
							<div class="bb_price">
								{{ $format(Math.floor(item.total)) }}
								{{ store.settings.balance.currency }}
							</div>
						</div>

						<div class="flex sb">
							<div class="balance_labels">
								<div
									class="balance_labels_item flex aic"
									v-for="subcat in item.items"
									:class="{ active: detailSubcat.name == subcat.name }"
									@click="
										;(detailSubcat = subcat), (isOpenTransactions = false)
									"
								>
									<div
										class="balance_labels_percent"
										:style="{ backgroundColor: colorByCat(subcat.name) }"
									>
										{{
											Math.round((subcat.total / Math.abs(item.total)) * 100)
										}}%
									</div>
									<div class="balance_labels_text">{{ subcat.name }}</div>
								</div>
							</div>

							<div v-show="!isChartView"></div>
						</div>
					</div>
				</swiper-slide>
			</swiper>
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
		onIonViewWillLeave,
	} from '@ionic/vue'
	import { ref, reactive, watch, computed } from 'vue'

	import IndicatorsComp from '@/components/Indicators.vue'
	import HistoryChartComp from '@/components/HistoryChart.vue'
	import TransactionList from '@/components/TransactionList.vue'

	import { Swiper, SwiperSlide } from 'swiper/vue'
	import { Pagination } from 'swiper'

	import useApi from '@/composables/useApi'
	import useMiniStore from '@/composables/useMiniStore'
	import { reportGroup } from '@/data-utils/reportAggs'
	import { useRoute } from 'vue-router'

	const store = useMiniStore()
	const route = useRoute()

	const portfolio = computed(() => {
		return store.portfolioList.find((o) => o.user_code == route.query.tab)
	})

	const transactionsOpts = reactive({
		end_date: store.settings.pnl.date,
		begin_date: '0001-01-01',
		portfolios: portfolio.value?.user_code,
		filter_entry_user_code: null,
	})

	let indicatorsRefresher = null

	let isChartView = ref(true)
	let detailSubcat = ref({})
	let categories = ref({})
	let colorsCat = {}

	if (route.query.tab) init()

	watch(
		() => route.query.tab,
		(newVal, oldVal) => {
			if (!route.path.includes('/main/pnl') || newVal == oldVal) return false

			refresh()
		}
	)
	watch(store.settings.pnl, () => {
		init()
	})

	async function refresh(event) {
		await Promise.all([init(), indicatorsRefresher()])

		if (event) event.target.complete()
	}
	async function init() {
		detailSubcat.value = {}

		transactionsOpts.end_date = store.settings.balance.date
		transactionsOpts.portfolios = route.query.tab
		transactionsOpts.filter_entry_user_code = null

		let report = await fetchReport()

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
				pl_first_date: store.settings.pnl.date_from,
				pl_include_zero: false,
				portfolio_mode: 1,
				portfolios: [route.query.tab],
				pricing_policy: 1,
				report_currency: store.settings.pnl.currency,
				report_date: store.settings.pnl.date_to,
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

	function colorByCat(item) {
		return colorsCat[item]
	}
</script>

<style lang="scss" scoped>
	ion-content {
		--padding-top: 10px;
		--padding-bottom: 10px;
		--background: #fafafa;
	}
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
