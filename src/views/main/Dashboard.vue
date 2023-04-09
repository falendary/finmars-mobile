<template>
  <ion-page>
    <ion-content class="content">
      <div class="header flex sb aic">
        <div>All Portfolios</div>
        <div class="header_info">2023-03-16</div>
      </div>

      <div class="main_chart">
        <div class="main_chart_h">Net Asset Value (NAV) </div>
        <div class="main_chart_price">126,342.12 USD</div>

        <div style="height: 80px;width: calc(100% + 10px);margin: 0 0 -5px -5px;">
          <canvas id="myChart"><p>Chart</p></canvas>
        </div>
      </div>

      <Indicators 
        :items="[
          {id: 1, name: 'Daily p/l', price: 1234, currency: 'USD', percent: -1.56},
          {id: 2, name: 'Month to date (MTD) P\L', price: 456, currency: 'USD', percent: 99.88},
          {id: 3, name: 'Daily p/l', price: 1234, currency: 'USD', percent: 0},
          {id: 4, name: 'Daily p/l', price: 1234, currency: 'USD', percent: 2.56},
        ]"
      />

      <div class="header">
        Portfolios
      </div>

      <div class="portfolios">
        <div class="portfolios_item"
          v-for="item in portfolios"
        >
          <div class="pi_first_line flex aic sb">
            <div class="pi_header">{{ item.name }}</div>
            <div class="pi_price_change">{{ $format(item.change.price) }}</div>
          </div>
          <div class="flex aic sb">
            <div class="pi_price">{{ $format(item.price) }} USD </div>
            <ChangePrice :percent="item.change.percent" />
          </div>
        </div>
      </div>

      <div class="header">
        Last transactions
      </div>

      <TransactionList :items="transactions" />
    </ion-content>
  </ion-page>
</template>

<script setup>

  import {
    IonTitle,
    IonIcon,
    IonButtons,
    IonButton,
    IonToolbar,
  } from '@ionic/vue';

  import Indicators from '@/components/Indicators.vue'
  import ChangePrice from '@/components/ChangePrice.vue'
  import TransactionList from '@/components/TransactionList.vue'

  import { statsChart , radio, library, settingsSharp } from 'ionicons/icons';

  import {
    Chart,
    LineElement,
		PointElement,
		LineController,
		ScatterController,
		CategoryScale,
		LinearScale,
		Decimation,
		Filler,
  } from 'chart.js';
  import { onMounted, ref } from 'vue';
  import useApi from '@/composables/useApi.js'
// Stores the controller so that the chart initialization routine can look it up
	Chart.register(
		LineElement,
		PointElement,
		LineController,
		ScatterController,
		CategoryScale,
		LinearScale,
		Decimation,
		Filler,
	);

  let allPorfoliosChart
  let width, height, gradient

  const portfolios = ref([])
  const transactions = ref([])

  fetchPortfolios()
  fetchTransactions()

  onMounted(() => {
    allPorfoliosChart = createChart()
    
  })

  async function fetchPortfolios() {
    let res = await useApi('portfolioLight.get')

    let percents = [-2.1, 20.54, 0, -1]
    if ( res )
      portfolios.value = res.results.map((o, k) => ({
        id: o.id, 
        name: o.name,
        price: Math.floor(Math.random() * 100000),
        change: {
          price: Math.floor(Math.random() * 10000),
          percent: percents[k] || 1.53
        }
      }))
  }

  async function fetchTransactions() {
    // let res = await useApi('complexTransaction.get', {
    //   filters: {
    //     page_size: 10
    //   }
    // })
    // console.log('res:', res)

    // if ( res )
    //   transactions.value = res.results.map((o, k) => ({
    //     id: o.id, 
    //     name: o.name,
    //     price: Math.floor(Math.random() * 100000),
    //     change: {
    //       price: Math.floor(Math.random() * 10000),
    //       percent: percents[k] || 1.53
    //     }
    //   }))
    transactions.value = [
      {id: 1, name: 'Any transaction', portfolio_name: 'IS9543PORT-AP', description: 'description', date: '2022-11-11'},
      {id: 1, name: 'Any transaction', portfolio_name: 'IS9543PORT-AP', description: 'description', date: '2022-11-11'},
      {id: 1, name: 'Any transaction', portfolio_name: 'IS9543PORT-AP', description: 'description', date: '2022-11-11'},
      {id: 1, name: 'Any transaction', portfolio_name: 'IS9543PORT-AP', description: 'description', date: '2022-11-11'},
    ]
  }

  function createChart() {
    return new Chart('myChart', {
			type: 'line',
			data: {
        labels: ['test', 'test2', 'test2', 'test2', 'test2', 'test', 'test2', 'test2', 'test2', 'test2'],
        datasets: [
          {
            label: 'Dataset 1',
            data: [23, 35, 38, 40, 12, 7,13, 15,20, 30,],
            borderColor: '#F05A22',
            borderWidth: 1,
            pointBackgroundColor: 'transparent',
            pointBorderColor: 'transparent',
            backgroundColor: function(context) {
              const chart = context.chart;
              const {ctx, chartArea} = chart;

              if (!chartArea) {
                // This case happens on initial chart load
                return;
              }

              const chartWidth = chartArea.right - chartArea.left;
              const chartHeight = chartArea.bottom - chartArea.top;
              if (!gradient || width !== chartWidth || height !== chartHeight) {
                // Create the gradient because this is either the first render
                // or the size of the chart has changed
                width = chartWidth
                height = chartHeight;
                gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                gradient.addColorStop(0, 'rgba(255, 178, 108, 0)');
                gradient.addColorStop(1, 'rgba(240, 90, 34, 0.48)');
              }
              return gradient
            },
            fill: true
          },
          {
            label: 'Dataset 1',
            data: [20, 30, 35, 40, 20, 35, 20, 10, 13, 30,],
            borderColor: 'rgba(30, 30, 30, 0.2)',
            borderWidth: 1,
            pointBackgroundColor: 'transparent',
            pointBorderColor: 'transparent',
            stepped: true
          }
        ],
      },
			options: {
        layout: {
        },
        maintainAspectRatio: false,
        elements: {
          line: {
            tension: 0.5
          }
        },
        scales: {
          x: {
            display: false
          },
          y: {
            display: false,
          },
        },
        plugins: {
          legend: {
            display: false,
          }
        }
			},
		});
  }
  

</script>

<style lang="scss" scoped>
  ion-content {
    --padding-top: 10px;
    --padding-bottom: 10px;
    --background: #FAFAFA;
  }
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
  .main_chart {
    margin: 0 15px;
    background: #fff;
    padding-top: 9px;
    border-radius: 5px;
    overflow: hidden;
    box-shadow: 0px 3px 15px rgba(0, 0, 0, 0.05);

    &_h {
      padding: 0 14px;
      padding-bottom: 4px;
      font-size: 14px;
      line-height: 24px;
      color: #747474;
    }
    &_price {
      padding: 0 14px;
      padding-bottom: 50px;
      font-weight: 600;
      font-size: 20px;
      line-height: 24px;
    }
  }
  .portfolios {
    margin: 0 15px 15px;
  }
  .portfolios_item {
    border-radius: 5px;
    background: #fff;
    padding: 7px 10px;
    box-shadow: 0px 3px 15px rgba(0, 0, 0, 0.05);

    & + & {
      margin-top: 10px;
    }
  }
  .pi_first_line {
    margin-bottom: 4px;
  }
  .pi_header {
    font-weight: 500;
    font-size: 14px;
    line-height: 24px;
    color: #747474;
  }
  .pi_price {
    font-size: 20px;
    line-height: 24px;
  }
  .pi_price_change {
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
  }
  
  
</style>
