<template>
	<ion-page >

		<ion-header>
			<ion-toolbar class="app-header">

				<div class="app-header-inner">

					<div class="app-header-inner-space-name">{{ store.activeSpaceName || 'Finmars' }}</div>

					<div class="display-flex flex-end flex-align-center">

						<ion-select
							v-model="spaceStore.settings.general.currency"
							placeholder="Currency"
						>
							<ion-select-option
								v-for="item in spaceStore.currencies"
								v-bind:key="item.user_code"
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

		<ion-content v-if="$route.query.tab">
			<ion-refresher slot="fixed" @ionRefresh="refresh($event)">
				<ion-refresher-content />
			</ion-refresher>

			<div class="header flex sb aic">
				<!--				<div v-if="portfolio">{{ portfolio.name }}</div>-->
				<div>Portfolios</div>
				<!--				<IonSkeletonText-->
				<!--					v-if="!portfolio"-->
				<!--					:animated="true"-->
				<!--					style="height: 24px; width: 80px"-->
				<!--				/>-->

			</div>

			<HistoryChartComp
				:date_to="spaceStore.settings.general.date_to"
				:currency="spaceStore.settings.general.currency"
				@portfolioChange="portfolioChangeHandler"
				@refresher="portfoliosRefresher = $event"
			/>


			<div class="portfolio-content">

				<IndicatorsComp
					:portfolioId="$route.query.tab"
					:currency="spaceStore.settings.general.currency"
					:pricing_policy="spaceStore.settings.general.pricing_policy"
					:date="spaceStore.settings.general.date_to"
					@refresher="indicatorsRefresher = $event"
				/>

				<!--			Pie Chart below-->

				<div class="header flex aic sb">
					Balance

					<ion-icon :icon="icons.cogOutline" size="large" @click="chartSettingsModalIsOpen = true"></ion-icon>

				</div>

				<div v-show="!chartProcessing">

					<div class="balance_block">
						<div class="bb_header_line flex sb aic">
							<div class="bb_header">{{ groupByName }}</div>
							<div class="bb_price">
								{{ $format(categoriesTotalSum) }}
								{{ spaceStore.settings.general.currency }}
							</div>
						</div>

						<div class="flex sb">
							<div
								class="balance_chart_wrap"
								style="width: 145px; height: 145px"
								v-if="spaceStore.settings.balance.isChartView && chartData"
							>

								<Doughnut :options="chartData.options" :data="chartData.data"></Doughnut>

							</div>

							<div
								class="balance_labels"
								:style="!spaceStore.settings.balance.isChartView ? 'margin-left: 0;' : ''"
							>
								<div
									class="balance_labels_item flex aic sb"
									v-for="(item, index) in categories"
									v-bind:key="index"
									:class="{ active: activeCategory && activeCategory.___group_name == item.___group_name }"
									@click="
										;(activeCategory = item), (isOpenTransactions = false), (fetchPositions())
									"
								>
									<div class="flex aic">
										<div
											class="balance_labels_percent"
											:style="{
												backgroundColor: colorByCat(item.___group_name, index),
											}"
										>
											{{
												roundToTwo(
													(Math.abs(item.subtotal[spaceStore.settings.balance.sumByKey]) / categoriesTotalSum) *
													100
												)
											}}%
										</div>
										<div class="balance_labels_text">{{ item.___group_name }}</div>
									</div>

									<div class="balance_labels_price" v-show="!spaceStore.settings.balance.isChartView">
										{{ $format(item.subtotal[spaceStore.settings.balance.sumByKey]) }}
									</div>
								</div>
							</div>
						</div>
					</div>
					<div v-show="!categories.length">
						<div class="nodata_wrap center aic">
							<div>
								<h3>No data</h3>

								<p>No data</p>
							</div>
						</div>
					</div>

				</div>

				<div v-show="chartProcessing" class="balance_block">

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

				<!-- Positions below-->

				<div v-if="!positionsProcessing && activeCategory">
					<div class="header flex aic sb">Details</div>

					<div class="balance_block instr_block">
						<div class="bb_header_line instr_block_header flex sb aifs">
							<div class="bb_header">{{ activeCategory.___group_name }}</div>
							<div>
								<div class="bb_price">
									{{ $format(activeCategory.subtotal[spaceStore.settings.balance.sumByKey]) }}
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
							v-for="(item, index) in positions"
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
										item.name.length > 80
											? item.name.slice(0, 80) + '...'
											: item.name
									}}
								</div>
								<div class="instr_market_value instr_first">
									{{ $format(item.market_value) }}
								</div>
							</div>
							<div class="flex sb">
								<div class="instr_pos">{{ $format(item.position_size) }}</div>

								<!--							<div class="flex" v-if="item.item_type != 2">-->
								<!--								<div class="instr_change_percent instr_first">-->
								<!--									{{ $format(item.change.value) }}-->
								<!--								</div>-->
								<!--								<div-->
								<!--									class="instr_change_percent instr_second"-->
								<!--									:class="[item.change.percent > 0 ? 'plus' : 'minus']"-->
								<!--								>-->
								<!--									{{ item.change.percent }}%-->
								<!--								</div>-->
								<!--							</div>-->
							</div>
						</div>
					</div>

				</div>

				<div v-if="positionsProcessing" class="balance_block" style="margin-top: 1rem">

					<IonSkeletonText
						:animated="true"
						style="width: 240px; height: 24px; margin-bottom: 0.3rem"
					/>

					<IonSkeletonText
						:animated="true"
						style="width: 160px; height: 24px; margin-bottom: 0.3rem"
					/>

					<IonSkeletonText
						:animated="true"
						style="width: 240px; height: 24px; margin-bottom: 0.3rem"
					/>

				</div>

				<!-- Transactions below-->

				<template v-if="isOpenTransactions">
					<div class="header flex aic sb">Transactions</div>

					<TransactionListComp
						v-if="transactionsOpts.filter_entry_user_code"
						:options="transactionsOpts"
					/>
				</template>

			</div>

			<ion-modal ref="modal" :is-open="chartSettingsModalIsOpen">
				<ion-header>
					<ion-toolbar>
						<ion-title>Chart Settings</ion-title>
						<ion-buttons slot="end">
							<ion-button @click="chartSettingsModalIsOpen = false;">Close</ion-button>
						</ion-buttons>
					</ion-toolbar>
				</ion-header>
				<ion-content class="ion-padding" style="padding-bottom: 1rem;">

					<div>

						<div style="margin-bottom: 1rem">
							<ion-checkbox
								v-model="spaceStore.settings.balance.isChartView"
								labelPlacement="start"
								class="chart_view"
							>
								Chart view
							</ion-checkbox>
						</div>
						<div style="margin-bottom: 1rem">
							<ion-checkbox
								v-model="spaceStore.settings.balance.consolidateAccounts"
								labelPlacement="start"
								class="chart_view"
							>
								Consolidate Accounts
							</ion-checkbox>
						</div>


						<ion-item v-if="numericBalanceReportAttributes?.length">
							<ion-select
								v-model="spaceStore.settings.balance.sumByKey"
								label="Sum By"
								placeholder="Market Value"
							>
								<ion-select-option
									v-for="item in numericBalanceReportAttributes"
									v-bind:key="item.key"
									:value="item.key"
								>
									{{ item.name }}
								</ion-select-option>
							</ion-select>
						</ion-item>

						<ion-item v-if="groupByAttributes?.length">
							<ion-select
								v-model="spaceStore.settings.balance.groupByKey"
								label="Group By"
								placeholder="Instrument Type"
							>
								<ion-select-option
									v-for="item in groupByAttributes"
									v-bind:key="item.key"
									:value="item.key"
								>
									{{ item.name }}
								</ion-select-option>
							</ion-select>
						</ion-item>

						<div class="display-flex" style="justify-content: end; margin-top: 0.5rem">
							<ion-button @click="saveChartSettings()" style="width: 100px;">Save</ion-button>
						</div>

					</div>

				</ion-content>
			</ion-modal>

		</ion-content>
	</ion-page>
</template>

<script>
	import { computed, watch } from 'vue'
	import {
		IonButton,
		IonButtons,
		IonCheckbox,
		IonContent,
		IonDatetime,
		IonDatetimeButton,
		IonHeader,
		IonIcon,
		IonItem,
		IonModal,
		IonPage,
		IonRefresher,
		IonRefresherContent,
		IonSelect,
		IonSelectOption,
		IonSkeletonText,
		IonTitle,
		IonToolbar
	} from '@ionic/vue'


	import IndicatorsComp from '@/components/Indicators.vue'
	import HistoryChartComp from '@/components/HistoryChart.vue'
	import TransactionListComp from '@/components/TransactionList.vue'

	import useApi from '@/composables/useApi'
	import useStore from '@/composables/useStore'
	import { Pagination } from 'swiper'
	import { cogOutline } from 'ionicons/icons'

	import { Bar, Doughnut } from 'vue-chartjs'

	export default {
		components: {
			IonItem,
			IonContent,
			IonTitle,
			IonButton,
			IonButtons,
			IonIcon,
			IndicatorsComp,
			HistoryChartComp,
			TransactionListComp,
			IonSkeletonText,
			IonCheckbox,
			IonSelectOption,
			IonSelect,
			IonRefresherContent,
			IonRefresher,
			IonHeader,
			IonPage,
			IonToolbar,
			IonModal, IonDatetimeButton, IonDatetime,

			Doughnut,
			Bar

		},
		data() {
			return {
				icons: {
					cogOutline
				},
				Pagination: Pagination,
				store: null,
				spaceStore: null,
				categoriesTotalSum: null,
				transactionsOpts: null,
				isOpenTransactions: false,
				chartProcessing: true,
				positionsProcessing: false,
				colorsCat: {},
				portfoliosRefresher: null,
				indicatorsRefresher: null,
				categories: [],
				positions: [],
				activeCategory: null,
				detailSubcat: {},
				chartSettingsModalIsOpen: false,

				numericBalanceReportAttributes: [],
				groupByAttributes: [],
				chartData: null
			}
		},
		computed: {
			groupByName() {

				let result = null

				this.groupByAttributes.forEach((item) => {

					if (item.key === this.spaceStore.settings.balance.groupByKey) {
						result = item
					}

				})

				if (!result) {
					return this.spaceStore.settings.balance.groupByKey
				} else {
					return result.name
				}

			},

			portfolio() {
				return this.spaceStore.portfolioList.find((o) => o.user_code == this.$route.query.tab)
			}
		},
		methods: {
			roundToTwo(num) {
				return +(Math.round(num + 'e+2') + 'e-2')
			},
			saveChartSettings() {
				this.chartSettingsModalIsOpen = false
				this.activeCategory = null
				this.createChart()
			},
			async portfolioChangeHandler(data) {

				console.log("Balance.portfolioChangeHandler", data);

				this.$router.push({
					query: {
						tab: data.activePortfolio
					}
				})

				// this.init()

			},
			async init() {

				this.activeCategory = null
				this.isOpenTransactions = false;

				this.transactionsOpts = {
					end_date: this.spaceStore.settings.general.date_to,
					begin_date: '0001-01-01',
					portfolios: [this.$route.query.tab],
					filter_entry_user_code: null,
					dept_level: 'entry'
				}

				await this.createChart()

			},
			async fetchBalanceReportAttributes() {

				this.groupByAttributes = []

				let res = await useApi('balanceReportAttributes.get')

				this.numericBalanceReportAttributes = res.results.filter((item) => {
					return item.value_type == 20
				})

				res = await useApi('instrumentAttributes.get')

				const instrumentAttributes = res.results.filter((item) => {
					return item.key.indexOf('attributes') !== -1 && item.name.indexOf('Pricing Policy') === -1
				}).map(function(item) {
					item.key = 'instrument.' + item.key
					return item
				})

				this.groupByAttributes = [...this.groupByAttributes, ...instrumentAttributes]

				this.groupByAttributes.push({
					key: 'pricing_currency.short_name',
					name: 'Pricing Currency',
					value_type: 10
				})
				this.groupByAttributes.push({
					key: 'exposure_currency.short_name',
					name: 'Exposure Currency',
					value_type: 10
				})
				this.groupByAttributes.push({
					key: 'account.name',
					name: 'Account',
					value_type: 10
				})
				this.groupByAttributes.push({
					key: 'instrument.instrument_type.name',
					name: 'Instrument Type',
					value_type: 10
				})
				this.groupByAttributes.push({
					key: 'instrument.country.name',
					name: 'Country',
					value_type: 10
				})
				this.groupByAttributes.push({
					key: 'item_type_name',
					name: 'Item Type',
					value_type: 10
				})

				// console.log('this.groupByAttributes', this.groupByAttributes);

			},
			colorByCat(item, index) {

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

				return colors[index]
			},
			async createChart() {

				this.chartProcessing = true

				this.chartData = null

				const res = await this.fetchReport()


				this.categories = res.items.sort((a, b) => b.subtotal[this.spaceStore.settings.balance.sumByKey] - a.subtotal[this.spaceStore.settings.balance.sumByKey])

				this.categoriesTotalSum = 0

				this.categories.forEach((item) => {
					this.categoriesTotalSum = this.categoriesTotalSum + item.subtotal[this.spaceStore.settings.balance.sumByKey]
				})

				if (this.balanceChartObj) {
					this.balanceChartObj.destroy()
				}

				this.chartData = {}

				this.chartData.data = {
					labels: this.categories.map((item) => {
						return item.___group_name
					}),
					datasets: [
						{
							data: this.categories.map((item) => {
								return item.subtotal[this.spaceStore.settings.balance.sumByKey]
							}),
							backgroundColor: this.categories.map((item, index) => {
								return this.colorByCat(item, index)
							}),
							borderWidth: 0
						}
					]
				}

				this.chartData.options = {
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

				this.chartProcessing = false


				// console.log('createChart.chartData', this.chartData)
				// console.log('createChart.chartProcessing', this.chartProcessing)

			},
			async fetchReport() {
				let filters = []

				let res = await useApi('backendBalanceReportGroups.post', {
					body: {
						account_mode: this.spaceStore.settings.balance.consolidateAccounts ? 0 : 1, // 0 - ignore, 1 - independent
						accounts: [],
						accounts_cash: [],
						accounts_position: [],
						allocation_detailing: true,
						allocation_mode: 0,
						approach_multiplier: 0.5,
						calculate_pl: true,
						calculationGroup: 'portfolio',
						cost_method: 1,
						custom_fields_to_calculate: '',
						expression_iterations_count: 1,
						filters,
						frontend_request_options: {
							columns: [
								{
									'key': this.spaceStore.settings.balance.groupByKey,
									'value_type': 10
								},
								{
									'key': this.spaceStore.settings.balance.sumByKey,
									'report_settings': {
										'subtotal_formula_id': 1 // sum
									},
									'value_type': 20
								}
							],
							groups_types: [
								{
									'key': this.spaceStore.settings.balance.groupByKey,
									'value_type': 10
								}
							],
							page: 1,
							filter_settings: []
						},
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
						task_id: null
					}
				})

				return res
			},
			async fetchPositions() {

				this.positionsProcessing = true

				let res = await useApi('backendBalanceReportItems.post', {
					body: {
						account_mode: this.spaceStore.settings.balance.consolidateAccounts ? 0 : 1, // 0 - ignore, 1 - independent
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
						custom_fields_to_calculate: '',
						date_field: 'transaction_date',
						depth_level: 'base_transaction',
						expression_iterations_count: 1,
						frontend_request_options: {
							groups_types: [
								{
									'key': this.spaceStore.settings.balance.groupByKey,
									'value_type': 10
								}
							],
							groups_values: [
								this.activeCategory.___group_identifier
							],
							page: 1,
							filter_settings: []
						},
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

				this.positions = res.items.sort((a, b) => b[this.spaceStore.settings.balance.sumByKey] - a[this.spaceStore.settings.balance.sumByKey])

				this.positionsProcessing = false

			},
			async refresh(event) {

				await this.init()

				if (this.portfoliosRefresher) {
					await this.portfoliosRefresher(true)
				}

				if (this.indicatorsRefresher) {
					await this.indicatorsRefresher()
				}

				if (event) event.target.complete()
			}
		},
		created() {

			this.store = useStore()
			this.spaceStore = computed(() => this.store.spaces[this.store.activeSpaceCode])

		},
		async mounted() {

			console.log('Balance.mounted')

			await this.fetchBalanceReportAttributes()

			console.log('this.$route.query.tab', this.$route.query.tab)
			if (this.$route.query.tab) {
				this.init()
			} else {
				this.$router.push({ query: { tab: this.spaceStore.portfolioList[0].user_code } })
			}

			watch(
				() => this.$route.query.tab,
				async (newVal, oldVal) => {

					if (!this.$route.path.includes('/main/balance') || newVal == oldVal)
						return false

					await this.init()

					if (this.indicatorsRefresher) {
						await this.indicatorsRefresher()
					}

				}
			)

			watch(this.spaceStore.settings.general, async () => {

				await this.init()

				if (this.portfoliosRefresher) {
					await this.portfoliosRefresher()
				}
				if (this.indicatorsRefresher) {
					await this.indicatorsRefresher()
				}

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
		margin: 0 15px 10px;
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
		width: 60px;
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
		font-size: 0.6rem;
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
