/**
 * Component demo copy
 */
export default {
  title: "Components",
  description: "The everyday forms of the base components. New pages reuse these wrappers instead of rebuilding them",
  group: {
    control: "Controls",
    feedback: "Feedback and state",
    layout: "Layout and containers",
    business: "Business components"
  },
  demo: {
    button: {
      title: "Button",
      desc: "Semantic tone and visual weight, sized by the design tokens"
    },
    tag: {
      title: "Tag",
      desc: "Status and category labels drawn from the semantic tones"
    },
    badge: {
      title: "Badge",
      desc: "Counts and dots, capped at the maximum value"
    },
    avatar: {
      title: "Avatar",
      desc: "Round or square, holding an icon or initials"
    },
    alert: {
      title: "Alert",
      desc: "Inline notes and warnings, closable and optionally centred"
    },
    empty: {
      title: "Empty",
      desc: "Suggests the next step when a list has no data"
    },
    errorState: {
      title: "Error state",
      desc: "Offers retry and back when loading fails"
    },
    skeleton: {
      title: "Skeleton",
      desc: "Placeholders for text, lists, tables and charts"
    },
    card: {
      title: "Card",
      desc: "The basic container, with adjustable title and padding"
    },
    separator: {
      title: "Separator",
      desc: "Horizontal or vertical, optionally with a label"
    },
    tabs: {
      title: "Tabs",
      desc: "Handles switching only; the page owns the content"
    },
    tooltip: {
      title: "Tooltip",
      desc: "Supplementary hints on hover, matching the theme"
    },
    dialog: {
      title: "Dialog",
      desc: "Title, width and footer buttons are uniform; closing is configurable"
    },
    drawer: {
      title: "Drawer",
      desc: "Good for edit forms, with an optional unsaved-change guard"
    },
    table: {
      title: "ProTable",
      desc: "Column config, density, skeletons and paging built in"
    },
    form: {
      title: "ProForm",
      desc: "Declarative fields with server-side errors written back"
    },
    chart: {
      title: "BaseChart",
      desc: "Chart container that follows the theme and fills its parent"
    }
  },
  label: {
    solid: "Solid",
    outline: "Outline",
    ghost: "Ghost",
    link: "Link",
    sizeSm: "S",
    sizeMd: "M",
    sizeLg: "L",
    avatarText: "A",
    emptyDesc: "No data yet, create the first record",
    errorDesc: "The request never returned; check the network and retry",
    tabOverview: "Overview",
    tabConfig: "Config",
    tabStats: "Stats",
    tabsBody: "Tabs only switch; the page renders whatever content it needs.",
    tooltipContent: "These fields come from the server",
    dialogTitle: "Dialog title",
    dialogBody: "The page fills the body; the footer buttons come from the component.",
    drawerTitle: "Drawer title",
    drawerBody: "The drawer slides in from the right, a good place for edit forms.",
    openDialog: "Open dialog",
    openDrawer: "Open drawer",
    docs: "Read the docs",
    cardPlain: "Bordered by default",
    codeButton: '<app-button tone="primary">Save</app-button>',
    codeTag: '<app-tag tone="success" dot>Online</app-tag>'
  }
};
