<template>
<div class='col col--12'>
    <div class='col col--12 clearfix py6 relative'>
        <span class='color-white'>Profile</span>
    </div>
    <div class='round relative bg-white pb12 px12 grid'>
        <RasterMenu/>

        <div class='col col--6 pt12 pr6'>
            <label>Username:</label>
            <input disabled :value='username' class='input' placeholder='Username'/>
        </div>
        <div class='col col--6 pt12 pl6'>
            <label>Email:</label>
            <input disabled :value='email' class='input' placeholder='Email'/>
        </div>

        <ProfileTokens
            @err='$emit("err", $event)'
        />
    </div>
</div>
</template>

<script>
import ProfileTokens from './profile/ProfileTokens.vue'
import RasterMenu from './util/Menu.vue';

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
        ProfileTokens,
        RasterMenu
    }
}
</script>
