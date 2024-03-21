<template>
	<ion-page>

		<ion-content>

			<ion-refresher slot="fixed" @ionRefresh="refresh($event)">
				<ion-refresher-content />
			</ion-refresher>

			<position-search-bar></position-search-bar>

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
	import PositionSearchBar from '@/components/PositionSearchBar.vue'

	export default {
		components: {
			PositionSearchBar,
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
					filter_entry_user_code: null,
					global_table_search: this.spaceStore.searchQuery
				}

				if (event) event.target.complete()

				setTimeout(() => {
					this.processing = false
				}, 0) // required to trigger ComplexTransactionList reinit

			},
			async submitSearchResult() {

				this.refresh()

			},

		},
		async created() {

			this.store = useStore()
			this.spaceStore = computed(() => this.store.getActiveSpaceStore());

		},
		mounted() {

			this.transactionsOpts = {
				end_date: this.spaceStore.settings.general.date_to,
				begin_date: this.spaceStore.settings.general.date_from,
				portfolios: this.spaceStore.settings.general.portfolios,
				filter_entry_user_code: null,
				global_table_search: this.spaceStore.searchQuery
			}

			watch([this.spaceStore.settings.transactions, this.spaceStore.settings.general], () => {
				this.transactionsOpts.end_date = this.spaceStore.settings.general.date_to
				this.transactionsOpts.begin_date = this.spaceStore.settings.general.date_from
				this.transactionsOpts.portfolios = this.spaceStore.settings.general.portfolios

				this.refresh()
			})

			this.searchWatch = watch(() => this.spaceStore.searchResult, async (newVal, oldVal) => {

				// console.log("transaction.watch.spaceStore.searchResult", newVal);

				this.transactionsOpts.global_table_search = this.spaceStore.searchQuery

				await this.submitSearchResult();

			},{ deep: true})


		},
		beforeUnmount() {

			// https://vuejs.org/guide/essentials/watchers.html#stopping-a-watcher
			if (this.searchWatch) {
				this.searchWatch();
			}

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
