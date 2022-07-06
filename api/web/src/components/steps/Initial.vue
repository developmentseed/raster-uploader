<template>
<div class='col col--12 grid my12'>
    <div class='col col--12'>
        <svg class='icon fl ml12 mt3 mr12'><use xlink:href='#icon-info'/></svg>
        Uploaded: <span v-text='upload.name'/>

        <button
            @click='folded = !folded'
            class='fr btn btn--stroke btn--s color-gray color-black-on-hover round mr12'
            style='height: 21px;'
        >
            <svg v-if='!folded' class='icon'><use xlink:href='#icon-chevron-down'/></svg>
            <svg v-else class='icon'><use xlink:href='#icon-chevron-right'/></svg>
        </button>

        <div class='fr bg-gray-faint color-gray inline-block px6 py3 round txt-xs txt-bold mr12'>
            <span v-text='new Date(upload.created).toISOString()'/>
        </div>
    </div>
    <template v-if='!folded'>
        <div class='col col--12 mx12 pt12'>
            <button @click='download' class='mt6 btn btn--s btn--stroke round fr btn--gray'><svg class='icon'><use href='#icon-arrow-down'/></svg></button>
        </div>

        <div class='col col--12 border border--gray-light round grid mx12 mb12 mt6 px12 py12'>
            <UploadSettings
                :disabled='true'
            />
        </div>
    </template>
</div>
</template>

<script>
import UploadSettings from '../util/UploadSettings.vue';

export default {
    name: 'StepInitial',
    props: {
        upload: Object,
    },
    data: function() {
        return {
            folded: true
        }
    },
    components: {
        UploadSettings
    },
    methods: {
        download: function() {

        }
    }
}
</script>
