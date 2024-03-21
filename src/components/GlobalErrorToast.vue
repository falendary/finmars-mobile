<template>
	<div v-if="store.error" class="global-error-toast">

		<ion-icon :icon="icons.bugOutline" size="large"
							style="margin-right: 8px;"></ion-icon>
		<div @click="showDialog = true">Oops, something went wrong. Don't panic, we are already working on it.
		</div>
		<ion-modal ref="modal" :is-open="showDialog">
			<ion-header>
				<ion-toolbar>

					<ion-title>Exception</ion-title>
					<ion-buttons slot="end">
						<ion-button @click="closeDialog()">Close</ion-button>
					</ion-buttons>
				</ion-toolbar>
			</ion-header>
			<ion-content class="ion-padding">
				{{ store.error }}

				<ion-button
					class="ion-margin-horizontal logout"
					fill="outline"
					expand="block"
					@click="goToRecovery()"
				>
					Recovery
				</ion-button>
			</ion-content>
		</ion-modal>

		<ion-buttons slot="end">
			<ion-button @click="closeGlobalError()">Close</ion-button>
		</ion-buttons>
	</div>

</template>

<script>
	import { IonApp, IonButton, IonButtons, IonIcon, IonModal, IonRouterOutlet } from '@ionic/vue'
	import ProgressCircular from '@/components/ProgressCircular.vue'
	import { Suspense } from 'vue'
	import useStore from '@/composables/useStore.js'
	import Passcode from '@/components/Passcode.vue'
	import { bugOutline } from 'ionicons/icons'

	export default {
		components: {
			IonIcon,
			IonModal,
			IonButton,
			IonButtons,
			ProgressCircular,
			IonRouterOutlet,
			Suspense,
			IonApp,
			Passcode
			// settingsSharp, close, barChartOutline, layersOutline, readerOutline, settingsOutline
		},

		data() {
			return {
				icons: {
					bugOutline
				},
				store: null,

				showDialog: false
			}
		},
		methods: {
			closeGlobalError() {
				this.store.setGlobalError(null)
			},
			goToRecovery() {
				this.closeGlobalError()
				this.closeDialog()
				this.$router.replace('/recovery');
				this.$refs.modal.$el.dismiss();
			},
			closeDialog() {
				this.showDialog = false
			}

		},
		async created() {

			this.store = useStore()


		},
		mounted() {

		},
		beforeUnmount() {

		}
	}

</script>

<style lang="scss">

	.global-error-toast {
		position: fixed;
		top:  env(safe-area-inset-top);
		–top: var(–ion-safe-area-top, 1rem);
		width: 100%;
		display: flex;
		//padding: 1rem;
		font-size: .8rem;
		justify-content: space-between;
		z-index: 100;
		background: var(--ion-background-color);
		color: var(--ion-text-color);
		–padding-top: var(–ion-safe-area-top, 1rem);
		padding-top: env(safe-area-inset-top);
		--ion-safe-area-top: 20px;
		--ion-safe-area-bottom: 20px;
	}


</style>
