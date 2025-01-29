<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import IntervalSelection from './IntervalSelection.vue';
import { Icon } from "@iconify/vue";
import NotificationPermissionDialog from './NotificationPermissionDialog.vue';

const hasSubscription = ref(false);
const dialogOpen = ref(false);
const intervalDays = ref(3)

onBeforeMount(() => {
    hasSubscription.value = !!window.localStorage.getItem('fcmToken');
})

</script>

<template>
    <div v-if="hasSubscription">
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
    </div>
    <div
        v-else
    >
        <IntervalSelection
            v-model="intervalDays"
        />
        
        <br>

        <button
            class="button plausible-event-name=Start+Reminders+Click"
            @click.prevent="dialogOpen = true"
        >
            Start watering reminders
        </button>
    </div>

    <NotificationPermissionDialog
        v-if="dialogOpen"
        :intervalDays="intervalDays"
        @close="dialogOpen = false"
    />
</template>