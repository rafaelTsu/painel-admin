
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

                // If the service returned an immediate terminal status, avoid polling
                if (this.currentRun && ['succeeded', 'failed'].includes(this.currentRun.status)) {
                    this.loading = false;
                    this.stopPolling();
                } else if (this.currentRun && this.currentRun.id) {
                    this.startPolling(groupId, this.currentRun.id);
                }

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
                    const result = await simulationService.getStatus(groupId, simulationId);
                    this.currentRun = result;

                    if (this.currentRun && ['succeeded', 'failed'].includes(this.currentRun.status)) {
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
                let blob;
                try {
                    blob = await simulationService.download(groupId, simulationId);
                } catch (err) {
                    // axios may fail due to interceptors or CORS; attempt fetch fallback
                    const token = localStorage.getItem('accessToken');
                    const downloadUrl = `/api/groups/${groupId}/simulations/${simulationId}/download`;
                    const resp = await fetch(downloadUrl, {
                        method: 'GET',
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                        credentials: 'include'
                    });
                    if (!resp.ok) {
                        const text = await resp.text().catch(() => '');
                        const message = text || `HTTP ${resp.status}`;
                        const apiError = new Error(`Download failed: ${message}`);
                        this.error = apiError;
                        throw apiError;
                    }
                    blob = await resp.blob();
                }

                // Validate response is binary (PDF or DOCX). If the server returned HTML/JSON (e.g. error page), surface it.
                const mime = blob && blob.type ? blob.type : '';
                const isPdf = mime.includes('pdf');
                const isDocx = mime.includes('officedocument') || mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

                if (!isPdf && !isDocx) {
                    // Try to extract text from the blob for a helpful error message
                    let text = '';
                    try { text = await blob.text(); } catch (e) { /* ignore */ }
                    let message = 'Unexpected download response';
                    try {
                        const parsed = JSON.parse(text || '{}');
                        message = parsed.message || parsed.error || JSON.stringify(parsed);
                    } catch (e) {
                        if (text) message = text.substring(0, 200);
                    }
                    const apiError = new Error(`Download failed: ${message}`);
                    this.error = apiError;
                    throw apiError;
                }

                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                link.remove();

                // Revoke the object URL after a short delay to allow the download to start
                setTimeout(() => {
                    try { window.URL.revokeObjectURL(url); } catch (e) { /* noop */ }
                }, 5000);
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
