<script setup lang="ts">
import { ref } from 'vue'
import { requestPermission } from '../service/firebase'
import Loading from './Loading.vue'
import { Icon } from "@iconify/vue";
import { createSubscription } from '@src/service/api';

const loading = ref(false)
const errorMessage = ref<string>()

const props = defineProps<{
    intervalDays: number
}>()
const emit = defineEmits(['close'])

async function doPermission() {
    loading.value = true

    try {
        const fcmToken = await requestPermission()

        try {
            await createSubscription(
                fcmToken,
                60 * 60 * 24 * props.intervalDays
            )
        } catch (e) {
            if (e.response.data.code !== 'EXISTING_SUBSCRIPTION') {
                throw e
            }

            // Ignore
        }

        console.log('Successfully subscribed!')

        window.location.href = '/subscription'
    } catch (e: unknown) {
        if (e.code === 'messaging/permission-blocked') {
            errorMessage.value = 'You have blocked notifications. Please allow them in your browser settings.'
        } else {
            errorMessage.value = 'An error occurred. Please try again later.'
        }
    } finally {    
        loading.value = false
    }
}

</script>

<template>
    <div
        class="notification-permission-dialog"
    >
        <div
            class="background"
            @click.prevent="emit('close')"
        ></div>
        <div class="dialog">
            <p>
                To send you reminders we need to ask for permission to send notifications.
                Please click the button below and allow the permission.
            </p>
            
            <Loading size="64px" v-if="loading" />

            <button
                @click="doPermission"
                class="plausible-event-name=Allow+Notifications+Click"
            >
                <Icon icon="noto:bell" size="18" />
                Allow Notifications
            </button>

            <br>
            <br>

            <span class="error-message">{{ errorMessage }}</span>
        </div>
    </div>
</template>

<style>
    .notification-permission-dialog {
        position: fixed;
        inset: 0px;

        @media (prefers-reduced-motion: no-preference) {
            transition: opacity 0.3s ease-in-out;
        }

        .background {
            background-color: rgba(0, 0, 0, 0.5);
            position: absolute;
            inset: 0;
        }

        .dialog {
            padding: 20px;
            margin: auto;
            position: absolute;
            max-width: 400px;
            max-height: 200px;
            background-color: white;
            border-radius: 14px;
            inset: 0px;
            text-align: center;
        }

        .error-message {
            color: red;
        }
    }
</style>