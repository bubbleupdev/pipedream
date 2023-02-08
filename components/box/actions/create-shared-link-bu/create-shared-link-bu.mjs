import { boxApi } from "../../common/api.mjs"

export default {
  name: "Create Shared Link (BU)",
  version: "0.0.1",
  key: "create-shared-link-bu",
  description: "Create a shared link for a folder",
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
    access: {
      type: "string",
      label: "Access",
      description: "Access level for the shared link.",
      options: [
        'open', 'company', 'collaborators',
      ],
    },
    canEdit: {
      type: 'boolean',
      label: 'Can Edit?',
      description: 'Can people with the link edit/upload files?',
    },
  },
  methods: {},
  async run({steps, $}) {
    const $box = new boxApi(this)
    return await $box.createSharedLink(this.parentFolderId, this.access, { can_edit: !!this.canEdit })
  },

}