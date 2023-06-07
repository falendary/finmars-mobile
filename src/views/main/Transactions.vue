<template>
	<ion-page>
		<ion-content>
			<div class="header flex sb aic">
				<div>Transactions</div>
				<div class="header_info">
					{{ store.settings.transactions.date_from }}
					<span style="font-size: 20px; position: relative; top: 2px">🠦</span>
					{{ store.settings.general.date_to }}
				</div>
			</div>

			<!-- <ion-searchbar animated="true" placeholder="Search..." /> -->

			<TransactionList displayMode="compact" :options="transactionsOpts" />
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

	import { reactive, watch } from 'vue'
	import TransactionList from '@/components/TransactionList.vue'
	import useMiniStore from '@/composables/useMiniStore'

	const store = useMiniStore()

	const transactionsOpts = reactive({
		end_date: store.settings.general.date_to,
		begin_date: store.settings.transactions.date_from,
		portfolios: store.settings.transactions.portfolios,
		filter_entry_user_code: null,
	})

	watch([store.settings.transactions, store.settings.general], () => {
		transactionsOpts.end_date = store.settings.general.date_to
		transactionsOpts.begin_date = store.settings.transactions.date_from
		transactionsOpts.portfolios = store.settings.transactions.portfolios
	})
</script>

<style lang="scss" scoped>
	.header {
		padding: 0 15px;
		color: #747474;
		font-weight: 500;
		font-size: 20px;
		margin-bottom: 15px;
	}
	.header_info {
		font-size: 16px;
	}
	ion-searchbar {
		padding-left: 15px;
		padding-right: 15px;
		padding-bottom: 23px;
	}
	ion-content {
		--padding-top: 10px;
		--padding-bottom: 10px;
		--background: #fafafa;
	}
</style>
