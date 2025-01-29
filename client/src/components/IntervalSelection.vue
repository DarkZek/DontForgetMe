<script setup lang="ts">
import { ref } from 'vue';

const selectedInterval = defineModel<number>()
const customShown = ref(false)

function selectInterval(interval: number) {
    selectedInterval.value = interval
    customShown.value = false
}

</script>

<template>
    <div class="interval-selection">
        <input type="radio" id="i2" name="interval" value="2" @input="selectInterval(2)">
        <label for="i2" class="option">
            <span>2</span>
            <span>DAYS</span>
        </label>

        <input type="radio" id="i3" name="interval" value="3" checked @input="selectInterval(3)">
        <label for="i3" class="option">
            <span>3</span>
            <span>DAYS</span>
        </label>

        <input type="radio" id="i4" name="interval" value="4" @input="selectInterval(4)">
        <label for="i4" class="option">
            <span>4</span>
            <span>DAYS</span>
        </label>

        <input type="radio" id="icustom" name="interval" value="custom" @input="customShown = true">
        <label for="icustom" class="option">
            <span>CUSTOM</span>
            <span>DAYS</span>
        </label>

        <br>
    </div>

    <input
        v-if="customShown"
        v-model="selectedInterval"
        class="custom-interval"
        type="number"
        placeholder="Enter days"
        max="30"
        min="1"
    >

</template>


<style lang="scss" scoped>
    .interval-selection {
        display: flex;
        flex-direction: row;
        gap: 12px;

        input[type=radio] {
            display: none;
        }

        :checked + .option {
            outline: 4px solid #2AC834;
            color: #2AC834;
        }

        .option {
            aspect-ratio: 1;
            width: 80px;
            outline: 2px solid green;
            background: white;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            user-select: none;
            transition: outline 0.15s ease-in-out;
        }
    }

    .custom-interval {
        margin-top: 16px;
        width: 100%;
        max-width: 200px;
        padding: 8px;
        border-radius: 8px;
        border: 2px solid #2AC834;
        font-size: 16px;
    }
</style>