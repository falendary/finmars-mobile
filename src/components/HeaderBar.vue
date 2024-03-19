<template>
	<ion-header>
		<ion-toolbar class="app-header">

			<div class="app-header-wrapper">

				<div class="app-header-inner">

					<div class="display-flex flex-align-center">
						<settings-button></settings-button>

						<div style="margin-left: 0.3rem">
							{{ username }}
						</div>
					</div>

					<div class="display-flex flex-end flex-align-center">

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

							<div v-if="spaceStore.settings.general.period_type === 'custom'">

								<ion-datetime-button class="header-date-button" datetime="datetime_date_from" />

								<span style="margin: 0 4px;">-</span>

								<ion-datetime-button class="header-date-button" datetime="datetime_date_to" />

							</div>

							<div v-if="spaceStore.settings.general.period_type !== 'custom' ">
								<ion-datetime-button class="header-date-button" datetime="datetime_date_to" />
							</div>

						</div>


						<div v-if="currentPath == '/main/transaction'">

							<ion-datetime-button class="header-date-button" datetime="datetime_date_from" />

							<span style="margin: 0 4px;">-</span>

							<ion-datetime-button class="header-date-button" datetime="datetime_date_to" />

						</div>


					</div>

				</div>

				<div class="app-header-footer">

					<div class="app-header-inner-space-name">{{ store.activeSpaceName || 'Finmars'
						}}
					</div>

					<div class="flex">

						<ion-select
							style="width: 60px;"
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

						<period-type-picker></period-type-picker>

					</div>

				</div>
			</div>

		</ion-toolbar>

	</ion-header>

</template>

<script>
	import {
		IonDatetime,
		IonDatetimeButton,
		IonHeader,
		IonModal,
		IonSelect,
		IonSelectOption,
		IonToolbar
	} from '@ionic/vue'
	import { computed, watch } from 'vue'
	import useStore from '@/composables/useStore.js'
	import SettingsButton from '@/components/SettingsButton.vue'
	import PeriodTypePicker from '@/components/PeriodTypePicker.vue'
	import useApi from '@/composables/useApi.js'

	export default {
		components: {
			PeriodTypePicker,
			IonToolbar,
			IonDatetime,
			IonHeader,
			IonDatetimeButton,
			IonSelect,
			IonSelectOption,
			IonModal,
			SettingsButton
		},
		props: {},
		data() {
			return {
				icons: {},
				store: null,
				spaceStore: null,
				currentPath: '/main/dashboard',
				username: ''
			}
		},
		emits: ['queryChange'],
		methods: {

			async fetchUser() {
				let result = await useApi('user.get')
				this.username = result.first_name || result.username
			}

		},
		async created() {

			this.store = useStore()
			this.spaceStore = computed(() => this.store.getActiveSpaceStore())


		},
		mounted() {

			this.fetchUser()

			console.log('currentPath', this.currentPath)

			this.queryWatch = watch(
				() => this.$route,
				async (newVal) => {

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

	.app-header {

		background: var(--ion-tab-bar-background);

		–padding-top: var(–ion-safe-area-top, 0);
		padding-top: env(safe-area-inset-top);
		--ion-safe-area-top: 20px;
		--ion-safe-area-bottom: 20px;

		position: relative;

		.app-header-wrapper {
			position: relative;
			height: 3.3rem;
		}

		.app-header-inner {

			display: flex;
			justify-content: space-between;
			font-size: .6rem;
			align-items: center;
			height: 1.6rem;
			width: 100%;
			padding: 0 0.5rem;
			//border-bottom: 1px solid var(--ion-date-button-border-color);


			.app-header-inner-space-name {
				max-width: 90px;
				text-overflow: ellipsis;
				overflow: hidden;
				white-space: nowrap;
				padding-right: 10px;
				box-sizing: border-box;
			}

			ion-select {
				width: 70px;
			}

			ion-datetime-button::part(native) {
				background: transparent;
			}

			ion-datetime-button.header-date-button {

				display: inline-block;
				font-size: .50rem;

				//padding: 0.2rem;
				border-bottom: 1px dotted var(--ion-date-button-border-color);

			}
		}

		.app-header-footer {

			display: flex;
			justify-content: space-between;
			font-size: .6rem;
			align-items: center;
			height: 1.8rem;
			width: 100%;
			padding: 0 0.5rem;

		}

	}


</style>
