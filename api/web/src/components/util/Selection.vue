<template>
<div class='col col--12 grid my12'>
    <div class='col col--12'>
        <span v-text='"Select from the following:"'/>
    </div>
    <div class='col col--12 grid border border--gray-light round'>
        <div @click='$emit("selection", sel.id)' :key='sel.id' v-for='sel in selections' class='col col--12'>
            <div class='w-full py6 px6' :class='{
                "bg-gray-light": selection === sel.name
            }'>
                <span class='txt-h4 round' v-text='sel.name'/>
            </div>
        </div>
    </div>
</div>
</template>

<script>
export default {
    name: 'Selection',
    props: {
        selections: Array
    }
}
</script>
