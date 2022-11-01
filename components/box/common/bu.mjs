export class boxApi {

    constructor(step) {
        this.accessToken = step.box.$auth.oauth_access_token
    }

    async findOrCreateFolder(parentId, folderName) {
        const list = await this.listDir(parentId)
        let dir = findDir(list, folderName)
        if (!dir) {
            const createRes = await this.post(`/folders`, {
                name: folderName,
                parent: { id: parentId },
            })
            dir = createRes.id
        }
        return dir
    }

    async listDir(folderId) {
        const res = await this.get(`/folders/${folderId}/items`)
        return res.entries
    }

    findDir(list, name) {
        return list.filter(item => item.type === 'folder' && item.name === name)[0]?.id
    }

    async setMetadata(folderId, metadataTemplate, metadata, scope = 'global') {
        return await this.post(`/folders/${folderId}/metadata/${scope}/${metadataTemplate}`, metadata)
    }

    async get(url) {
        return await this.sendRequest(url)
    }

    async post(url, data = undefined) {
        return await this.sendRequest(url, 'post', data)
    }

    async put(url, data = undefined) {
        return await this.sendRequest(url, 'put', data)
    }

    async sendRequest(url, method = 'get', data = undefined) {
        const res = await axios({
            method: method,
            url: `https://api.box.com/2.0${url}`,
            data: data,
            headers: {
                "Authorization": `Bearer ${this.accessToken}`,
                "Content-Type": "application/json",
                "Accept": "application/json",
                "User-Agent": "@PipedreamHQ/pipedream v0.1",
            },
            validateStatus: function (status) {
                return (status >= 200 && status < 400) || status === 409;
            },
        })
        return res.data
    }

}