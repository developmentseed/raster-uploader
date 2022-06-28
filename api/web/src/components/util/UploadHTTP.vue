<template>
<div class='col col--12 grid py12 px12 border border--gray-light round'>
    <template v-if='loading.submit'>
        <Loading desc='Submitting Obtain HTTP'/>
    </template>
    <template v-else-if='!submitted'>
        <div class='col col--12'>
            <label>HTTP URL</label>
            <input type='text' v-model='url' class='input w-full'/>
        </div>
        <div class='col col--12 clearfix mt12'>
            <button @click='submitObtain' class='btn btn--stroke color-gray color-green-on-hover round fr'>Submit</button>
        </div>
    </template>
    <template v-else-if='submitted'>
        <div class='flex flex--center-main'>
            <svg class='icon color-green w60 h60'><use href='#icon-check'/></svg>
        </div>
        <div class='align-center'>Upload Complete</div>
        <div class='col col--12 clearfix pt12'>
            <template v-if='single'>
                <button @click='$emit("ok", done)' class='btn round btn--stroke fr btn--gray'>OK</button>
            </template>
            <template v-else>
                <button @click='refresh' class='btn round btn--stroke fr btn--gray'>
                    <svg class='fl icon' style='margin-top: 6px;'><use href='#icon-refresh'/></svg>Upload
                </button>
            </template>
        </div>
    </template>
</div>
</template>

<script>
import Loading from './Loading.vue';

export default {
    name: 'UploadHTTP',
    props: {
        cog: Object
    },
    data: function() {
        return {
            url: '',
            submitted: false,
            loading: {
                submit: false
            }
        }
    },
    methods: {
        submitObtain: async function() {
            try {
                this.loading.submit = true;
                const res = await window.std(`/api/obtain`, {
                    method: 'POST',
                    body: {
                        cog: this.cog,
                        obtain: {
                            url: this.url
                        }
                    }
                });

                this.$emit('ok', res);
            } catch (err) {
                this.$emit('err', err);
            }

            this.loading.submit = false;
        }
    },
    components: {
        Loading
    }
}

</script>
