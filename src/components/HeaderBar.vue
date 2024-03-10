<template>
	<ion-header>
		<ion-toolbar class="app-header">

			<div class="app-header-inner">

				<div class="display-flex flex-align-center">
					<settings-button ></settings-button>

					<div style="margin-left: 0.3rem" class="app-header-inner-space-name">{{ store.activeSpaceName || 'Finmars' }}</div>
				</div>

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

					<ion-modal :keep-contents-mounted="true">
						<ion-datetime id="datetime_date_from" displayFormat="YYYY-MM-DD"
													v-model="spaceStore.settings.general.date_from"
													:prefer-wheel="true"
													presentation="date"
													show-default-buttons
						></ion-datetime>
					</ion-modal>

					<ion-modal :keep-contents-mounted="true">
						<ion-datetime id="datetime_date_to" displayFormat="YYYY-MM-DD"
													v-model="spaceStore.settings.general.date_to"
													:prefer-wheel="true"
													presentation="date"
													show-default-buttons
						></ion-datetime>
					</ion-modal>


					<div v-if="currentPath == '/main/balance' || currentPath == '/main/dashboard'">

						<ion-datetime-button class="header-date-button" datetime="datetime_date" />

					</div>

					<div v-if="currentPath == '/main/pnl'">

						<ion-datetime-button class="header-date-button" datetime="datetime_date_from" />

						<span style="margin: 0 4px;">-</span>

						<ion-datetime-button class="header-date-button" datetime="datetime_date_to" />

					</div>


					<div v-if="currentPath == '/main/transaction'">

						<ion-datetime-button class="header-date-button" datetime="datetime_date_from" />

						<span style="margin: 0 4px;">-</span>

						<ion-datetime-button class="header-date-button" datetime="datetime_date_to" />

					</div>


				</div>

			</div>

		</ion-toolbar>

	</ion-header>

</template>

<script>
	import {
		IonApp,
		IonButton,
		IonButtons,
		IonDatetime,
		IonDatetimeButton,
		IonHeader,
		IonIcon,
		IonModal,
		IonRouterOutlet,
		IonSearchbar,
		IonSelect,
		IonSelectOption,
		IonToolbar
	} from '@ionic/vue'
	import ProgressCircular from '@/components/ProgressCircular.vue'
	import { computed, Suspense, watch } from 'vue'
	import useStore from '@/composables/useStore.js'
	import Passcode from '@/components/Passcode.vue'
	import SearchDialog from '@/views/dialogs/SearchDialog.vue'
	import PositionSearchBar from '@/components/PositionSearchBar.vue'
	import SettingsButton from '@/components/SettingsButton.vue'

	export default {
		components: {
			PositionSearchBar,
			IonToolbar,
			IonDatetime,
			IonHeader,
			IonDatetimeButton,
			SearchDialog,
			IonIcon,
			IonButton,
			IonButtons,
			ProgressCircular,
			IonRouterOutlet,
			Suspense,
			IonApp,
			Passcode,
			IonSelect,
			IonSelectOption,
			IonSearchbar,
			IonModal,
			SettingsButton

			// settingsSharp, close, barChartOutline, layersOutline, readerOutline, settingsOutline
		},
		props: {},
		data() {
			return {
				icons: {},
				store: null,
				spaceStore: null,
				currentPath: '/main/dashboard'
			}
		},
		emits: ['queryChange'],
		methods: {},
		async created() {

			this.store = useStore()
			this.spaceStore = computed(() => this.store.getActiveSpaceStore())


		},
		mounted() {

			console.log('currentPath', this.currentPath)

			this.queryWatch = watch(
				() => this.$route,
				async (newVal, oldVal) => {

					console.log('headerBar.route.newVal', newVal)

					this.currentPath = newVal.path

					console.log('headerBar.currentPath', this.currentPath)

				}
			)


		},
		beforeUnmount() {

			if (this.queryWatch) {
				this.queryWatch()
			}

		}
	}

</script>

<style lang="scss" scoped>

	.period-type-picker {
		font-size: 1rem;
	}

</style>
