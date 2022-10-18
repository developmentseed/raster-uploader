<template>
<button class='btn round btn--stroke color-white mx3' :class='`color-${hover}-on-hover`'>
    <template v-if='icon'>
        <svg class='icon'><use :href='`#icon-${icon}`'/></svg>
    </template>
    <template v-if='text'>
        <span v-text='text'/>
    </template>

    <slot/>
</button>
</template>

<script>
export default {
    name: 'StdButton',
    props: {
        hover: {
            type: String,
            default: 'gray-light'
        },
        text: {
            type: String,
            default: ''
        },
        icon: {
            type: String,
            default: ''
        },
    }
};
</script>
