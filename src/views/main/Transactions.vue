<template>
	<ion-page>
		<ion-content>
			<div class="header flex sb aic">
				<div>Transactions</div>
				<div class="header_info">
					{{ dayjs(store.spaces[store.activeSpaceCode].settings.general.date_from).format('DD MMM YYYY') }}
					<ion-icon style='position: relative; top: 3px;' :icon="removeOutline"></ion-icon>
					{{ dayjs(store.spaces[store.activeSpaceCode].settings.general.date_to).format('DD MMM YYYY') }}
				</div>
			</div>
			<!-- <ion-searchbar animated="true" placeholder="Search..." /> -->

			<TransactionList
				reportType="pl"
				displayMode="compact"
				:options="transactionsOpts"
			/>
		</ion-content>
	</ion-page>
</template>

<script setup>
	import {
		IonButtons,
		IonSearchbar,
		IonHeader,
		IonMenuButton,
		IonPage,
		IonTitle,
		IonToolbar,
		IonFooter,
	} from '@ionic/vue'
	import dayjs from 'dayjs'

	import { reactive, watch } from 'vue'
	import TransactionList from '@/components/TransactionList.vue'
	import useStore from '@/composables/useStore'
	import { removeOutline } from 'ionicons/icons'

	const store = useStore()

	const transactionsOpts = reactive({
		end_date: store.spaces[store.activeSpaceCode].settings.general.date_to,
		begin_date: store.spaces[store.activeSpaceCode].settings.general.date_from,
		portfolios: store.spaces[store.activeSpaceCode].settings.general.portfolios,
		filter_entry_user_code: null,
	})

	watch([store.spaces[store.activeSpaceCode].settings.transactions, store.spaces[store.activeSpaceCode].settings.general], () => {
		transactionsOpts.end_date = store.spaces[store.activeSpaceCode].settings.general.date_to
		transactionsOpts.begin_date = store.spaces[store.activeSpaceCode].settings.general.date_from
		transactionsOpts.portfolios = store.spaces[store.activeSpaceCode].settings.general.portfolios
	})
</script>

<style lang="scss" scoped>
	.header {
		padding: 0 15px;
		color: #363636;
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
		--background: #eff4f7;
	}
</style>
