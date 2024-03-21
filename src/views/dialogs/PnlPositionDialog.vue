<template>
	<ion-modal ref="modal" :is-open="isOpen">
		<ion-header>
			<ion-toolbar>
				<ion-buttons slot="start">
					<ion-button @click="createOrder()">Send Order</ion-button>
				</ion-buttons>
				<ion-title>Position</ion-title>
				<ion-buttons slot="end">
					<ion-button @click="closePositionDialog()">Close</ion-button>
				</ion-buttons>
			</ion-toolbar>
		</ion-header>
		<ion-content class="ion-padding">

			<div style="padding-bottom: 4rem;" v-if="fullInstrument">

				<ion-item>
					<ion-label class="ion-text-wrap selectable">{{ fullInstrument.name }}</ion-label>
					<copy-button :text="fullInstrument.name" slot="end"></copy-button>
				</ion-item>

				<h1>General</h1>

				<ion-item v-if="position['portfolio.user_code'] && position['portfolio.user_code'] != '-'">
					<ion-label>
						Portfolio
					</ion-label>
					<ion-badge color="primary" class="selectable">{{ position['portfolio.user_code'] }}
					</ion-badge>
				</ion-item>

				<ion-item v-if="position['account.user_code'] && position['account.user_code'] != '-'">
					<ion-label>
						Account
					</ion-label>
					<ion-badge color="primary" class="selectable">{{ position['account.user_code'] }}
					</ion-badge>
				</ion-item>

				<ion-item v-if="position['item_group_name']">
					<ion-label>
						PL Group
					</ion-label>
					<ion-badge color="primary" class="selectable">{{ position['item_group_name'] }}
					</ion-badge>
				</ion-item>

				<ion-item v-if="position.nominal_position_size && position['item_group'] == 10">
					<ion-label>
						Position Size (Nominal)
					</ion-label>
					<ion-badge color="primary" class="selectable">{{ $format(position.nominal_position_size) }}
					</ion-badge>
				</ion-item>

				<ion-item v-if="position.instrument_factor">
					<ion-label>
						Factor
					</ion-label>
					<ion-badge color="primary" class="selectable">{{ position.instrument_factor }}
					</ion-badge>
				</ion-item>

				<div v-if="position['item_group'] == 10">

				<h1>Price</h1>

				<ion-item v-if="position.instrument_principal_price">
					<ion-label>
						Price
					</ion-label>
					<ion-badge color="primary" class="selectable">{{ $roundToTwo(position.instrument_principal_price) }} {{ position['pricing_currency.user_code'] }}
					</ion-badge>
				</ion-item>

				<ion-item v-if="position.instrument_accrued_price">
					<ion-label>
						Accrued Price
					</ion-label>
					<ion-badge color="primary" class="selectable">{{ $roundToTwo(position.instrument_accrued_price) }} {{ position['accrued_currency.user_code'] }}
					</ion-badge>
				</ion-item>

				<ion-item v-if="position['pricing_currency.user_code'] && position['pricing_currency.user_code'] != '-'">
					<ion-label>
						Pricing Currency
					</ion-label>
					<ion-badge color="primary" class="selectable">{{ position['pricing_currency.user_code'] }}
					</ion-badge>
				</ion-item>

				<ion-item v-if="position['instrument.price_multiplier']">
					<ion-label>
						Multiplier
					</ion-label>
					<ion-badge color="primary" class="selectable">{{ position['instrument.price_multiplier'] }}
					</ion-badge>
				</ion-item>

				<ion-item v-if="position.instrument_pricing_currency_fx_rate">
					<ion-label>
						FX Rate
					</ion-label>
					<ion-badge color="primary" class="selectable">{{ $roundToTwo(position.instrument_pricing_currency_fx_rate) }}
					</ion-badge>
				</ion-item>

				<ion-item v-if="position.market_value">
					<ion-label>
						Market Value
					</ion-label>
					<ion-badge color="primary" class="selectable">{{ $format(position.market_value) }} {{ spaceStore.settings.general.currency }}
					</ion-badge>
				</ion-item>

				</div>

				<h1>P&L</h1>

				<ion-item v-if="position.total">
					<ion-label>
						P&L Total
					</ion-label>
					<ion-badge color="primary" class="selectable">{{ $format(position.total) }} {{ spaceStore.settings.general.currency }}
					</ion-badge>
				</ion-item>

				<ion-item v-if="position.principal">
					<ion-label>
						Capital Gain
					</ion-label>
					<ion-badge color="primary" class="selectable">{{ $roundToTwo(position.principal) }} {{ spaceStore.settings.general.currency }}</ion-badge>
				</ion-item>

				<ion-item v-if="position.carry">
					<ion-label>
						Carry
					</ion-label>
					<ion-badge color="primary" class="selectable">{{ $roundToTwo(position.carry) }} {{ spaceStore.settings.general.currency }}</ion-badge>
				</ion-item>

				<ion-item v-if="position.overheads">
					<ion-label>
						Overheads
					</ion-label>
					<ion-badge color="primary" class="selectable">{{ $roundToTwo(position.overheads) }} {{ spaceStore.settings.general.currency }}</ion-badge>
				</ion-item>

				<h1>Description</h1>

				<ion-item>
					<ion-label>
						<p>Instrument Type</p>
						<h2 class="selectable">{{ fullInstrument.instrument_type_object.name }}</h2>
					</ion-label>
				</ion-item>

				<ion-item>
					<ion-label>
							<p>ISIN (User Code)</p>
							<h2 class="selectable">{{ fullInstrument.user_code }}</h2>
					</ion-label>
					<copy-button :text="fullInstrument.user_code" slot="end"></copy-button>
				</ion-item>

				<ion-item v-if="fullInstrument.maturity_date">
					<ion-label>
						<p>Maturity Date</p>
						<h2 class="selectable">{{ fullInstrument.maturity_date }}</h2>
					</ion-label>
				</ion-item>

				<ion-item>
					<ion-label>
						<p>Pricing Currency</p>
						<h2 class="selectable">{{ fullInstrument.pricing_currency_object.short_name }}</h2>
					</ion-label>
				</ion-item>


				<ion-item>
					<ion-label>
						<p>Accrued Currency</p>
						<h2 class="selectable">{{ fullInstrument.accrued_currency_object.short_name }}</h2>
					</ion-label>
				</ion-item>

				<ion-item v-if="fullInstrument.country && fullInstrument.country_object.name != '-'">
					<ion-label>
						<p>Country</p>
						<h2 class="selectable">{{ fullInstrument.country_object.name }}</h2>
					</ion-label>
				</ion-item>


				<ion-item v-if="fullInstrument.notes && fullInstrument.notes != '-'">
					<ion-label>
						<p>Notes</p>
						<h2 class="selectable ion-text-wrap">{{ fullInstrument.notes }}</h2>
					</ion-label>
					<copy-button :text="fullInstrument.notes" slot="end"></copy-button>
				</ion-item>

				<div>

					<ion-item v-for="attribute in fullInstrumentAttributes" :key="attribute.id">
						<ion-label>
							<p>{{ attribute.attribute_type_object.name }}</p>

							<h2 v-if="attribute.attribute_type_object.value_type == 10" class="selectable ion-text-wrap">
								{{ attribute.value_string }}</h2>
							<h2 v-if="attribute.attribute_type_object.value_type == 20" class="selectable">
								{{ attribute.value_float }}</h2>
							<h2 v-if="attribute.attribute_type_object.value_type == 30" class="selectable">
								{{ attribute.classifier_object.name }}</h2>
							<h2 v-if="attribute.attribute_type_object.value_type == 40" class="selectable">{{ attribute.value_date
								}}</h2>
						</ion-label>
						<copy-button v-if="attribute.attribute_type_object.value_type == 10" :text="attribute.value_string" slot="end"></copy-button>
						<copy-button v-if="attribute.attribute_type_object.value_type == 30 && attribute.classifier_object" :text="attribute.classifier_object.name" slot="end"></copy-button>
					</ion-item>


				</div>


				<div class="display-flex" style="justify-content: flex-end; padding-right: 0.5rem; margin-top: 0.5rem">
					<ion-button size="small" @click="showMoreInstrumentData = !showMoreInstrumentData">

						<span v-if="!showMoreInstrumentData">Show More</span>
						<span v-if="showMoreInstrumentData">Hide</span>
					</ion-button>
				</div>

				<div v-if="showMoreInstrumentData">

					<ion-item v-if="position.total_fixed">
						<ion-label>
							P&L Total Fixed
						</ion-label>
						<ion-badge color="primary" class="selectable">{{ $format(position.total_fixed) }} {{ spaceStore.settings.general.currency }}
						</ion-badge>
					</ion-item>

					<ion-item v-if="position.principal_fixed">
						<ion-label>
							Capital Gain Fixed
						</ion-label>
						<ion-badge color="primary" class="selectable">{{ $roundToTwo(position.principal_fixed) }} {{ spaceStore.settings.general.currency }}</ion-badge>
					</ion-item>

					<ion-item v-if="position.carry_fixed">
						<ion-label>
							Carry Fixed
						</ion-label>
						<ion-badge color="primary" class="selectable">{{ $roundToTwo(position.carry_fixed) }} {{ spaceStore.settings.general.currency }}</ion-badge>
					</ion-item>

					<ion-item v-if="position.overheads_fixed">
						<ion-label>
							Overheads Fixed
						</ion-label>
						<ion-badge color="primary" class="selectable">{{ $roundToTwo(position.overheads_fixed) }} {{ spaceStore.settings.general.currency }}</ion-badge>
					</ion-item>

					<ion-item v-if="position.total_fixed">
						<ion-label>
							P&L Total Fixed
						</ion-label>
						<ion-badge color="primary" class="selectable">{{ $format(position.total_fixed) }} {{ spaceStore.settings.general.currency }}
						</ion-badge>
					</ion-item>

					<ion-item v-if="position.principal_fx">
						<ion-label>
							Capital Gain FX
						</ion-label>
						<ion-badge color="primary" class="selectable">{{ $roundToTwo(position.principal_fx) }} {{ spaceStore.settings.general.currency }}</ion-badge>
					</ion-item>

					<ion-item v-if="position.carry_fx">
						<ion-label>
							Carry FX
						</ion-label>
						<ion-badge color="primary" class="selectable">{{ $roundToTwo(position.carry_fx) }} {{ spaceStore.settings.general.currency }}</ion-badge>
					</ion-item>

					<ion-item v-if="position.overheads_fx">
						<ion-label>
							Overheads FX
						</ion-label>
						<ion-badge color="primary" class="selectable">{{ $roundToTwo(position.overheads_fx) }} {{ spaceStore.settings.general.currency }}</ion-badge>
					</ion-item>



					<ion-item v-if="position.gross_cost_price">
						<ion-label>
							Gross Cost Price
						</ion-label>
						<ion-badge color="primary" class="selectable">{{ $roundToTwo(position.gross_cost_price) }} {{ spaceStore.settings.general.currency }}
						</ion-badge>
					</ion-item>

					<ion-item v-if="position.net_cost_price">
						<ion-label>
							Net Cost Price
						</ion-label>
						<ion-badge color="primary" class="selectable">{{ $roundToTwo(position.net_cost_price) }} {{ spaceStore.settings.general.currency }}
						</ion-badge>
					</ion-item>

					<ion-item v-if="position.time_invested">
						<ion-label>
							Time Invested
						</ion-label>
						<ion-badge color="primary" class="selectable">{{ $roundToTwo(position.time_invested) }} Years
						</ion-badge>
					</ion-item>

					<ion-item v-if="position.amount_invested">
						<ion-label>
							Amount Invested
						</ion-label>
						<ion-badge color="primary" class="selectable">{{ $roundToTwo(position.amount_invested) }} {{ spaceStore.settings.general.currency }}
						</ion-badge>
					</ion-item>

					<ion-item v-if="position.exposure">
						<ion-label>
							Exposure
						</ion-label>
						<ion-badge color="primary" class="selectable">{{ $roundToTwo(position.exposure) }} {{ spaceStore.settings.general.currency }}</ion-badge>
					</ion-item>

					<ion-item v-if="position.ytm">
						<ion-label>
							YTM
						</ion-label>
						<ion-badge color="primary" class="selectable">{{ $roundToTwo(position.ytm) * 100 }}%</ion-badge>
					</ion-item>

					<ion-item v-if="position.modified_duration">
						<ion-label>
							Modified Duration
						</ion-label>
						<ion-badge color="primary" class="selectable">{{ $roundToTwo(position.modified_duration) }} Years
						</ion-badge>
					</ion-item>

					<ion-item v-if="position.position_return">
						<ion-label>
							Return (All Time)
						</ion-label>
						<ion-badge color="primary" class="selectable">{{ $roundToTwo(position.position_return) * 100 }}%</ion-badge>
					</ion-item>

					<ion-item v-if="position.return_annually">
						<ion-label>
							Return (P. A.)
						</ion-label>
						<ion-badge color="primary" class="selectable">{{ $roundToTwo(position.return_annually) * 100 }}%
						</ion-badge>
					</ion-item>

				</div>

			</div>

			<order-dialog
				:position="position"
				:isOpen="isOrderDialogOpen"
				@close="isOrderDialogOpen = false"
			></order-dialog>

		</ion-content>
	</ion-modal>
</template>

<script>
	import { computed } from 'vue'
	import { IonButton, IonButtons, IonContent, IonHeader, IonItem, IonModal, IonTitle, IonToolbar } from '@ionic/vue'

	import useApi from '@/composables/useApi'
	import useStore from '@/composables/useStore'
	import CopyButton from '@/components/CopyButton.vue'
	import OrderDialog from '@/views/dialogs/OrderDialog.vue'

	export default {
		components: {
			OrderDialog,
			IonItem,
			IonContent,
			IonTitle,
			IonButton,
			IonButtons,
			IonHeader,
			IonToolbar,
			IonModal,
			CopyButton,


		},
		props: {
			position: Object, // Data to display in the modal
			isOpen: Boolean // Controls whether the modal is open or closed
		},
		data() {
			return {
				icons: {},
				showMoreInstrumentData: false,
				fullInstrument: null,
				fullInstrumentAttributes: [],
				spaceStore: null,
				isOrderDialogOpen: false
			}
		},
		watch: {
			async isOpen(newVal) {
				if (newVal) {
					await this.getFullInstrument()
				}
			}
		},
		emits: ['close'],
		methods: {
			createOrder() {

				this.isOrderDialogOpen = true;
				console.log('create order');

			},
			closePositionDialog() {
				this.$emit('close')
			},
			async getFullInstrument() {

				console.log('PositionDialog.position', this.position)

				this.fullInstrument = await useApi('instrument.get', {
					params: { id: this.position['instrument.id'] }
				})

				this.fullInstrumentAttributes = this.fullInstrument.attributes.filter((attribute) => {

					if (attribute.attribute_type_object.user_code.indexOf('pricing_policy_') !== -1) {
						return false
					}

					if (attribute.attribute_type_object.value_type == 10) {

						if (!attribute.value_string) {
							return false
						}
						if (attribute.value_string == '-') {
							return false
						}
					}

					if (attribute.attribute_type_object.value_type == 20 && (!attribute.value_float && attribute.value_float !== 0)) {
						return false
					}

					if (attribute.attribute_type_object.value_type == 30) {

						if (!attribute.classifier) {
							return false
						}

						if (attribute.classifier_object.name == '-') {
							return false
						}

					}

					if (attribute.attribute_type_object.value_type == 40 && !attribute.value_date) {
						return false
					}

					return true

				})

			}
		},
		async created() {

			this.store = useStore()
			this.spaceStore = computed(() => this.store.getActiveSpaceStore())

		},
		async mounted() {


		},
		beforeUnmount() {


		}
	}

</script>

<style lang="scss" scoped>


</style>
