<template>
  <!-- AutoSeq is a configuration-only marker — its sequencing logic is
       implemented elsewhere in the framework, not in this SFC. The page
       generator emits <AutoSeq ...> tags so Vue needs *something* to
       resolve; this no-render component swallows the props and emits
       nothing visual, which silences the "Failed to resolve component"
       warning without changing behaviour. -->
</template>

<script setup>
defineOptions({ name: 'AutoSeq', inheritAttrs: false })

defineProps({
  id:            { type: String, default: '' },
  root:          { type: Object, default: null },
  bindingObject: { type: String, default: '' },
  field:         { type: String, default: '' },
  numDig:        { type: [Number, String], default: 2 },
  startValue:    { type: [Number, String], default: 1 },
  step:          { type: [Number, String], default: 1 }
})
</script>
