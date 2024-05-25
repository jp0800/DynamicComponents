<!-- @/components/CommonTableComponent/CommonTable.vue -->
<template>
  <br />{{ Object.entries(HEADERS_MANAGER).sort((a, b) => a[0].localeCompare(b[0])) }}
  <br />{{ Object.entries(ROWS_MANAGER).sort((a, b) => a[0].localeCompare(b[0])) }}
  

  <table>
    <tr>
      <th v-for="(header, columnIndex) in HEADERS" :key="columnIndex" v-bind="header.directives">
        <component
          v-for="(item, componentIndex) in header.items"
          :is="item.is"
          :key="componentIndex"
          v-bind="item.directives"
          v-model:inputValue="HEADERS_MANAGER[`${columnIndex}-${componentIndex}`]"
          @commonClick="emitEvent($event, { columnIndex, componentIndex })"
        />
      </th>
    </tr>
    <tr v-for="(row, rowIndex) in ROWS" :key="rowIndex">
      <td v-for="(column, columnIndex) in row" :key="columnIndex" v-bind="column.directives">
        <component
          v-for="(item, componentIndex) in column.items"
          :is="item.is"
          :key="componentIndex"
          v-model:inputValue="ROWS_MANAGER[`${rowIndex}-${columnIndex}-${componentIndex}`]"
          @commonClick="emitEvent($event, { rowIndex, columnIndex, componentIndex })"
        />
      </td>
    </tr>
    <CommonButton :item="{ display: { text: 'some' } }" @commonClick="()=>{HEADERS_MANAGER['0-1'] = 'HAHAHA CHANGED BY A BUTTON'}"></CommonButton>
  </table>
</template>

<script>
import { HEADERS, ROWS } from '@/recipe/rCommonTable.js'
import CommonButton from '@/components/CommonButton.vue'
import CommonInput from '@/components/CommonInput.vue'
export default {
  components: {
    CommonButton,
    CommonInput
  },
  data() {
    return {
      HEADERS: HEADERS,
      ROWS: ROWS,
      HEADERS_MANAGER: {},
      ROWS_MANAGER: {}
    }
  },
  methods: {
    emitEvent(event, tableIndex) {
      console.log('CommonTable', event, tableIndex)
    }
  }
}
</script>
<style scoped>
table {
  border-collapse: collapse;
}

td,
th {
  border: 1px solid #dddddd;
  padding: 8px;
}
tr:nth-child(even) {
  background: #dddddd;
}
</style>
