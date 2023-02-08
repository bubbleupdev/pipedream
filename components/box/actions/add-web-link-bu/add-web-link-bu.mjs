import { boxApi } from "../../common/api.mjs"

export default {
  name: "Add Web Link (BU)",
  version: "0.0.1",
  key: "add-web-link-bu",
  description: "Add an external web link to a folder",
  type: "action",
  props: {
    box: {
      type: "app",
      app : "box",
    },
    parentFolderId: {
      type: "string",
      label: "Folder ID",
      description: "The destination folder.",
    },
    linkName: {
      type: "string",
      label: "Link Name",
      description: "Name of the link.",
    },
    linkUrl: {
      type: "string",
      label: "Link URL",
      description: "URL of the link.",
    },
    linkDesc: {
      type: 'boolean',
      label: 'Link Description',
      description: 'Description of the link',
    },
  },
  methods: {},
  async run({steps, $}) {
    const $box = new boxApi(this)
    return await $box.addWebLink(this.parentFolderId, this.linkName, this.linkUrl, this.linkDesc)
  },

}