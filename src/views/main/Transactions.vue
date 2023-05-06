<template>
	<ion-page>
		<ion-content>
			<div class="header flex sb aic">
				<div>Transactions</div>
				<div class="header_info">2023-03-16</div>
			</div>

			<ion-searchbar animated="true" placeholder="Search..." />

			<TransactionList
				:options="{
					end_date: '2022-09-19',
					begin_date: '2020-01-01',
					filter_entry_user_code: [],
				}"
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

	import { ref } from 'vue'
	import TransactionList from '@/components/TransactionList.vue'
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
