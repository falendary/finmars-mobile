<template>
	<ion-page v-if="pageReady">

		<ion-content v-if="activePath === '/main/pnl'">
			<ion-refresher slot="fixed" @ionRefresh="refresh($event)">
				<ion-refresher-content />
			</ion-refresher>

			<div v-if="!pageProcessing">

				<position-search-bar></position-search-bar>

				<div class="header flex sb aic">
					<div>Portfolios</div>
					<!--				<IonSkeletonText-->
					<!--					v-else-->
					<!--					:animated="true"-->
					<!--					style="height: 24px; width: 80px"-->
					<!--				/>-->

				</div>

				<HistoryChartComp
					v-if="activeTab"
					type="pnl"
					:date_from="spaceStore.settings.general.date_from"
					:date_to="spaceStore.settings.general.date_to"
					:currency="spaceStore.settings.general.currency"
					@tabChange="tabChangeHandler"
					@refresher="portfoliosRefresher = $event"
				/>

				<div class="portfolio-content"></div>

				<div v-if="activeTab !== 'All' && spaceStore.settings.general.period_type !== 'custom'">

					<div class="header header-with-period-type-picker" style="margin: 0;">
						<div>Metrics</div>
					</div>

					<metrics-block :portfolio="[activeTab]" @refresher="metricsBlockRefresher = $event"></metrics-block>

				</div>

				<div class="header flex aic sb">
					Profit & Loss

					<ion-icon :icon="icons.cogOutline" size="large" @click="chartSettingsModalIsOpen = true"></ion-icon>

				</div>

				<div v-show="!chartProcessing">

					<div class="balance_block">
						<div class="bb_header_line flex sb aic">
							<div class="bb_header">{{ groupByName }}</div>
							<div class="bb_price">
								{{ $format(categoriesTotalTrueSum) }}
								{{ spaceStore.settings.general.currency }}
							</div>
						</div>

						<div class="flex sb">
							<div
								class="balance_chart_wrap"
								style="width: 100%;"
								:style="{ height: chartHeight + 'px' }"
								v-if="spaceStore.settings.pl.isChartView && chartData"
							>

								<Bar :options="chartData.options" :data="chartData.data"></Bar>

							</div>

							<div v-if="!spaceStore.settings.pl.isChartView"
									 class="balance_labels"
									 :style="!spaceStore.settings.pl.isChartView ? 'margin-left: 0;' : ''"
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
											style="width: 24px;
    border-radius: 50%;"
											:style="{
												backgroundColor: colorByCat(item.___group_name, index),
											}"
										>
											&nbsp;
										</div>

										<!--									<div-->
										<!--										class="balance_labels_percent"-->
										<!--										:style="{-->
										<!--												backgroundColor: colorByCat(item.___group_name, index),-->
										<!--											}"-->
										<!--									>-->
										<!--										<span v-if="item.subtotal[spaceStore.settings.pl.sumByKey] < 0">-</span>{{ roundToTwo(-->
										<!--										(Math.abs(item.subtotal[spaceStore.settings.pl.sumByKey]) / categoriesTotalSum) *-->
										<!--										100-->
										<!--									)-->
										<!--										}}%-->
										<!--									</div>-->
										<div class="balance_labels_text">{{ item.___group_name }}</div>
									</div>

									<div class="balance_labels_price" v-show="!spaceStore.settings.pl.isChartView"
											 :class="{ 'negative-number': item.subtotal[spaceStore.settings.pl.sumByKey] < 0}">
										{{ $format(item.subtotal[spaceStore.settings.pl.sumByKey]) }}
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

					<div class="balance_block instr_block" v-if="!positionsError">
						<div class="bb_header_line instr_block_header flex sb aifs">
							<div class="bb_header">{{ activeCategory.___group_name }}</div>
							<div>
								<div class="bb_price" v-if="!spaceStore.searchResult">
									{{ $format(activeCategory.subtotal[spaceStore.settings.pl.sumByKey]) }}
									<!--								{{ spaceStore.settings.general.currency }}-->
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

							<position-item :item="item" :item-type="'pl'" :portfolios="activePortfolios"></position-item>

						</div>
					</div>

					<div class="balance_block instr_block" v-if="positionsError">
						<div class="bb_header_line instr_block_header flex sb aifs">
							<div class="bb_header">{{ activeCategory.___group_name }}</div>
						</div>
						<div style="padding: 0 0.5rem">
							{{ positionsError }}
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
									v-model="spaceStore.settings.pl.isChartView"
									labelPlacement="start"
									class="chart_view"
								>
									Chart view
								</ion-checkbox>
							</div>


							<ion-item v-if="numericBalanceReportAttributes?.length">
								<ion-select
									v-model="spaceStore.settings.pl.sumByKey"
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
									v-model="spaceStore.settings.pl.groupByKey"
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
								<ion-button @click="saveChartSettings()">Save</ion-button>
							</div>


						</div>

					</ion-content>
				</ion-modal>

			</div>

			<div class="display-flex align-center justify-center" style="padding-top: 2rem;" v-if="pageProcessing">
				<progress-circular diameter="100"></progress-circular>
			</div>


		</ion-content>

	</ion-page>
</template>

<script>
	import { computed, toRaw, watch } from 'vue'
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

	import { Swiper, SwiperSlide } from 'swiper/vue'

	import useApi from '@/composables/useApi'
	import useStore from '@/composables/useStore'
	import { Pagination } from 'swiper'
	import { cogOutline } from 'ionicons/icons'
	import { Bar, Doughnut } from 'vue-chartjs'

	import errorService from '@/services/errorService'
	import PeriodTypePicker from '@/components/PeriodTypePicker.vue'
	import MetricsBlock from '@/components/MetricsBlock.vue'
	import PositionItem from '@/components/PositionItem.vue'
	import PositionSearchBar from '@/components/PositionSearchBar.vue'
	import ProgressCircular from '@/components/ProgressCircular.vue'

	export default {
		components: {
			ProgressCircular,
			PositionSearchBar,
			PositionItem,
			MetricsBlock, PeriodTypePicker,
			Doughnut,
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
				activePortfolios: [],
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
				categoriesTotalSum: null, // used only to find out bar length for chart
				categoriesTotalTrueSum: null,
				chartData: null,
				positionsError: '',
				chartHeight: 200,
				activePosition: {},
				metricsBlockRefresher: null,

				activeTab: null,
				pageReady: false,
				activePath: null,
				pageProcessing: false
			}
		},
		computed: {
			groupByName() {

				let result = null

				this.groupByAttributes.forEach((item) => {

					if (item.key === this.spaceStore.settings.pl.groupByKey) {
						result = item
					}

				})

				if (!result) {
					return this.spaceStore.settings.pl.groupByKey
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
					// console.log("pnl.submitSearchResult.noType: do_refresh")
					await this.refresh()
				}

				if (this.spaceStore.searchType && this.spaceStore.searchType !== 'pnl') {
					// console.log("pnl.submitSearchResult.searchResult_exists: wrong_type")
					return
				}

				let item = this.spaceStore.searchResult

				this.positions = []

				if (item) {

					await this.fetchCategories()

					let categories = toRaw(this.categories)

					categories.forEach((category) => {

						// because we use user_code instead of names and other non unique fields for relations
						// also because of user_code not equal to name of instrument type
						// probably will cause error if Account Name and Account User Code are different
						// TODO consider refactor in future
						// 2023-11-18 szhitenev
						if (this.spaceStore.settings.pl.groupByKey === 'instrument.instrument_type.name') {

							if (category.___group_identifier === item['instrument.instrument_type.user_code']) {
								this.activeCategory = category
							}

						} else {

							if (category.___group_identifier === item[this.spaceStore.settings.pl.groupByKey]) {
								this.activeCategory = category
							}

						}


					})

					// console.log('pnl.submitSearchResult.activeCategory', this.activeCategory)

					await this.fetchPositions()

					this.positions = toRaw(this.positions).filter((position) => {
						return position.id === toRaw(item).id
					})

				} else {
					await this.refresh()
				}
			},
			roundToTwo(num) {
				return +(Math.round(num + 'e+2') + 'e-2')
			},
			saveChartSettings() {
				this.chartSettingsModalIsOpen = false
				this.createChart()
			},
			async tabChangeHandler(data) {

				// console.log('PL.tabChangeHandler', data)

				this.activeTab = data.activeTab
				this.spaceStore.activeTab = data.activeTab

				this.init()

			},
			async init() {

				this.pageProcessing = true;

				this.activePortfolios = this.getPortfoliosForReportSettings()
				this.activeCategory = null

				this.positions = []
				await this.createChart()

				this.pageProcessing = false;

			},
			async fetchPLReportAttributes() {

				this.groupByAttributes = []

				let res = await useApi('plReportAttributes.get')

				this.numericBalanceReportAttributes = [
					{
						key: 'total',
						name: 'Total P&L',
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
					},
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
					key: 'currency.name',
					name: 'Currency',
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
					key: 'item_group_name',
					name: 'PL Type',
					value_type: 10
				})

				// // console.log('this.groupByAttributes', this.groupByAttributes);

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

				this.categories = res.items.sort((a, b) => b.subtotal[this.spaceStore.settings.pl.sumByKey] - a.subtotal[this.spaceStore.settings.pl.sumByKey])

				this.categoriesTotalTrueSum = 0;
				this.categoriesTotalSum = 0

				this.categories.forEach((item) => {
					if (item.subtotal[this.spaceStore.settings.pl.sumByKey] > 0) {
						this.categoriesTotalSum = this.categoriesTotalSum + item.subtotal[this.spaceStore.settings.pl.sumByKey]
					}

					this.categoriesTotalTrueSum = this.categoriesTotalTrueSum + item.subtotal[this.spaceStore.settings.pl.sumByKey]


				})

			},
			async createChart() {

				try {

					this.chartProcessing = true

					await this.fetchCategories()

					// console.log('createChart.categories', this.categories)

					this.chartData = {}

					let vueThis = this

					this.originalDataSet = this.categories.map((item) => {
						return Math.floor(item.subtotal[this.spaceStore.settings.pl.sumByKey])
					})

					this.minPercent = 10


					this.chartData.data = {
						labels: this.categories.map((item) => {
							return item.___group_name
						}),
						datasets: [
							{// positive values
								data: this.categories.map((item, index) => {

									var val = Math.floor(item.subtotal[this.spaceStore.settings.pl.sumByKey])

									var res = (val / vueThis.categoriesTotalSum) * 100

									if (res < vueThis.minPercent) {
										if (res < 0) {
											res = res - vueThis.minPercent
										} else {
											res = res + vueThis.minPercent
										}
									}

									if (res > 100) {
										res = 100
									}

									if (res < -100) {
										res = -100
									}

									return res
								}),
								backgroundColor: this.categories.map((item, index) => {
									return this.colorByCat(item, index)
								}),
								borderColor: this.categories.map((item, index) => {
									return this.colorByCat(item, index)
								}),
								borderWidth: 2
							}
						]
					}

					// console.log('this.chartData', this.chartData)

					this.chartData.options = {
						responsive: true,
						maintainAspectRatio: false,
						indexAxis: 'y',
						plugins: {
							legend: {
								display: false
							},
							tooltip: {
								callbacks: {
									label: (context) => {
										let labelIndex = context.dataIndex

										// console.log('context', context)
										// console.log('labelIndex', labelIndex)

										if (context.datasetIndex === 0) {
											labelIndex =
												context.chart.data.datasets[0].data.length + labelIndex
										}

										// console.log('labelIndex', labelIndex)

										return (
											this.$format(vueThis.originalDataSet[context.dataIndex])
										)
									}
								}
							}
						},
						onClick: function(event, array) {
							// Check if a bar was clicked
							if (array.length > 0) {
								// Access the first clicked element
								var firstClickedElement = array[0]

								// Get the index of the clicked bar
								var clickedBarIndex = firstClickedElement.index

								// Access the dataset of the clicked bar
								var clickedDataset = firstClickedElement.datasetIndex

								// You can then use these indices to access your chart data, for example:
								var clickedValue = this.data.datasets[clickedDataset].data[clickedBarIndex]

								// Do something with the clicked bar
								// console.log(`You clicked on: ${this.data.labels[clickedBarIndex]} with value: ${clickedValue}`)


								this.data.datasets[0].borderColor = this.data.datasets[0].borderColor.map((item, index) => {
									return vueThis.colorByCat(this.data.labels[index], index)

								})


								if (array.length > 0) {
									const firstElement = array[0]
									const datasetIndex = firstElement.datasetIndex
									const dataIndex = firstElement.index

									// Highlight the clicked bar, for example, by setting its opacity to 1
									this.data.datasets[datasetIndex].borderColor[dataIndex] = vueThis.colorByCat(this.data.labels[clickedBarIndex + 1], clickedBarIndex + 1)

								}

								this.update()


								let activeCategory = null

								vueThis.categories.forEach((item) => {

									if (item.___group_name === this.data.labels[clickedBarIndex]) {
										activeCategory = item
									}

								})

								vueThis.activeCategory = activeCategory
								vueThis.fetchPositions()


							}
						},
						scales: {
							x: {
								ticks: {
									callback: (value, index) => {

										// // console.log('value', value)
										// // console.log('index', index)

										let categories = JSON.parse(JSON.stringify(this.categories)).reverse()

										if (categories) {

											let item = categories[index]

											if (item) {
												return this.$format(Math.round(item.subtotal[this.spaceStore.settings.pl.sumByKey]))
											} else {

												let maxValue = 0

												categories.forEach((item) => {
													if (item.subtotal[this.spaceStore.settings.pl.sumByKey] > maxValue) {
														maxValue = item.subtotal[this.spaceStore.settings.pl.sumByKey]
													}
												})

												return this.$format(Math.round(maxValue))

											}


										}

										return value
									}

								}
							}
						}
					}

					const categoriesCount = this.chartData.data.labels.length
					const heightPerCategory = 70 // Set desired height for each category
					this.chartHeight = categoriesCount * heightPerCategory

					this.chartProcessing = false

					// console.log('createChart.balanceChartObj', this.balanceChartObj)
					// console.log('createChart.chartProcessing', this.chartProcessing)

				} catch (error) {

					console.error('createChart.error', error)

				}

			},
			async fetchReport() {
				let filters = []

				let report_settings = {
					account_mode: this.spaceStore.settings.general.consolidateAccounts ? 0 : 1, // 0 - ignore, 1 - independent
					accounts: this.spaceStore.settings.general.accounts,
					accounts_cash: [],
					accounts_position: [],
					allocation_detailing: true,
					allocation_mode: this.spaceStore.settings.general.allocationMode ? 1 : 0,
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
								'key': this.spaceStore.settings.pl.groupByKey,
								'value_type': 10
							},
							{
								'key': this.spaceStore.settings.pl.sumByKey,
								'report_settings': {
									'subtotal_formula_id': 1 // sum
								},
								'value_type': 20
							}
						],
						groups_types: [
							{
								'key': this.spaceStore.settings.pl.groupByKey,
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

				if (this.spaceStore.settings.general.period_type === 'custom') {
					report_settings.pl_first_date = this.spaceStore.settings.general.date_from;
				} else {
					report_settings.period_type = this.spaceStore.settings.general.period_type;
				}

				let res = await useApi('backendPLReportGroups.post', {
					body: report_settings
				})

				return res
			},

			async fetchPositions() {

				this.positionsProcessing = true
				this.positionsError = ''

				try {

					let res = await useApi('backendPLReportItems.post', {
						body: {
							account_mode: this.spaceStore.settings.general.consolidateAccounts ? 0 : 1, // 0 - ignore, 1 - independent
							accounts: [],
							accounts_cash: [],
							accounts_position: [],
							allocation_detailing: true,
							allocation_mode: this.spaceStore.settings.general.allocationMode ? 1 : 0,
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
										'key': this.spaceStore.settings.pl.groupByKey,
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
							pl_first_date: this.spaceStore.settings.general.date_from,
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
							task_id: null
						}
					})

					this.positions = res.items.sort((a, b) => b[this.spaceStore.settings.pl.sumByKey] - a[this.spaceStore.settings.pl.sumByKey])

				} catch (error) {
					console.error('Pnl.fetchPositions.error', error)
					this.positionsError = errorService.getRandomErrorMessage()
				}

				this.positionsProcessing = false

			},
			async smallRefresh() {

				this.activePortfolios = this.getPortfoliosForReportSettings()
				this.activeCategory = null

				this.positions = []
				await this.createChart()

			},
			async refresh(event) {

				this.pageProcessing = true;

				await this.init()

				if (this.portfoliosRefresher) {
					this.portfoliosRefresher(true)
				}

				if (this.metricsBlockRefresher) {
					this.metricsBlockRefresher()
				}

				this.pageProcessing = false;

				if (event) event.target.complete()
			}
		},
		async created() {

			this.store = useStore()
			this.spaceStore = computed(() => this.store.getActiveSpaceStore())


		},

		async mounted() {

			await this.fetchPLReportAttributes()
			this.pageReady = true


			if (!this.spaceStore.activeTab) {
				this.spaceStore.activeTab = 'All'
			}

			this.activeTab = this.spaceStore.activeTab

			// console.log('this.activeTab', this.activeTab)

			this.activePath = this.$route.path
			await this.init()

			if (this.spaceStore.searchResult) {
				await this.submitSearchResult()
			}

			this.tabWatch = watch(
				() => this.spaceStore.activeTab,
				async (newVal) => {

					// console.log('Balance.tabWatch.this.spaceStore', newVal)

					this.activeTab = newVal

					if (this.activePath === '/main/pnl') {
						await this.smallRefresh()
					}

				}
			)

			this.settingsWatch = watch(() => this.spaceStore.settings.general, async () => {

				await this.init()

				if (this.portfoliosRefresher) {
					await this.portfoliosRefresher()
				}

				if (this.metricsBlockRefresher) {
					await this.metricsBlockRefresher()
				}

			}, { deep: true })

			this.searchWatch = watch(() => this.spaceStore.searchResult, async (newVal, oldVal) => {

				// console.log("pnl.watch.spaceStore.searchResult", newVal);

				await this.submitSearchResult()

			}, { deep: true })

			this.routeWatch = watch(
				() => this.$route,
				async (newVal) => {

					// console.log('headerBar.route.newVal', newVal)

					this.activePath = newVal.path

					// console.log('headerBar.currentPath', this.currentPath)

				}
			)


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
				this.searchWatch()
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
		font-size: 0.65rem;
		margin-top: 0.5rem;
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
