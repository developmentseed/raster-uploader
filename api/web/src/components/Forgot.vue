<template>
    <div class='col col--12 grid pt12'>
        <div class='col col--12 flex flex--center-main color-white'>
            <h3 class='flex-child txt-h4 py6'>Forgot Password</h3>
        </div>
        <div class='bg-white round px12 py12 col col--12'>
            <template v-if='loading'>
                <Loading desc='Sending Password Reset Email'/>
            </template>
            <template v-else-if='!submitted'>
                <div class='w240 col col--12 grid'>
                    <label class='mt12'>Username/Email:</label>
                    <input v-on:keyup.enter='reset' :class='{
                         "input--border-red": attempted && !username
                    }' v-model='username' type='text' class='input'/>

                    <button @click='reset' class='mt12 w-full color-gray color-green-on-hover btn btn--stroke round'>Reset Password</button>
                </div>
            </template>
            <template v-else>
                <div class='col col--12 flex flex--center-main py24'>
                    <svg class='icon color-green w60 h60'><use href='#icon-check'/></svg>
                </div>
                <div class='col col--12 flex flex--center-main'>
                    <div>Password Reset Email Sent</div>
                </div>

                <div class='col col--12'>
                    <button @click='$router.push("/login")' class='mt12 w-full color-gray color-green-on-hover btn btn--stroke round'>Home</button>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
import Loading from './util/Loading.vue';

export default {
    name: 'Forgot',
    props: ['meta'],
    data: function() {
        return {
            submitted: false,
            loading: false,
            attempted: false,
            username: '',
        }
    },
    methods: {
        reset: async function() {
            this.attempted = true;

            if (!this.username.length) return;
            this.loading = true;

            try {
                await window.std('/api/login/forgot', {
                    method: 'POST',
                    body: {
                        username: this.username
                    }
                }, false);

                this.submitted = true;
            } catch (err) {
                this.$emit('err', err);
            }

            this.loading = false;
        }
    },
    components: {
        Loading
    }
}
</script>
