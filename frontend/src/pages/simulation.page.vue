
<template>
  <v-container>
    <v-btn variant="text" :to="`/groups/${groupId}/templates`" class="mb-4" prepend-icon="mdi-arrow-left">Back to Templates</v-btn>
    
    <v-card :loading="loading">
      <v-card-title>Run Simulation</v-card-title>
      <v-card-text v-if="template">
        <div class="text-h5 mb-2">{{ template.name }}</div>
        
        <v-select
          v-model="selectedVersionId"
          :items="versions"
          item-title="versionNumber"
          item-value="id"
          label="Select Version"
          return-object
          @update:modelValue="onVersionChange"
        >
           <template v-slot:selection="{ item }">
              v{{ item.raw.versionNumber }} ({{ formatDate(item.raw.createdAt) }})
           </template>
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props" :subtitle="item.raw.changeNote">
                  v{{ item.raw.versionNumber }}
              </v-list-item>
            </template>
        </v-select>

        <v-divider class="my-4"></v-divider>

        <v-form @submit.prevent="run" v-if="selectedVersionId">
          <div v-for="variable in currentVariables" :key="variable.key" class="my-2">
            <v-text-field
              v-if="variable.type === 'text'"
              v-model="inputs[variable.key]"
              :label="variable.label"
              hint="Enter text value"
            ></v-text-field>
            <v-checkbox
              v-if="variable.type === 'boolean'"
              v-model="inputs[variable.key]"
              :label="variable.label"
            ></v-checkbox>
          </div>
          
          <v-alert v-if="currentVariables.length === 0" type="info" class="mb-4">
             No variables detected in this version.
          </v-alert>

          <v-radio-group v-model="outputFormat" inline label="Output Format">
            <v-radio label="DOCX" value="docx"></v-radio>
            <v-radio label="PDF" value="pdf"></v-radio>
          </v-radio-group>
          
          <v-btn type="submit" color="primary" :loading="simulationLoading" :disabled="simulationLoading || !selectedVersionId">
             Run Simulation
          </v-btn>
        </v-form>

        <div v-if="currentRun" class="mt-4">
           <v-alert :type="statusType" border="start" variant="tonal">
             <v-card-title>{{ currentRun.status.toUpperCase() }}</v-card-title>
             <v-card-text>
                 <div v-if="currentRun.status === 'succeeded'">
                    <v-btn color="success" @click="download" prepend-icon="mdi-download">Download Result</v-btn>
                 </div>
                 <div v-else-if="currentRun.status === 'failed'">
                    Error: {{ currentRun.errorMessage }}
                 </div>
                 <div v-else>
                    Processing...
                    <v-progress-linear indeterminate class="mt-2"></v-progress-linear>
                 </div>
             </v-card-text>
           </v-alert>
        </div>
      </v-card-text>
      <v-card-text v-else>
          Loading template...
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import templateService from '@/services/template.service';
import variableService from '@/services/variable.service';
import { useSimulationStore } from '@/stores/simulation.store';
import { mapState, mapActions } from 'pinia';

export default {
    props: ['groupId', 'templateId'],
    data() {
        return {
            template: null,
            versions: [],
            variables: [],
            selectedVersionId: null, // this will hold the object due to return-object
            inputs: {},
            outputFormat: 'docx',
            loading: false
        };
    },
    computed: {
        ...mapState(useSimulationStore, ['currentRun', 'loading', 'error']),
        simulationLoading() {
            return this.loading; // mapped from store
        },
        currentVariables() {
            if (!this.selectedVersionId) return [];
            // selectedVersionId is the object
            const keys = this.selectedVersionId.referencedVariableKeys || [];
            return this.variables.filter(v => keys.includes(v.key));
        },
        statusType() {
            if (!this.currentRun) return 'info';
            switch (this.currentRun.status) {
                case 'succeeded': return 'success';
                case 'failed': return 'error';
                default: return 'info';
            }
        }
    },
    async mounted() {
        this.loading = true;
        this.reset(); // reset store
        try {
            const [tpl, vers, vars] = await Promise.all([
                templateService.getTemplate(this.groupId, this.templateId),
                templateService.getVersions(this.groupId, this.templateId),
                variableService.getVariables(this.groupId) // Optimizable? Yes, but MVP.
            ]);
            this.template = tpl.data;
            this.versions = vers.data; // array of objects
            this.variables = vars.data;
            
            if (this.versions.length > 0) {
                this.selectedVersionId = this.versions[0]; // Latest
            }
        } catch (e) {
            console.error(e);
        } finally {
            this.loading = false;
        }
    },
    methods: {
        ...mapActions(useSimulationStore, ['startSimulation', 'downloadResult', 'reset']),
        formatDate(date) {
            return new Date(date).toLocaleString();
        },
        onVersionChange() {
            // Inputs reset? Maybe keep same keys.
            // Ensure inputs has keys ready
            this.currentVariables.forEach(v => {
                if (this.inputs[v.key] === undefined) {
                    this.inputs[v.key] = v.type === 'boolean' ? false : '';
                }
            });
        },
        async run() {
            if (!this.selectedVersionId) return;
            // Clean inputs to only send relevant ones? Or send all.
            // Backend validiation ignores extras? Schema allows pattern?
            // Validation said `required()`.
            await this.startSimulation(
                this.groupId, 
                this.templateId, 
                this.selectedVersionId.id, 
                this.inputs, 
                this.outputFormat
            );
        },
        async download() {
             if (!this.currentRun) return;
             const ext = this.currentRun.outputFormat === 'pdf' ? 'pdf' : 'docx';
             await this.downloadResult(this.groupId, this.currentRun.id, `sim.${ext}`);
        }
    },
    beforeUnmount() {
        this.reset();
    }
}
</script>
