<template>
	<div class="position-item">

		<div
			class="position-item-content"
			:class="{active: item.is_active}"
		>
			<div class="flex sb jcfe">

				<div class="flex sb jcfe">
					<div class="item-icon" @click="openPositionModal($event, item)" v-if="item.item_type == 1">

						<div :style="{'background': getIconColor(item['instrument.instrument_type.name'][0])}"
								 class="item-icon-icon">
							{{ item['instrument.instrument_type.name'][0] }}
						</div>

					</div>

					<div class="item-icon" v-if="item.item_type == 2">

						<div :style="{'background': getIconColor('C')}"
								 class="item-icon-icon">
							C
						</div>

					</div>

					<div class="item-icon" v-if="item.item_type != 1 && item.item_type != 2">

						<div :style="{'background': getIconColor('O')}"
								 class="item-icon-icon">
							O
						</div>

					</div>

					<div class="position-item-name" @click="activatePosition($event, item)">
						{{
							item.name.length > 80
								? item.name.slice(0, 80) + '...'
								: item.name
						}}
					</div>

				</div>
				<div class="instr_market_value instr_first" @click="activatePosition($event, item)">
					<div v-if="itemType == 'balance'">
						{{ $format(item.market_value) }}
					</div>
					<div v-if="itemType == 'pl'">
						{{ $format(item.total) }}
					</div>
				</div>
			</div>
			<div class="position-item-chips">

				<ion-chip :id="item.id + 'position_size'" v-if="item.position_size && itemType == 'balance'">
					{{ $format(item.position_size) }}
				</ion-chip>

				<ion-chip :id="item.id + 'position_size'" v-if="item.position_size && itemType == 'pl'">Unrealized {{ $format(item.position_size) }}</ion-chip>
				<ion-chip :id="item.id + 'position_size'" v-if="!item.position_size && itemType == 'pl'">Realized</ion-chip>

				<ion-popover :trigger="item.id + 'position_size'">
					<ion-content>
						<div class="position-item-popover-content">Position Size</div>
					</ion-content>
				</ion-popover>

				<ion-chip :id="item.id + 'account'" class="instr_pos"
									v-if="item['account.name'] && item['account.name'] != '-'">
					{{ item['account.name'] }}
				</ion-chip>

				<ion-popover :trigger="item.id + 'account'">
					<ion-content>
						<div class="position-item-popover-content">Account</div>
					</ion-content>
				</ion-popover>

				<ion-chip :id="item.id + 'portfolio'" class="instr_pos"
									v-if="item['portfolio.name'] && item['portfolio.name'] != '-'">
					{{ item['portfolio.name'] }}
				</ion-chip>

				<ion-popover :trigger="item.id + 'portfolio'">
					<ion-content>
						<div class="position-item-popover-content">Portfolio</div>
					</ion-content>
				</ion-popover>

			</div>
		</div>

		<transaction-list-comp
			v-if="item.is_active"
			:options="item.transactionsOpts"
			:reportType="itemType"
		/>

	</div>

	<position-dialog
		:position="item"
		:isOpen="isPositionDialogOpen"
		@close="isPositionDialogOpen = false"
	></position-dialog>

</template>

<script>
	import {
		IonApp,
		IonButton,
		IonButtons,
		IonIcon,
		IonModal,
		IonRouterOutlet,
		IonSelect,
		IonSelectOption,
		IonSkeletonText
	} from '@ionic/vue'
	import ProgressCircular from '@/components/ProgressCircular.vue'
	import { computed, Suspense } from 'vue'
	import useStore from '@/composables/useStore.js'
	import Passcode from '@/components/Passcode.vue'
	import TransactionListComp from '@/components/TransactionList.vue'
	import metaService from '@/services/metaService.js'
	import PositionDialog from '@/views/dialogs/PositionDialog.vue'

	export default {
		components: {
			PositionDialog,
			TransactionListComp,
			IonSkeletonText,
			IonIcon,
			IonModal,
			IonButton,
			IonButtons,
			ProgressCircular,
			IonRouterOutlet,
			Suspense,
			IonApp,
			Passcode,
			IonSelect,
			IonSelectOption
			// settingsSharp, close, barChartOutline, layersOutline, readerOutline, settingsOutline
		},
		props: {
			item: {
				type: Object,
				required: true
			},
			itemType: {
				type: String,
				required: true
			},
			portfolios: {
				type: Array,
				required: true
			}
		},
		emits: ['refresher'],
		data() {
			return {
				icons: {},
				store: null,
				spaceStore: null,
				portfolioHistoryItems: [],
				processing: false,

				isPositionDialogOpen: false
			}
		},
		methods: {
			getIconColor(letter) {
				return metaService.getIconColor(letter)
			},
			async openPositionModal($event, item) {

				this.isPositionDialogOpen = true

			},
			activatePosition($event, item) {

				this.activePosition = item

				item.is_active = !item.is_active

				let dept_level = 'base_transaction'

				if (this.itemType === 'pl') {
					dept_level = 'base_transaction'
				}

				if (this.itemType === 'balance') {
					dept_level = 'entry'
				}

				item.transactionsOpts = {
					end_date: this.spaceStore.settings.general.date_to,
					begin_date: '0001-01-01',
					portfolios: this.portfolios,
					filter_entry_user_code: item.user_code,
					dept_level: dept_level
				}

			}
		},
		async created() {

			this.store = useStore()
			this.spaceStore = computed(() => this.store.getActiveSpaceStore())


		},
		mounted() {


		},
		beforeUnmount() {

		}
	}

</script>

<style lang="scss" scoped>

	.position-item {
		padding: 0.25rem;
		margin-bottom: 0.5rem;
		width: 100%;

		.transactions {
			padding-right: 0;
		}
	}

	.position-item-chips {
		display: flex;
		flex-wrap: wrap;
		margin-top: 0.5rem;
	}

	.position-item-name {
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

	.position-item-popover-content {
		padding: 0.5rem;
		background: var(--ion-card-background);
	}

	.position-item-chips {
		ion-chip {
			font-size: 0.6rem;
			padding: 0.5rem;
			height: 1.5rem;
			opacity: .8;
		}
	}


</style>
