import { boxApi } from "../../common/api.mjs"

export default defineComponent({
  name: "Set Folder Metadata (BU)",
  version: "0.0.2",
  key: "set-folder-metadata-bu",
  description: "Set cascading metadata on a folder",
  type: "action",
  props: {
    box: {
      type: "app",
      app: "box",
    },
    folderId: {
      type: "string",
      label: "Folder ID",
      description: "The unique identifier of the folder to update.",
    },
    scope: {
      type: "string",
      label: "Scope",
      description: "Metadata Scope (global or enterprise)."
    },
    metadataTemplate: {
      type: "string",
      label: "Metadata Template Name",
      description: "The metadata template to apply to the folder (and sub-items).",
    },
    metadata: {
      type: "object",
      label: "Metadata",
      description: "Metadata to be applied to folder (and sub-items).",
    }
  },
  methods: {},
  async run({ steps, $ }) {
    const $box = new boxApi(this)
    return $box.setMetadata(this.folderId, this.metadataTemplate, this.metadata, this.scope)
  },
})