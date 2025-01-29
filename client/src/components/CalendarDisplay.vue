<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { computed } from "vue";

const props = defineProps<{
    intervalDays: number
}>()

const now = new Date();

function getSuffix(date: number) {
    const dateNum = date % 10

    if (dateNum === 1) {
        return 'st'
    }
    if (dateNum === 2) {
        return 'nd'
    }
    if (dateNum === 3) {
        return 'rd'
    }
    return 'th'
}

function isSameDay(d1: Date, d2: Date): boolean {
	return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
}

const daysShown = 9

const days = computed(() => {
    return new Array(daysShown).fill(0)
        .map((_, i) => new Date(now.getTime() + i * 24 * 60 * 60 * 1000))
        .map((date) => {
            
            let isWatering = false

            // If the date is today
            if (isSameDay(date, now)) {
                isWatering = true
            }

            for (let i = 0; i < daysShown; i += props.intervalDays) {
                const wateringDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000)
                if (isSameDay(date, wateringDate)) {
                    isWatering = true
                }
            }

            return {
                date,
                isWatering
            }
        })
})

</script>

<template>
    <div
        class="calendar"
    >
        <!-- Loop over the previous day and next 7 days to make icons -->
        <div
            v-for="entry, i of days"
            :key="i"
        >
            <div class="item">
                <Icon
                    v-if="!entry.isWatering"
                    icon="noto:sun"
                    size="28px"
                    class="sun"
                />
                <Icon
                    v-else
                    icon="noto:shower"
                    size="28px"
                    class="water"
                />
                <span v-if="entry.date.getDate() === now.getDate()">Now</span>
                <span v-else>{{entry.date.getDate()}}{{getSuffix(entry.date.getDate())}}</span>
            </div>
        </div>
    </div>
</template>

<style lang="scss">

.calendar {
    display: flex;
    justify-content: space-around;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    max-width: 100%;
    overflow-x: auto;

    .item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        width: 36px;
    }
}

</style>