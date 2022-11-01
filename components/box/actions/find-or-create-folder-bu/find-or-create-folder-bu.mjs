import { boxApi } from "../../common/api.mjs"

export default defineComponent({
  name: "Find/Create Folder (BU)",
  version: "0.0.4",
  key: "find-or-create-folder-bu",
  description: "Find a subfolder by name or create it if it doesn't exist.",
  type: "action",
  props: {
    box: {
      type: "app",
      app: "box",
    },
    parentFolderId: {
      type: "string",
      label: "Folder ID",
      description: "The unique identifier of the top-level folder to search below.",
    },
    target: {
      type: "string",
      label: "Target Folder",
      description: "Folder name to find/create (use '/' for nested subfolders).",
    },
  },
  methods: {},
  async run({ steps, $ }) {
    const $box = new boxApi(this)
    const dirs = this.target.split('/')
    let parent = this.parentFolderId
    for (const dir of dirs) {
      parent = await $box.findOrCreateFolder(parent, dir)
    }
    return parent
  },
})