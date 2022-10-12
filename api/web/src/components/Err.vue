<template>
    <Modal>
        <div class='col col--12 flex flex--center-main'>
            <div class='pt12'>
                <svg class='icon h60 w60 color-gray'><use href='#icon-alert'/></svg>
            </div>
        </div>

        <div class='col col--12 txt-l mb12 align-center'>Uh Oh!</div>
        <div class='col col--12 txt-m align-center my12' v-text='err.message'></div>

        <div v-if='err.body' class='col col--12 pre pb12 h400' v-text='err.body'></div>

        <div class='col col--12 mt12'>
            <a href='mailto:info@climbseneca.com'   class='fl btn btn--stroke btn--gray round'>Contact Us</a>
            <button @click='close' class='fr btn btn--stroke btn--gray round'>Ok</button>
        </div>
    </Modal>
</template>

<script>
import Modal from './util/Modal.vue';

export default {
    name: 'Err',
    props: ['err'],
    methods: {
        close: function() {
            this.$emit('close');
        }
    },
    components: {
        Modal
    }
}
</script>
