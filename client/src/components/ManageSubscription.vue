<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue'
import { acknowledgeWatering, delayDay, getSubscription, removeSubscription } from '@src/service/api'
import type { Subscription } from '@src/service/types';
import { dayInMillis } from '@src/const';
import CalendarDisplay from './NewCalendarDisplay.vue'

const subscription = ref<Subscription>()

async function fetchData() {
    try {
        subscription.value = await getSubscription()
    } catch (e) {
        if (e.response?.data?.code === 'NO_SUBSCRIPTION' || e.response?.data?.code === 'MISSING_FCM_TOKEN') {
            window.localStorage.removeItem('fcmToken')
            window.location.href = '/'
            return
        }

        throw e
    }
}
onBeforeMount(fetchData)

const daysWateringOverdue = computed(() => {
    if (!subscription.value) {
        return -1
    }

    // If they haven't acknowledged the watering then they're overdue
    if (!subscription.value.wateringAcknowledged && subscription.value.nextWateringTime.getTime() < new Date().getTime()) {
        // Calculate how many millis we're overdue by
        const overdueMillis = new Date().getTime() - subscription.value.nextWateringTime.getTime()
        return Math.floor(overdueMillis / dayInMillis)
    }

    return -1
})

const daysUntilNextWatering = computed(() => {

    if (!subscription.value) {
        return -1
    }

    if (subscription.value.nextWateringTime.getTime() > new Date().getTime()) {
        // Calculate how many millis until the next watering
        const millisUntilNextWatering = subscription.value.nextWateringTime.getTime() - new Date().getTime()
        return Math.ceil(millisUntilNextWatering / dayInMillis)
    }

    return -1
})

enum DayType {
	Watering = 0,
	Normal = 1,
	Overdue = 2
}

const day = computed(() => {
    if (daysWateringOverdue.value === 0) {
        return DayType.Watering
    }
    if (daysWateringOverdue.value > 0) {
        return DayType.Overdue
    }
    return DayType.Normal
})

const wateringMessage = computed(() => {
    if (day.value === DayType.Watering) {
        return `It's watering day! 🌧️`
    }
    if (day.value === DayType.Overdue) {
        return `You're ${daysWateringOverdue.value} day${daysWateringOverdue.value > 1 ? 's' : ''} overdue 🍂`
    }

    return `Next watering in ${daysUntilNextWatering.value} day${daysUntilNextWatering.value > 1 ? 's' : ''}`
})

async function unsubscribe() {
    await removeSubscription()
    window.location.href = '/'
}

async function skip() {
    await delayDay()
    await fetchData()
}

async function water() {
    await acknowledgeWatering()
    await fetchData()
}

</script>

<template>
    

	<h3>{{ wateringMessage }}</h3>

    <br>

    <CalendarDisplay
        v-if="subscription"
        :subscription="subscription"
    />

    <button
        @click="skip"
        v-if="day === DayType.Watering"
        class="plausible-event-name=Skip+Click"
    >
        Skip
    </button>

    <br>

    <button
        @click="water"
        v-if="day === DayType.Watering || day === DayType.Overdue"
        class="plausible-event-name=Watered+Click"
    >
        Mark as watered
    </button>

    <br>

    <button
        @click="unsubscribe"
        class="plausible-event-name=Unsubscribe+Click"
    >
        Unsubscribe
    </button>

</template>

<style lang="scss" scoped>

    h3 {
        text-align: center;
        color: #114C0B;
        font-size: 24px;
    }

</style>