<template>
	<ion-page>

		<ion-header>
			<ion-toolbar class="app-header">

				<div class="app-header-inner">

					<div class="app-header-inner-space-name">{{ store.activeSpaceName || 'Finmars' }}</div>

					<div class="display-flex flex-end flex-align-center">

						<ion-icon :icon="icons.searchOutline" size="small" @click="openSearchDialog($event)"
											style="margin-right: 8px"></ion-icon>

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

						<div class="display-flex flex-end flex-align-center" v-if="activeSegment == 'balance'">
							<ion-modal :keep-contents-mounted="true">
								<ion-datetime id="datetime_date" displayFormat="YYYY-MM-DD"
															v-model="spaceStore.settings.general.date_to"
															:prefer-wheel="true"
															presentation="date"
															show-default-buttons
								></ion-datetime>
							</ion-modal>

							<ion-datetime-button class="header-date-button" datetime="datetime_date" />

						</div>

						<div class="display-flex flex-end flex-align-center" v-if="activeSegment == 'pl'">

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

				</div>

			</ion-toolbar>
		</ion-header>

		<div class="explore-segment-holder">
			<ion-segment value="balance" class="explore-segment">
				<ion-segment-button value="balance" @click="activeSegment = 'balance'">
					<ion-label>Balance</ion-label>
				</ion-segment-button>
				<ion-segment-button value="pl" @click="activeSegment = 'pl'">
					<ion-label>P&L</ion-label>
				</ion-segment-button>
			</ion-segment>
		</div>

		<ion-content v-if="activeSegment == 'balance'">

			<explore-balance-part></explore-balance-part>

		</ion-content>

		<ion-content v-if="activeSegment == 'pl'">

			<explore-pl-part></explore-pl-part>

		</ion-content>

	</ion-page>
</template>

<script>
	import { computed } from 'vue'
	import {
		IonContent,
		IonDatetime,
		IonDatetimeButton,
		IonHeader,
		IonIcon,
		IonModal,
		IonPage, IonSegment, IonSegmentButton,
		IonSelect,
		IonSelectOption,
		IonToolbar
	} from '@ionic/vue'

	import useStore from '@/composables/useStore'
	import { Pagination } from 'swiper'

	import ExploreBalancePart from '@/views/ExploreBalancePart.vue'
	import ExplorePlPart from '@/views/ExplorePlPart.vue'

	export default {
		components: {
			IonContent,
			IonIcon,
			IonSelectOption,
			IonSelect,
			IonHeader,
			IonPage,
			IonToolbar,
			IonModal, IonDatetimeButton, IonDatetime,
			ExploreBalancePart,
			ExplorePlPart,
			IonSegment,
			IonSegmentButton
		},
		data() {
			return {
				icons: {},
				Pagination: Pagination,
				store: null,
				spaceStore: null,

				activeSegment: 'balance'
			}
		},

		methods: {},
		async created() {

			this.store = useStore()
			this.spaceStore = computed(() => this.store.getActiveSpaceStore())

		},
		async mounted() {

			// console.log('Explore.mounted')


		},
		beforeUnmount() {

		}
	}

</script>

<style lang="scss" scoped>

	.explore-segment-holder {
		padding: 0.5rem;
	}

	.portfolio-content {
		margin-top: 0.5rem;
	}

	.header {
		color: var(--ion-text-color);
		padding: 0 15px;
		font-weight: 500;
		font-size: 1.1rem;
		margin-bottom: 15px;
	}

	.chart_view {
		font-size: 14px;
	}

	.header_info {
		font-size: 0.6rem;
	}

	ion-content {
		--padding-top: 16px;
		--padding-bottom: 20px;
		//--background: #fafafa;
		//--background: #eff4f7;
	}

	ion-skeleton-text {
		margin: 0;
	}

	.balance_chart_wrap_skeleton {
		border-radius: 50%;
		--background: rgba(255, 138, 0, 0.2);
		--background-rgb: 255, 138, 0;
	}

	.balance_swiper {
		padding-bottom: 10px;
	}

	.balance_chart_wrap {
		flex-shrink: 0;
	}

	.balance_block {
		margin: 0 15px 10px;
		padding: 15px 13px 12px;
		background: var(--ion-card-background);
		border-radius: 5px;
	}

	.instr_block {
		margin-bottom: 10px;
	}

	.swiper-slide .balance_block {
		height: 100%;
	}

	.bb_header {
		font-size: 18px;
		line-height: 22px;
		color: var(--ion-text-color);
		width: 50%;
	}

	.bb_price {
		font-weight: 600;
		font-size: 18px;
		line-height: 22px;
		text-align: right;
	}

	.bb_header_line {
		margin-bottom: 25px;
	}

	.balance_labels {
		margin-left: 10px;
		width: 100%;
	}

	.balance_labels_item {
		padding: 6px 8px;
		padding-right: 4px;
		transition: 0.3s;

		&.active {
			background: rgba(255, 138, 0, 0.2);
		}
	}

	.balance_labels_price {
		font-weight: 500;
		font-size: 16px;
		line-height: 22px;
	}

	.balance_labels_percent {
		padding: 3px 0;
		background: #747474;
		flex-shrink: 0;
		color: #fff;
		font-size: 14px;
		width: 60px;
		text-align: center;
		border-radius: 5px;
		margin-right: 6px;
	}

	.balance_labels_text {
		font-size: 14px;
		line-height: 16px;
		color: #747474;
	}

	.instr_block {
		padding-left: 0;
		padding-right: 0;
	}

	.instr_block_header {
		padding-left: 13px;
		padding-right: 13px;
		margin-bottom: 10px;
	}

	.instr_block_change {
	}

	.instruments {
		padding: 5px 13px;
		transition: 0.3s;

		&.active {
			background: rgba(255, 138, 0, 0.2);
		}
	}

	.instr_name {
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

	.instr_pos {
		color: #747474;
		font-size: 0.65rem;
		margin-top: 0.5rem;
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

	.nodata_wrap {
		text-align: center;
		background: var(--ion-card-background);
		height: 200px;

		h3 {
			font-size: 18px;
		}

		p {
			color: #747474;
		}
	}

	.portfolio-metric-grid-container {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(6rem, 1fr));
		gap: 10px;
		padding: 10px;
	}

	.portfolio-metric-card {

		h3 {
			font-weight: bold;
			font-size: .8rem;
			margin: 0 0 0.5rem;
		}

		p {
			margin: 0;
			color: var(--ion-color-neutral)
		}

		background: var(--ion-card-background);
		border: 1px solid var(--ion-border-color);
		border-radius: 8px; /* Rounded corners */
		padding: 0.5rem;
		text-align: left;

		font-size: .9rem;


	}

</style>
