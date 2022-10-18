<template>
    <div class='col col--12 grid pt12'>
        <div class='col col--12 flex flex--center-main color-white'>
            <h3 class='flex-child txt-h4 py6'>Register</h3>
        </div>
        <div class='bg-white px12 py12 round col col--12 flex flex--center-main'>
            <div class='w240 col col--12 grid'>
                <template v-if='loading'>
                    <Loading desc='Creating User Account'/>
                </template>
                <template v-else-if='!success'>
                    <label class='mt12 col col--12'>
                        Username:
                    </label>
                    <input v-on:keyup.enter='register' :class='{
                         "input--border-red": attempted && !username
                    }' v-model='username' type='text' class='input'/>

                    <label class='mt12 col col--12'>
                        Email:
                    </label>
                    <input v-on:keyup.enter='register' :class='{
                         "input--border-red": attempted && !username
                    }' v-model='email' type='text' class='input'/>

                    <label class='mt12 col col--12'>
                        Password:
                    </label>
                    <input v-on:keyup.enter='register' :class='{
                         "input--border-red": attempted && !password
                   } ' v-model='password' type='password' class='input'/>

                    <button @click='register' class='mt12 w-full color-gray color-green-on-hover btn btn--stroke round'>Register</button>
                </template>
                <template v-else>
                    <div class='col col--12 flex flex--center-main py24'>
                        <svg class='icon color-green w60 h60'><use href='#icon-check'/></svg>
                    </div>
                    <div class='col col--12 flex flex--center-main'>
                        <div>Email Confirmation Sent!</div>
                    </div>

                    <button @click='$router.push("/login")' class='mt12 w-full color-gray color-green-on-hover btn btn--stroke round'>Home</button>
                </template>
            </div>
        </div>
    </div>
</template>

<script>
import Loading from './util/Loading.vue';

export default {
    name: 'Register',
    props: ['meta'],
    data: function() {
        return {
            loading: false,
            attempted: false,
            success: false,
            username: '',
            password: '',
            email: ''
        }
    },
    methods: {
        register: async function() {
            this.attempted = true;

            if (!this.username.length) return;
            if (!this.password.length) return;
            this.loading = true;

            try {
                await window.std('/api/user', {
                    method: 'POST',
                    body: {
                        username: this.username,
                        password: this.password,
                        email: this.email
                    }
                }, false);

                this.success = true;
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
