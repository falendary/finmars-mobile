<template>
	<ion-modal ref="modal" :is-open="isOpen">
		<ion-header>
			<ion-toolbar>
				<ion-title>Order</ion-title>
				<ion-buttons slot="end">
					<ion-button @click="closeOrderDialog()">Close</ion-button>
				</ion-buttons>
			</ion-toolbar>
		</ion-header>
		<ion-content class="ion-padding">

			<div class="order-dialog-wrap">

				<div v-if="state === 'initial'">

					<input class="order-dialog-subject-input" type="text" v-model="subjectText">

					<textarea name="" id="" cols="30" rows="10" v-model="orderText"></textarea>

					<div class="order-dialog-footer">

						<ion-button fill="outline" :class="{'active': transactionType === 'buy'}" @click="buy()" style="width: 40vw">
							Buy
						</ion-button>
						<ion-button fill="outline" :class="{'active': transactionType === 'sell'}" @click="sell()"
												style="width: 40vw">Sell
						</ion-button>

					</div>

					<h4>Recipients</h4>
					<div>
						<ion-chip v-for="item in spaceStore.settings.recipients">
							<ion-label>{{ item }}</ion-label>
							<span class="order-dialog-delete-chip" @click="removeEmail(item)">x</span>
						</ion-chip>

						<div class="flex" style="align-items: center; margin-top: 0.5rem;">
							<ion-input class="order-dialog-add-email-input" type="text" v-model="userEmail"></ion-input>
							<ion-button class="order-dialog-add-email"
													:disabled="!userEmail.length"
													@click="addEmail()" style="width: 100%">Add
							</ion-button>
						</div>
					</div>

					<ion-button @click="sendOrder()" style="width: 100%">Send Order</ion-button>

				</div>

				<div v-if="state === 'success'" class="text-center">

					<ion-icon style="font-size: 3rem; margin-bottom: 1rem; margin-top: 1rem;" slot="icon-only" :ios="icons.diamondOutline"  :md="icons.diamondOutline"></ion-icon>

					<div>Order successfully sent</div>

				</div>

				<div v-if="state === 'error'">
					Something went wrong

					<ion-button @click="state = 'init'" style="width: 100%">Try Again</ion-button>
				</div>


			</div>

		</ion-content>
	</ion-modal>
</template>

<script>
	import { computed } from 'vue'
	import {
		IonButton,
		IonButtons,
		IonChip,
		IonContent,
		IonHeader,
		IonIcon,
		IonInput,
		IonItem,
		IonModal,
		IonTitle,
		IonToolbar
	} from '@ionic/vue'
	import useStore from '@/composables/useStore'
	import useApi from '@/composables/useApi.js'
	import { closeOutline, diamondOutline } from 'ionicons/icons'

	export default {
		components: {
			IonContent,
			IonTitle,
			IonButton,
			IonButtons,
			IonHeader,
			IonToolbar,
			IonModal,
			IonChip,
			IonInput,
			IonItem,
			IonIcon
		},
		props: {
			position: Object, // Data to display in the modal
			isOpen: Boolean // Controls whether the modal is open or closed
		},
		data() {
			return {
				icons: {
					closeOutline,
					diamondOutline
				},
				state: 'initial', // 'initial', 'success', 'error'
				showMoreInstrumentData: false,
				fullInstrument: null,
				fullInstrumentAttributes: [],
				spaceStore: null,
				isOrderDialogOpen: false,
				transactionType: 'buy',

				username: '',
				subjectText: '',
				orderText: '',
				userEmail: ''


			}
		},
		watch: {
			async isOpen(newVal) {
				if (newVal) {
					// await this.getFullInstrument()
				}
			}
		},
		emits: ['close'],
		methods: {
			buy() {
				this.transactionType = 'buy'
				this.updateOrderText()
			},
			sell() {
				this.transactionType = 'sell'
				this.updateOrderText()
			},
			async fetchUser() {
				let result = await useApi('user.get')
				this.username = result.first_name || result.username
			},
			async sendOrder() {

				try {

					console.log('this.orderText', this.orderText)
					console.log('this.spaceStore.recipients', this.spaceStore.settings.recipients)

					let res = await useApi('sendEmail.post', {
						body: {
							'subject': this.subjectText,
							'message': this.orderText,
							'recipient_list': this.spaceStore.settings.recipients,
							'html_message': this.orderText
						}
					})

					this.state = 'success';

					console.log('sendOrder.res', res)

					setTimeout(() => {
						this.$emit('close')
					}, 2000)

				} catch (e) {
					this.state = 'error'
				}

			},
			closeOrderDialog() {
				this.$emit('close')
			},
			updateOrderText() {

				this.orderText = `Please ${this.transactionType} ${this.position['pricing_currency.short_name']} ${this.position['position_size']} ${this.position.name} (${this.position.user_code})  @ mkt  for ${this.position['portfolio.user_code']}, day order`
			},
			removeEmail(email) {
				this.spaceStore.settings.recipients = this.spaceStore.settings.recipients.filter((recipientEmail) => {
					return recipientEmail !== email
				})
			},
			addEmail() {
				this.spaceStore.settings.recipients.push(this.userEmail)
				this.userEmail = ''
			}
		},
		async created() {

			this.store = useStore()
			this.spaceStore = computed(() => this.store.getActiveSpaceStore())

		},
		async mounted() {

			this.state = 'initial';


			this.updateOrderText()
			await this.fetchUser()
			this.subjectText = `Order Request from ${this.username}`
		},
		beforeUnmount() {


		}
	}

</script>

<style lang="scss" scoped>

	.order-dialog-footer {
		justify-content: space-between;
		display: flex;
	}

	ion-button.active {
		background: var(--ion-color-primary);
		color: var(--ion-color-primary-contrast);
		border-radius: var(--border-radius);
	}

	textarea {
		width: 100%;
		resize: none;
		padding: .4rem;

		background: transparent;
		border: 1px solid var(--ion-card-border-color);
	}

	.order-dialog-subject-input {
		width: 100%;
		resize: none;
		padding: .4rem;

		background: transparent;
		margin-bottom: .4rem;
		border: 1px solid var(--ion-card-border-color);
	}

	.order-dialog-add-email {
		max-width: 4rem;
		margin: 0;
		margin-left: 0.5rem;
	}

	.order-dialog-add-email-input {
		border: 1px solid var(--ion-color-primary);
		border-radius: .5rem;
	}

	.order-dialog-delete-chip {
		border: 1px solid var(--ion-color-primary);
		display: inline-block;
		margin-left: 0.5rem;
		height: 1rem;
		width: 1rem;
		text-align: center;
		border-radius: 6px;
	}

	.order-dialog-wrap {
		padding-bottom: 5rem;
	}


</style>
