<template>
  <input v-bind="PROPS.directives" :value="inputValue" @input="$emit('update:inputValue', $event.target.value)" />
</template>
<script>
import { COMPONENT_TEMPLATE } from '@/recipe/rCommonTable.js'
export default {
  emits: ['update:inputValue'],
  props: {
    inputValue: String,
    item: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      PROPS: { ...COMPONENT_TEMPLATE.item },
    }
  },
  mounted() {
    this.PROPS = { ...this.PROPS, ...this.item }
  },
}
</script>
<style lang=""></style>
