
import api from '@/shared/api.service';

class SimulationService {
    createRun(groupId, templateId, versionId, inputValues, outputFormat) {
        return api.post(`/groups/${groupId}/templates/${templateId}/versions/${versionId}/simulate`, {
            inputValues,
            outputFormat
        });
    }

    getStatus(groupId, simulationId) {
        return api.get(`/groups/${groupId}/simulations/${simulationId}`);
    }

    getDownloadUrl(groupId, simulationId) {
        // Construct URL directly for href usages
        // Api base url + path.
        // Needs token? api.service usually attaches token in interceptor.
        // For href download, we might need a token in query param or use blob download via JS.
        // T090 implemented download endpoint.
        // If we use simple <a> link, we need token.
        // Easier: Use api.get with responseType 'blob' and trigger download in JS.
        return `/groups/${groupId}/simulations/${simulationId}/download`;
    }

    download(groupId, simulationId) {
        return api.get(`/groups/${groupId}/simulations/${simulationId}/download`, {
            responseType: 'blob'
        });
    }
}

export default new SimulationService();
