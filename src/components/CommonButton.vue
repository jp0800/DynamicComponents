<template>
  <div>
    <button @click="emitEvent">{{ PROPS.display.text }}</button>
  </div>
</template>
<script>
import { COMPONENT_TEMPLATE } from '@/recipe/rCommonTable.js'
export default {
  emits: ['commonClick'],
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      PROPS: { ...COMPONENT_TEMPLATE.item }
    }
  },
  mounted() {
    this.PROPS = { ...this.PROPS, ...this.item }
  },
  methods: {
    emitEvent(event) {
      const out = {
        raw: event,
        data: this.PROPS.events
      }
      this.$emit('commonClick', out)
    }
  }
}
</script>
<style scoped></style>
