<template>

	<ion-icon :icon="icons.settingsOutline" size="small" @click="isOpen = true"></ion-icon>

	<ion-modal

		:is-open="isOpen"
		:initial-breakpoint="0.75"
		:breakpoints="[0, 0.75, 0.95]"
		@ionModalDidDismiss="isOpen = false"
	>
		<ion-toolbar>
			<ion-title>Settings</ion-title>

			<ion-buttons slot="end">
				<ion-button @click="isOpen = false">
					<ion-icon slot="icon-only" :ios="icons.close" :md="close"></ion-icon>
				</ion-button>
			</ion-buttons>
		</ion-toolbar>

		<ion-content>
			<ion-list lines="full">

				<ion-item v-if="spaceStore.settings.general.date_to">
					<ion-label>Date</ion-label>

					<ion-modal
						:keep-contents-mounted="true"

					>
						<ion-datetime
							id="datetime_date_to"
							v-model="spaceStore.settings.general.date_to"
							:prefer-wheel="true"
							presentation="date"
							show-default-buttons
						/>
					</ion-modal>
					<ion-datetime-button datetime="datetime_date_to" />
				</ion-item>

				<ion-item>
					<ion-select
						v-model="spaceStore.settings.general.period_type"
						label="Period Type"
						placeholder="Period Type"
					>
						<ion-select-option
							v-for="item in periodTypes"
							:value="item.user_code"
						>
							{{ item.name }}
						</ion-select-option>
					</ion-select>
				</ion-item>

				<ion-item v-if="spaceStore.pricingPolicies?.length">
					<ion-select
						v-model="spaceStore.settings.general.pricing_policy"
						label="Pricing policy"
						placeholder="Policy"
					>
						<ion-select-option
							v-for="item in spaceStore.pricingPolicies"
							:value="item.user_code"
						>
							{{ item.short_name }}
						</ion-select-option>
					</ion-select>
				</ion-item>

				<ion-item v-if="spaceStore.currencies?.length">
					<ion-select
						v-model="spaceStore.settings.general.currency"
						label="Reporting currency"
						placeholder="Currency"
					>
						<ion-select-option
							v-for="item in spaceStore.currencies"
							:value="item.user_code"
						>
							{{ item.short_name }}
						</ion-select-option>
					</ion-select>
				</ion-item>

				<ion-item>
					<ion-select
						v-model="spaceStore.settings.general.portfolios"
						label="Portfolios"
						placeholder="Portfolios"
						:multiple="true"
					>
						<ion-select-option
							v-for="item in spaceStore.portfolios"
							:value="item.user_code"
						>
							{{ item.name }}
						</ion-select-option>
					</ion-select>
				</ion-item>

				<ion-item>
					<ion-select
						v-model="spaceStore.settings.general.accounts"
						label="Accounts"
						placeholder="Accounts"
						:multiple="true"
					>
						<ion-select-option
							v-for="item in spaceStore.accounts"
							:value="item.user_code"
						>
							{{ item.name }}
						</ion-select-option>
					</ion-select>
				</ion-item>

				<ion-item>
					<ion-checkbox
						v-model="spaceStore.settings.general.consolidateAccounts"
						labelPlacement="start"
						class="chart_view"
					>
						Consolidate Accounts
					</ion-checkbox>
				</ion-item>

				<ion-item>
					<ion-checkbox
						v-model="spaceStore.settings.general.allocationMode"
						labelPlacement="start"
						class="chart_view"
					>
						Allocation Mode
					</ion-checkbox>
				</ion-item>


			</ion-list>

			<br />


			<ion-button
				class="ion-margin-horizontal"
				fill="outline"
				expand="block"
				@click="goToMore()"
			>
				More
			</ion-button>


		</ion-content>
	</ion-modal>


</template>

<script>
	import {
		IonButton,
		IonButtons,
		IonCheckbox,
		IonContent,
		IonDatetime,
		IonDatetimeButton,
		IonIcon,
		IonItem,
		IonLabel,
		IonList,
		IonModal,
		IonPage,
		IonRouterOutlet,
		IonSelect,
		IonSelectOption,
		IonTabBar,
		IonTabButton,
		IonTabs,
		IonTitle,
		IonToolbar
	} from '@ionic/vue'

	import { barChartOutline, close, layersOutline, readerOutline, settingsOutline, settingsSharp } from 'ionicons/icons'
	import { computed } from 'vue'
	import useStore from '@/composables/useStore'
	import dayjs from 'dayjs'
	import quarterOfYear from 'dayjs/plugin/quarterOfYear'
	import SearchButton from '@/components/SearchButton.vue'

	dayjs.extend(quarterOfYear)

	export default {
		components: {

			IonCheckbox,
			IonTabs,
			IonRouterOutlet,
			IonTabBar,
			IonTabButton,
			IonLabel,
			IonIcon,
			IonModal,
			IonContent,
			IonList,
			IonItem,
			IonSelect,
			IonSelectOption,
			IonDatetime,
			IonDatetimeButton,
			IonToolbar,
			IonButtons,
			IonTitle, IonPage,
			SearchButton,
			IonButton


			// settingsSharp, close, barChartOutline, layersOutline, readerOutline, settingsOutline
		},

		data() {
			return {
				processing: false,
				currentYear: new Date().getFullYear(),
				spaceStore: null,
				store: null,
				currencies: [],
				pricingPolicies: [],
				activeSpaceCode: null,
				workspace: null,
				username: null,
				isOpen: false,
				themeToggle: false,
				dayjs: dayjs,
				icons: {
					settingsSharp,
					close,
					barChartOutline,
					layersOutline,
					readerOutline,
					settingsOutline
				},
				periodTypes: [
					{
						user_code: 'daily',
						name: 'Daily'
					},
					{
						user_code: 'mtd',
						name: 'MTD'
					},
					{
						user_code: 'qtd',
						name: 'QTD'
					},
					{
						user_code: 'ytd',
						name: 'YTD'
					},
					{
						user_code: 'inception',
						name: 'All Time'
					}
				]
			}
		},
		methods: {

			navigate(path) {

				this.$router.push({ path })
			},
			goToMore() {
				this.isOpen = false
				this.$router.push('/main/more')
			},

			adjustDates(date_to, date_from) {
				// Convert the dates from strings (if they are) to Date objects
				const toDate = (typeof date_to === 'string') ? new Date(date_to) : date_to
				const fromDate = (typeof date_from === 'string') ? new Date(date_from) : date_from

				// Check if toDate is less than fromDate
				if (toDate <= fromDate) {
					// Subtract 30 days from fromDate
					fromDate.setDate(fromDate.getDate() - 30)

					// If fromDate is still greater than toDate after subtracting 30 days,
					// then reset fromDate to be the same as toDate
					if (fromDate > toDate) {
						fromDate.setTime(toDate.getTime())
					}
				}

				// Return the adjusted dates, converting them back to strings if needed
				return {
					date_to: (typeof date_to === 'string') ? toDate.toISOString().split('T')[0] : toDate,
					date_from: (typeof date_from === 'string') ? fromDate.toISOString().split('T')[0] : fromDate
				}
			}

		},
		async created() {

			this.processing = true

			this.store = useStore()
			this.store.globalProcessing = true


			this.spaceStore = computed(() => this.store.getActiveSpaceStore())

			// console.log('Index.spaceStore', this.spaceStore)
			// console.log('Index.store.activeSpaceCode', this.store.activeSpaceCode)

			// Adjust dates, just in case date_from bigger then date_to
			let result = this.adjustDates(this.spaceStore.settings.general.date_to, this.spaceStore.settings.general.date_from)

			this.spaceStore.settings.general.date_from = result.date_from


			this.dateToWatch = this.$watch(
				() => this.spaceStore.settings.general.date_to,
				() => {

					// console.log('this.spaceStore.settings.general.date_to', this.spaceStore.settings.general.date_to)
					// console.log('this.spaceStore.settings.general.date_from', this.spaceStore.settings.general.date_from)

					let result = this.adjustDates(this.spaceStore.settings.general.date_to, this.spaceStore.settings.general.date_from)

					this.spaceStore.settings.general.date_from = result.date_from

				}
			)


			// console.log('INDEX_CONTROLLER: Store is ready')
			this.processing = false
			this.store.globalProcessing = false


		},
		beforeUnmount() {


			// https://vuejs.org/guide/essentials/watchers.html#stopping-a-watcher
			if (this.dateToWatch) {
				this.dateToWatch()
			}

		}
	}

</script>


<style lang="scss" scoped>
	.copy-button {
		margin-top: 0;
		background: var(--ion-background-color);
	}
</style>
