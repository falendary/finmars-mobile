<template>
	<ion-page>

		<ion-header>
			<ion-toolbar class="app-header">

				<div class="app-header-inner">

					<div class="app-header-inner-space-name">{{ store.activeSpaceName || 'Finmars' }}</div>

					<div class="display-flex flex-end flex-align-center">

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

						<ion-datetime-button class="header-date-button" datetime="datetime_date_from" />

						<span style="margin: 0 4px;">-</span>

						<ion-datetime-button class="header-date-button" datetime="datetime_date_to" />

					</div>

				</div>


			</ion-toolbar>

		</ion-header>


		<ion-content>

			<ion-refresher slot="fixed" @ionRefresh="refresh($event)">
				<ion-refresher-content />
			</ion-refresher>

			<div v-if="!processing">


				<div class="header flex sb aic">
					<div>Transactions</div>
				</div>
				<!-- <ion-searchbar animated="true" placeholder="Search..." /> -->

				<ComplexTransactionList
					:options="transactionsOpts"
				/>

			</div>

		</ion-content>
	</ion-page>
</template>

<script>
	import {
		IonDatetime,
		IonDatetimeButton,
		IonHeader,
		IonModal,
		IonPage,
		IonRefresher,
		IonRefresherContent,
		IonToolbar
	} from '@ionic/vue'

	import { computed, watch } from 'vue'
	import ComplexTransactionList from '@/components/ComplexTransactionList.vue'
	import useStore from '@/composables/useStore'

	export default {
		components: {
			IonRefresherContent,
			IonRefresher,
			IonHeader,
			IonPage,
			IonToolbar,
			IonModal, IonDatetimeButton, IonDatetime,
			ComplexTransactionList
		},
		data() {
			return {
				spaceStore: null,
				transactionsOpts: null,
				processing: false
			}
		},
		methods: {
			refresh(event) {

				this.processing = true

				this.transactionsOpts = {
					end_date: this.spaceStore.settings.general.date_to,
					begin_date: this.spaceStore.settings.general.date_from,
					portfolios: this.spaceStore.settings.general.portfolios,
					filter_entry_user_code: null
				}

				if (event) event.target.complete()

				setTimeout(() => {
					this.processing = false
				}, 0) // required to trigger ComplexTransactionList reinit

			}
		},
		async created() {

			this.store = useStore()
			this.spaceStore = this.store.activeSpaceStore


		},
		mounted() {

			this.transactionsOpts = {
				end_date: this.spaceStore.settings.general.date_to,
				begin_date: this.spaceStore.settings.general.date_from,
				portfolios: this.spaceStore.settings.general.portfolios,
				filter_entry_user_code: null
			}

			watch([this.spaceStore.settings.transactions, this.spaceStore.settings.general], () => {
				this.transactionsOpts.end_date = this.spaceStore.settings.general.date_to
				this.transactionsOpts.begin_date = this.spaceStore.settings.general.date_from
				this.transactionsOpts.portfolios = this.spaceStore.settings.general.portfolios

				this.refresh()
			})


		}
	}


</script>

<style lang="scss" scoped>
	.header {
		padding: 0 15px;
		color: var(--ion-text-color);
		font-weight: 500;
		font-size: 1.1rem;
		margin-bottom: 15px;
	}

	.header_info {
		font-size: 0.6rem;
	}

	ion-searchbar {
		padding-left: 15px;
		padding-right: 15px;
		padding-bottom: 23px;
	}

	ion-content {
		--padding-top: 16px;
		--padding-bottom: 10px;
		//--background: #fafafa;
	}
</style>
