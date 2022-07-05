<template>
<div class='col col--12 grid my12'>
    <div class='col col--12'>
        <svg class='icon fl mt3 mx12'><use xlink:href='#icon-alert'/></svg>
        Error

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
            >Resubmit</button>
        </template>
    </div>
    <template v-if='!folded'>
        <template v-if='loading.submit'>
            <Loading desc='Submitting Step'/>
        </template>
        <template v-else>
            <div class='col col--12 pre mx12 mt3'>
                <span v-text='step.step.message'/>
            </div>
        </template>
    </template>
</div>
</template>

<script>
import Loading from '../util/Loading.vue';

export default {
    name: 'StepError',
    props: {
        step: Object,
    },
    mounted: function() {
        this.folded = this.step.closed;
    },
    data: function() {
        return {
            folded: null,
            loading: {
                submit: false
            }
        }
    },
    methods: {
        submit: async function() {
            try {
                this.loading.submit = true;
                const step = await window.std(`/api/upload/${this.$route.params.uploadid}/step/${this.step.id}`, {
                    method: 'PUT',
                });
                this.loading.submit = false;
                this.$emit('step', step);
            } catch (err) {
                this.$emit('err', err);
            }
        }
    },
    components: {
        Loading
    }
}
</script>
