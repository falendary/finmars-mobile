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
				@refresher="portfoliosRefresher = $event"
			/>

			<IndicatorsComp
				:portfolio_id="portfolio?.user_code"
				:currency="store.settings.pnl.currency"
				:date="store.settings.pnl.date_to"
				@refresher="indicatorsRefresher = $event"
			/>

			<div class="header flex aic sb">
				Profit & Loss

				<ion-checkbox
					v-model="isChartView"
					labelPlacement="start"
					class="chart_view"
				>
					Chart view
				</ion-checkbox>
			</div>

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

			<template v-if="detailSubcat.name">
				<div class="header flex aic sb">Details</div>

				<div class="balance_block instr_block">
					<div class="bb_header_line instr_block_header flex sb aifs">
						<div class="bb_header">{{ detailSubcat.name }}</div>
						<div>
							<div class="bb_price">
								{{ $format(detailSubcat.total) }}
								{{ store.settings.pnl.currency }}
							</div>
							<!-- <div class="instr_block_change flex jcfe">
								<div class="instr_change_percent instr_first minus">
									{{ $format(1254) }}
								</div>
								<div class="instr_change_percent instr_second plus">YTD</div>
							</div> -->
						</div>
					</div>

					<div
						class="instruments"
						v-for="item in detailSubcat.items"
						:class="{
							active: transactionsOpts.filter_entry_user_code == item.user_code,
						}"
						@click="
							;(transactionsOpts.filter_entry_user_code = item.user_code),
								(isOpenTransactions = true)
						"
					>
						<div class="flex sb jcfe">
							<div class="instr_name">
								{{
									item.name.length > 20
										? item.name.slice(0, 20) + '...'
										: item.name
								}}
							</div>
							<div class="instr_market_value instr_first">
								{{ $format(item.total) }}
							</div>
						</div>
						<div class="flex sb">
							<div class="instr_pos">{{ $format(item.position_size) }}</div>

							<div class="flex" v-if="item.item_type != 2">
								<div class="instr_change_percent instr_first">
									{{ $format(item.change.value) }}
								</div>
								<div
									class="instr_change_percent instr_second"
									:class="[item.change.percent > 0 ? 'plus' : 'minus']"
								>
									{{ item.change.percent }}%
								</div>
							</div>
						</div>
					</div>
				</div>
			</template>
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
	let portfoliosRefresher = null

	let isChartView = ref(true)
	let detailSubcat = ref({})
	let categories = ref({})
	let colorsCat = {}

	if (route.query.tab) init()

	watch(
		() => route.query.tab,
		(newVal, oldVal) => {
			if (!route.path.includes('/main/pnl') || newVal == oldVal) return false

			Promise.all([init(), portfoliosRefresher(), indicatorsRefresher()])
		}
	)
	watch(store.settings.pnl, () => {
		init()
	})

	async function refresh(event) {
		await Promise.all([
			init(),
			portfoliosRefresher(true),
			indicatorsRefresher(),
		])

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
		console.log('categories.value:', categories.value)
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
	.chart_view {
		font-size: 14px;
	}
	.header_info {
		font-size: 16px;
	}
	.balance_swiper {
		padding-bottom: 10px;
	}
	.balance_block {
		margin: 0 15px;
		padding: 15px 13px;
		background: #fff;
		border-radius: 5px;
		margin-bottom: 10px;
	}
	.bb_header {
		font-size: 18px;
		line-height: 22px;
		color: #747474;
		width: 50%;
	}
	.bb_price {
		font-weight: 600;
		font-size: 18px;
		line-height: 22px;
		text-align: right;
	}
	.instr_block {
		padding-left: 0;
		padding-right: 0;
	}
	.instr_block_header {
		padding-left: 13px;
		padding-right: 13px;
		margin-bottom: 10px;
	}
	.instruments {
		padding: 5px 13px;
		transition: 0.3s;
		&.active {
			background: rgba(255, 138, 0, 0.2);
		}
	}
	.instr_name {
		line-height: 20px;
	}
	.instr_first {
		text-align: right;
		width: 85px;
	}
	.instr_second {
		text-align: right;
		width: 47px;
	}
	.instr_pos {
		color: #747474;
		font-size: 14px;
		line-height: 24px;
	}
	.instr_market_value {
		font-weight: 500;
		font-size: 16px;
		line-height: 20px;
	}
	.instr_change_percent {
		font-weight: 600;
		font-size: 12px;
		line-height: 20px;
		color: #747474;

		&.plus {
			color: rgba(52, 199, 89, 1);
		}
		&.minus {
			color: #ff2d55;
		}
		&.neutral {
			color: #747474;
		}
	}
</style>
