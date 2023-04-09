<template>
  <ion-page>
    <ion-content class="ion-padding">
      <ion-select v-model="active" label="Region" placeholder="Choose region">
        <ion-select-option 
          v-for="item in regions" 
          :value="item.id"
        >
          {{ item.name }}
        </ion-select-option>
      </ion-select>
    </ion-content>
  </ion-page>
</template>

<script setup>

  import {
    IonPage,
    IonContent,
    IonIcon,
    IonButtons,
    IonButton,
    IonFooter,
    IonSelect,
    IonSelectOption,
  } from '@ionic/vue';
  import { ref } from 'vue'

  const regions = [
    {id: 'eu-central', name: 'EU Central'},
    {id: 'eu2-central', name: 'EU Not central'},
    {id: 'dev', name: 'Development'},
  ]
  const active = ref('')

</script>

<style lang="scss" scoped>

</style>
