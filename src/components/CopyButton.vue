<template>
	<ion-button class="copy-button" fill="outline" @click="$copyToClipboard(text)">
		<ion-icon :icon="copyOutline" size="medium"></ion-icon>
	</ion-button>
</template>

<script setup>

	import { IonButton, IonIcon } from '@ionic/vue'
	import { copyOutline } from 'ionicons/icons'

	const props = defineProps({
    text: String
  })

</script>

<style lang="scss" scoped>
  .copy-button {
		margin-top: 0;
		background: var(--ion-background-color);
	}
</style>
