<template>
<div class='col col--12 grid'>
    <div class='col col--12'>
        <svg class='icon fl'><use xlink:href='#icon-cursor'/></svg>
        <span v-text='step.step.title || "Select from the following:"'/>
    </div>
    <div class='col col--12 grid border border--gray-light round mx12 my12'>
        <div @click='selection = sel.name' :key='sel.id' v-for='sel in step.step.selections' class='col col--12 bg-darken10-on-hover' :class='{
            "cursor-pointer": !disabled
        }'>
            <div class='w-full py6 px6' :class='{
                "bg-gray-light": sel === sel.name
            }'>
                <span class='txt-h4 round' v-text='sel.name'/>
            </div>
        </div>
    </div>
</div>
</template>

<script>
export default {
    name: 'StepSelection',
    props: {
        step: Object
    },
    data: function() {
        return {
            selection: null
        }
    }
}
</script>
