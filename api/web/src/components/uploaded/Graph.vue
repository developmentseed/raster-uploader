<template>
<div class='col col--12 relative'>
    <div id='cy'></div>

    <div class='absolute top left z5 mx6 my6'>
        <button @click='centre' class='btn round btn--stroke color-gray color-red-on-hover'>
            <svg class='icon'><use href='#icon-position'/></svg>
        </button>
    </div>
</div>
</template>

<script>
import Cytoscape from 'cytoscape';

export default {
    name: 'UploadedGraph',
    props: {
        steps: Object
    },
    data: function() {
        return {
            map: new Map(),
            graph: null,
            selected: null,
            processed: {
                nodes: [],
                edges: []
            }
        };
    },
    watch: {
        steps: {
            deep: true,
            handler: function() {
                if (!this.graph) return;
                this.process();
                this.parents()
            }
        },
        selected: function() {
            this.graph.$('.selected').removeClass('selected');
            this.selected.addClass('selected');
            this.parents()
        }
    },
    mounted: function() {
        // Populate Nodes
        this.processed.nodes.push({ data: {
            id: 'initial',
            type: 'initial'
        }});

        for (const step of this.steps.upload_steps) {
            this.map.set(step.id, step);

            this.processed.nodes.push({ data: {
                id: step.id,
                type: step.type
            }});
        }

        for (const step of this.steps.upload_steps) {
            if (!step.parent) {
                this.processed.edges.push({ data: {
                    source: 'initial',
                    target: step.id
                }});
            } else {
                this.processed.edges.push({ data: {
                    source: step.parent,
                    target: step.id
                }});
            }
        }

        this.$nextTick(() => {
            this.graph = Cytoscape({
                container: document.getElementById('cy'),
                elements: this.processed,
                boxSelectionEnabled: false,
                autounselectify: true,
                style: Cytoscape.stylesheet()
                    .selector('node').css({
                        'height': 80,
                        'width': 80,
                        'background-fit': 'cover',
                        'border-color': '#000',
                        'border-width': 3,
                        'border-opacity': 0.5
                    })
                    .selector('edge').css({
                        'curve-style': 'bezier',
                        'width': 6,
                        'target-arrow-shape': 'triangle',
                        'line-color': '#c7cacc',
                        'target-arrow-color': '#c7cacc'
                    })
                    .selector('[type = "initial"]').css({
                        'label': 'Initial',
                        'background-image': 'https://live.staticflickr.com/1261/1413379559_412a540d29_b.jpg'
                    })
                    .selector('[type = "error"]').css({
                        'label': 'Error',
                        'background-image': 'https://live.staticflickr.com/1261/1413379559_412a540d29_b.jpg'
                    })
                    .selector('[type = "selection"]').css({
                        'label': 'Selection',
                        'background-image': 'https://live.staticflickr.com/1261/1413379559_412a540d29_b.jpg'
                    })
                    .selector('[type = "cog"]').css({
                        'label': 'COG',
                        'background-image': 'https://live.staticflickr.com/1261/1413379559_412a540d29_b.jpg'
                    })
                    .selector('.selected').css({
                        'border-color': '#FF0000',
                        'border-width': 5,
                        'border-opacity': 1
                    }),
                layout: {
                    name: 'breadthfirst',
                    directed: true,
                    padding: 10
                }
            });

            this.selected = this.graph.$id(this.steps.upload_steps[this.steps.upload_steps.length - 1].id)

            this.graph.on('tap', 'node', (evt) => {
                this.selected = evt.target;
            });
        });
    },
    methods: {
        process: function() {
            let selected = null;
            for (const step of this.steps.upload_steps) {
                if (!this.map.has(step.id)) {
                    selected = step.id;

                    this.graph.add([
                        { group: 'nodes', data: { id: step.id, type: step.type } },
                        { group: 'edges', data: { source: step.parent ? step.parent : 'initial', target: step.id } }
                    ]);
                }

                this.map.set(step.id, step);
            }

            const layout = this.graph.layout({
                name: 'breadthfirst',
                directed: true,
                padding: 10
            });
            layout.run();

            this.graph.fit();

            if (selected) {
                this.$nextTick(() => {
                    selected = this.graph.$id(selected.id);

                    console.error(selected);
                    this.selected = selected;
                });
            }
        },
        parents: function() {
            let ids = [];
            ids.push(this.selected.id());
            for (const parent of this.selected.predecessors()) {
                if (!parent.isNode()) continue;
                ids.push(parent.id());
            }

            ids.pop(); // remove initial
            ids.reverse();
            ids = ids.map((id) => {
                return this.map.get(parseInt(id));
            });

            this.$emit('steps', ids);
        },
        centre: function() {
            this.graph.fit();
        }
    }
}
</script>

<style>
#cy {
    height: 500px;
    width: 100%;
}
</style>

