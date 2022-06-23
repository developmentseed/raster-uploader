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
        <template v-else>
            <div class='col col--12 grid mt6'>
                <CogMap
                    :step='step'
                    @err='$emit("err", $event)'
                />
            </div>
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
    },
    data: function() {
        return {
            loading: {
                submit: false
            },
            info: null,
            folded: null
        }
    },
    methods: {
        info: async function() {
            try {
                const info = await window.std(`/api/upload/${this.$route.params.uploadid}/step/${this.step.id}/cog/info`);
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
        }
    },
    components: {
        Loading,
        CogMap
    }
}
</script>
