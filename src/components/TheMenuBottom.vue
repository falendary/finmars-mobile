<template>
	<ion-footer>
		<ion-toolbar color="medium">
			<ion-buttons slot="start">

				<ion-tabs>
					<ion-router-outlet></ion-router-outlet>
					<ion-tab-bar slot="bottom">
						<ion-tab-button tab="balance" href="/balance">
							<ion-icon :icon="iconTest" />
							<ion-label>Listen now</ion-label>
						</ion-tab-button>

						<ion-tab-button tab="radio" href="/balance">
							<ion-icon :icon="iconTest" />
							<ion-label>Radio</ion-label>
						</ion-tab-button>
					</ion-tab-bar>
					<ion-tab-bar slot="bottom">
						<ion-tab-button tab="balance" href="/balance">
							<ion-icon :icon="iconTest" />
							<ion-label>Listen fnow</ion-label>
						</ion-tab-button>

						<ion-tab-button tab="radio" href="/balance">
							<ion-icon :icon="iconTest" />
							<ion-label>Radio3</ion-label>
						</ion-tab-button>
					</ion-tab-bar>
				</ion-tabs>
				
				
			</ion-buttons>

			<div>
				

				<ion-button fill="clear" router-link="/dashboard">
					Finmars
				</ion-button>
			</div>

			<ion-buttons slot="end">
				<ion-icon size="large" color="primary" :icon="iconTest" />
			</ion-buttons>
		</ion-toolbar>
	</ion-footer>
</template>

<script setup lang="ts">
	import {
    IonTitle,
    IonIcon,
    IonButtons,
    IonButton,
    IonTabButton,
    IonFooter,
    IonToolbar,
  } from '@ionic/vue';

	let iconTest = `data:image/svg+xml;utf8,<svg class='ionicon' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.25 2.52.77-1.28-3.52-2.09V8z"/></svg>`
</script>

<style scoped>

</style>