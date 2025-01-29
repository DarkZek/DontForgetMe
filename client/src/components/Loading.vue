<script setup lang="ts">
defineProps({
    size: String,
})
</script>

<template>
    <div>
        <Icon class="e1" name="noto:sunflower" :size="size ?? '32px'" />
    </div>
</template>

<style lang="scss" scoped>
    @keyframes animate-spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    .e1 {
        animation: animate-spin 1.5s linear infinite;
        transform-origin: 50% 40.7%;
        aspect-ratio: 1;
    }
</style>