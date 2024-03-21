<template>
	<ion-page>

		<ion-content v-if="activeTab">
			<ion-refresher slot="fixed" @ionRefresh="refresh($event)">
				<ion-refresher-content />
			</ion-refresher>

			<position-search-bar></position-search-bar>

			<div class="header flex sb aic">
				<div>Portfolios</div>
			</div>

			<HistoryChartComp
				v-if="activeTab"
				:date_to="spaceStore.settings.general.date_to"
				:currency="spaceStore.settings.general.currency"
				:activeTab="activeTab"
				@tabChange="tabChangeHandler"
				@refresher="portfoliosRefresher = $event"
			/>


			<div class="portfolio-content">

				<div v-if="activeTab !== 'All' && spaceStore.settings.general.period_type !== 'custom'">

					<div class="header header-with-period-type-picker" style="margin: 0;">
						<div>Metrics</div>
					</div>

					<metrics-block :portfolio="[activeTab]" @refresher="metricsBlockRefresher = $event"></metrics-block>

				</div>

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
										;(activeCategory = item), (fetchPositions())
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
					<div class="header flex aic sb" style="justify-content: space-between"><span>Details</span>
						<span>{{ spaceStore.settings.general.currency }}</span></div>

					<div class="balance_block instr_block">
						<div class="bb_header_line instr_block_header flex sb aifs">
							<div class="bb_header">{{ activeCategory.___group_name }}</div>
							<div>
								<div class="bb_price">
									{{ $format(activeCategory.subtotal[spaceStore.settings.balance.sumByKey]) }}
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
							v-for="(item, index) in positions"
							v-bind:key="index"
						>
							<position-item :item="item" :item-type="'balance'" :portfolios="activePortfolios"></position-item>
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
		IonSearchbar,
		IonSelect,
		IonSelectOption,
		IonSkeletonText,
		IonTitle,
		IonToolbar
	} from '@ionic/vue'

	import HistoryChartComp from '@/components/HistoryChart.vue'
	import TransactionListComp from '@/components/TransactionList.vue'

	import useApi from '@/composables/useApi'
	import useStore from '@/composables/useStore'
	import { Pagination } from 'swiper'
	import { cogOutline, searchOutline } from 'ionicons/icons'

	import { Doughnut } from 'vue-chartjs'
	import ProgressCircular from '@/components/ProgressCircular.vue'
	import SearchDialog from '@/views/dialogs/SearchDialog.vue'
	import MetricsBlock from '@/components/MetricsBlock.vue'
	import PeriodTypePicker from '@/components/PeriodTypePicker.vue'
	import PositionItem from '@/components/PositionItem.vue'
	import PositionSearchBar from '@/components/PositionSearchBar.vue'

	export default {
		components: {
			PeriodTypePicker,
			ProgressCircular,
			IonItem,
			IonContent,
			IonTitle,
			IonButton,
			IonButtons,
			IonIcon,
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
			IonSearchbar,

			Doughnut,

			SearchDialog,

			MetricsBlock,
			PositionItem,
			PositionSearchBar


		},
		data() {
			return {
				icons: {
					cogOutline,
					searchOutline
				},
				Pagination: Pagination,
				store: null,
				spaceStore: null,
				activePortfolios: [],
				categoriesTotalSum: null,
				portfolioHistory: null,
				transactionsOpts: null,
				chartProcessing: true,
				positionsProcessing: false,
				colorsCat: {},
				portfoliosRefresher: null,
				categories: [],
				positions: [],
				activeCategory: null,
				detailSubcat: {},
				chartSettingsModalIsOpen: false,


				numericBalanceReportAttributes: [],
				groupByAttributes: [],
				chartData: null,
				activeInstrument: null,

				selectedPositionForDialog: null,

				activePosition: {},
				metricsBlockRefresher: null,

				activeTab: null,
				pageReady: false

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
				return this.spaceStore.portfolios.find((o) => o.user_code == this.activeTab)
			}
		},
		methods: {

			async submitSearchResult() {

				if (!this.spaceStore.searchType) {
					console.log("balance.submitSearchResult.noType: do_refresh")
					this.refresh();
				}

				if (this.spaceStore.searchType && this.spaceStore.searchType !== 'balance') {
					console.log("balance.submitSearchResult.searchResult_exists: wrong_type")
					return;
				}

				let item = this.spaceStore.searchResult

				console.log('Balance.submitSearchResult.item', item)
				console.log('Balance.submitSearchResult.categories', this.categories)

				this.positions = []

				if (item) {

					await this.fetchCategories();

					this.categories.forEach((category) => {

						// because we use user_code instead of names and other non unique fields for relations
						// also because of user_code not equal to name of instrument type
						// probably will cause error if Account Name and Account User Code are different
						// TODO consider refactor in future
						// 2023-11-18 szhitenev
						if (this.spaceStore.settings.balance.groupByKey === 'instrument.instrument_type.name') {

							if (category.___group_identifier === item['instrument.instrument_type.user_code']) {
								this.activeCategory = category
							}

						} else {

							if (category.___group_identifier === item[this.spaceStore.settings.balance.groupByKey]) {
								this.activeCategory = category
							}

						}


					})

					console.log('submitSearchResult.activeCategory', this.activeCategory)

					await this.fetchPositions()

					this.positions = this.positions.filter((position) => {
						return position.id === item.id
					})

				} else {
					this.refresh()
				}
				// Todo refactor
				// this.activatePosition(new Event('click'), item)

			},

			roundToTwo(num) {
				return +(Math.round(num + 'e+2') + 'e-2')
			},
			saveChartSettings() {
				this.chartSettingsModalIsOpen = false
				this.activeCategory = null
				this.createChart()
			},

			async tabChangeHandler(data) {

				console.log('Balance.tabChangeHandler', data)

				this.$router.push({
					query: {
						tab: data.activeTab
					}
				})

				this.activeTab = data.activeTab
				this.spaceStore.activeTab = data.activeTab

				await this.init()

			},
			async init() {

				this.activePortfolios = this.getPortfoliosForReportSettings()
				this.activeCategory = null

				this.positions = []
				await this.createChart()


			},
			async fetchBalanceReportAttributes() {

				this.groupByAttributes = []

				let res = await useApi('balanceReportAttributes.get')

				// Market value
				// Market value, %
				// Exposure
				// Exposure, %
				// P&L
				// Capital Gain (Principal)
				// Carry P&L
				// Overheads

				this.numericBalanceReportAttributes = [
					{
						key: 'market_value',
						name: 'Market Value',
						value_type: 20
					},
					{
						key: 'market_value_percent',
						name: 'Market Value, %',
						value_type: 20
					},
					{
						key: 'exposure',
						name: 'Exposure',
						value_type: 20
					},
					{
						key: 'exposure_percent',
						name: 'Exposure, %',
						value_type: 20
					},
					{
						key: 'total',
						name: 'P&L',
						value_type: 20
					},
					{
						key: 'principal',
						name: 'Capital Gain (Principal)',
						value_type: 20
					},
					{
						key: 'carry',
						name: 'Carry P&L',
						value_type: 20
					},
					{
						key: 'overheads',
						name: 'Overheads',
						value_type: 20
					}
				]

				res = await useApi('instrumentAttributes.get')

				const instrumentAttributes = res.results.filter((item) => {
					return item.key.indexOf('attributes') !== -1 && item.name.indexOf('Pricing Policy') === -1
				}).map(function(item) {
					item.key = 'instrument.' + item.key
					return item
				})

				this.groupByAttributes = [...this.groupByAttributes, ...instrumentAttributes]

				this.groupByAttributes.push({
					key: 'portfolio.name',
					name: 'Portfolio',
					value_type: 10
				})

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

			getPortfoliosForReportSettings() {

				if (this.activeTab === 'All') {
					return this.spaceStore.settings.general.portfolios
				} else {
					return [this.activeTab]
				}

			},

			async fetchCategories() {

				const res = await this.fetchReport()

				this.categories = res.items.sort((a, b) => b.subtotal[this.spaceStore.settings.balance.sumByKey] - a.subtotal[this.spaceStore.settings.balance.sumByKey])

				this.categoriesTotalSum = 0

				this.categories.forEach((item) => {
					this.categoriesTotalSum = this.categoriesTotalSum + item.subtotal[this.spaceStore.settings.balance.sumByKey]
				})

			},

			async createChart() {

				this.chartProcessing = true

				this.chartData = null

				await this.fetchCategories();

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

									return (
										context.formattedValue
									)
								}
							}
						}
					}
				}

				this.activeCategory = this.categories[0]

				this.chartProcessing = false

				this.fetchPositions()


				// console.log('createChart.chartData', this.chartData)
				// console.log('createChart.chartProcessing', this.chartProcessing)

			},
			async fetchReport() {
				let filters = []

				let res = await useApi('backendBalanceReportGroups.post', {
					body: {
						account_mode: this.spaceStore.settings.general.consolidateAccounts ? 0 : 1, // 0 - ignore, 1 - independent
						accounts: this.spaceStore.settings.general.accounts,
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
						portfolios: this.getPortfoliosForReportSettings(),
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
						account_mode: this.spaceStore.settings.general.consolidateAccounts ? 0 : 1, // 0 - ignore, 1 - independent
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
						portfolios: this.getPortfoliosForReportSettings(),
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
					this.portfoliosRefresher(true)
				}

				if (this.metricsBlockRefresher) {
					this.metricsBlockRefresher()
				}

				if (event) event.target.complete()
			}
		},
		async created() {

			this.store = useStore()
			this.spaceStore = computed(() => this.store.getActiveSpaceStore())

		},
		async mounted() {

			console.log('Balance.mounted')
			this.pageReady = true

			await this.fetchBalanceReportAttributes()

			this.activeTab = this.$route.query.tab || 'All'

			if (this.$router.options.history.state.back.indexOf('?tab=') !== -1) {
				let activeTabFromHistory = this.$router.options.history.state.back.split('?tab=')[1]
				activeTabFromHistory = decodeURIComponent(activeTabFromHistory.replace(/\+/g, ' '))
				this.activeTab = activeTabFromHistory
			}

			this.spaceStore.activeTab = this.activeTab

			await this.init()

			if (this.spaceStore.searchResult) {
				await this.submitSearchResult();
			}

			this.tabWatch = watch(
				() => this.spaceStore.activeTab,
				async (newVal) => {

					console.log('Balance.tabWatch.this.spaceStore', newVal)

					this.activeTab = newVal

					await this.init()

				}
			)

			this.settingsWatch = watch(() => this.spaceStore.settings.general, async () => {

				console.log("Balance.watch.settings.general")

				await this.refresh()

			}, { deep: true})

			this.searchWatch = watch(() => this.spaceStore.searchResult, async (newVal, oldVal) => {

				console.log("balance.watch.spaceStore.searchResult", newVal);

				await this.submitSearchResult();

			},{ deep: true})


		},

		beforeUnmount() {

			// https://vuejs.org/guide/essentials/watchers.html#stopping-a-watcher
			if (this.tabWatch) {
				this.tabWatch()
			}

			if (this.settingsWatch) {
				this.settingsWatch()
			}

			if (this.searchWatch) {
				this.searchWatch();
			}

		}
	}

</script>

<style lang="scss" scoped>

	.portfolio-content {
		margin-top: 0.5rem;
	}

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
