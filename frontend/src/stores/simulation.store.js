
import { defineStore } from 'pinia';
import simulationService from '@/services/simulation.service';

export const useSimulationStore = defineStore('simulation', {
    state: () => ({
        currentRun: null,
        loading: false,
        error: null,
        pollInterval: null
    }),
    actions: {
        async startSimulation(groupId, templateId, versionId, inputValues, outputFormat) {
            this.loading = true;
            this.error = null;
            this.currentRun = null;
            try {
                const response = await simulationService.createRun(groupId, templateId, versionId, inputValues, outputFormat);
                this.currentRun = response; // response data is already unwrapped by api.service
                this.startPolling(groupId, this.currentRun.id);
                return this.currentRun;
            } catch (error) {
                this.error = error;
                this.loading = false;
                throw error;
            }
        },

        startPolling(groupId, simulationId) {
            this.stopPolling(); // Ensure no duplicates
            
            this.pollInterval = setInterval(async () => {
                if (!this.currentRun) {
                    this.stopPolling();
                    return;
                }
                
                try {
                    const response = await simulationService.getStatus(groupId, simulationId);
                    this.currentRun = response.data;
                    
                    if (['succeeded', 'failed'].includes(this.currentRun.status)) {
                        this.stopPolling();
                        this.loading = false;
                    }
                } catch (e) {
                    this.stopPolling();
                    this.loading = false;
                    this.error = e;
                }
            }, 2000); // 2 sec poll
        },

        stopPolling() {
            if (this.pollInterval) {
                clearInterval(this.pollInterval);
                this.pollInterval = null;
            }
        },

        async downloadResult(groupId, simulationId, fileName) {
            try {
                const response = await simulationService.download(groupId, simulationId);
                const url = window.URL.createObjectURL(response);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                link.remove();
            } catch (error) {
                this.error = error;
                throw error;
            }
        },
        
        reset() {
            this.stopPolling();
            this.currentRun = null;
            this.error = null;
            this.loading = false;
        }
    }
});
