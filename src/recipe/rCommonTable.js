const DEFAULT_INPUT_TEMPLATE = {
  is: 'CommonInput',
  directives: {},
  item: {
    directives: {},
    data: {},
    events: { actionType: 'input' },
    display: { text: 'rawr' },
  }
}

const COMPONENT_TEMPLATE = {
  is: 'CommonInput',
  directives: {},
  item: {
    directives: {},
    data: {},
    events: { actionType: 'click' },
    display: { text: 'rawr' },
  }
}

const ICOMPONENT_TEMPLATE = {
  is: 'CommonButton',
  directives: {},
  item: {
    directives: {},
    data: {},
    events: { actionType: 'click' },
    display: { text: 'rawr' },
  }
}

const COLUMN_TEMPLATE = {
  directives: {},
  items: [COMPONENT_TEMPLATE, COMPONENT_TEMPLATE, COMPONENT_TEMPLATE]
}
const SPANCOLUMN_TEMPLATE2 = {
  directives: {colspan:2},
  items: [ICOMPONENT_TEMPLATE, COMPONENT_TEMPLATE, COMPONENT_TEMPLATE]
}

const SPANCOLUMN_TEMPLATE = {
  directives: {colspan:2},
  items: [COMPONENT_TEMPLATE, COMPONENT_TEMPLATE, COMPONENT_TEMPLATE]
}

const ROW_TEMPLATE = [COLUMN_TEMPLATE, COLUMN_TEMPLATE, COLUMN_TEMPLATE]
const ROW_TEMPLATE2 = [SPANCOLUMN_TEMPLATE2, SPANCOLUMN_TEMPLATE, COLUMN_TEMPLATE]

const HEADERS = [SPANCOLUMN_TEMPLATE, COLUMN_TEMPLATE, COLUMN_TEMPLATE]
const ROWS = [ROW_TEMPLATE2, ROW_TEMPLATE, ROW_TEMPLATE, ROW_TEMPLATE]

export { HEADERS, ROWS, COMPONENT_TEMPLATE, DEFAULT_INPUT_TEMPLATE }
