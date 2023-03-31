<template>
  <ion-app>
    <ion-content>
      <ion-router-outlet id="main-content" />
    </ion-content>

    <TheMenuBottom />
  </ion-app>
</template>

<script setup lang="ts">

  import {
    IonApp,
    IonRouterOutlet, 
    IonContent, 
  } from '@ionic/vue';

  import TheMenuBottom from '@/components/TheMenuBottom.vue'

</script>

<style lang="scss" scoped>

</style>
