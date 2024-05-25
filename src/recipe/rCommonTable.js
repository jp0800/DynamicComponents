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

const COLUMN_TEMPLATE = {
  directives: {},
  items: [COMPONENT_TEMPLATE, COMPONENT_TEMPLATE, COMPONENT_TEMPLATE]
}

const ROW_TEMPLATE = [COLUMN_TEMPLATE, COLUMN_TEMPLATE, COLUMN_TEMPLATE]

const HEADERS = [COLUMN_TEMPLATE, COLUMN_TEMPLATE, COLUMN_TEMPLATE]
const ROWS = [ROW_TEMPLATE, ROW_TEMPLATE, ROW_TEMPLATE, ROW_TEMPLATE]

export { HEADERS, ROWS, COMPONENT_TEMPLATE, DEFAULT_INPUT_TEMPLATE }
