<template>
    <div class='col col--12 grid pt24'>

        <div class='col col--12'>
            <div class='flex flex--center-main'>
                <div style='width: 80px; height: 80px; border-radius: 50%;' class='bg-gray'>
                </div>
            </div>
        </div>

        <h2 class='txt-h4 ml12 pb12 w-full'>Profile:</h2>

        <div class='col col--12 grid grid--gut12'>
            <div class='col col--6 pt12'>
                <label>Username:</label>
                <input disabled :value='username' class='input' placeholder='Username'/>
            </div>
            <div class='col col--6 pt12'>
                <label>Email:</label>
                <input disabled :value='email' class='input' placeholder='Email'/>
            </div>
        </div>

        <ProfileTokens
            @err='$emit("err", $event)'
        />

    </div>
</template>

<script>
import ProfileTokens from './profile/ProfileTokens.vue'

export default {
    name: 'Profile',
    props: ['user'],
    data: function() {
        return {
            username: this.user.username,
            email: this.user.email
        }
    },
    components: {
        ProfileTokens
    }
}
</script>
