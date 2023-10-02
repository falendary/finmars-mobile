<template>
	<ion-page>

		<ion-header>
			<ion-toolbar class="app-header">


				<div class="app-header-inner">

					{{ store.activeSpaceName || 'Finmars'}}

					<div class="display-flex flex-end flex-align-center">

						<ion-select
							v-model="spaceStore.settings.general.currency"
							placeholder="Currency"
						>
							<ion-select-option
								v-for="item in spaceStore.currencies"
								:value="item.user_code"
							>
								{{ item.short_name }}
							</ion-select-option>
						</ion-select>

						<ion-modal :keep-contents-mounted="true">
							<ion-datetime id="datetime_date" displayFormat="YYYY-MM-DD"
														v-model="spaceStore.settings.general.date_to"
														:prefer-wheel="true"
														presentation="date"
														show-default-buttons
							></ion-datetime>
						</ion-modal>

						<ion-datetime-button class="header-date-button" datetime="datetime_date" />

					</div>

				</div>


			</ion-toolbar>

		</ion-header>

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

			</div>

			<HistoryChartComp
				:date_to="spaceStore.settings.general.date_to"
				:currency="spaceStore.settings.general.currency"
				@portfolioChange="init($event)"
				@refresher="portfoliosRefresher = $event"
				:nav="total_nav"
			/>

			<IndicatorsComp
				:portfolioId="$route.query.tab"
				:currency="spaceStore.settings.general.currency"
				:date="spaceStore.settings.general.date_to"
				@refresher="indicatorsRefresher = $event"
				@nav="total_nav = $event"
			/>

			<!--			Pie Chart below-->

			<div class="header flex aic sb">
				Balance

				<ion-checkbox
					v-model="isChartView"
					labelPlacement="start"
					class="chart_view"
				>
					Chart view
				</ion-checkbox>
			</div>

			<swiper
				v-if="categories && Object.keys(categories).length"
				:pagination="true"
				:modules="[Pagination]"
				class=""
				:loop="true"
				@slideChangeTransitionEnd="onBalanceChange"
				@swiper="onSwiper"
			>
				<swiper-slide v-for="(item, cat) in categories" v-bind:key="cat">
					<div class="balance_block" v-show="item.subcats.length">
						<div class="bb_header_line flex sb aic">
							<div class="bb_header">{{ item.layout_name || (item.verbose_name || item.name) }}</div>
							<div class="bb_price">
								{{ $format(item.market_value) }}
								{{ spaceStore.settings.general.currency }}
							</div>
						</div>

						<div class="flex sb">
							<div
								class="balance_chart_wrap"
								style="width: 145px; height: 145px"
								v-show="isChartView && !chartProcced"
							>
								<canvas :id="`${cat}_balanceChart`"><p>Chart</p></canvas>
							</div>

							<ion-skeleton-text
								v-if="chartProcced"
								class="balance_chart_wrap balance_chart_wrap_skeleton"
								:animated="true"
								style="width: 145px; height: 145px"
							/>

							<div
								class="balance_labels"
								:style="!isChartView ? 'margin-left: 0;' : ''"
							>
								<div
									class="balance_labels_item flex aic sb"
									v-for="(subcat, index) in item.subcats"
									v-bind:key="index"
									:class="{ active: detailSubcat.name == subcat.name }"
									@click="
										;(detailSubcat = subcat), (isOpenTransactions = false)
									"
								>
									<div class="flex aic">
										<div
											class="balance_labels_percent"
											:style="{
												backgroundColor: colorByCat(cat + subcat.name),
											}"
										>
											{{
												Math.floor(
													(subcat.market_value / Math.abs(item.market_value)) *
													100
												)
											}}%
										</div>
										<div class="balance_labels_text">{{ subcat.name }}</div>
									</div>

									<div class="balance_labels_price" v-show="!isChartView">
										{{ $format(subcat.market_value) }}
									</div>
								</div>
							</div>
						</div>
					</div>
					<div v-show="!item.subcats.length">
						<div class="nodata_wrap center aic">
							<div>
								<h3>No data</h3>

								<p>No data</p>
							</div>
						</div>
					</div>
				</swiper-slide>
			</swiper>

			<div v-else class="balance_block">
				<div class="bb_header_line flex sb aic">
					<div class="bb_header">
						<IonSkeletonText
							style="height: 22px; width: 100px"
							:animated="true"
						/>
					</div>
					<div class="bb_price">
						<IonSkeletonText
							style="height: 22px; width: 120px"
							:animated="true"
						/>
					</div>
				</div>

				<div class="flex sb">
					<ion-skeleton-text
						class="balance_chart_wrap balance_chart_wrap_skeleton"
						:animated="true"
						style="width: 145px; height: 145px"
					/>

					<div class="balance_labels">
						<div
							class="balance_labels_item flex aic"
							v-for="(subcat, index) in [3, 3, 3]" v-bind:key="index"
						>
							<IonSkeletonText style="height: 32px" :animated="true" />
						</div>
					</div>
				</div>
			</div>

			<!--			Transactions below-->

			<template v-if="detailSubcat.name">
				<div class="header flex aic sb">Details</div>

				<div class="balance_block instr_block">
					<div class="bb_header_line instr_block_header flex sb aifs">
						<div class="bb_header">{{ detailSubcat.name }}</div>
						<div>
							<div class="bb_price">
								{{ $format(detailSubcat.market_value) }}
								{{ spaceStore.settings.general.currency }}
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
						v-for="(item, index) in detailSubcat.items"
						v-bind:key="index"
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
								{{ $format(item.market_value) }}
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

			<template v-if="isOpenTransactions">
				<div class="header flex aic sb">Transactions</div>

				<TransactionListComp
					v-if="transactionsOpts.filter_entry_user_code"
					:options="transactionsOpts"
				/>
			</template>
		</ion-content>
	</ion-page>
</template>

<script>
	import { computed,  watch } from 'vue'
	import {
		IonCheckbox,
		IonDatetime,
		IonDatetimeButton, IonHeader,
		IonModal, IonPage,
		IonRefresher,
		IonRefresherContent,
		IonSelect,
		IonSelectOption,
		IonSkeletonText,
		IonToolbar
	} from '@ionic/vue'
	import {
		ArcElement,
		CategoryScale,
		Chart,
		DoughnutController,
		Filler,
		Legend,
		LinearScale,
		LineController,
		LineElement,
		PieController,
		PointElement,
		Tooltip
	} from 'chart.js'

	import IndicatorsComp from '@/components/Indicators.vue'
	import HistoryChartComp from '@/components/HistoryChart.vue'
	import TransactionListComp from '@/components/TransactionList.vue'

	import { Swiper, SwiperSlide } from 'swiper/vue'

	import useApi from '@/composables/useApi'
	import useStore from '@/composables/useStore'
	import { reportGroup } from '@/data-utils/reportAggs'
	import { Pagination } from 'swiper'

	Chart.register(
		LineElement,
		PointElement,
		ArcElement,
		DoughnutController,
		LineController,
		PieController,
		CategoryScale,
		LinearScale,
		Filler,
		Legend,
		Tooltip
	)

	export default {
		components: {
			IndicatorsComp,
			HistoryChartComp,
			TransactionListComp,
			IonSkeletonText,
			Swiper, SwiperSlide,
			IonCheckbox,
			IonSelectOption,
			IonSelect,
			IonRefresherContent,
			IonRefresher,
			IonHeader,
			IonPage,
			IonToolbar,
			IonModal, IonDatetimeButton, IonDatetime,

		},
		data() {
			return {
				Pagination: Pagination,
				store: null,
				spaceStore: null,
				portfolio: null,
				total_nav: 0,
				transactionsOpts: null,
				isOpenTransactions: false,
				chartProcced: false,
				colorsCat: {},
				portfoliosRefresher: null,
				indicatorsRefresher: null,
				categories: null,
				activeCategory: '',
				isChartView: true,
				detailSubcat: {  }
			}
		},
		methods: {

			async init() {
				this.chartProcced = true
				this.detailSubcat = {}

				console.log('route.query.tab', this.$route.query.tab)

				this.transactionsOpts.end_date = this.spaceStore.settings.general.date_to
				this.transactionsOpts.portfolios = [this.$route.query.tab]
				this.transactionsOpts.filter_entry_user_code = null

				let report = await this.fetchReport(this.spaceStore.layout.balance.fieldsToGroup)

				if (report && !report.error) {
					if (
						this.spaceStore.layout.balance.fieldToAggrigate &&
						this.spaceStore.layout.balance.fieldsToGroup
					) {
						this.categories = reportGroup({
							report,
							sum_field: this.spaceStore.layout.balance.fieldToAggrigate[0].key,
							colorsCat: this.colorsCat,
							fieldsToGroup: this.spaceStore.layout.balance.fieldsToGroup
						})
					}
				}

				if (this.balanceChartObj && !this.balanceSwiper?.destroyed) {
					console.log('balanceSwiper:', this.balanceSwiper)
					this.balanceSwiper.slideTo(0)
					let catName = Object.keys(this.categories)[0]
					this.activeCategory = this.categories[catName]

					this.balanceChartObj.data = this.createBalanceDataset(this.activeCategory, catName)
					this.balanceChartObj.update()
				}

				this.chartProcced = false
			},

			createBalanceDataset(cat, catName) {
				if (!cat) return false

				let plusColors = []
				let plus = cat.subcats
					.filter((item) => Math.floor(item.market_value) >= 0)
					.map((item) => {
						plusColors.push(this.colorByCat(catName + item.name))
						return item.market_value
					})

				let totalPlus = plus.length ? plus.reduce((a, b) => a + b) : 0

				let minusColors = []
				let minus = cat.subcats
					.filter((item) => item.market_value < 0)
					.map((item) => {
						minusColors.push(this.colorByCat(catName + item.name))

						return item.market_value
					})

				let totalMinus = Math.abs(minus.length ? minus.reduce((a, b) => a + b) : 1)

				let data = {}

				data.labels = cat.subcats.map((item) => item.name)
				data.datasets = [
					{
						data: plus,
						backgroundColor: plusColors,
						hoverOffset: 4,
						circumference:
							totalPlus >= totalMinus
								? 360
								: Math.floor((totalPlus / totalMinus) * 360)
					},
					{
						data: minus,
						backgroundColor: minusColors,
						circumference:
							totalMinus >= totalPlus
								? 360
								: Math.floor((totalMinus / totalPlus) * 360)
					}
				]

				return data
			},
			colorByCat(item) {
				return this.colorsCat[item]
			},
			createChart(cat) {
				console.log('cat:', cat)
				if (this.balanceChartObj) this.balanceChartObj.destroy()

				this.balanceChartObj = new Chart(
					(cat || Object.keys(this.categories)[0]) + '_balanceChart',
					{
						type: 'doughnut',
						data: this.chartData,
						options: {
							cutout: '35%',
							responsive: true,
							maintainAspectRatio: false,
							plugins: {
								legend: {
									display: false
								},

								tooltip: {
									callbacks: {
										label: function(context) {
											let labelIndex = context.dataIndex

											if (context.datasetIndex === 1) {
												labelIndex =
													context.chart.data.datasets[0].data.length + labelIndex
											}

											return (
												context.chart.data.labels[labelIndex] +
												': ' +
												context.formattedValue
											)
										}
									}
								}
							}
						}
					}
				)
			},
			onBalanceChange(swiper) {
				let catName = Object.keys(this.categories)[swiper.realIndex]
				this.activeCategory = this.categories[catName]

				this.createChart(catName)

				this.balanceChartObj.data = this.createBalanceDataset(this.activeCategory, catName)
				this.balanceChartObj.update()
			},
			async fetchReport(fieldsToGroup) {
				let filters = []
				let customFields = ''

				if (fieldsToGroup) {
					customFields = fieldsToGroup
						.filter((o) => o.custom_field)
						.map((item) => item.custom_field.name)
						.join(',')
				}

				let res = await useApi('balanceReport.post', {
					body: {
						account_mode: 0, // Ignore Accounts, important
						accounts: [],
						accounts_cash: [],
						accounts_position: [],
						allocation_detailing: true,
						allocation_mode: 0,
						approach_multiplier: 0.5,
						calculate_pl: true,
						calculationGroup: 'portfolio',
						complex_transaction_statuses_filter: 'booked',
						cost_method: 1,
						custom_fields_to_calculate: customFields,
						date_field: 'transaction_date',
						depth_level: 'base_transaction',
						expression_iterations_count: 1,
						filters,
						pl_include_zero: false,
						portfolio_mode: 1,
						portfolios: [this.$route.query.tab],
						pricing_policy: this.spaceStore.settings.general.pricing_policy,
						report_currency: this.spaceStore.settings.general.currency,
						report_date: this.spaceStore.settings.general.date_to,
						report_type: 1,
						show_balance_exposure_details: false,
						show_transaction_details: true,
						strategies1: [],
						strategies2: [],
						strategies3: [],
						strategy1_mode: 0,
						strategy2_mode: 0,
						strategy3_mode: 0,
						table_font_size: 'small',
						transaction_classes: [],
						pl_first_date: null,
						task_id: null
					}
				})

				return res
			},
			async refresh(event) {
				await Promise.all([
					this.init(),
					this.portfoliosRefresher(true),
					this.indicatorsRefresher()
				])

				if (event) event.target.complete()
			},
			onSwiper(swiper) {
				this.balanceSwiper = swiper
				this.createChart()

				let catName = Object.keys(this.categories)[0]
				this.activeCategory = this.categories[catName]

				if (!this.activeCategory) {
					console.error('No categories')
					return false
				}

				this.balanceChartObj.data = this.createBalanceDataset(this.activeCategory, catName)
				this.balanceChartObj.update()
			}

		},
		created() {

			this.store = useStore()
			this.spaceStore = computed(() => this.store.spaces[this.store.activeSpaceCode])


		},
		mounted() {

			this.portfolio = computed(() => {
				return this.spaceStore.portfolioList.find((o) => o.user_code == this.$route.query.tab)
			})

			this.transactionsOpts = {
				end_date: this.spaceStore.settings.general.date_to,
				begin_date: '0001-01-01',
				portfolios: this.$route.query.tab,
				filter_entry_user_code: null
			}

			this.chartData = {
				labels: [],
				datasets: [
					{
						data: [],
						hoverOffset: 4
					},
					{
						data: [],
						circumference: 180
					}
				]
			}


			if (this.$route.query.tab) this.init()

			watch(
				() => this.$route.query.tab,
				(newVal, oldVal) => {
					if (!this.$route.path.includes('/main/balance') || newVal == oldVal)
						return false

					this.total_nav = null
					Promise.all([this.init(), this.portfoliosRefresher(), this.indicatorsRefresher()])
				}
			)
			watch(this.spaceStore.settings.general, () => {
				Promise.all([this.init(), this.portfoliosRefresher(), this.indicatorsRefresher()])
			})

		}
	}


</script>

<style lang="scss" scoped>
	.header {
		color: var(--ion-text-color);
		padding: 0 15px;
		font-weight: 500;
		font-size: 1.1rem;
		margin-bottom: 15px;
	}

	.chart_view {
		font-size: 14px;
	}

	.header_info {
		font-size: 0.6rem;
	}

	ion-content {
		--padding-top: 16px;
		--padding-bottom: 20px;
		//--background: #fafafa;
		//--background: #eff4f7;
	}

	ion-skeleton-text {
		margin: 0;
	}

	.balance_chart_wrap_skeleton {
		border-radius: 50%;
		--background: rgba(255, 138, 0, 0.2);
		--background-rgb: 255, 138, 0;
	}

	.balance_swiper {
		padding-bottom: 10px;
	}

	.balance_chart_wrap {
		flex-shrink: 0;
	}

	.balance_block {
		margin: 0 15px;
		padding: 15px 13px 12px;
		background: var(--ion-card-background);
		border-radius: 5px;
	}

	.instr_block {
		margin-bottom: 10px;
	}

	.swiper-slide .balance_block {
		height: 100%;
	}

	.bb_header {
		font-size: 18px;
		line-height: 22px;
		color: var(--ion-text-color);
		width: 50%;
	}

	.bb_price {
		font-weight: 600;
		font-size: 18px;
		line-height: 22px;
		text-align: right;
	}

	.bb_header_line {
		margin-bottom: 25px;
	}

	.balance_labels {
		margin-left: 10px;
		width: 100%;
	}

	.balance_labels_item {
		padding: 6px 8px;
		padding-right: 4px;
		transition: 0.3s;

		&.active {
			background: rgba(255, 138, 0, 0.2);
		}
	}

	.balance_labels_price {
		font-weight: 500;
		font-size: 16px;
		line-height: 22px;
	}

	.balance_labels_percent {
		padding: 3px 0;
		background: #747474;
		flex-shrink: 0;
		color: #fff;
		font-size: 14px;
		width: 50px;
		text-align: center;
		border-radius: 5px;
		margin-right: 6px;
	}

	.balance_labels_text {
		font-size: 14px;
		line-height: 16px;
		color: #747474;
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

	.instr_block_change {
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

	.nodata_wrap {
		text-align: center;
		background: var(--ion-card-background);
		height: 200px;

		h3 {
			font-size: 18px;
		}

		p {
			color: #747474;
		}
	}
</style>
