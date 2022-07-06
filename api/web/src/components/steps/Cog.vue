<template>
<div class='col col--12 grid my12'>
    <div class='col col--12'>
        <svg class='icon fl mt3 mx12'><use xlink:href='#icon-picture'/></svg>
        COGified

        <template v-if='step.closed'>
            <button
                @click='folded = !folded'
                class='fr btn btn--stroke btn--s color-gray color-black-on-hover round mr12'
                style='height: 21px;'
            >
                <svg v-if='!folded' class='icon'><use xlink:href='#icon-chevron-down'/></svg>
                <svg v-else class='icon'><use xlink:href='#icon-chevron-right'/></svg>
            </button>

            <div class='fr bg-gray-faint color-gray inline-block px6 py3 round txt-xs txt-bold mr12'>
                <span v-text='new Date(step.created).toISOString()'/>
            </div>
        </template>
        <template v-else>
            <button
                @click='submit'
                class='fr btn btn--stroke btn--s color-gray color-green-on-hover round mr12'
            >Submit</button>
        </template>
    </div>
    <template v-if='!folded'>
        <template v-if='loading.submit'>
            <Loading desc='Submitting Step'/>
        </template>
        <template v-if='loading.info'>
            <Loading desc='Loading Raster Metadata'/>
        </template>
        <template v-else>
            <div class='col col--12 mx12 pt12 mb6'>
                <button @click='download' class='mt6 btn btn--s btn--stroke round fr btn--gray'><svg class='icon'><use href='#icon-arrow-down'/></svg></button>
            </div>
            <CogMap
                :step='step'
                :info='info'
                @err='$emit("err", $event)'
            />
        </template>
    </template>
</div>
</template>

<script>
import Loading from '../util/Loading.vue';
import CogMap from './cog/Map.vue';

export default {
    name: 'StepCog',
    props: {
        step: Object,
    },
    mounted: function() {
        this.folded = this.step.closed;
        this.getInfo();
    },
    data: function() {
        return {
            loading: {
                submit: false,
                info: false
            },
            info: null,
            folded: null
        }
    },
    methods: {
        getInfo: async function() {
            try {
                this.loading.info = true;
                this.info = await window.std(`/api/upload/${this.$route.params.uploadid}/step/${this.step.id}/cog/info`);
                this.loading.info = false;
            } catch (err) {
                this.$emit('err', err);
            }
        },
        submit: async function() {
            try {
                this.loading.submit = true;
                const step = await window.std(`/api/upload/${this.$route.params.uploadid}/step/${this.step.id}`, {
                    method: 'PATCH',
                    body: {
                        closed: true,
                        step: { }
                    }
                });
                this.loading.submit = false;
                this.$emit('step', step);
            } catch (err) {
                this.$emit('err', err);
            }
        },
        download: function() {
            const url = new URL(`/api/upload/${this.$route.params.uploadid}/step/${this.step.id}/cog/download`, window.location.origin);
            url.searchParams.append('token', localStorage.token);

            this.external(url);
        },
        external: function(url) {
            if (!url) return;
            window.open(url, "_blank")
        },
    },
    components: {
        Loading,
        CogMap
    }
}
</script>
