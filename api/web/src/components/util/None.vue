<template>
<div class='col col--12'>
    <div class='flex flex--center-main pt36'>
        <svg class='flex-child icon w60 h60 color--gray'><use href='#icon-info'/></svg>
    </div>

    <div class='flex flex--center-main pt12 pb36'>
        <h1 class='flex-child txt-h4 cursor-default'>No <span v-text='name'/> Found</h1>
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
        }
    }
};
</script>
