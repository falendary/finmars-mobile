<template>
  <ion-page>
    <ion-content>
      <div class="header flex sb aic">
        <div>Transactions</div>
        <div class="header_info">2023-03-16</div>
      </div>

      <ion-searchbar animated="true" placeholder="Search..." />

      <TransactionList :items="transactions" />
    </ion-content>
  </ion-page>
</template>

<script setup>

  import { IonButtons, IonSearchbar, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonFooter } from '@ionic/vue';

  import { ref } from 'vue'
  import TransactionList from '@/components/TransactionList.vue'

  let transactions = ref([
    {id: 1, name: 'Any transaction', portfolio_name: 'IS9543PORT-AP', description: 'description', date: '2022-11-11'},
    {id: 1, name: 'Any transaction', portfolio_name: 'IS9543PORT-AP', description: 'description', date: '2022-11-11'},
    {id: 1, name: 'Any transaction', portfolio_name: 'IS9543PORT-AP', description: 'description', date: '2022-11-11'},
    {id: 1, name: 'Any transaction', portfolio_name: 'IS9543PORT-AP', description: 'description', date: '2022-11-11'},
  ])

</script>

<style lang="scss" scoped>
  .header {
    padding: 0 15px;
    color: #747474;
    font-weight: 500;
    font-size: 20px;
    margin-bottom: 15px;
  }
  .header_info {
    font-size: 16px;
  }
  ion-searchbar {
    padding-left: 15px;
    padding-right: 15px;
    padding-bottom: 23px;
  }
  ion-content {
    --padding-top: 10px;
    --padding-bottom: 10px;
    --background: #FAFAFA;
  }
</style>
