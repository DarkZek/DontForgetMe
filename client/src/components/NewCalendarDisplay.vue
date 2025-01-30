<script lang="ts" setup>
import { dayInMillis } from '@src/const'
import type { Subscription } from '@src/service/types';
import { Icon } from "@iconify/vue";

const props = defineProps<{
    subscription: Subscription
}>()

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

function getCalendarEntries() {
	// Create an array of dates to show your missed or upcoming watering day, as well as surrounding context
	const wateringDay = props.subscription.nextWateringTime

    const dayBeforeWateringDay = new Date(wateringDay.getTime() - dayInMillis)

	// Get yesterday
	const yesterday = new Date(new Date().getTime() - dayInMillis)

	// Pick the furtherst date to show
	const furthestDate = dayBeforeWateringDay.getTime() > yesterday.getTime() ? yesterday : dayBeforeWateringDay

    const datesCount = 7

    const isWateringLate = wateringDay < new Date()

	// Create a list of dates to show
	return new Array(datesCount).fill(null).map((_, i) => {
		const date = new Date(furthestDate.getTime() + (i * dayInMillis))

		let dateString = `${date.getDate()}${getSuffix(date.getDate())}`
        let isWatering = false
        let isBehind = false

		// If it's today
		if (isSameDay(date, new Date())) {
			dateString = 'Today'
		}
        
        if (isSameDay(date, wateringDay)) {
            isWatering = true
        }
        if (props.subscription.lastWateringTime && isSameDay(date, props.subscription.lastWateringTime)) {
            isWatering = true
        }
        for (let i = 0; i < datesCount; i++) {
            if (isSameDay(date, new Date(props.subscription.nextWateringTime.getTime() + (i * props.subscription.intervalSeconds * 1000))) && !isWatering) {
                isWatering = true
            }
        }
        // If they're late then they need to catch up for it to be watering day again
        if (isWateringLate && date > wateringDay && date < new Date()) {
            isWatering = false
        }

        if (isWateringLate && isSameDay(date, wateringDay)) {
            isBehind = true
        }

		return {
			date: dateString,
			isWatering,
            isBehind
		}
	})
}

const items = getCalendarEntries()

</script>

<template>

<div
    class="calendar"
>
    <!-- Loop over the previous day and next 7 days to make icons -->
    <div :class="{ item: true, watering: item.isWatering, behind: item.isBehind }" v-for="(item, i) in items" :key="i">

        <Icon v-if="item.isBehind" icon="noto:fallen-leaf" size="28px" />
        <Icon v-else-if="item.isWatering" icon="noto:shower" size="28px" />
        <Icon v-else icon="noto:sun" size="28px" />
        <span>{{item.date}}</span>
    </div>
</div>
</template>

<style lang="scss" scoped>

.calendar {
    display: flex;
    justify-content: space-around;
    align-items: center;
    gap: 6px;
    padding: 12px;
    max-width: 100%;
    overflow-x: auto;

    .item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        width: 36px;
        background-color: rgba(255, 255, 239, 0.508);
        border-radius: 12px;
        padding: 12px;
        color: #383838;

        &.watering {
            background-color: rgba(221, 242, 255, 0.5);
        }

        &.behind {
            background-color: rgba(255, 193, 167, 0.5);
        }

    }
}

</style>