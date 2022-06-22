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
                <svg v-if='folded' class='icon'><use xlink:href='#icon-chevron-down'/></svg>
                <svg v-else class='icon'><use xlink:href='#icon-chevron-right'/></svg>
            </button>

            <div class='fr bg-gray-faint color-gray inline-block px6 py3 round txt-xs txt-bold mr12'>
                <span v-text='new Date(step.created).toISOString()'/>
            </div>
        </template>
    </div>
    <template v-if='folded'>
        <div class='col col--12 pre'>
            <span v-text='step.message'/>
        </div>
    </template>
</div>
</template>

<script>
export default {
    name: 'StepError',
    props: {
        step: Object,
    },
    mounted: function() {
        this.folded = !this.step.closed;
    },
    data: function() {
        return {
            folded: null
        }
    }
}
</script>
