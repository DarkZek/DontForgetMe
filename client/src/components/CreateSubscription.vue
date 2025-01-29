<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import IntervalSelection from './IntervalSelection.vue';
import { Icon } from "@iconify/vue";
import NotificationPermissionDialog from './NotificationPermissionDialog.vue';
import CalendarDisplay from './CalendarDisplay.vue';

const hasSubscription = ref(false);
const dialogOpen = ref(false);
const intervalDays = ref(3)

onBeforeMount(() => {
    hasSubscription.value = !!window.localStorage.getItem('fcmToken');
})

</script>

<template>
    <div
        class="create-subscription"
    >
        <template v-if="hasSubscription">
            <p>
                <Icon icon="noto:bell" size="24" />
                You're already subscribed to notifications
            </p>
            <a
                class="button plausible-event-name=Change+Interval+Click"
                href="/subscription"
            >
                <Icon icon="noto:pencil" size="18" />
                Change watering interval
            </a>
        </template>
        <template
            v-else
        >
            <IntervalSelection
                v-model="intervalDays"
            />

            <CalendarDisplay
                :intervalDays="intervalDays"
            />
            
            <br>

            <button
                class="button plausible-event-name=Start+Reminders+Click"
                @click.prevent="dialogOpen = true"
            >
                Start watering reminders
            </button>
        </template>
    </div>

    <NotificationPermissionDialog
        v-if="dialogOpen"
        :intervalDays="intervalDays"
        @close="dialogOpen = false"
    />
</template>

<style lang="scss" scoped>

.create-subscription {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

</style>