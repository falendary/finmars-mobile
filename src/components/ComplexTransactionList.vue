<template>

	<div v-if="!processing">

		<div class="transactions-holder" v-if="transactions.length">

			<div class="transaction" v-for="item in transactions" :key="item.id">

				<div class="transaction-inner">

					<div class="transaction-icon" @click="openComplexTransactionModal($event, item)">

						<div :style="{'background': getIconColor(item.transaction_type_object.name[0])}"
								 class="transaction-icon-icon">
							{{ item.transaction_type_object.name[0] }}
						</div>

					</div>

					<div class="transaction-content" @click="toggleTransaction($event, item)">


						<div class="transaction-content-text" v-if="item.text">{{ item.text }}</div>
						<div class="transaction-content-text" v-if="!item.text">No Description</div>


						<div class="transaction-content-footer">

							<div class="transaction-content-footer-date">
								<ion-icon :icon="icons.calendarOutline" size="8" style="margin-right: 4px"></ion-icon>
								{{ item.first_transaction_accounting_date }}
							</div>

							<div class="transaction-content-footer-transaction-type">
								<ion-icon :icon="icons.cubeOutline" size="8" style="margin-right: 4px"></ion-icon>
								{{ item.transaction_type_object.name }}
							</div>

						</div>


					</div>

				</div>

				<div v-if="item.is_opened" class="transaction-childs-holder">

					<div v-if="item.processing">

						<IonSkeletonText
							:animated="true"
							style="width: 90%; height: 32px"
						/>

					</div>

					<div v-if="!item.processing">

						<div class="transaction-child-item"
								 v-for="transaction in detailedTransactions[item.id].transactions_object"
								 :key="transaction.id">

							<div class="transaction-child-item-inner">

								<div class="transaction-child-item-transaction-class"
										 @click="openTransactionModal($event, transaction)">

									<div :style="{'background': getIconColor(transaction.transaction_class_object.name[0])}"
											 class="transaction-child-item-transaction-class-icon">
										<ion-icon v-if="transaction.transaction_class_object.user_code == 'BUY'" :icon="icons.bagAddOutline"
															size="8"></ion-icon>
										<ion-icon v-if="transaction.transaction_class_object.user_code == 'SELL'"
															:icon="icons.bagAddOutline"
															size="8"></ion-icon>
										<ion-icon v-if="transaction.transaction_class_object.user_code == 'INSTRUMENT_PL'"
															:icon="icons.barChartOutline" size="8"></ion-icon>
										<ion-icon v-if="transaction.transaction_class_object.user_code == 'TRANSACTION_PL'"
															:icon="icons.layersOutline" size="8"></ion-icon>
									</div>


									<span
										class="transaction-child-item-transaction-class-name">{{ transaction.transaction_class_object.name
										}}</span>
								</div>

								<div class="transaction-child-item-transaction-content">

									<div class="transaction-child-item-transaction-content-notes">{{ transaction.verbose_notes }}
									</div>

									<div style="margin-top: 0.4rem">

										<div class="transaction-content-footer-date">
											<ion-icon :icon="icons.calendarOutline" size="8" style="margin-right: 4px"></ion-icon>
											{{ transaction.accounting_date }}
										</div>
									</div>

								</div>

								<div class="transaction-child-item-transaction-result">

									<div v-if="transaction.transaction_class_object.user_code == 'BUY'">

										<div>
										<span
											v-bind:class="{'is-negative': isNegative(transaction.position_size_with_sign), 'is-positive': !isNegative(transaction.position_size_with_sign)}">{{ formatNumber(transaction.position_size_with_sign)
											}}</span>
											<span class="currency-span">UNITS</span>
										</div>

										<div class="text-nowrap">
										<span
											v-bind:class="{'is-negative': isNegative(transaction.cash_consideration), 'is-positive': !isNegative(transaction.cash_consideration)}">{{ formatNumber(transaction.cash_consideration)
											}}</span>
											<span class="currency-span">{{ transaction.settlement_currency_object.short_name }}</span>
										</div>

									</div>

									<div v-if="transaction.transaction_class_object.user_code == 'SELL'">

										<div class="text-nowrap">
										<span
											v-bind:class="{'is-negative': isNegative(transaction.cash_consideration), 'is-positive': !isNegative(transaction.cash_consideration)}">{{ formatNumber(transaction.cash_consideration)
											}}</span>
											<span class="currency-span">{{ transaction.settlement_currency_object.short_name }}</span>
										</div>

										<div>
										<span
											v-bind:class="{'is-negative': isNegative(transaction.position_size_with_sign), 'is-positive': !isNegative(transaction.position_size_with_sign)}">{{ formatNumber(transaction.position_size_with_sign)
											}}</span>
											<span class="currency-span">UNITS</span>
										</div>

									</div>

									<div v-if="transaction.transaction_class_object.user_code == 'INSTRUMENT_PL'" class="text-nowrap">

									<span
										v-bind:class="{'is-negative': isNegative(transaction.cash_consideration), 'is-positive': !isNegative(transaction.cash_consideration)}">{{ formatNumber(transaction.cash_consideration)
										}}</span>
										<span class="currency-span">{{ transaction.settlement_currency_object.short_name }}</span>

									</div>

									<div v-if="transaction.transaction_class_object.user_code == 'TRANSACTION_PL'" class="text-nowrap">

									<span
										v-bind:class="{'is-negative': isNegative(transaction.cash_consideration), 'is-positive': !isNegative(transaction.cash_consideration)}">{{ formatNumber(transaction.cash_consideration)
										}}</span>
										<span class="currency-span">{{ transaction.settlement_currency_object.short_name }}</span>

									</div>


								</div>


							</div>


						</div>

					</div>

				</div>


			</div>

		</div>

		<div v-if="!transactions.length">
			<h4 class="text-center">No transactions found</h4>
		</div>

	</div>

	<div v-if="processing" style="padding: 0 1rem">

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

	<ion-modal ref="modal" :is-open="isComplexTransactionModelOpen">
		<ion-header>
			<ion-toolbar>
				<ion-title>Transaction {{ activeComplexTransaction.code }}</ion-title>
				<ion-buttons slot="end">
					<ion-button @click="closeComplexTransactionModal()">Close</ion-button>
				</ion-buttons>
			</ion-toolbar>
		</ion-header>
		<ion-content class="ion-padding" style="padding-bottom: 1rem;">

			<div style="padding-bottom: 4rem;">

				<p>
					{{ activeComplexTransaction.text }}
				</p>

				<template v-for="field in userFieldsMap">
					<div
						class="complex-transaction-user-field-item flex sb"
						v-if="activeComplexTransaction[field.key]"
					>
						<div class="complex-transaction-user-field-key">{{ field.name }}:</div>
						<div class="complex-transaction-user-field-value">
							{{ activeComplexTransaction[field.key] }}
						</div>
					</div>
				</template>

			</div>

		</ion-content>
	</ion-modal>

	<ion-modal ref="modal" :is-open="isTransactionModelOpen">
		<ion-header>
			<ion-toolbar>
				<ion-title>Transaction {{ activeTransaction.transaction_code }}</ion-title>
				<ion-buttons slot="end">
					<ion-button @click="closeTransactionModal()">Close</ion-button>
				</ion-buttons>
			</ion-toolbar>
		</ion-header>
		<ion-content class="ion-padding">

			<div style="padding-bottom: 4rem;">

				<p>
					{{ activeTransaction.notes }}
				</p>

				<template v-for="field in transactionFieldsMap">
					<div
						class="complex-transaction-user-field-item flex sb"
						v-if="activeTransaction[field.key]"
					>
						<div class="complex-transaction-user-field-key">{{ field.name }}:</div>
						<div class="complex-transaction-user-field-value">

							<div v-if="field.key == 'complex_transaction'">
								{{ activeTransaction[field.key + '_object'].code }}
							</div>

							<div v-if="field.key != 'complex_transaction'">

								<div v-if="field.is_relation">
									{{ activeTransaction[field.key + '_object'].name }}
								</div>
								<div v-if="!field.is_relation">
									{{ activeTransaction[field.key] }}
								</div>

							</div>
						</div>
					</div>
				</template>

			</div>

		</ion-content>
	</ion-modal>

</template>

<script>/**
 * Created by szhitenev on 01.10.2023.
 */

import useApi from '@/composables/useApi.js'
import {
	IonButton,
	IonButtons,
	IonContent, IonDatetime, IonDatetimeButton,
	IonHeader,
	IonIcon,
	IonModal,
	IonSkeletonText,
	IonTitle,
	IonToolbar
} from '@ionic/vue'
import { bagAddOutline, barChartOutline, calendarOutline, cubeOutline, layersOutline } from 'ionicons/icons'
import { formatNumber } from 'chart.js/helpers'

export default {
	components: {
		IonDatetime,
		IonDatetimeButton,
		IonSkeletonText,
		IonIcon,
		IonButtons,
		IonButton,
		IonModal,
		IonHeader,
		IonToolbar,
		IonContent,
		IonTitle
	},

	props: {
		options: {
			type: Object,
			required: true
		}
	},

	data() {
		return {
			processing: false,
			icons: {
				calendarOutline,
				cubeOutline,
				bagAddOutline,
				barChartOutline,
				layersOutline
			},
			detailedTransactions: {},
			transactions: [],
			page: 1,
			pageSize: 40,
			isComplexTransactionModelOpen: false,
			activeComplexTransaction: {},
			userFieldsMap: null,

			isTransactionModelOpen: false,
			activeTransaction: {},
			spaceStore: null

		}
	},
	methods: {

		openComplexTransactionModal($event, item) {

			this.isComplexTransactionModelOpen = true
			this.activeComplexTransaction = item


		},
		closeComplexTransactionModal() {
			this.isComplexTransactionModelOpen = false
			this.activeComplexTransaction = {}
		},

		openTransactionModal($event, item) {

			this.isTransactionModelOpen = true
			this.activeTransaction = item

			this.transactionFieldsMap = []

			Object.keys(this.activeTransaction).forEach((key) => {

				if (['notes', 'verbose_notes'].indexOf(key) === -1) {

					if (key.indexOf('_object') === -1) {

						this.transactionFieldsMap.push({
							name: key.split('_').join(' '),
							is_relation: !!this.activeTransaction[key + '_object'],
							key: key
						})

					}
				}

			})

		},
		closeTransactionModal() {
			this.isTransactionModelOpen = false
			this.activeTransaction = {}
		},

		isNegative(num) {

			if (num < 0) {
				return true
			}

			return false
		},
		formatNumber(num) {
			return formatNumber(num)
		},
		verboseNotes(notes) {

			if (!notes) {
				notes = ''
			}

			if (notes.length > 80) {
				return notes.substring(0, 80) + '...'
			}
			return notes
		},
		async toggleTransaction($event, item) {

			item.is_opened = !item.is_opened

			if (!this.detailedTransactions[item.id]) {

				item.processing = true

				const detailedComplexTransaction = await useApi('complexTransactionItem.get', {
					params: { id: item.id }
				})

				detailedComplexTransaction.transactions_object.map((trn) => {
					trn.verbose_notes = this.verboseNotes(trn.notes)
				})

				this.detailedTransactions[item.id] = detailedComplexTransaction

				item.processing = false


			}

		},
		getIconColor(letter) {
			const colorMap = {
				'A': '#FFADAD',
				'B': '#FFD6A5',
				'C': '#FDFFB6',
				'D': '#CAFFBF',
				'E': '#9BF6FF',
				'F': '#A0C4FF',
				'G': '#BDB2FF',
				'H': '#FFC6FF',
				'I': '#FFAFCC',
				'J': '#FFC3A0',
				'K': '#FF61A6',
				'L': '#70F3FF',
				'M': '#9448BC',
				'N': '#A3A380',
				'O': '#FFA343',
				'P': '#B671D5',
				'Q': '#DDBDF1',
				'R': '#4B8BBE',
				'S': '#CCE7E8',
				'T': '#EFB839',
				'U': '#FF4242',
				'V': '#CAA8F5',
				'W': '#DFF2BF',
				'X': '#D0F4DE',
				'Y': '#AAEFDF',
				'Z': '#BDC0BA'
			}
			return colorMap[letter.toUpperCase()] || 'gray'  // default to gray if letter is not found
		},
		async getComplexTransactionUserFields() {

			const transactionUserFieldsRes = await useApi('transactionUserField.get')

			this.userFieldsMap = transactionUserFieldsRes.results.filter((o) => o.is_active)

		},
		async getTransactions() {

			const res = await useApi('complexTransaction.get', {
				filters: {
					transactions__accounting_date_after: this.options.begin_date,
					transactions__accounting_date_before: this.options.end_date
				}
			})

			this.transactions = res.results

			console.log('ComplexTransactionList.transactions', this.transactions)

		}

	},
	async mounted() {

		console.log('ComplexTransactionList.options', this.options)

		this.processing = true;

		await this.getComplexTransactionUserFields()
		await this.getTransactions()

		this.processing = false;

	}


}


</script>

<style lang="scss" scoped>

	.transactions-holder {
		padding: 0 1rem;
	}

	.transaction {

		font-size: 0.8rem;
		font-size: 0.8rem;
		margin: 0.4rem 0;
		background: var(--ion-transaction-transparent-bg);
		padding: 0.8rem 0.3rem;
		border-radius: 1rem;
	}

	.transaction-inner {
		display: flex;
	}

	.transaction-content {
		padding-left: 0.5rem;

	}

	.transaction-content-text {
		font-size: 0.7rem;
	}

	.transaction-icon {
		width: 60px;
		min-width: 60px;
		overflow: hidden;
		text-align: center;
	}


	.transaction-icon-icon {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
		background: #fff;
		color: #000;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto;
		font-size: 1.2rem;
	}

	.transaction-content-footer {
		display: flex;
		margin-top: 1rem;
	}

	.transaction-content-footer-date {
		font-size: .6rem;
		opacity: .7;
		align-items: center;
		display: flex;
		margin-right: 0.5rem;
		min-width: 90px;
	}

	.transaction-content-footer-transaction-type {

		font-size: .6rem;
		opacity: .7;
		align-items: center;
		display: flex;

	}

	.transaction-childs-holder {
		padding-top: 1rem;
		padding-bottom: 1rem;
		padding-left: 2rem;
		padding-right: 0.3rem;
	}

	.transaction-child-item-inner {
		display: flex;
		justify-content: space-between;
		width: 100%;
	}

	.transaction-child-item-transaction-class {
		margin-right: 0.5rem;
		text-align: center;
		max-width: 30px;
		width: 65px;
		position: relative;
	}

	.transaction-child-item-transaction-class-name {
		text-align: center;
		font-size: 0.5rem;
		right: 0;
		margin-top: 4px;
		word-break: break-word;
		display: block;
	}

	.transaction-child-item-transaction-class-icon {
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 50%;
		background: #fff;
		color: #000;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto;
		font-size: 1rem;

	}

	.transaction-child-item-transaction-content-notes {
		font-size: .5rem;
		padding-right: 4px;
	}

	.transaction-child-item-transaction-result {
		text-align: right;
	}

	.is-negative {
		color: crimson;
	}

	.is-positive {
		color: rgb(52, 199, 89);
	}

	.currency-span {
		font-size: .5rem;
		opacity: .8;
		margin-left: 2px;
	}

	.complex-transaction-user-field-item {
		margin: 0.2rem;
	}

	.complex-transaction-user-field-key {
		opacity: 0.7;
		margin-right: 10px;
		text-transform: capitalize;
	}

	.complex-transaction-user-field-value {
		text-align: right;
	}

</style>
