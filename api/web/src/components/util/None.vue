<template>
<div class='col col--12'>
    <div class='flex flex--center-main pt36'>
        <svg class='flex-child icon w60 h60 color--gray'><use href='#icon-info'/></svg>
    </div>

    <div class='flex flex--center-main pt12 pb36'>
        <h1 class='flex-child txt-h4 cursor-default'>No <span v-text='name'/> Found</h1>
    </div>

    <div v-if='create' @click='$emit("create")' class='flex flex--center-main pt12 pb36'>
        <button class='btn btn--stroke color-gray color-green-on-hover round'>Create <span v-text='name'/></button>
    </div>
</div>
</template>

<script>
export default {
    name: 'None',
    props: {
        name: {
            type: String,
            default: 'Items'
        },
        create: {
            type: Boolean,
            default: false
        }
    }
};
</script>
